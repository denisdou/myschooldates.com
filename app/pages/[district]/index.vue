<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, eventTypeLabel, eventTypeColor } = useDistrictPage()

// Load all data in parallel (allDistricts needed for state detection)
const [{ data: allDistricts }, { data: district }, { data: allCals }, { data: statePageData }] = await Promise.all([
  useAsyncData('districts-all', () => queryCollection('districts').order('name', 'ASC').all()),
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`cals:${slug}`, async () => {
    const d = await queryCollection('districts').where('slug', '=', slug).first()
    if (!d) return []
    return queryCollection('calendars').where('institutionId', '=', d.institutionId).order('schoolYear', 'DESC').all()
  }),
  useAsyncData(`state:${slug}`, () => queryCollection('states').where('stateSlug', '=', slug).first()),
])

// State detection — derive state slug from state name (e.g. "New York" → "new-york")
const toStateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
const uniqueStates = [...new Set((allDistricts.value ?? []).map(d => d.state))]
const matchedStateName = uniqueStates.find(s => toStateSlug(s) === slug) ?? null
const isStatePage = !!matchedStateName
const stateDistricts = (allDistricts.value ?? [])
  .filter(d => d.state === matchedStateName)

if (!isStatePage && !district.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// ── State page SEO ─────────────────────────────────────────────────────────
// Derive the most common school year from state districts to keep title current
const stateCurrentYear = (() => {
  if (!stateDistricts.length) return '2025-2026'
  const years = stateDistricts.map(d => d.currentSchoolYear).filter(Boolean)
  const freq: Record<string, number> = {}
  for (const y of years) freq[y] = (freq[y] ?? 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '2025-2026'
})()

if (isStatePage) {
  const stateTitle = `${matchedStateName} School Calendars ${stateCurrentYear} | MySchoolDates`
  const stateDesc = `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school district${stateDistricts.length !== 1 ? 's' : ''} in ${matchedStateName}. First day of school, spring break, winter break, and all important dates.`
  useSeoMeta({ title: stateTitle, description: stateDesc })
  useHead({
    link: [{ rel: 'canonical', href: `https://myschooldates.com/${slug}` }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: `${matchedStateName} School Calendars`, item: `https://myschooldates.com/${slug}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${matchedStateName} Public School Districts — ${stateCurrentYear} Calendars`,
          description: `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school districts in ${matchedStateName}.`,
          numberOfItems: stateDistricts.length,
          itemListElement: stateDistricts.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.name,
            url: `https://myschooldates.com/${d.slug}`,
            item: {
              '@type': 'EducationalOrganization',
              name: d.name,
              url: `https://myschooldates.com/${d.slug}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: d.city ?? '',
                addressRegion: (d as any).stateCode ?? d.state,
                addressCountry: 'US',
              },
            },
          })),
        },
        ...(statePageData.value?.faqs?.length ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: statePageData.value.faqs.map((f: { q: string; a: string }) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
      ]),
    }],
  })
}

// ── State page: load first days for district cards ─────────────────────────
const { data: stateCals } = await useAsyncData(`state-cals:${slug}`, async () => {
  if (!isStatePage || !stateDistricts.length) return []
  const all = await queryCollection('calendars').all()
  const ids = new Set(stateDistricts.map(d => d.institutionId))
  return (all ?? []).filter(c => ids.has(c.institutionId) && c.schoolYear === stateCurrentYear)
})

const stateCalsMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of stateCals.value ?? []) {
    map[c.institutionId] = c.firstDay
  }
  return map
})

// Format "2026-08-10" → "Aug 10" (compact, no year)
const formatMonthDay = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' })

// Per-district stats for the state comparison table
const stateDistrictStats = computed(() => {
  type DistrictStat = {
    firstDay: string; lastDay: string
    winterBreak: { start: string; end: string } | null
    springBreak: { start: string; end: string } | null
    daysOff: number; eventCount: number
  }
  const result: Record<string, DistrictStat> = {}
  for (const c of stateCals.value ?? []) {
    const calBreaks = getBreaks(c.events ?? [])
    const winterBreak = calBreaks.find(b =>
      b.name.toLowerCase().includes('winter') ||
      b.name.toLowerCase().includes('christmas') ||
      b.name.toLowerCase().includes('december')
    ) ?? null
    const springBreak = calBreaks.find(b => b.name.toLowerCase().includes('spring')) ?? null
    let daysOff = 0
    const breakRanges: { start: string; end: string }[] = []
    for (const e of (c.events ?? [])) {
      if (e.type === 'break_start') {
        const endEvt = (c.events ?? []).find((x: any) => x.type === 'break_end' && x.date > e.date)
        if (endEvt) breakRanges.push({ start: e.date, end: endEvt.date })
      }
      if (e.type === 'holiday' || e.type === 'no_school') daysOff++
    }
    for (const { start, end } of breakRanges) {
      let d = new Date(start + 'T00:00:00')
      const endD = new Date(end + 'T00:00:00')
      while (d <= endD) {
        if (d.getDay() !== 0 && d.getDay() !== 6) daysOff++
        d.setDate(d.getDate() + 1)
      }
    }
    result[c.institutionId] = {
      firstDay: c.firstDay, lastDay: c.lastDay,
      winterBreak: winterBreak ? { start: winterBreak.start, end: winterBreak.end } : null,
      springBreak: springBreak ? { start: springBreak.start, end: springBreak.end } : null,
      daysOff, eventCount: (c.events ?? []).length,
    }
  }
  return result
})

// ── Related district calendars (for comparison table) ──────────────────────
const { data: relatedCals } = await useAsyncData(`related-cals:${slug}`, async () => {
  if (isStatePage || !district.value?.relatedDistricts?.length) return []
  const relatedSlugs = new Set((district.value.relatedDistricts as { slug: string }[]).map(rd => rd.slug))
  const relatedIds = (allDistricts.value ?? [])
    .filter(d => relatedSlugs.has(d.slug))
    .map(d => d.institutionId)
  if (!relatedIds.length) return []
  const all = await queryCollection('calendars').all()
  const year = district.value.currentSchoolYear
  return (all ?? []).filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
})

// ── District page logic ────────────────────────────────────────────────────
const currentYear = district.value?.currentSchoolYear ?? ''
const cal = allCals.value?.find(y => y.schoolYear === currentYear) ?? null
const meta = district

const archivedYears = computed(() =>
  (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
)
const daysUntilStart = computed(() => cal ? daysUntil(cal.firstDay) : 0)
const today = new Date(); today.setHours(0, 0, 0, 0)
const nextEvent = computed(() =>
  cal?.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal?.events ?? []))
const faqs = computed(() => {
  if (!cal || !district.value) return []
  const specificFaqs = (district.value as any).districtFaqs ?? []
  const allTemplateFaqs = generateFaqs(district.value, cal, district.value.officialWebsite)
  // Districts with very rich specific FAQs (≥5): skip the template fall break question
  // (position 0) since it is already covered by the About section in these districts.
  // Append Google Calendar, travel planning, early release, official verification (positions 1–4).
  if (specificFaqs.length >= 5) {
    return [...specificFaqs, ...allTemplateFaqs.slice(1, 5)]
  }
  // Districts with rich specific FAQs (≥3): only append the 5 utility questions (fall break,
  // Google Calendar, travel planning, early release, official verification) — positions 0–4.
  // These are not duplicated elsewhere on the page. Skip the date questions (positions 5–13)
  // since they are already shown in the hero, breaks section, and all-dates table.
  if (specificFaqs.length >= 3) {
    return [...specificFaqs, ...allTemplateFaqs.slice(0, 5)]
  }
  // Districts with few or no specific FAQs: use full template list for coverage.
  return [...specificFaqs, ...allTemplateFaqs.slice(0, 10)]
})
const secondSemStart = computed(() => cal ? getSecondSemesterStart(cal.events) : '')

// Today status — answers "is school in session right now?"
const todayStr = (() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

const todayStatus = computed(() => {
  if (!cal) return null
  if (todayStr < cal.firstDay) {
    const d = daysUntilStart.value
    return { type: 'upcoming', headline: d === 0 ? 'School starts today!' : d === 1 ? 'School starts tomorrow' : `School starts in ${d} days`, detail: `First day: ${formatShortDate(cal.firstDay)}`, color: 'blue' }
  }
  if (todayStr > cal.lastDay) {
    return { type: 'ended', headline: 'School year has ended', detail: `Last day was ${formatShortDate(cal.lastDay)}`, color: 'gray' }
  }
  for (const b of breaks.value) {
    if (todayStr >= b.start && todayStr <= b.end) {
      const d = daysUntil(b.end)
      return { type: 'break', headline: b.name, detail: `${d + 1} day${d !== 0 ? 's' : ''} remaining`, color: 'purple' }
    }
  }
  const holiday = cal.events.find(e => e.date === todayStr && (e.type === 'holiday' || e.type === 'no_school'))
  if (holiday) {
    return { type: 'holiday', headline: `No school today — ${holiday.name}`, detail: nextEvent.value ? `Next school event: ${formatShortDate(nextEvent.value.date)}` : '', color: 'amber' }
  }
  return { type: 'school', headline: 'School is in session', detail: nextEvent.value ? `Next: ${nextEvent.value.name} — ${formatShortDate(nextEvent.value.date)}` : '', color: 'green' }
})

// Next upcoming events (excludes break_end since break_start already shows the range)
const upcomingEvents = computed(() => {
  if (!cal) return []
  return cal.events
    .filter(e => e.date >= todayStr && e.type !== 'break_end')
    .slice(0, 6)
})

// Share / copy link
const copied = ref(false)
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function shareWhatsApp() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar — ${window.location.href}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
function shareSMS() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar: ${window.location.href}`)
  window.open(`sms:?body=${text}`)
}
function shareTwitter() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar — holidays, spring break, and all important dates`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}
function shareReddit() {
  const title = encodeURIComponent(`${district.value?.name} ${currentYear} School Calendar`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank')
}

// Data quality: estimated when no lastVerifiedAt is set
const isEstimated = computed(() => !cal?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!cal?.lastVerifiedAt) return null
  return new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const prevYear = computed(() => {
  const [y1, y2] = currentYear.split('-').map(Number)
  return `${y1 - 1}-${y2 - 1}`
})
const prevCal = computed(() => allCals.value?.find(c => c.schoolYear === prevYear.value) ?? null)
const yearComparison = computed(() => {
  if (!prevCal.value) return ''
  const prevBreaks = getBreaks(prevCal.value.events)
  const curSpring = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const prevSpring = prevBreaks.find(b => b.name.toLowerCase().includes('spring'))
  if (!curSpring || !prevSpring) return ''
  const diff = Math.round(
    (new Date(curSpring.start + 'T00:00:00').getTime() - new Date(prevSpring.start + 'T00:00:00').getTime())
    / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return `Spring break starts on the same date as ${prevYear.value}.`
  if (diff > 0) return `Compared to ${prevYear.value}, spring break starts ${diff} day${diff !== 1 ? 's' : ''} later this year.`
  return `Compared to ${prevYear.value}, spring break starts ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} earlier this year.`
})

// ── Dynamic Metrics: types ─────────────────────────────────────────────────
type MetricPool = {
  // Quick Facts candidates
  nextStudentDayOff:           { name: string; date: string; daysUntil: number } | null
  nextHoliday:                 { name: string; date: string; daysUntil: number } | null
  nextTeacherWorkday:          { name: string; date: string; daysUntil: number } | null
  nextBreak:                   { name: string; start: string; daysUntil: number } | null
  longestBreak:                { name: string; days: number; start: string; end: string } | null
  breakCount:                  number
  daysUntilSpringBreak:        number | null
  springBreakStart:            string | null
  daysBeforeLaborDay:          number | null
  teacherWorkDays:             number | null
  startDiffNearest:            { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  lastDayDiffNearest:          { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  // Year by Numbers candidates
  schoolWeeks:                 number
  totalDaysOff:                number
  winterBreakLength:           number | null
  winterBreakStart:            string | null
  winterBreakEnd:              string | null
  longestInstructionalStretch: { weeks: number; start: string; end: string } | null
  instructionalDays:           number
  springBreakVsPrevYear:       string | null
  springBreakDiffDays:         number | null
  firstDay:                    string
  lastDay:                     string
}

type FactItem = {
  key:   string
  value: string
  label: string
}

type NumberCard = {
  key:         string
  label:       string
  value:       number
  unit:        string
  description: string
}

// ── Dynamic Metrics: helpers ───────────────────────────────────────────────
function getLaborDay(year: number): string {
  // First Monday of September
  const sept1 = new Date(year, 8, 1)
  const dow = sept1.getDay() // 0=Sun, 1=Mon…
  const offset = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  const day = 1 + offset
  const mm = '09'
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function countWeekdays(from: string, to: string): number {
  if (from > to) return 0
  let count = 0
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

function shiftDay(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// ── Dynamic Metrics: pool computation ─────────────────────────────────────
function computeMetricPool(
  cal: any,
  breaksVal: { name: string; start: string; end: string; days: number }[],
  relatedCalsVal: any[],
  allDistrictsVal: any[],
  todayStrVal: string,
  daysUntilFn: (d: string) => number,
  schoolWeeksVal: number,
  daysOffCountVal: number,
  winterBreakDaysVal: number,
  prevCalVal: any,
  yearComparisonVal: string,
): MetricPool {
  const events: { date: string; type: string; name: string }[] = cal.events ?? []

  // ── nextStudentDayOff ──────────────────────────────────────────────────
  const nextSdoEvt = events
    .filter(e => e.date >= todayStrVal && (e.type === 'holiday' || e.type === 'no_school' || e.type === 'break_start'))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextStudentDayOff = nextSdoEvt
    ? { name: nextSdoEvt.name, date: nextSdoEvt.date, daysUntil: daysUntilFn(nextSdoEvt.date) }
    : null

  // ── nextHoliday ────────────────────────────────────────────────────────
  const nextHolEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'holiday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextHoliday = nextHolEvt
    ? { name: nextHolEvt.name, date: nextHolEvt.date, daysUntil: daysUntilFn(nextHolEvt.date) }
    : null

  // ── nextTeacherWorkday ─────────────────────────────────────────────────
  const nextTwdEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'teacher_workday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextTeacherWorkday = nextTwdEvt
    ? { name: nextTwdEvt.name, date: nextTwdEvt.date, daysUntil: daysUntilFn(nextTwdEvt.date) }
    : null

  // ── nextBreak ──────────────────────────────────────────────────────────
  const nextBreakObj = [...breaksVal]
    .sort((a, b) => a.start.localeCompare(b.start))
    .find(b => b.start >= todayStrVal) ?? null
  const nextBreak = nextBreakObj
    ? { name: nextBreakObj.name, start: nextBreakObj.start, daysUntil: daysUntilFn(nextBreakObj.start) }
    : null

  // ── longestBreak ───────────────────────────────────────────────────────
  const longestBreak = breaksVal.length === 0 ? null
    : breaksVal.reduce((max, b) => b.days > max.days ? b : max, breaksVal[0]!)

  // ── springBreak ────────────────────────────────────────────────────────
  const springBreak = breaksVal.find(b => b.name.toLowerCase().includes('spring')) ?? null
  const springBreakStart = springBreak ? springBreak.start : null
  const daysUntilSpringBreak = springBreak && springBreak.start >= todayStrVal
    ? daysUntilFn(springBreak.start)
    : null

  // ── daysBeforeLaborDay ─────────────────────────────────────────────────
  const firstDayYear = parseInt(cal.firstDay.slice(0, 4))
  const laborDay = getLaborDay(firstDayYear)
  const daysBeforeLaborDay = cal.firstDay < laborDay
    ? Math.round((new Date(laborDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()) / 86400000)
    : null

  // ── teacherWorkDays ────────────────────────────────────────────────────
  const teacherWorkDays = (cal.teacherWorkDays && cal.teacherWorkDays > 0) ? cal.teacherWorkDays : null

  // ── startDiffNearest / lastDayDiffNearest ──────────────────────────────
  let startDiffNearest: MetricPool['startDiffNearest'] = null
  let lastDayDiffNearest: MetricPool['lastDayDiffNearest'] = null
  let bestStartAbsDiff = Infinity
  let bestLastAbsDiff = Infinity
  for (const rc of relatedCalsVal) {
    const relDistrict = allDistrictsVal.find((d: any) => d.institutionId === rc.institutionId)
    if (!relDistrict) continue
    const vsName = (relDistrict.shortName || relDistrict.name) as string

    const startDiff = Math.round((new Date(rc.firstDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()) / 86400000)
    if (Math.abs(startDiff) < bestStartAbsDiff) {
      bestStartAbsDiff = Math.abs(startDiff)
      startDiffNearest = {
        days: Math.abs(startDiff),
        direction: startDiff > 0 ? 'earlier' : startDiff < 0 ? 'later' : 'same',
        vsName,
      }
    }

    const lastDiff = Math.round((new Date(rc.lastDay + 'T00:00:00').getTime() - new Date(cal.lastDay + 'T00:00:00').getTime()) / 86400000)
    if (Math.abs(lastDiff) < bestLastAbsDiff) {
      bestLastAbsDiff = Math.abs(lastDiff)
      lastDayDiffNearest = {
        days: Math.abs(lastDiff),
        direction: lastDiff > 0 ? 'earlier' : lastDiff < 0 ? 'later' : 'same',
        vsName,
      }
    }
  }

  // ── winterBreak ────────────────────────────────────────────────────────
  const winterBreakObj = breaksVal.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  ) ?? null

  // ── longestInstructionalStretch ────────────────────────────────────────
  type Period = { start: string; end: string }
  const closed: Period[] = [
    ...breaksVal.map(b => ({ start: b.start, end: b.end })),
    ...events
      .filter(e => e.type === 'holiday' || e.type === 'no_school')
      .map(e => ({ start: e.date, end: e.date })),
  ].sort((a, b) => a.start.localeCompare(b.start))

  // Merge overlapping/adjacent periods
  const merged: Period[] = []
  for (const p of closed) {
    const last = merged[merged.length - 1]
    if (!last || p.start > shiftDay(last.end, 1)) {
      merged.push({ ...p })
    } else if (p.end > last.end) {
      last.end = p.end
    }
  }

  let longestInstructionalStretch: MetricPool['longestInstructionalStretch'] = null
  let longestWd = 0

  // Gap: firstDay → first closed period
  if (merged.length > 0) {
    const gapEnd = shiftDay(merged[0]!.start, -1)
    if (cal.firstDay <= gapEnd) {
      const wd = countWeekdays(cal.firstDay, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: cal.firstDay, end: gapEnd } }
    }
  }
  // Gaps between consecutive closed periods
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = shiftDay(merged[i]!.end, 1)
    const gapEnd = shiftDay(merged[i + 1]!.start, -1)
    if (gapStart <= gapEnd) {
      const wd = countWeekdays(gapStart, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: gapEnd } }
    }
  }
  // Gap: last closed period → lastDay
  if (merged.length > 0) {
    const gapStart = shiftDay(merged[merged.length - 1]!.end, 1)
    if (gapStart <= cal.lastDay) {
      const wd = countWeekdays(gapStart, cal.lastDay)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: cal.lastDay } }
    }
  }

  // ── springBreakVsPrevYear ──────────────────────────────────────────────
  let springBreakVsPrevYear: string | null = null
  let springBreakDiffDays: number | null = null
  if (prevCalVal && yearComparisonVal) {
    springBreakVsPrevYear = yearComparisonVal
    const match = yearComparisonVal.match(/(\d+) day/)
    if (match) {
      const n = parseInt(match[1]!)
      springBreakDiffDays = yearComparisonVal.includes('later') ? n : yearComparisonVal.includes('earlier') ? -n : 0
    } else if (yearComparisonVal.includes('same date')) {
      springBreakDiffDays = 0
    }
  }

  return {
    nextStudentDayOff,
    nextHoliday,
    nextTeacherWorkday,
    nextBreak,
    longestBreak: longestBreak ?? null,
    breakCount: breaksVal.length,
    daysUntilSpringBreak,
    springBreakStart,
    daysBeforeLaborDay,
    teacherWorkDays,
    startDiffNearest,
    lastDayDiffNearest,
    schoolWeeks: schoolWeeksVal,
    totalDaysOff: daysOffCountVal,
    winterBreakLength: winterBreakObj ? winterBreakDaysVal : null,
    winterBreakStart: winterBreakObj ? winterBreakObj.start : null,
    winterBreakEnd: winterBreakObj ? winterBreakObj.end : null,
    longestInstructionalStretch,
    instructionalDays: cal.totalSchoolDays ?? 180,
    springBreakVsPrevYear,
    springBreakDiffDays,
    firstDay: cal.firstDay,
    lastDay: cal.lastDay,
  }
}

// ── Dynamic Metrics: Quick Facts scorer ───────────────────────────────────
function scoreQuickFacts(pool: MetricPool, districtSlug: string): FactItem[] {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const recency = (d: number | undefined) =>
    d === undefined ? 0 : d < 7 ? 20 : d < 14 ? 15 : d < 30 ? 10 : 0

  type Candidate = FactItem & { score: number }
  const raw: Candidate[] = []

  if (pool.nextStudentDayOff) {
    const x = pool.nextStudentDayOff
    raw.push({ key: 'nextStudentDayOff', value: fmt(x.date), label: x.name, score: 90 + recency(x.daysUntil) })
  }
  if (pool.nextTeacherWorkday) {
    const x = pool.nextTeacherWorkday
    raw.push({ key: 'nextTeacherWorkday', value: fmt(x.date), label: 'Next Teacher Workday', score: 85 + recency(x.daysUntil) })
  }
  if (pool.nextBreak) {
    const x = pool.nextBreak
    raw.push({ key: 'nextBreak', value: fmt(x.start), label: x.name, score: 80 + recency(x.daysUntil) })
  }
  if (pool.daysUntilSpringBreak !== null) {
    raw.push({ key: 'daysUntilSpringBreak', value: String(pool.daysUntilSpringBreak), label: 'Days Until Spring Break', score: 75 + recency(pool.daysUntilSpringBreak) })
  }
  if (pool.longestBreak) {
    raw.push({ key: 'longestBreak', value: `${pool.longestBreak.days} days`, label: 'Longest Break', score: 70 })
  }
  if (pool.daysBeforeLaborDay !== null) {
    raw.push({ key: 'daysBeforeLaborDay', value: String(pool.daysBeforeLaborDay), label: 'Days Before Labor Day', score: 65 })
  }
  if (pool.nextHoliday) {
    const x = pool.nextHoliday
    raw.push({ key: 'nextHoliday', value: fmt(x.date), label: x.name, score: 60 + recency(x.daysUntil) })
  }
  if (pool.startDiffNearest) {
    const x = pool.startDiffNearest
    raw.push({
      key: 'startDiffNearest',
      value: x.direction === 'same' ? 'Same day' : `${x.days}d ${x.direction}`,
      label: `Start vs. ${x.vsName}`,
      score: 60,
    })
  }
  if (pool.teacherWorkDays !== null) {
    raw.push({ key: 'teacherWorkDays', value: String(pool.teacherWorkDays), label: 'Teacher Workdays', score: 55 })
  }
  raw.push({ key: 'breakCount', value: String(pool.breakCount), label: 'Major Breaks', score: 50 })
  if (pool.lastDayDiffNearest) {
    const x = pool.lastDayDiffNearest
    raw.push({
      key: 'lastDayDiffNearest',
      value: x.direction === 'same' ? 'Same day' : `${x.days}d ${x.direction}`,
      label: `Last Day vs. ${x.vsName}`,
      score: 45,
    })
  }

  // Redundancy penalties
  const hasNsdo = raw.some(c => c.key === 'nextStudentDayOff')
  const hasNextBreak = raw.some(c => c.key === 'nextBreak')
  const nextBreakIsSpring = pool.nextBreak !== null && pool.nextBreak.start === pool.springBreakStart

  const scored = raw.map(c => {
    if (hasNsdo && c.key === 'nextHoliday') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsSpring && c.key === 'daysUntilSpringBreak') return { ...c, score: -999 }
    return c
  }).filter(c => c.score > -999)

  // Sort: score DESC, then stable hash tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return simpleHash(a.key + districtSlug) - simpleHash(b.key + districtSlug)
  })

  return scored.slice(0, 6).map(({ score: _score, ...item }) => item)
}

// ── Dynamic Metrics: Year by Numbers scorer ────────────────────────────────
function scoreYearNumbers(
  pool: MetricPool,
  selectedQuickFactKeys: Set<string>,
  districtVal: any,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const shortName: string = districtVal?.shortName || districtVal?.name || ''

  // Mandatory card — always first
  const mandatory: NumberCard = {
    key: 'schoolWeeks',
    label: 'School year',
    value: pool.schoolWeeks,
    unit: 'weeks',
    description: `The ${currentYearVal} year runs ${fmtShort(pool.firstDay)} through ${fmtShort(pool.lastDay)}, spanning ${pool.schoolWeeks} weeks.`,
  }

  type ScoredCard = NumberCard & { score: number }
  const candidates: ScoredCard[] = []

  if (pool.longestInstructionalStretch) {
    const ls = pool.longestInstructionalStretch
    const bonus = ls.weeks > 8 ? 10 : 0
    candidates.push({
      key: 'longestInstructionalStretch',
      label: 'Longest school stretch',
      value: ls.weeks,
      unit: 'weeks',
      description: `The longest stretch without a student day off runs ${ls.weeks} weeks — ${fmtShort(ls.start)} through ${fmtShort(ls.end)}.`,
      score: 85 + bonus,
    })
  }

  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const bonus = pool.winterBreakLength > 14 ? 10 : 0
    const penalty = selectedQuickFactKeys.has('longestBreak') ? -30 : 0
    candidates.push({
      key: 'winterBreakLength',
      label: 'Winter break',
      value: pool.winterBreakLength,
      unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} to ${fmtShort(pool.winterBreakEnd)} — ${pool.winterBreakLength} calendar days.`,
      score: 80 + bonus + penalty,
    })
  }

  candidates.push({
    key: 'totalDaysOff',
    label: 'Student days off',
    value: pool.totalDaysOff,
    unit: 'days',
    description: `Students get ${pool.totalDaysOff} full weekdays off — breaks, holidays, and no-school days combined.`,
    score: 75,
  })

  if (pool.springBreakVsPrevYear && pool.springBreakDiffDays !== null && pool.springBreakDiffDays !== 0) {
    const absDiff = Math.abs(pool.springBreakDiffDays)
    const direction = pool.springBreakDiffDays > 0 ? 'later' : pool.springBreakDiffDays < 0 ? 'earlier' : 'same'
    candidates.push({
      key: 'springBreakVsPrevYear',
      label: 'Spring break shift',
      value: absDiff,
      unit: `day${absDiff !== 1 ? 's' : ''} ${direction}`,
      description: pool.springBreakVsPrevYear,
      score: 70,
    })
  }

  // instructionalDays — always available as fallback
  candidates.push({
    key: 'instructionalDays',
    label: 'Instructional days',
    value: pool.instructionalDays,
    unit: 'days',
    description: `${shortName} schedules ${pool.instructionalDays} instructional days for ${currentYearVal}, consistent with state calendar requirements.`,
    score: 55,
  })

  candidates.sort((a, b) => b.score - a.score)
  const top3 = candidates.slice(0, 3).map(({ score: _score, ...c }) => c)

  return [mandatory, ...top3]
}

