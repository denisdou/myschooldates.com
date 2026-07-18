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
  springBreak: { start: string; end: string } | null
  winterBreak: { start: string; end: string } | null
  thanksgivingBreak: { start: string; end: string } | null
  comparisonNote?: string
  sourceUrl?: string
  sourceVersion?: string
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
  return `${fmt(start)} – ${fmt(end)}`
}

const fmtValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number') return value.toLocaleString('en-US')
  return String(value)
}

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

const displayName = (row: ComparisonRow) => {
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
    const winter = calBreaks.find((b: any) =>
      b.name.toLowerCase().includes('winter') ||
      b.name.toLowerCase().includes('christmas') ||
      b.name.toLowerCase().includes('december')
    ) ?? null
    const thanksgiving = calBreaks.find((b: any) => b.name.toLowerCase().includes('thanksgiving')) ?? null
    result.push({
      name: props.district.name, shortName: props.district.shortName ?? null,
      slug: props.district.slug, isCurrent: true,
      firstDay: props.cal.firstDay, lastDay: props.cal.lastDay,
      totalSchoolDays: props.cal.totalSchoolDays ?? null,
      calendarType: props.cal.calendarType ?? props.district.calendarType ?? null,
      studentCount: props.district.studentCount ?? null,
      schoolCount: props.district.schoolCount ?? null,
      county: props.district.county ?? null,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      winterBreak: winter ? { start: winter.start, end: winter.end } : null,
      thanksgivingBreak: thanksgiving ? { start: thanksgiving.start, end: thanksgiving.end } : null,
      sourceUrl: props.cal.sourceUrl ?? props.cal.sourcePdfUrl ?? props.district.calendarPage ?? props.district.officialWebsite,
      sourceVersion: props.cal.sourceVersion,
    })
  }
  for (const c of (props.relatedCals ?? []).slice(0, 3)) {
    const d = (props.allDistricts ?? []).find((x: any) => x.institutionId === c.institutionId)
    if (!d) continue
    const calBreaks = getBreaks(c.events ?? [])
    const sp = calBreaks.find((b: any) => b.name.toLowerCase().includes('spring')) ?? null
    const winter = calBreaks.find((b: any) =>
      b.name.toLowerCase().includes('winter') ||
      b.name.toLowerCase().includes('christmas') ||
      b.name.toLowerCase().includes('december')
    ) ?? null
    const thanksgiving = calBreaks.find((b: any) => b.name.toLowerCase().includes('thanksgiving')) ?? null
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
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      winterBreak: winter ? { start: winter.start, end: winter.end } : null,
      thanksgivingBreak: thanksgiving ? { start: thanksgiving.start, end: thanksgiving.end } : null,
      comparisonNote: relatedDef?.comparisonNote,
      sourceUrl: c.sourceUrl ?? c.sourcePdfUrl ?? d.calendarPage ?? d.officialWebsite,
      sourceVersion: c.sourceVersion,
    })
  }
  return result
})

