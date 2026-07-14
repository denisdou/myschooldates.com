<script setup lang="ts">
export type ComparisonRow = {
  name: string
  shortName: string | null
  slug: string
  isCurrent: boolean
  firstDay: string
  lastDay: string
  springBreak: { start: string; end: string } | null
  fallBreak: boolean
  instructionalDays: number | null
  comparisonNote?: string
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
  new Date(d + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' })

const displayName = (row: ComparisonRow) => row.shortName ?? row.name

const detectFallBreak = (events: { type: string; date: string; name: string }[], firstDay: string) => {
  const yr = firstDay.substring(0, 4)
  return events.some(e =>
    e.type === 'break_start' &&
    e.date >= firstDay &&
    e.date <= `${yr}-11-15` &&
    !e.name.toLowerCase().includes('thanksgiving')
  )
}

const rows = computed((): ComparisonRow[] => {
  const result: ComparisonRow[] = []
  if (props.cal && props.district) {
    const calBreaks = getBreaks(props.cal.events ?? [])
    const sp = calBreaks.find((b: any) => b.name.toLowerCase().includes('spring')) ?? null
    result.push({
      name: props.district.name, shortName: props.district.shortName ?? null,
      slug: props.district.slug, isCurrent: true,
      firstDay: props.cal.firstDay, lastDay: props.cal.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      fallBreak: detectFallBreak(props.cal.events ?? [], props.cal.firstDay),
      instructionalDays: props.cal.totalSchoolDays ?? null,
    })
  }
  for (const c of (props.relatedCals ?? []).slice(0, 3)) {
    const d = (props.allDistricts ?? []).find((x: any) => x.institutionId === c.institutionId)
    if (!d) continue
    const calBreaks = getBreaks(c.events ?? [])
    const sp = calBreaks.find((b: any) => b.name.toLowerCase().includes('spring')) ?? null
    const relatedDef = (props.district?.relatedDistricts as any[] ?? []).find((rd: any) => rd.slug === d.slug)
    result.push({
      name: d.name, shortName: d.shortName ?? null,
      slug: d.slug, isCurrent: false,
      firstDay: c.firstDay, lastDay: c.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      fallBreak: detectFallBreak((c.events ?? []) as any[], c.firstDay),
      instructionalDays: (c as any).totalSchoolDays ?? null,
      comparisonNote: relatedDef?.comparisonNote,
    })
  }
  return result
})

const insight = computed((): string => {
  if (rows.value.length < 2) return ''
  const current = rows.value.find(s => s.isCurrent)
  const others = rows.value.filter(s => !s.isCurrent)
  if (!current || !others.length) return ''
  const sn = (n: string) => n.replace(/ School District$/, '').replace(/ Unified$/, '').replace(/ Independent$/, '') || n
  const parts = others.map(other => {
    const diff = Math.round(
      (new Date(other.firstDay + 'T00:00:00').getTime() - new Date(current.firstDay + 'T00:00:00').getTime())
      / (1000 * 60 * 60 * 24)
    )
    if (diff > 0) return `${diff} day${diff !== 1 ? 's' : ''} earlier than ${sn(other.name)}`
    if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} later than ${sn(other.name)}`
    return `on the same first day as ${sn(other.name)}`
  })
  return `${sn(current.name)} starts ${parts.join(' and ')}.`
})

const compareIntro = computed(() => (props.district as any).compareIntro ?? '')
</script>

<template>
  <div v-if="rows.length > 1" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">Compare with Nearby School Districts</h2>
      <p v-if="compareIntro" class="text-sm text-gray-600 mt-1 leading-relaxed">{{ compareIntro }}</p>
      <p v-else-if="insight" class="text-sm text-gray-500 mt-1">{{ insight }}</p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 whitespace-nowrap">
              Calendar Feature
            </th>
            <th
              v-for="row in rows"
              :key="row.slug"
              class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
              :class="row.isCurrent ? 'text-blue-600' : 'text-gray-400'"
            >
              <span v-if="row.isCurrent">{{ displayName(row) }}</span>
              <NuxtLink v-else :to="`/${row.slug}`" class="hover:text-blue-600 transition-colors">
                {{ displayName(row) }}
              </NuxtLink>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <!-- First Day -->
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">First Day</td>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-blue-800' : 'text-gray-600'"
            >
              {{ fmt(row.firstDay) }}
            </td>
          </tr>
          <!-- Last Day -->
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">Last Day</td>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-blue-800' : 'text-gray-600'"
            >
              {{ fmt(row.lastDay) }}
            </td>
          </tr>
          <!-- Fall Break -->
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">Fall Break</td>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
            >
              <span v-if="row.fallBreak" class="text-green-600 font-medium">✓ Yes</span>
              <span v-else class="text-gray-300">—</span>
            </td>
          </tr>
          <!-- Spring Break -->
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">Spring Break</td>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-blue-800' : 'text-gray-600'"
            >
              <span v-if="row.springBreak">{{ fmt(row.springBreak.start) }} – {{ fmt(row.springBreak.end) }}</span>
              <span v-else class="text-gray-300">—</span>
            </td>
          </tr>
          <!-- School Days -->
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">School Days</td>
            <td
              v-for="row in rows"
              :key="row.slug"
              class="px-4 py-3 whitespace-nowrap"
              :class="row.isCurrent ? 'font-semibold text-blue-800' : 'text-gray-600'"
            >
              <span v-if="row.instructionalDays !== null">{{ row.instructionalDays }}</span>
              <span v-else class="text-gray-300">—</span>
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

    <p class="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
      Comparison dates reflect each district's official published academic calendar, verified individually.
      Districts shown are selected from calendars currently available on MySchoolDates.
    </p>
  </div>
</template>