// ── Year-at-a-Glance stats ─────────────────────────────────────────────────
const schoolWeeks = computed(() => {
  if (!cal) return 0
  const ms = new Date(cal.lastDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
})

const daysOffCount = computed(() => {
  if (!cal) return 0
  let count = 0
  const breakRanges: { start: string; end: string }[] = []
  for (const e of cal.events) {
    if (e.type === 'break_start') {
      const endEvt = cal.events.find(x => x.type === 'break_end' && x.date > e.date)
      if (endEvt) breakRanges.push({ start: e.date, end: endEvt.date })
    }
    if (e.type === 'holiday' || e.type === 'no_school') count++
  }
  for (const { start, end } of breakRanges) {
    let d = new Date(start + 'T00:00:00')
    const endD = new Date(end + 'T00:00:00')
    while (d <= endD) {
      if (d.getDay() !== 0 && d.getDay() !== 6) count++
      d.setDate(d.getDate() + 1)
    }
  }
  return count
})

const winterBreakDays = computed(() => {
  const wb = breaks.value.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  )
  if (!wb) return 0
  const ms = new Date(wb.end + 'T00:00:00').getTime() - new Date(wb.start + 'T00:00:00').getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1
})

// ── Dynamic Metrics: computed refs ─────────────────────────────────────────
const metricPool = computed((): MetricPool | null => {
  if (!cal || !district.value) return null
  return computeMetricPool(
    cal,
    breaks.value,
    relatedCals.value ?? [],
    allDistricts.value ?? [],
    todayStr,
    daysUntil,
    schoolWeeks.value,
    daysOffCount.value,
    winterBreakDays.value,
    prevCal.value,
    yearComparison.value,
  )
})

