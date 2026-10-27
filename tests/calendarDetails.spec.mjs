import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

function moduleUrl(path, dependency) {
  let source = ts.transpile(readFileSync(new URL(path, import.meta.url), 'utf8'), { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })
  if (dependency) source = source.replaceAll("'./calendarOverview'", JSON.stringify(dependency))
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
}
const overviewUrl = moduleUrl('../app/utils/calendarOverview.ts')
const { pairedBreakEndDate } = await import(overviewUrl)
const { studentDetailEvents, extendedTimeOff, shiftCalendarDate, isCalendarWeekend } = await import(moduleUrl('../app/utils/calendarDetails.ts', overviewUrl))
const auhsd = JSON.parse(readFileSync(new URL('../content/calendars/anaheim-union-high-school-district/2026-2027.json', import.meta.url), 'utf8'))

test('AUHSD suffixes on end markers preserve complete Thanksgiving, winter, and spring ranges', () => {
  const breaks = studentDetailEvents(auhsd).filter(event => event.type === 'break_start')
  assert.deepEqual(breaks.map(({ start, end }) => [start, end]), [
    ['2026-11-23', '2026-11-27'], ['2026-12-21', '2027-01-01'], ['2027-03-22', '2027-03-26'],
  ])
  assert.deepEqual(extendedTimeOff(auhsd).map(({ start, end, days }) => [start, end, days]), [
    ['2026-11-21', '2026-11-29', 9], ['2026-12-19', '2027-01-03', 16], ['2027-03-20', '2027-03-28', 9],
  ])
})

test('annotated break names match across slash and spaced-dash labels, preserving No-Student and Mid-Winter', () => {
  for (const [startName, endName] of [
    ['Winter No-Student Period Begins', "Winter No-Student Period Ends / New Year's Day"],
    ['Teacher Workday / Winter Break Begins', 'Winter Break Ends'],
    ['Winter Recess Begins - Schools Closed', "New Year's Day - Winter Recess Ends"],
    ['Mid-Winter Break — No School', 'Mid-Winter Break End'],
  ]) {
    const start = { date: '2026-12-21', name: startName, type: 'break_start' }
    const end = { date: '2027-01-01', name: endName, type: 'break_end' }
    assert.equal(pairedBreakEndDate(start, [end, start]), '2027-01-01')
  }
})

test('an unrelated holiday suffix cannot join two different breaks', () => {
  const start = { date: '2026-11-23', name: 'Thanksgiving Recess Begins / Holiday', type: 'break_start' }
  assert.equal(pairedBreakEndDate(start, [start, { date: '2027-01-01', name: 'Winter Recess Ends / Holiday', type: 'break_end' }]), undefined)
})

test('discrete dates remain discrete and partial/conditional closures do not create districtwide windows', () => {
  const cal = { firstDay: '2026-09-01', lastDay: '2027-06-30', events: [
    { name: 'Late start', type: 'late_start', date: '2026-09-14', dates: ['2026-09-14', '2026-09-21'] },
    { name: 'Elementary schools closed only', type: 'no_school', date: '2026-10-09', endDate: '2026-10-12' },
    { name: 'Conditional no school', type: 'no_school', date: '2027-02-12', endDate: '2027-02-15', status: 'TENTATIVE' },
  ] }
  assert.deepEqual(studentDetailEvents(cal).filter(event => event.type === 'late_start').map(({ start, end }) => [start, end]), [['2026-09-14', '2026-09-14'], ['2026-09-21', '2026-09-21']])
  assert.deepEqual(extendedTimeOff(cal), [])
})

test('resolved break ranges and extended windows stay consistent across published calendars', () => {
  const root = new URL('../content/calendars/', import.meta.url)
  let checked = 0
  for (const district of readdirSync(root)) for (const file of readdirSync(new URL(`${district}/`, root)).filter(file => file.endsWith('.json'))) {
    const cal = JSON.parse(readFileSync(new URL(`${district}/${file}`, root), 'utf8'))
    for (const start of cal.events.filter(event => event.type === 'break_start')) {
      const end = pairedBreakEndDate(start, cal.events)
      if (end) assert.equal(studentDetailEvents(cal).find(event => event.type === 'break_start' && event.start === start.date && event.name === start.name)?.end, start.endDate ?? start.dates?.at(-1) ?? end)
    }
    for (const window of extendedTimeOff(cal)) {
      assert(window.start > cal.firstDay && window.end < cal.lastDay && window.days >= 4)
      const published = new Set(window.closures.flatMap(range => {
        const dates = []
        for (let date = range.start; date <= range.end; date = shiftCalendarDate(date, 1)) dates.push(date)
        return dates
      }))
      for (let date = window.start; date <= window.end; date = shiftCalendarDate(date, 1)) assert(published.has(date) || isCalendarWeekend(date))
    }
    checked++
  }
  assert(checked > 0)
})
