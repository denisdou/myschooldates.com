<script setup lang="ts">
const props = defineProps<{
  studentCount?: number
  studentCountAsOf?: string
  studentCountSourceLabel?: string
  studentCountSourceUrl?: string
  studentCountApproximate?: boolean
  schoolCount?: number
  schoolCountExact?: boolean
  schoolCountApproximate?: boolean
  schoolCountLabel?: string
  calendarType?: string
  hideCalendarType?: boolean
  grades?: string[]
  founded?: number
  county?: string
  metro?: string
  districtFact?: string
  title?: string
  disclaimer?: string
}>()

const formattedStudentCountAsOf = computed(() => {
  const value = props.studentCountAsOf?.trim()
  if (!value) return ''
  const schoolYearMatch = value.match(/^(\d{4})-(\d{4})$/)
  if (schoolYearMatch) return `${schoolYearMatch[1]}–${schoolYearMatch[2]!.slice(2)}`
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const calendarTypeLabel = computed(() => {
  const value = props.calendarType?.trim() ?? ''
  const normalized = value.toLowerCase()
  if (normalized === 'traditional') return 'Traditional'
  if (normalized === 'year-round') return 'Year-Round'
  if (normalized.includes('extended-year')) {
    const dayCount = value.match(/(\d+)-day extended-year/i)?.[1]
    return `Traditional + ${dayCount ? `${dayCount}-Day ` : ''}Extended-Year`
  }
  if (normalized.includes('year-round')) return 'Traditional + Year-Round'
  return value
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">{{ title || 'District Profile' }}</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
      <div v-if="studentCount">
        <div class="text-2xl font-bold text-gray-900">{{ studentCountApproximate ? '~' : '' }}{{ studentCount.toLocaleString('en-US') }}</div>
        <div class="text-xs text-gray-600 mt-0.5">
          students enrolled<span v-if="formattedStudentCountAsOf"> · as of {{ formattedStudentCountAsOf }}</span>
        </div>
      </div>
      <div v-if="schoolCount">
        <div class="text-2xl font-bold text-gray-900">{{ schoolCountApproximate ? '~' : '' }}{{ schoolCount }}{{ !schoolCountApproximate && !schoolCountExact ? '+' : '' }}</div>
        <div class="text-xs text-gray-600 mt-0.5">{{ schoolCountLabel || (schoolCountExact ? 'campuses' : 'schools & campuses') }}</div>
      </div>
      <div v-if="calendarType && !hideCalendarType">
        <div class="text-sm font-semibold text-gray-900 leading-snug mt-1">
          {{ calendarTypeLabel }}
        </div>
        <div class="text-xs text-gray-600 mt-0.5">calendar type</div>
      </div>
      <div v-if="grades?.length">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ grades[0] }}–{{ grades[grades.length - 1] }}</div>
        <div class="text-xs text-gray-600 mt-0.5">grades served</div>
      </div>
      <div v-if="founded">
        <div class="text-2xl font-bold text-gray-900">{{ founded }}</div>
        <div class="text-xs text-gray-600 mt-0.5">year founded</div>
      </div>
      <div v-if="county">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ county }}</div>
        <div class="text-xs text-gray-600 mt-0.5">county</div>
      </div>
      <div v-if="metro">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ metro }}</div>
        <div class="text-xs text-gray-600 mt-0.5">metro area</div>
      </div>
    </div>
    <p v-if="districtFact" class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">{{ districtFact }}</p>
    <p class="mt-3 text-xs text-gray-600">
      {{ disclaimer || 'District profile figures are approximate and sourced from public district information. Enrollment counts, school totals, and program details may change by school year.' }}
      <a
        v-if="studentCountSourceUrl"
        :href="studentCountSourceUrl"
        target="_blank"
        rel="noopener"
        class="ml-1 underline hover:text-gray-900"
      >{{ studentCountSourceLabel || 'Enrollment source' }}<span class="sr-only"> (opens in a new tab)</span></a>
    </p>
  </div>
</template>