const quickFactItems = computed((): FactItem[] => {
  if (!metricPool.value || !district.value) return []
  return scoreQuickFacts(metricPool.value, district.value.slug)
})

const quickFactKeys = computed(() => new Set(quickFactItems.value.map(f => f.key)))

const yearNumberCards = computed((): NumberCard[] => {
  if (!metricPool.value || !district.value) return []
  return scoreYearNumbers(metricPool.value, quickFactKeys.value, district.value, currentYear, formatShortDate)
})

// ── Nearby district comparison stats ───────────────────────────────────────
type ComparisonEntry = {
  name: string; slug: string; isCurrent: boolean
  firstDay: string; lastDay: string
  springBreak: { start: string; end: string } | null
  daysOff: number
  comparisonNote?: string
}
const comparisonStats = computed((): ComparisonEntry[] => {
  const rows: ComparisonEntry[] = []

  const computeDaysOff = (events: any[]) => {
    let count = 0
    const ranges: { start: string; end: string }[] = []
    for (const e of events) {
      if (e.type === 'break_start') {
        const end = events.find((x: any) => x.type === 'break_end' && x.date > e.date)
        if (end) ranges.push({ start: e.date, end: end.date })
      }
      if (e.type === 'holiday' || e.type === 'no_school') count++
    }
    for (const { start, end } of ranges) {
      let d = new Date(start + 'T00:00:00')
      const endD = new Date(end + 'T00:00:00')
      while (d <= endD) { if (d.getDay() !== 0 && d.getDay() !== 6) count++; d.setDate(d.getDate() + 1) }
    }
    return count
  }

  // Current district
  if (cal && district.value) {
    const sp = breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
    rows.push({
      name: district.value.name, slug: district.value.slug, isCurrent: true,
      firstDay: cal.firstDay, lastDay: cal.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      daysOff: daysOffCount.value,
    })
  }

  // Related districts
  for (const c of relatedCals.value ?? []) {
    const d = (allDistricts.value ?? []).find(x => x.institutionId === c.institutionId)
    if (!d) continue
    const calBreaks = getBreaks(c.events ?? [])
    const sp = calBreaks.find(b => b.name.toLowerCase().includes('spring')) ?? null
    const relatedDef = (district.value?.relatedDistricts as any[] ?? []).find((rd: any) => rd.slug === d.slug)
    rows.push({
      name: d.name, slug: d.slug, isCurrent: false,
      firstDay: c.firstDay, lastDay: c.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      daysOff: computeDaysOff(c.events ?? []),
      comparisonNote: relatedDef?.comparisonNote,
    })
  }

  return rows
})

