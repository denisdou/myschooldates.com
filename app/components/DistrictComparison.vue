<script setup lang="ts">
export type ComparisonRow = {
  name: string
  shortName: string | null
  slug: string
  isCurrent: boolean
  firstDay: string
  lastDay: string
  totalSchoolDays?: number | null
  calendarType?: string | null
  studentCount?: number | null
  schoolCount?: number | null
  county?: string | null
  fallBreak: { start: string; end: string } | null
  springBreak: { start: string; end: string } | null
  winterBreak: { start: string; end: string } | null
  thanksgivingBreak: { start: string; end: string } | null
  comparisonNote?: string
  sourceUrl?: string
  sourceLabel?: string
  sourceVersion?: string
  extraSourceUrl?: string
  extraSourceLabel?: string
  comparisonLabel?: string
  comparisonValues?: Record<string, string>
  calendarPath?: string
}

const props = defineProps<{
  cal: any
  district: any
  relatedCals: any[]
  allDistricts: any[]
  year: string
}>()

const { getBreaks } = useDistrictPage()

const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const fmtRange = (start: string, end: string) => {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()}–${endDate.toLocaleString('en-US', { month: 'short' })} ${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  return `${fmt(start)}–${fmt(end)}`
}

const fmtValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number') return value.toLocaleString('en-US')
  return String(value)
}

const displaySchoolYear = computed(() => {
  const match = String(props.year).match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : props.year
})

const calendarTypeLabel = (type?: string | null) => {
  if (!type) return ''
  if (type === 'traditional') return 'Traditional'
  if (type === 'year-round') return 'Year-round'
  if (type === 'district-wide') return 'District-wide'
  return type
    .split(/[-_]/)
    .map(part => part ? part[0]!.toUpperCase() + part.slice(1) : part)
    .join(' ')
}

const pdfSourceLabel = (district: any, cal: any, relatedDef?: any) => {
  const custom = relatedDef?.comparisonSourceLabel ?? cal?.comparisonSourceLabel ?? cal?.meta?.comparisonSourceLabel
  if (custom) return custom
  const shortName = relatedDef?.comparisonLabel ?? district?.comparisonLabel ?? district?.shortName
  if (shortName) return `${shortName} ${displaySchoolYear.value} calendar PDF`
  const name = String(district?.name ?? 'District')
    .replace(/ County Public Schools$/, '')
    .replace(/ School District$/, '')
    .replace(/ Schools$/, '')
  return `${name} ${displaySchoolYear.value} calendar PDF`
}

const pageSourceLabel = (district: any, relatedDef?: any) => {
  const custom = relatedDef?.comparisonPageSourceLabel
  if (custom) return custom
  const shortName = relatedDef?.comparisonLabel ?? district?.comparisonLabel ?? district?.shortName
  if (shortName) return `${shortName} calendar page`
  const name = String(district?.name ?? 'District')
    .replace(/ County Public Schools$/, '')
    .replace(/ School District$/, '')
    .replace(/ Schools$/, '')
  return `${name} calendar page`
}

const comparisonValueOverridesFor = (slug?: string | null, relatedDef?: any) => {
  const configured = (props.cal as any)?.comparisonValueOverrides ??
    (props.cal as any)?.meta?.comparisonValueOverrides ??
    (props.district as any)?.comparisonValueOverrides ??
    (props.district as any)?.meta?.comparisonValueOverrides ??
    {}
  const bySlug = slug ? configured?.[slug] : undefined
  return (bySlug ?? relatedDef?.comparisonValueOverrides ?? {}) as Record<string, string>
}