const comparisonInsights = computed((): { label: string; items: string[] }[] => {
  if (rows.value.length < 2) return []
  const current = rows.value.find(s => s.isCurrent)
  const others = rows.value.filter(s => !s.isCurrent)
  if (!current || !others.length) return []
  const sn = (n: string) => n.replace(/ School District$/, '').replace(/ Unified$/, '').replace(/ Independent$/, '') || n
  const compareDate = (field: 'firstDay' | 'lastDay', label: string) => {
    return others.map(other => {
      const diff = Math.round(
        (new Date(other[field] + 'T00:00:00').getTime() - new Date(current[field] + 'T00:00:00').getTime())
        / (1000 * 60 * 60 * 24)
      )
      if (diff > 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} earlier than ${sn(other.name)}`
      if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} later than ${sn(other.name)}`
      return `on the same ${label} as ${sn(other.name)}`
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
  const last = names[names.length - 1]
  const list = names.length === 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')}, and ${last}`
  return `Compare the ${props.year} traditional student calendars for ${list}. Dates shown include school-year boundaries, major breaks, instruction-day counts when available, and district profile fields.`
})

const comparisonRows = computed(() => {
  const baseRows = [
    {
      key: 'firstDay',
      label: 'First Day',
      value: (row: ComparisonRow) => fmt(row.firstDay),
    },
    {
      key: 'lastDay',
      label: 'Last Day',
      value: (row: ComparisonRow) => fmt(row.lastDay),
    },
    {
      key: 'instructionalDays',
      label: 'Instruction Days',
      value: (row: ComparisonRow) => row.totalSchoolDays ? `${row.totalSchoolDays} days` : '',
    },
    {
      key: 'thanksgivingBreak',
      label: 'Thanksgiving',
      value: (row: ComparisonRow) => row.thanksgivingBreak ? fmtRange(row.thanksgivingBreak.start, row.thanksgivingBreak.end) : '',
    },
    {
      key: 'winterBreak',
      label: 'Winter Break',
      value: (row: ComparisonRow) => row.winterBreak ? fmtRange(row.winterBreak.start, row.winterBreak.end) : '',
    },
    {
      key: 'springBreak',
      label: 'Spring Break',
      value: (row: ComparisonRow) => row.springBreak ? fmtRange(row.springBreak.start, row.springBreak.end) : '',
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
  return baseRows.filter(def => rows.value.some(row => def.value(row)))
})

const compareIntro = computed(() => {
  const intro = (props.district as any).compareIntro ?? ''
  const yearPattern = /\b\d{4}-\d{4}\b/
  if (!intro) return dynamicIntro.value
  if (yearPattern.test(intro) && !intro.includes(props.year)) return dynamicIntro.value
  const lowerIntro = intro.toLowerCase()
  const missingNamedDistrict = rows.value.some(row => !row.isCurrent && !lowerIntro.includes(displayName(row).toLowerCase().split(' ')[0]))
  return missingNamedDistrict ? dynamicIntro.value : intro
})

const sourceRows = computed(() => rows.value.filter(row => row.sourceUrl))
const comparisonTitle = computed(() => {
  const others = rows.value.filter(row => !row.isCurrent)
  if (others.length === 1) {
    return `${props.year} Calendar Comparison with ${others[0].name}`
  }
  return `${props.year} Calendar Comparison with Nearby School Districts`
})
</script>

<template>
  <details id="comparison" v-if="rows.length > 1" open class="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-24 group">
    <summary class="cursor-pointer list-none px-6 py-4 border-b border-gray-100">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ comparisonTitle }}</h2>
          <p v-if="compareIntro" class="text-sm text-gray-600 mt-1 leading-relaxed">{{ compareIntro }}</p>
        </div>
        <span class="mt-1 text-sm font-medium text-blue-600 group-open:hidden">Show</span>
        <span class="mt-1 text-sm font-medium text-blue-600 hidden group-open:inline">Hide</span>
      </div>
      <div v-if="comparisonInsights.length" class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="group in comparisonInsights" :key="group.label" class="rounded-lg bg-gray-50 border border-gray-100 p-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ group.label }}</h3>
          <ul class="mt-2 space-y-1">
            <li v-for="item in group.items" :key="item" class="text-sm text-gray-600">{{ item }}</li>
          </ul>
        </div>
      </div>
    </summary>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">
          {{ year }} calendar comparison for {{ rows.map(row => row.name).join(', ') }}
        </caption>
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th scope="col" class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 whitespace-nowrap">
              Calendar Feature
            </th>
            <th
              v-for="row in rows"
              :key="row.slug"
              scope="col"
              class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
              :class="row.isCurrent ? 'text-blue-600' : 'text-gray-500'"
            >
              <span v-if="row.isCurrent">{{ displayName(row) }}</span>
              <NuxtLink v-else :to="`/${row.slug}`" class="hover:text-blue-600 transition-colors">
                {{ displayName(row) }}
              </NuxtLink>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="feature in comparisonRows" :key="feature.key" class="hover:bg-gray-50 transition-colors">
            <th scope="row" class="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{{ feature.label }}</th>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-blue-800' : 'text-gray-600'"
            >
              <span v-if="feature.value(row)">{{ feature.value(row) }}</span>
              <span v-else class="text-gray-400">Not listed in summary</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.some(r => !r.isCurrent && r.comparisonNote)" class="px-6 py-4 border-t border-gray-100 space-y-2">
      <template v-for="row in rows.filter(r => !r.isCurrent && r.comparisonNote)" :key="row.slug">
        <p class="text-sm text-gray-600 leading-relaxed">
          <NuxtLink :to="`/${row.slug}`" class="font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ displayName(row) }}</NuxtLink>: {{ row.comparisonNote }}
        </p>
      </template>
    </div>

    <p class="px-6 py-3 border-t border-gray-100 text-xs text-gray-600">
      All dates use each district's {{ year }} traditional student calendar.
      <template v-if="reviewedDate"> Comparison last reviewed {{ reviewedDate }}.</template>
      Comparison shows date ranges, instruction-day counts when available, and district profile fields from each district's published calendar and public district information.
      <template v-if="sourceRows.length">
        Sources:
        <template v-for="(row, index) in sourceRows" :key="row.slug">
          <a :href="row.sourceUrl" target="_blank" rel="noopener" class="underline hover:text-blue-600 transition-colors">
            {{ displayName(row) }} official calendar
            <span class="sr-only">(opens in a new tab)</span>
          </a><template v-if="row.sourceVersion"> ({{ row.sourceVersion }})</template><template v-if="index < sourceRows.length - 1"> · </template>
        </template>.
      </template>
      <template v-else>
        Open the linked district calendar for the full date list and source PDF.
      </template>
    </p>
  </details>
</template>