// ── Compare insight ────────────────────────────────────────────────────────
const comparisonInsight = computed((): string => {
  const stats = comparisonStats.value
  if (stats.length < 2) return ''
  const current = stats.find(s => s.isCurrent)
  const others = stats.filter(s => !s.isCurrent)
  if (!current || !others.length) return ''
  const shortName = (n: string) => n.replace(/ School District$/, '').replace(/ Unified$/, '').replace(/ Independent$/, '') || n
  const parts = others.map(other => {
    const diff = Math.round(
      (new Date(other.firstDay + 'T00:00:00').getTime() - new Date(current.firstDay + 'T00:00:00').getTime())
      / (1000 * 60 * 60 * 24)
    )
    if (diff > 0) return `${diff} day${diff !== 1 ? 's' : ''} earlier than ${shortName(other.name)}`
    if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} later than ${shortName(other.name)}`
    return `on the same first day as ${shortName(other.name)}`
  })
  return `${shortName(current.name)} starts ${parts.join(' and ')}.`
})

// ── All Dates legend ───────────────────────────────────────────────────────
const dateLegend = [
  { label: 'Breaks', dot: 'bg-purple-400' },
  { label: 'Holidays', dot: 'bg-blue-400' },
  { label: 'No school', dot: 'bg-amber-400' },
  { label: 'Early release', dot: 'bg-green-400' },
]

if (!isStatePage && district.value) {
  const canonicalUrl = `https://myschooldates.com/${slug}`
  useSeoMeta({
    title: `${meta.value!.name} Calendar ${currentYear} | MySchoolDates`,
    description: `${meta.value!.name} academic calendar ${currentYear}. First day of school ${formatShortDate(cal!.firstDay)}, last day ${formatShortDate(cal!.lastDay)}. View all holidays, spring break, and important dates for ${meta.value!.state} public schools.`,
    ogTitle: `${meta.value!.name} Calendar ${currentYear}`,
    ogDescription: `Complete ${currentYear} school calendar for ${meta.value!.name}. All holidays, breaks, and key dates.`,
    ogUrl: canonicalUrl,
  })

  const orgAddress = {
    '@type': 'PostalAddress',
    addressLocality: meta.value!.city ?? '',
    addressRegion: (meta.value! as any).stateCode ?? meta.value!.state,
    addressCountry: 'US',
  }
  const orgRef = { '@type': 'EducationalOrganization', name: meta.value!.name, url: meta.value!.officialWebsite || canonicalUrl }

  const keyEvents = cal ? [
    ...(cal.firstDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `First Day of School — ${meta.value!.name} ${currentYear}`,
      startDate: cal.firstDay, endDate: cal.firstDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...(cal.lastDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `Last Day of School — ${meta.value!.name} ${currentYear}`,
      startDate: cal.lastDay, endDate: cal.lastDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...breaks.value.map(b => ({
      '@context': 'https://schema.org', '@type': 'Event',
      name: `${b.name} — ${meta.value!.name} ${currentYear}`,
      startDate: b.start, endDate: b.end,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    })),
  ] : []

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: meta.value!.state, item: `https://myschooldates.com/${toStateSlug(meta.value!.state)}` },
            { '@type': 'ListItem', position: 3, name: `${meta.value!.name} Calendar`, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: meta.value!.name,
          url: meta.value!.officialWebsite || canonicalUrl,
          sameAs: [canonicalUrl, meta.value!.officialWebsite].filter(Boolean),
          description: meta.value!.about ?? '',
          address: orgAddress,
        },
        ...keyEvents,
        ...(faqs.value.length ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.value.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
      ]),
    }],
  })
}
</script>