const cleanBreakLabel = (name: string, fallback: string) => {
  const cleaned = name
    .replace(/\b(Begins|Starts|Begin|Start)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || fallback
}

const isLateDecemberBreak = (schoolBreak: { name: string; start?: string; end?: string }) => {
  const lower = schoolBreak.name.toLowerCase()
  const startMonth = schoolBreak.start ? new Date(`${schoolBreak.start}T00:00:00`).getMonth() : -1
  const endMonth = schoolBreak.end ? new Date(`${schoolBreak.end}T00:00:00`).getMonth() : -1
  const isDecemberWindow = startMonth === 11 || endMonth === 0
  return lower.includes('winter') ||
    lower.includes('christmas') ||
    lower.includes('december') ||
    (lower.includes('holiday') && isDecemberWindow)
}

const holidayRange = (events: any[], label: string) => {
  const matches = events
    .filter((event: any) => event?.type === 'holiday' && String(event.name ?? '').toLowerCase().includes(label))
    .map((event: any) => event.date)
    .filter(Boolean)
    .sort()
  if (!matches.length) return null
  return { start: matches[0], end: matches[matches.length - 1] }
}

const configuredRange = (cal: any, key: string) => {
  const ranges = cal?.comparisonRanges ?? cal?.meta?.comparisonRanges
  const value = ranges?.[key]
  if (value?.start && value?.end) return { start: value.start, end: value.end }
  return null
}

const winterBreakLabel = computed(() => {
  const configuredLabel = (props.cal as any)?.winterBreakComparisonLabel ??
    (props.cal as any)?.meta?.winterBreakComparisonLabel ??
    (props.district as any)?.winterBreakComparisonLabel ??
    (props.district as any)?.meta?.winterBreakComparisonLabel
  if (configuredLabel) return configuredLabel
  const winterBreak = getBreaks(props.cal?.events ?? []).find((b: any) => isLateDecemberBreak(b))
  return winterBreak ? cleanBreakLabel(winterBreak.name, 'Winter Break') : 'Winter Break'
})

const springBreakComparisonLabel = computed(() =>
  props.district?.springBreakComparisonLabel ??
  props.district?.meta?.springBreakComparisonLabel ??
  props.cal?.springBreakComparisonLabel ??
  props.cal?.meta?.springBreakComparisonLabel ??
  'Spring Break'
)

const displayName = (row: ComparisonRow) => {
  if (row.comparisonLabel) return row.comparisonLabel
  if (row.name.includes('Pinellas')) return 'Pinellas'
  if (row.name.includes('Pasco')) return 'Pasco'
  if (row.name.includes('Duval')) return 'Duval'
  if (row.name.includes('Hillsborough')) return 'Hillsborough'
  if (row.shortName === 'CCS' && row.name.includes('Cabarrus')) return 'Cabarrus County'
  return row.shortName ?? row.name
}
const reviewedDate = computed(() => {
  if (!props.cal?.lastVerifiedAt) return ''
  return new Date(props.cal.lastVerifiedAt + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const rows = computed((): ComparisonRow[] => {
  const result: ComparisonRow[] = []
  if (props.cal && props.district) {
    const calBreaks = getBreaks(props.cal.events ?? [])
    const sp = calBreaks.find((b: any) => b.name.toLowerCase().includes('spring')) ?? null
    const fall = calBreaks.find((b: any) => b.name.toLowerCase().includes('fall')) ?? null
    const winter = calBreaks.find((b: any) => isLateDecemberBreak(b)) ?? null
    const thanksgiving = configuredRange(props.cal, 'thanksgivingBreak') ?? calBreaks.find((b: any) => b.name.toLowerCase().includes('thanksgiving')) ?? holidayRange(props.cal.events ?? [], 'thanksgiving')
    result.push({
      name: props.district.name, shortName: props.district.shortName ?? null,
      slug: props.district.slug, isCurrent: true,
      firstDay: props.cal.firstDay, lastDay: props.cal.lastDay,
      totalSchoolDays: props.cal.totalSchoolDays ?? null,
      calendarType: props.cal.calendarType ?? props.district.calendarType ?? null,
      studentCount: props.district.studentCount ?? null,
      schoolCount: props.district.schoolCount ?? null,
      county: props.district.county ?? null,
      fallBreak: fall ? { start: fall.start, end: fall.end } : null,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      winterBreak: winter ? { start: winter.start, end: winter.end } : null,
      thanksgivingBreak: thanksgiving ? { start: thanksgiving.start, end: thanksgiving.end } : null,
      sourceUrl: props.cal.comparisonSourceUrl || props.cal.sourcePdfUrl || props.cal.sourceUrl || props.district.calendarPage || props.district.officialWebsite,
      sourceLabel: props.cal.comparisonSourceLabel ?? props.cal.meta?.comparisonSourceLabel,
      sourceVersion: props.cal.sourceVersion,
      extraSourceUrl: props.cal.comparisonExtraSourceUrl ?? props.cal.meta?.comparisonExtraSourceUrl,
      extraSourceLabel: props.cal.comparisonExtraSourceLabel ?? props.cal.meta?.comparisonExtraSourceLabel,
      comparisonLabel: props.cal.comparisonLabel ?? props.cal.meta?.comparisonLabel ?? props.district.comparisonLabel ?? props.district.meta?.comparisonLabel,
      comparisonValues: comparisonValueOverridesFor(props.district.slug),
      calendarPath: `/${props.district.slug}/${props.year}`,
    })
  }
  const configuredComparisonSlugs = ((props.cal as any)?.comparisonDistrictSlugs ??
    (props.cal as any)?.meta?.comparisonDistrictSlugs ??
    (props.district as any)?.comparisonDistrictSlugs ??
    (props.district as any)?.meta?.comparisonDistrictSlugs ??
    []) as string[]
  const relatedCalPool = configuredComparisonSlugs.length
    ? configuredComparisonSlugs
        .map(slug => (props.relatedCals ?? []).find((c: any) => {
          const d = (props.allDistricts ?? []).find((x: any) => x.institutionId === c.institutionId)
          return d?.slug === slug
        }))
        .filter(Boolean)
    : (props.relatedCals ?? []).slice(0, 3)

  for (const c of relatedCalPool) {
    const d = (props.allDistricts ?? []).find((x: any) => x.institutionId === c.institutionId)
    if (!d) continue
    const calBreaks = getBreaks(c.events ?? [])
    const sp = calBreaks.find((b: any) => b.name.toLowerCase().includes('spring')) ?? null
    const fall = calBreaks.find((b: any) => b.name.toLowerCase().includes('fall')) ?? null
    const winter = calBreaks.find((b: any) => isLateDecemberBreak(b)) ?? null
    const thanksgiving = configuredRange(c, 'thanksgivingBreak') ?? calBreaks.find((b: any) => b.name.toLowerCase().includes('thanksgiving')) ?? holidayRange(c.events ?? [], 'thanksgiving')
    const relatedDef = (props.district?.relatedDistricts as any[] ?? []).find((rd: any) => rd.slug === d.slug)
    result.push({
      name: d.name, shortName: d.shortName ?? null,
      slug: d.slug, isCurrent: false,
      firstDay: c.firstDay, lastDay: c.lastDay,
      totalSchoolDays: c.totalSchoolDays ?? null,
      calendarType: c.calendarType ?? d.calendarType ?? null,
      studentCount: d.studentCount ?? null,
      schoolCount: d.schoolCount ?? null,
      county: d.county ?? null,
      fallBreak: fall ? { start: fall.start, end: fall.end } : null,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      winterBreak: winter ? { start: winter.start, end: winter.end } : null,
      thanksgivingBreak: thanksgiving ? { start: thanksgiving.start, end: thanksgiving.end } : null,
      comparisonNote: relatedDef?.comparisonNote,
      sourceUrl: c.sourcePdfUrl || c.sourceUrl || d.calendarPage || d.officialWebsite,
      sourceLabel: c.sourcePdfUrl ? pdfSourceLabel(d, c, relatedDef) : undefined,
      sourceVersion: c.sourceVersion,
      extraSourceUrl: c.sourcePdfUrl && c.sourceUrl ? c.sourceUrl : undefined,
      extraSourceLabel: c.sourcePdfUrl && c.sourceUrl ? pageSourceLabel(d, relatedDef) : undefined,
      comparisonLabel: relatedDef?.comparisonLabel,
      comparisonValues: comparisonValueOverridesFor(d.slug, relatedDef),
      calendarPath: c.schoolYear ? `/${d.slug}/${c.schoolYear}` : `/${d.slug}`,
    })
  }
  return result
})

const comparisonInsights = computed((): { label: string; items: string[] }[] => {
  const customInsights = ((props.cal as any)?.comparisonInsights ??
    (props.cal as any)?.meta?.comparisonInsights ??
    (props.district as any)?.comparisonInsights ??
    (props.district as any)?.meta?.comparisonInsights ??
    []) as { label: string; items: string[] }[]
  if (customInsights.length) return customInsights
  if ((props.cal as any)?.hideComparisonInsights ?? (props.cal as any)?.meta?.hideComparisonInsights ?? (props.district as any)?.hideComparisonInsights ?? (props.district as any)?.meta?.hideComparisonInsights) return []
  if (rows.value.length < 2) return []
  const current = rows.value.find(s => s.isCurrent)
  const others = rows.value.filter(s => !s.isCurrent)
  if (!current || !others.length) return []
  const sn = (n: string) => {
    if (n.includes('Broward')) return 'Broward'
    if (n.includes('Palm Beach')) return 'Palm Beach'
    return n
      .replace(/ County Public Schools$/, '')
      .replace(/ School District$/, '')
      .replace(/ Unified$/, '')
      .replace(/ Independent$/, '') || n
  }
  const compareDate = (field: 'firstDay' | 'lastDay', label: string) => {
    return others.map(other => {
      const diff = Math.round(
        (new Date(other[field] + 'T00:00:00').getTime() - new Date(current[field] + 'T00:00:00').getTime())
        / (1000 * 60 * 60 * 24)
      )
      if (diff > 0) return `${Math.abs(diff)} calendar day${Math.abs(diff) !== 1 ? 's' : ''} earlier than ${sn(other.name)}`
      if (diff < 0) return `${Math.abs(diff)} calendar day${Math.abs(diff) !== 1 ? 's' : ''} later than ${sn(other.name)}`
      return `Same ${label} as ${sn(other.name)}`
    })
  }
  return [
    { label: 'Start date comparison', items: compareDate('firstDay', 'first day') },
    { label: 'End date comparison', items: compareDate('lastDay', 'last day') },
  ]
})

const dynamicIntro = computed(() => {
  const names = rows.value.map(row => displayName(row))
  if (names.length < 2) return ''
  return `Compare ${displayName(rows.value[0]!)} with ${names.slice(1).join(', ')}. The table focuses on school-year boundaries and major breaks.`
})

const comparisonRows = computed(() => {
  const customRows = ((props.cal as any)?.comparisonCustomRows ??
    (props.cal as any)?.meta?.comparisonCustomRows ??
    (props.district as any)?.comparisonCustomRows ??
    (props.district as any)?.meta?.comparisonCustomRows ??
    []) as { key?: string; label: string; values: Record<string, string> }[]
  if (customRows.length) {
    return customRows.map((row, index) => ({
      key: row.key ?? `custom-${index}`,
      label: row.label,
      value: (comparisonRow: ComparisonRow) =>
        row.values?.[comparisonRow.slug] ??
        (comparisonRow.shortName ? row.values?.[comparisonRow.shortName] : undefined) ??
        row.values?.[displayName(comparisonRow)] ??
        '',
    }))
  }

  const labelOverrides = ((props.cal as any)?.comparisonRowLabels ??
    (props.cal as any)?.meta?.comparisonRowLabels ??
    (props.district as any)?.comparisonRowLabels ??
    (props.district as any)?.meta?.comparisonRowLabels ??
    {}) as Record<string, string>
  const baseRows = [
    {
      key: 'firstDay',
      label: labelOverrides.firstDay ?? 'First Day',
      value: (row: ComparisonRow) => row.comparisonValues?.firstDay ?? fmt(row.firstDay),
    },
    {
      key: 'lastDay',
      label: labelOverrides.lastDay ?? 'Last Day',
      value: (row: ComparisonRow) => row.comparisonValues?.lastDay ?? fmt(row.lastDay),
    },
    {
      key: 'fallBreak',
      label: labelOverrides.fallBreak ?? 'Fall Break',
      value: (row: ComparisonRow) => row.comparisonValues?.fallBreak ?? (row.fallBreak ? fmtRange(row.fallBreak.start, row.fallBreak.end) : ''),
    },
    {
      key: 'instructionalDays',
      label: labelOverrides.instructionalDays ?? 'Instruction Days',
      value: (row: ComparisonRow) => row.totalSchoolDays ? `${row.totalSchoolDays} days` : '',
    },
    {
      key: 'thanksgivingBreak',
      label: labelOverrides.thanksgivingBreak ?? 'Thanksgiving',
      value: (row: ComparisonRow) => row.comparisonValues?.thanksgivingBreak ?? (row.thanksgivingBreak ? fmtRange(row.thanksgivingBreak.start, row.thanksgivingBreak.end) : ''),
    },
    {
      key: 'winterBreak',
      label: winterBreakLabel.value,
      value: (row: ComparisonRow) => row.comparisonValues?.winterBreak ?? (row.winterBreak ? fmtRange(row.winterBreak.start, row.winterBreak.end) : ''),
    },
    {
      key: 'springBreak',
      label: springBreakComparisonLabel.value,
      value: (row: ComparisonRow) => row.comparisonValues?.springBreak ?? (row.springBreak ? fmtRange(row.springBreak.start, row.springBreak.end) : ''),
    },
    {
      key: 'calendarType',
      label: 'Calendar Type',
      value: (row: ComparisonRow) => calendarTypeLabel(row.calendarType),
    },
    {
      key: 'students',
      label: 'Students',
      value: (row: ComparisonRow) => fmtValue(row.studentCount),
    },
    {
      key: 'schools',
      label: 'Schools',
      value: (row: ComparisonRow) => row.schoolCount ? `${row.schoolCount}+` : '',
    },
    {
      key: 'county',
      label: 'County',
      value: (row: ComparisonRow) => fmtValue(row.county),
    },
  ]
  const includeRows = (((props.cal as any)?.comparisonRowsInclude ?? (props.cal as any)?.meta?.comparisonRowsInclude ?? (props.district as any)?.comparisonRowsInclude ?? (props.district as any)?.meta?.comparisonRowsInclude ?? []) as string[])
  const candidates = includeRows.length
    ? baseRows.filter(def => includeRows.includes(def.key))
    : baseRows
  const rowsMode = (props.cal as any)?.comparisonRowsMode
    ?? (props.cal as any)?.meta?.comparisonRowsMode
    ?? (props.district as any)?.comparisonRowsMode
    ?? (props.district as any)?.meta?.comparisonRowsMode
  if (rowsMode === 'sharedValuesOnly') {
    return candidates.filter(def => rows.value.every(row => def.value(row)))
  }
  return candidates.filter(def => rows.value.some(row => def.value(row)))
})

const compareIntro = computed(() => {
  const intro = (props.cal as any)?.comparisonSummary ?? (props.cal as any)?.meta?.comparisonSummary ?? (props.cal as any)?.compareIntro ?? (props.cal as any)?.meta?.compareIntro ?? (props.district as any).compareIntro ?? ''
  const yearPattern = /\b\d{4}-\d{4}\b/
  if (!intro) return dynamicIntro.value
  if (yearPattern.test(intro) && !intro.includes(props.year)) return dynamicIntro.value
  return intro
})

const sourceRows = computed(() => rows.value.filter(row => row.sourceUrl))
const comparisonTitle = computed(() => {
  const customTitle = (props.cal as any)?.comparisonTitle ?? (props.cal as any)?.meta?.comparisonTitle ?? (props.district as any)?.comparisonTitle ?? (props.district as any)?.meta?.comparisonTitle
  if (customTitle) return customTitle
  const current = rows.value.find(row => row.isCurrent)
  const currentName = current?.name
    ? current.name
      .replace(/ School District$/, '')
      .replace(/ Unified$/, ' Unified')
      .replace(/ Independent$/, ' Independent')
    : (props.district?.shortName ?? props.district?.name ?? 'District')
  const relatedRows = rows.value.filter(row => !row.isCurrent)
  const currentState = props.district?.state
  const allRelatedInState = Boolean(currentState) && relatedRows.length > 0 && relatedRows.every(row => {
    const relatedDistrict = (props.allDistricts ?? []).find((d: any) => d.slug === row.slug)
    return relatedDistrict?.state === currentState
  })
  return `${currentName} Calendar Compared With ${allRelatedInState ? 'Nearby Districts' : 'Large Districts'}`
})
const comparisonSubheading = computed(() =>
  (props.cal as any)?.comparisonSubheading ?? (props.cal as any)?.meta?.comparisonSubheading ?? (props.district as any)?.comparisonSubheading ?? (props.district as any)?.meta?.comparisonSubheading ?? ''
)
const comparisonDefaultOpen = computed(() =>
  Boolean((props.cal as any)?.comparisonDefaultOpen ?? (props.cal as any)?.meta?.comparisonDefaultOpen ?? (props.district as any)?.comparisonDefaultOpen ?? (props.district as any)?.meta?.comparisonDefaultOpen)
)
const showComparisonNotes = computed(() =>
  !Boolean((props.cal as any)?.hideComparisonNotes ?? (props.cal as any)?.meta?.hideComparisonNotes)
)
const comparisonReviewedText = computed(() =>
  (props.cal as any)?.comparisonReviewedText ?? (props.cal as any)?.meta?.comparisonReviewedText ?? (props.district as any)?.comparisonReviewedText ?? (props.district as any)?.meta?.comparisonReviewedText ?? ''
)
const comparisonSourceNote = computed(() =>
  (props.cal as any)?.comparisonSourceNote ??
  (props.cal as any)?.meta?.comparisonSourceNote ??
  (props.district as any)?.comparisonSourceNote ??
  (props.district as any)?.meta?.comparisonSourceNote ??
  "Rows compare equivalent break periods, although districts may use different labels. Adjacent holidays and staff workdays are not included unless they fall within the listed range."
)
const comparisonFooterText = computed(() =>
  (props.cal as any)?.comparisonFooterText ??
  (props.cal as any)?.meta?.comparisonFooterText ??
  (props.district as any)?.comparisonFooterText ??
  (props.district as any)?.meta?.comparisonFooterText ??
  ''
)
const comparisonCaption = computed(() =>
  (props.cal as any)?.comparisonCaption ??
  (props.cal as any)?.meta?.comparisonCaption ??
  `${displaySchoolYear.value} calendar comparison for ${rows.value.map(row => row.name).join(', ')}`
)
</script>

<template>
  <section id="comparison" v-if="rows.length > 1" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden scroll-mt-24 shadow-[0_1px_0_rgba(31,41,51,0.03)]">
    <div class="px-6 py-4 border-b border-[#ebe6dd]">
      <h2 class="text-lg font-semibold text-[#1f2933]">{{ comparisonTitle }}</h2>
      <p v-if="compareIntro" class="text-sm text-[#6b645c] mt-1 leading-relaxed">{{ compareIntro }}</p>
      <div v-if="comparisonInsights.length" class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="group in comparisonInsights" :key="group.label" class="rounded-lg bg-[#f3f0e8] border border-[#e6e1d8] p-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-[#7b756d]">{{ group.label }}</h3>
          <ul class="mt-2 space-y-1">
            <li v-for="item in group.items" :key="item" class="text-sm text-[#6b645c]">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>

    <details :open="comparisonDefaultOpen" class="group">
      <summary class="cursor-pointer list-none px-6 py-3 border-b border-[#ebe6dd]">
        <span class="flex items-center justify-between gap-4">
          <span class="text-sm font-semibold text-[#4f5b5f]">View full comparison table</span>
          <span class="text-sm font-medium text-[#0f5d6b] group-open:hidden">Show</span>
          <span class="text-sm font-medium text-[#0f5d6b] hidden group-open:inline">Hide</span>
        </span>
      </summary>

    <div v-if="comparisonSubheading" class="px-6 pt-4">
      <p class="text-sm font-medium text-[#1f2933]">{{ comparisonSubheading }}</p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">
          {{ comparisonCaption }}
        </caption>
        <thead>
          <tr class="bg-[#f3f0e8] border-b border-[#ebe6dd]">
            <th scope="col" class="text-left px-6 py-3 text-xs font-semibold text-[#7b756d] uppercase tracking-wide w-36 whitespace-nowrap">
              Calendar Feature
            </th>
            <th
              v-for="row in rows"
              :key="row.slug"
              scope="col"
              class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
              :class="row.isCurrent ? 'text-[#0f5d6b]' : 'text-[#7b756d]'"
            >
              <span v-if="row.isCurrent">{{ displayName(row) }}</span>
              <NuxtLink v-else :to="row.calendarPath ?? `/${row.slug}`" class="hover:text-[#0f5d6b] transition-colors">
                {{ displayName(row) }}
              </NuxtLink>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#eee9df]">
          <tr v-for="feature in comparisonRows" :key="feature.key" class="hover:bg-[#f6f2ea] transition-colors">
            <th scope="row" class="px-6 py-3 text-left text-xs font-medium text-[#7b756d] whitespace-nowrap">{{ feature.label }}</th>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-[#0f5d6b]' : 'text-[#6b645c]'"
            >
              <span v-if="feature.value(row)">{{ feature.value(row) }}</span>
              <span v-else class="text-[#aaa39a]">Not available in reviewed source</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showComparisonNotes && rows.some(r => !r.isCurrent && r.comparisonNote)" class="px-6 py-4 border-t border-[#ebe6dd] space-y-2">
      <template v-for="row in rows.filter(r => !r.isCurrent && r.comparisonNote)" :key="row.slug">
        <p class="text-sm text-[#6b645c] leading-relaxed">
          <NuxtLink :to="row.calendarPath ?? `/${row.slug}`" class="font-medium text-[#1f2933] hover:text-[#0f5d6b] transition-colors">{{ displayName(row) }}</NuxtLink>: {{ row.comparisonNote }}
        </p>
      </template>
    </div>

    </details>

    <div class="px-6 py-3 border-t border-[#ebe6dd] text-xs text-[#6b645c]">
      <p v-if="comparisonFooterText">
        {{ comparisonFooterText }}
        <template v-if="comparisonReviewedText"> {{ comparisonReviewedText }}</template>
        <template v-else-if="reviewedDate"> Last reviewed {{ reviewedDate }}.</template>
      </p>
      <p v-else>
        Dates come from each district's published {{ displaySchoolYear }} calendar. {{ comparisonSourceNote }}
        <template v-if="comparisonReviewedText"> {{ comparisonReviewedText }}</template>
        <template v-else-if="reviewedDate"> Last reviewed {{ reviewedDate }}.</template>
      </p>
      <div v-if="sourceRows.length" class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="row in sourceRows" :key="row.slug" class="leading-relaxed">
          <div class="mb-0.5 font-semibold text-[#4f5b5f]">{{ displayName(row) }}</div>
          <p class="flex min-w-0 flex-col gap-1">
            <span class="flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap">
              <a :href="row.sourceUrl" target="_blank" rel="noopener" class="inline-flex min-w-0 items-center truncate underline underline-offset-2 hover:text-[#0f5d6b] transition-colors">
                {{ row.sourceLabel || `${displayName(row)} official calendar` }}<span class="sr-only">(opens in a new tab)</span>
              </a>
              <span v-if="row.sourceVersion" class="hidden flex-shrink-0 text-[#7b756d] lg:inline"> · {{ row.sourceVersion }}</span>
            </span>
            <template v-if="row.extraSourceUrl">
              <a :href="row.extraSourceUrl" target="_blank" rel="noopener" class="block underline underline-offset-2 hover:text-[#0f5d6b] transition-colors">{{ row.extraSourceLabel || 'district calendar page' }}<span class="sr-only">(opens in a new tab)</span></a>
            </template>
          </p>
        </div>
      </div>
      <p v-else class="mt-2">
        Open the linked district calendar for the full date list and source PDF.
      </p>
    </div>
  </section>
</template>
