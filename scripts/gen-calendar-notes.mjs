import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const calendarsDir = path.join(root, 'content/calendars')
const districtsDir = path.join(root, 'content/districts')

function fmtFull(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function fmtShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric',
  })
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getBreaks(events) {
  const result = []
  for (let i = 0; i < events.length; i++) {
    if (events[i].type === 'break_start') {
      const base = events[i].name
      const end = events.find((e, j) => j > i && e.type === 'break_end' && e.name.replace(' End', '') === base)
      if (end) result.push({ name: base, start: events[i].date, end: end.date })
    }
  }
  return result
}

function getGoodFriday(events) {
  return events.find(e => e.name.toLowerCase().includes('good friday'))
}

let processed = 0
let skipped = 0

for (const slug of fs.readdirSync(calendarsDir).sort()) {
  const distFile = path.join(districtsDir, slug + '.json')
  if (!fs.existsSync(distFile)) continue

  const ref26File = path.join(calendarsDir, slug, '2026-2027.json')
  if (!fs.existsSync(ref26File)) continue
  const ref26 = JSON.parse(fs.readFileSync(ref26File, 'utf8'))
  const refNotes = ref26.calendarNotes || ''
  if (!refNotes) continue

  const ref26Breaks = getBreaks(ref26.events)
  const ref26Spring = ref26Breaks.find(b => b.name.toLowerCase().includes('spring'))
  const ref26GF = getGoodFriday(ref26.events)

  const distCalDir = path.join(calendarsDir, slug)
  for (const yearFile of fs.readdirSync(distCalDir).sort()) {
    if (yearFile === '2026-2027.json') continue

    const calFile = path.join(distCalDir, yearFile)
    const cal = JSON.parse(fs.readFileSync(calFile, 'utf8'))
    if (cal.calendarNotes) { skipped++; continue }

    const [startYr, endYr] = cal.schoolYear.split('-')
    const breaks = getBreaks(cal.events)
    const spring = breaks.find(b => b.name.toLowerCase().includes('spring'))
    const gf = getGoodFriday(cal.events)

    let notes = refNotes

    // 1. School year string
    notes = notes.replace(/2026-2027/g, cal.schoolYear)

    // 2. First day (full, short+year, short alone)
    notes = notes.replace(new RegExp(escRe(fmtFull(ref26.firstDay)), 'g'), fmtFull(cal.firstDay))
    notes = notes.replace(new RegExp(escRe(fmtShort(ref26.firstDay)) + ',?\\s*2026', 'g'), fmtShort(cal.firstDay) + ', ' + startYr)
    notes = notes.replace(new RegExp(escRe(fmtShort(ref26.firstDay)), 'g'), fmtShort(cal.firstDay))

    // 3. Last day (full and short)
    notes = notes.replace(new RegExp(escRe(fmtFull(ref26.lastDay)), 'g'), fmtFull(cal.lastDay))
    notes = notes.replace(new RegExp(escRe(fmtShort(ref26.lastDay)) + ',?\\s*2027', 'g'), fmtShort(cal.lastDay) + ', ' + endYr)

    // 4. Spring break dates
    if (ref26Spring && spring) {
      const refStart = fmtShort(ref26Spring.start)  // e.g. "March 15"
      const refEnd = fmtShort(ref26Spring.end)        // e.g. "March 19"
      const newStart = fmtShort(spring.start)
      const newEnd = fmtShort(spring.end)
      // "March 15–19, 2027" style
      const refEndDay = refEnd.split(' ')[1]
      const newEndDay = newEnd.split(' ')[1]
      notes = notes.replace(
        new RegExp(escRe(refStart) + '[\\u2013-]' + escRe(refEndDay) + ',?\\s*2027', 'g'),
        newStart + '\u2013' + newEndDay + ', ' + endYr
      )
      // "March 15–19" without year
      notes = notes.replace(
        new RegExp(escRe(refStart) + '[\\u2013-]' + escRe(refEndDay), 'g'),
        newStart + '\u2013' + newEndDay
      )
      // standalone end date with year
      notes = notes.replace(
        new RegExp(escRe(refEnd) + ',?\\s*2027', 'g'),
        newEnd + ', ' + endYr
      )
    }

    // 5. Good Friday
    if (ref26GF && gf) {
      const refGFShort = fmtShort(ref26GF.date)
      const newGFShort = fmtShort(gf.date)
      notes = notes.replace(new RegExp(escRe(refGFShort) + ',?\\s*2027', 'g'), newGFShort + ', ' + endYr)
      notes = notes.replace(new RegExp('\\(' + escRe(refGFShort) + '\\)', 'g'), '(' + newGFShort + ')')
    }

    // 6. Catch remaining standalone year numbers (not part of a school-year range like 2025-2026)
    notes = notes.replace(/(?<!\d-)\b2026\b(?!-\d)/g, startYr)
    notes = notes.replace(/(?<!\d-)\b2027\b(?!-\d)/g, endYr)

    cal.calendarNotes = notes
    fs.writeFileSync(calFile, JSON.stringify(cal, null, 2) + '\n')
    processed++
    console.log(`OK: ${slug}/${yearFile}`)
  }
}

console.log(`\nDone: ${processed} processed, ${skipped} already had notes`)