<template>
  <div>
    <!-- ── State Page ─────────────────────────────────────────────────────── -->
    <template v-if="isStatePage">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: matchedStateName! }]" />

        <!-- Hero -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ matchedStateName }} School Calendars {{ stateCurrentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Official {{ stateCurrentYear }} school calendars · {{ stateDistricts.length }} public school district{{ stateDistricts.length !== 1 ? 's' : '' }} · Sourced from official district websites
          </p>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              {{ stateDistricts.length }} districts covered
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Updated for {{ stateCurrentYear }}
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Google Calendar support
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Official district sources
            </span>
          </div>
        </div>

        <!-- Quick Facts from state data -->
        <div v-if="statePageData?.quickFacts?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="fact in statePageData.quickFacts" :key="fact.label" class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ fact.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ fact.label }}</div>
          </div>
        </div>

        <!-- About section -->
        <div v-if="statePageData?.about" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">About {{ matchedStateName }} School Calendars</h2>
          <div class="text-gray-600 leading-relaxed space-y-3">
            <p v-for="(para, i) in statePageData.about.split('\n\n')" :key="i">{{ para }}</p>
          </div>
        </div>

        <!-- District Comparison Table -->
        <div v-if="Object.keys(stateDistrictStats).length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare {{ matchedStateName }} Districts at a Glance</h2>
            <p class="text-sm text-gray-500 mt-1">First and last days, major breaks, and days off — side by side.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th class="text-left px-6 py-3 whitespace-nowrap">District</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">First Day</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Winter Break</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Spring Break</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Last Day</th>
                  <th class="text-right px-6 py-3 whitespace-nowrap">Days Off</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="d in stateDistricts" :key="d.slug" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-3">
                    <NuxtLink :to="`/${d.slug}`" class="font-medium text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap">
                      {{ d.shortName || d.name }}
                    </NuxtLink>
                  </td>
                  <template v-if="stateDistrictStats[d.institutionId]">
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stateDistrictStats[d.institutionId].firstDay) }}</td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span v-if="stateDistrictStats[d.institutionId].winterBreak">
                        {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.end) }}
                      </span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span v-if="stateDistrictStats[d.institutionId].springBreak">
                        {{ formatMonthDay(stateDistrictStats[d.institutionId].springBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].springBreak!.end) }}
                      </span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stateDistrictStats[d.institutionId].lastDay) }}</td>
                    <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ stateDistrictStats[d.institutionId].daysOff }}</td>
                  </template>
                  <template v-else>
                    <td colspan="5" class="px-4 py-3 text-xs text-gray-300">Calendar not yet available</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            Days off = full student weekdays off (breaks, holidays, no-school days). Click any district for the full calendar.
          </div>
        </div>

        <!-- District Cards -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Districts — {{ stateCurrentYear }}</h2>
          <p class="text-sm text-gray-500 mb-4">Click any district to view the full calendar, add dates to Google Calendar, or download an ICS file.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="d in stateDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div class="font-semibold text-gray-900 leading-snug">{{ d.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ (d as any).stateCode ?? d.state }}</div>
              <template v-if="stateDistrictStats[d.institutionId]">
                <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <div class="text-xs text-gray-400">First day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].firstDay) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Last day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].lastDay) }}</div>
                  </div>
                  <div v-if="stateDistrictStats[d.institutionId].winterBreak">
                    <div class="text-xs text-gray-400">Winter break</div>
                    <div class="text-sm font-medium text-gray-800">
                      {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.end) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Days off</div>
                    <div class="text-sm font-medium text-gray-800">{{ stateDistrictStats[d.institutionId].daysOff }} days</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="mt-3 text-xs text-gray-400">{{ d.currentSchoolYear }}</div>
              </template>
              <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ d.currentSchoolYear }}</span>
                <span class="text-xs font-medium text-blue-600">View calendar →</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Common Holidays -->
        <div v-if="statePageData?.commonHolidays?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Common {{ matchedStateName }} School Holidays</h2>
          <p class="text-sm text-gray-500 mb-4">Exact dates vary by district. Always verify with your district's official calendar before making plans.</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="holiday in statePageData.commonHolidays"
              :key="holiday"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
            >{{ holiday }}</span>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="statePageData?.planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Planning Tips for {{ matchedStateName }} Families</h2>
          <ul class="space-y-3">
            <li v-for="tip in statePageData.planningTips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- FAQ -->
        <div v-if="statePageData?.faqs?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in statePageData.faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Related States -->
        <div v-if="statePageData?.relatedStates?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare Nearby States</h2>
            <p class="text-sm text-gray-500 mt-1">School start dates, spring break, and holiday schedules vary significantly between states — even for neighboring districts across state lines.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink
              v-for="rs in statePageData.relatedStates"
              :key="rs.slug"
              :to="`/${rs.slug}`"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ rs.name }} School Calendars</div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- SEO footer note -->
        <p class="text-xs text-gray-400 text-center">
          All calendar data is sourced from official {{ matchedStateName }} school district websites.
          Dates are subject to board approval — always verify with your district before making plans.
        </p>

      </main>
    </template>

    <!-- ── District Page ──────────────────────────────────────────────────── -->
    <template v-else-if="district && cal">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[
          { label: 'Home', href: '/' },
          { label: district.state, href: `/${toStateSlug(district.state)}` },
          { label: district.name },
        ]" />

        <!-- Title -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ district.name }} Calendar {{ currentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Official {{ currentYear }} school calendar · Sourced from {{ district.name }} ·
            <button @click="downloadICS(district, cal)" class="underline hover:text-blue-600 transition-colors">Add to Google Calendar</button>
          </p>
          <!-- Verification badge -->
          <div class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="isEstimated
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'"
          >
            <svg v-if="!isEstimated" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span v-if="!isEstimated">Human-verified against official calendar · {{ verifiedDate }}</span>
            <span v-else>Based on official district website · Not yet human-verified</span>
          </div>
        </div>

        <!-- Today Status — HERO: first thing users see after the title -->
        <div
          v-if="todayStatus"
          class="rounded-2xl px-6 py-6"
          :class="{
            'bg-green-50 border border-green-200': todayStatus.type === 'school',
            'bg-blue-50 border border-blue-200': todayStatus.type === 'upcoming',
            'bg-purple-50 border border-purple-200': todayStatus.type === 'break',
            'bg-amber-50 border border-amber-200': todayStatus.type === 'holiday',
            'bg-gray-100 border border-gray-200': todayStatus.type === 'ended',
          }"
        >
          <div class="text-xs font-semibold uppercase tracking-wide mb-1"
            :class="{
              'text-green-500': todayStatus.type === 'school',
              'text-blue-500': todayStatus.type === 'upcoming',
              'text-purple-500': todayStatus.type === 'break',
              'text-amber-500': todayStatus.type === 'holiday',
              'text-gray-400': todayStatus.type === 'ended',
            }"
          >Today</div>
          <div
            class="font-bold text-2xl leading-tight"
            :class="{
              'text-green-800': todayStatus.type === 'school',
              'text-blue-800': todayStatus.type === 'upcoming',
              'text-purple-800': todayStatus.type === 'break',
              'text-amber-800': todayStatus.type === 'holiday',
              'text-gray-600': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.headline }}
          </div>
          <div v-if="todayStatus.detail" class="text-sm mt-1"
            :class="{
              'text-green-600': todayStatus.type === 'school',
              'text-blue-600': todayStatus.type === 'upcoming',
              'text-purple-600': todayStatus.type === 'break',
              'text-amber-600': todayStatus.type === 'holiday',
              'text-gray-500': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.detail }}
          </div>
          <!-- Primary CTA -->
          <button
            @click="downloadICS(district, cal)"
            class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </button>
        </div>

        <!-- Key Date Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.firstDay) }}</div>
            <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {{ daysUntilStart }} days away
            </div>
            <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
            <div v-else class="mt-2 text-sm text-green-600">School is in session</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.lastDay) }}</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Next Event</div>
            <template v-if="nextEvent">
              <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
            </template>
            <div v-else class="text-gray-400">No upcoming events</div>
          </div>
        </div>

        <!-- District Profile -->
        <div v-if="(district as any).studentCount || (district as any).schoolCount" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">District Profile</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
            <div v-if="(district as any).studentCount">
              <div class="text-2xl font-bold text-gray-900">{{ ((district as any).studentCount as number).toLocaleString('en-US') }}</div>
              <div class="text-xs text-gray-400 mt-0.5">students enrolled</div>
            </div>
            <div v-if="(district as any).schoolCount">
              <div class="text-2xl font-bold text-gray-900">{{ (district as any).schoolCount }}+</div>
              <div class="text-xs text-gray-400 mt-0.5">schools &amp; campuses</div>
            </div>
            <div v-if="(district as any).calendarType">
              <div class="text-sm font-semibold text-gray-900 leading-snug mt-1">
                {{ (district as any).calendarType === 'traditional' ? 'Traditional' : (district as any).calendarType === 'year-round' ? 'Year-Round' : 'Traditional + Year-Round' }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">calendar type</div>
            </div>
            <div v-if="district.grades?.length">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ district.grades[0] }} – {{ district.grades[district.grades.length - 1] }}</div>
              <div class="text-xs text-gray-400 mt-0.5">grades served</div>
            </div>
            <div v-if="(district as any).county">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ (district as any).county }}</div>
              <div class="text-xs text-gray-400 mt-0.5">county</div>
            </div>
            <div v-if="(district as any).metro">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ (district as any).metro }}</div>
              <div class="text-xs text-gray-400 mt-0.5">metro area</div>
            </div>
          </div>
          <p v-if="(district as any).districtFact" class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">{{ (district as any).districtFact }}</p>
        </div>

        <!-- Year at a Glance -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">The Year, by the Numbers</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="border border-gray-100 rounded-xl p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">School year</div>
              <div class="text-3xl font-bold text-gray-900 mb-2">{{ schoolWeeks }} <span class="text-base font-normal text-gray-400">weeks</span></div>
              <p class="text-sm text-gray-500 leading-relaxed">
                The {{ currentYear }} year runs {{ formatDate(cal.firstDay) }} through {{ formatDate(cal.lastDay) }}, about {{ schoolWeeks }} weeks.
              </p>
            </div>
            <div class="border border-gray-100 rounded-xl p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">For students</div>
              <div class="text-3xl font-bold text-gray-900 mb-2">{{ daysOffCount }} <span class="text-base font-normal text-gray-400">days off</span></div>
              <p class="text-sm text-gray-500 leading-relaxed">
                Students get {{ daysOffCount }} full weekdays off during the year — breaks, holidays, and no-school days combined.
              </p>
            </div>
            <div v-if="winterBreakDays" class="border border-gray-100 rounded-xl p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Winter break</div>
              <div class="text-3xl font-bold text-gray-900 mb-2">{{ winterBreakDays }} <span class="text-base font-normal text-gray-400">days</span></div>
              <p class="text-sm text-gray-500 leading-relaxed">
                <template v-if="breaks.find(b => b.name.toLowerCase().includes('winter') || b.name.toLowerCase().includes('christmas'))">
                  {{ (() => { const wb = breaks.find(b => b.name.toLowerCase().includes('winter') || b.name.toLowerCase().includes('christmas')); return wb ? `Winter break runs ${formatShortDate(wb.start)} to ${formatShortDate(wb.end)} — ${winterBreakDays} days.` : '' })() }}
                </template>
              </p>
            </div>
            <div class="border border-gray-100 rounded-xl p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Instructional days</div>
              <div class="text-3xl font-bold text-gray-900 mb-2">{{ cal.totalSchoolDays ?? 180 }} <span class="text-base font-normal text-gray-400">days</span></div>
              <p class="text-sm text-gray-500 leading-relaxed">
                {{ district.shortName || district.name }} schedules a {{ cal.totalSchoolDays ?? 180 }}-day instructional year, consistent with {{ district.state }} public school requirements. Makeup days may be added if school is cancelled.
              </p>
            </div>
          </div>
        </div>

        <!-- Year Switcher -->
        <div v-if="archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-500">Other years:</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ y }}
          </NuxtLink>
        </div>

        <!-- About / Calendar Context -->
        <div class="text-gray-600 leading-relaxed space-y-3 text-sm">
          <template v-if="cal.calendarNotes">
            <p v-for="(para, i) in cal.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
          </template>
          <template v-else>
            <p>
              The {{ currentYear }} academic year for {{ district.name }} runs from
              <strong>{{ formatDate(cal.firstDay) }}</strong> to
              <strong>{{ formatDate(cal.lastDay) }}</strong>,
              covering {{ cal.totalSchoolDays ?? 180 }} instructional days across {{ cal.semesters ?? 2 }} semesters.
              <span v-if="secondSemStart">
                The second semester begins {{ formatShortDate(secondSemStart) }} following the winter recess.
              </span>
            </p>
            <p v-if="breaks.length">
              Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
              {{ breaks.map(b => b.name).join(', ') }} — plus all federal holidays.
              <span v-if="yearComparison" class="italic text-gray-500"> {{ yearComparison }}</span>
            </p>
          </template>
          <p v-if="district.about && !cal.calendarNotes" class="text-gray-500">{{ district.about }}</p>
        </div>

        <!-- Upcoming Events — timeline of next 6 events -->
        <div v-if="upcomingEvents.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Upcoming Dates</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="event in upcomingEvents"
              :key="event.date + event.type"
              class="flex items-center gap-4 px-6 py-3.5"
            >
              <!-- Date column -->
              <div class="w-16 flex-shrink-0 text-center">
                <div class="text-xs font-semibold text-gray-400 uppercase">
                  {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }) }}
                </div>
                <div class="text-xl font-bold text-gray-900 leading-tight">
                  {{ new Date(event.date + 'T00:00:00').getDate() }}
                </div>
              </div>
              <!-- Divider -->
              <div class="w-px h-8 bg-gray-200 flex-shrink-0" />
              <!-- Event info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 text-sm">{{ event.name }}</div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }) }}
                </div>
              </div>
              <!-- Badge -->
              <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" :class="eventTypeColor[event.type]">
                {{ eventTypeLabel[event.type] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Facts -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ currentYear }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.totalSchoolDays ?? 180 }}</div>
              <div class="text-xs text-gray-500 mt-1">Instructional Days</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.teacherWorkDays ?? '—' }}</div>
              <div class="text-xs text-gray-500 mt-1">Teacher Work Days</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.semesters ?? 2 }}</div>
              <div class="text-xs text-gray-500 mt-1">Semesters</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ breaks.length }}</div>
              <div class="text-xs text-gray-500 mt-1">Major Breaks</div>
            </div>
            <div v-if="(district as any).studentCount" class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ ((district as any).studentCount as number).toLocaleString('en-US') }}</div>
              <div class="text-xs text-gray-500 mt-1">Students</div>
            </div>
            <div v-if="(district as any).schoolCount" class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ (district as any).schoolCount }}+</div>
              <div class="text-xs text-gray-500 mt-1">Schools</div>
            </div>
          </div>
          <!-- Data source row -->
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Source:</span>
            <a
              :href="cal.sourceUrl ?? district.calendarPage ?? district.officialWebsite"
              target="_blank"
              rel="nofollow noopener"
              class="underline text-gray-500 hover:text-blue-600 transition-colors"
            >{{ district.name }} official calendar</a>
            <span v-if="!isEstimated" class="ml-1 text-green-600 font-medium">· Verified {{ verifiedDate }}</span>
            <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
          </div>
        </div>

        <!-- Break Summary -->
        <div v-if="breaks.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Major School Breaks</h2>
          <div class="space-y-3">
            <div v-for="b in breaks" :key="b.name" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <div class="font-medium text-gray-900">{{ b.name }}</div>
                <div class="text-sm text-gray-500">{{ formatShortDate(b.start) }} – {{ formatShortDate(b.end) }}</div>
                <div v-if="daysUntil(b.start) > 0" class="text-xs text-blue-600 mt-0.5 font-medium">
                  Starts in {{ daysUntil(b.start) }} day{{ daysUntil(b.start) !== 1 ? 's' : '' }}
                </div>
                <div v-else-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-purple-600 mt-0.5 font-medium">
                  In progress
                </div>
              </div>
              <div class="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{{ b.days }} days</div>
            </div>
          </div>
        </div>

        <!-- Add to Calendar + Share -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <!-- Add to Calendar -->
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Add to Calendar</h2>
            <p class="text-sm text-gray-500 mb-4">Download the {{ district.name }} {{ currentYear }} calendar and import it into your calendar app.</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <!-- Apple Calendar -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 14h2l1 2 2-5 1 3h2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Apple<br>Calendar</span>
              </button>
              <!-- Google Calendar -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="12" cy="15" r="2.5" stroke-width="1.5"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Google<br>Calendar</span>
              </button>
              <!-- Outlook -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 13h8M8 17h5" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Outlook</span>
              </button>
              <!-- Download .ics -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all text-center"
              >
                <svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="text-xs font-medium text-blue-700 leading-tight">Download<br>.ics File</span>
              </button>
            </div>
            <p class="text-xs text-gray-400">All formats use the standard .ics file. After downloading, open the file to import into your calendar app.</p>
          </div>

          <!-- Share with Parents -->
          <div class="p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-3">Share with Parents</h3>
            <div class="flex flex-wrap gap-3">
              <!-- Copy Link -->
              <button
                @click="copyLink"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ copied ? 'Copied!' : 'Copy Link' }}
              </button>
              <!-- WhatsApp -->
              <button
                @click="shareWhatsApp"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a7.947 7.947 0 01-3.794-.964l-4.21 1.104 1.126-4.108a7.934 7.934 0 01-1.062-3.965C4.09 7.148 7.666 3.573 12.03 3.573c2.116 0 4.099.823 5.59 2.317a7.862 7.862 0 012.31 5.587c-.002 4.358-3.579 7.403-7.901 7.403z"/>
                </svg>
                WhatsApp
              </button>
              <!-- Text / SMS -->
              <button
                @click="shareSMS"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Text
              </button>
              <!-- Twitter / X -->
              <button
                @click="shareTwitter"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </button>
              <!-- Reddit -->
              <button
                @click="shareReddit"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                Reddit
              </button>
              <!-- Official source -->
              <a
                :href="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
                target="_blank"
                rel="nofollow noopener"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Official Source
              </a>
            </div>
          </div>
        </div>

        <!-- All Dates -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">All Important Dates</h2>
            <!-- Legend -->
            <div class="flex flex-wrap gap-3">
              <span
                v-for="item in dateLegend"
                :key="item.label"
                class="inline-flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span class="w-2 h-2 rounded-full flex-shrink-0" :class="item.dot" />
                {{ item.label }}
              </span>
            </div>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="event in cal.events"
              :key="event.date + event.type"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <div class="font-medium text-gray-900">{{ event.name }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(event.date) }}</div>
              </div>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="eventTypeColor[event.type]">
                {{ eventTypeLabel[event.type] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Compare with Nearby Districts -->
        <div v-if="comparisonStats.length > 1" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare with Nearby Districts</h2>
            <p class="text-sm text-gray-500 mt-1">First day, spring break, and days off for {{ currentYear }} — side by side.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th class="text-left px-6 py-3 whitespace-nowrap">District</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">First Day</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Spring Break</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Last Day</th>
                  <th class="text-right px-6 py-3 whitespace-nowrap">Days Off</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="stat in comparisonStats" :key="stat.slug"
                  :class="stat.isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50 transition-colors'"
                >
                  <td class="px-6 py-3">
                    <template v-if="stat.isCurrent">
                      <span class="font-semibold text-blue-800 whitespace-nowrap">{{ stat.name }}</span>
                      <span class="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">this district</span>
                    </template>
                    <template v-else>
                      <NuxtLink :to="`/${stat.slug}`" class="font-medium text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap">
                        {{ stat.name }}
                      </NuxtLink>
                      <p v-if="stat.comparisonNote" class="text-xs text-gray-500 mt-0.5 leading-snug max-w-xs">{{ stat.comparisonNote }}</p>
                    </template>
                  </td>
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stat.firstDay) }}</td>
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span v-if="stat.springBreak">{{ formatMonthDay(stat.springBreak.start) }} – {{ formatMonthDay(stat.springBreak.end) }}</span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stat.lastDay) }}</td>
                  <td class="px-6 py-3 text-right font-semibold" :class="stat.isCurrent ? 'text-blue-800' : 'text-gray-900'">{{ stat.daysOff }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="comparisonInsight" class="px-6 py-3 border-t border-gray-100 text-xs text-gray-500 italic">{{ comparisonInsight }}</p>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="(district as any).planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Planning Tips for {{ district.shortName || district.name }} Families</h2>
          <ul class="space-y-3">
            <li v-for="tip in (district as any).planningTips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- Living Here -->
        <div v-if="(district as any).livingHere" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Living in {{ district.city || district.name }}</h2>
          <p v-if="(district as any).livingHere.intro" class="text-sm text-gray-500 mb-4 leading-relaxed">{{ (district as any).livingHere.intro }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div v-for="h in (district as any).livingHere.highlights" :key="h.label" class="flex items-start gap-2.5">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
              <div>
                <span class="font-medium text-gray-900 text-sm">{{ h.label }}</span>
                <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ h.detail }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Districts -->
        <div v-if="district.relatedDistricts?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Nearby School Districts</h2>
            <p class="text-sm text-gray-500 mt-1">Compare nearby {{ district.state }} school districts.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink v-for="rd in district.relatedDistricts" :key="rd.slug" :to="`/${rd.slug}`" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <div class="font-medium text-gray-900">{{ rd.name }}</div>
                <div class="text-sm text-gray-500">{{ rd.state }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Data quality notice -->
        <div v-if="isEstimated" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-gray-700">Dates not yet verified</p>
              <p>
                These dates have not been confirmed against the official {{ currentYear }} calendar.
                Always check the
                <a :href="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium text-gray-700">official {{ district.name }} calendar</a>
                before making travel or childcare plans.
              </p>
            </div>
          </div>
        </div>

        <div v-else class="bg-green-50 border border-green-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-green-700 space-y-1">
              <p class="font-medium">Human-verified against official district calendar</p>
              <p>
                Dates sourced directly from the
                <a :href="cal.sourceUrl ?? district.calendarPage ?? district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium">official {{ district.shortName || district.name }} calendar</a>.
                Dates are subject to board approval and may change — always confirm before making travel or childcare plans.
              </p>
              <p class="text-green-600 text-xs">Last verified: {{ verifiedDate }}</p>
            </div>
          </div>
        </div>

      </main>
    </template>
  </div>
</template>
