<script setup lang="ts">
const { formatShortDate } = useDistrictPage()

const props = defineProps<{
  title?: string
  description?: string
  daysLabel?: string
  nextDateLabel?: string
  reportsLabel?: string
  footerNote?: string
  periods?: {
    label: string
    start?: string
    end: string
    nextStudentDate?: string
    studentDays?: number
    reportsIssued?: string
    secondaryReportDate?: string
    elementaryReportDate?: string
  }[]
}>()

const showStart = computed(() => props.periods?.some(period => period.start))
const showStudentDays = computed(() => props.periods?.some(period => typeof period.studentDays === 'number'))
const showNextStudentDate = computed(() => props.periods?.some(period => period.nextStudentDate))
const showReportsIssued = computed(() => props.periods?.some(period => period.reportsIssued))
const showSecondaryReportDate = computed(() => props.periods?.some(period => period.secondaryReportDate))
const showElementaryReportDate = computed(() => props.periods?.some(period => period.elementaryReportDate))
</script>

<template>
  <section v-if="props.periods?.length" id="grading-periods" class="bg-white rounded-lg border border-gray-200 overflow-hidden scroll-mt-24">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">{{ title || 'Grading Periods' }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ description || 'Marking-period dates and report-card timing from the published student calendar.' }}</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th scope="col" class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grading Period</th>
            <th v-if="showStart" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End</th>
            <th v-if="showNextStudentDate" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ nextDateLabel || 'Next Student Day' }}</th>
            <th v-if="showStudentDays" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ daysLabel || 'Student Days' }}</th>
            <th v-if="showReportsIssued" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ reportsLabel || 'Reports Issued' }}</th>
            <th v-if="showSecondaryReportDate" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle &amp; High ParentVUE</th>
            <th v-if="showElementaryReportDate" scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Elementary K–5 ParentVUE</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="period in props.periods" :key="period.label" class="hover:bg-gray-50 transition-colors">
            <th scope="row" class="px-6 py-3 text-left font-medium text-gray-900 whitespace-nowrap">{{ period.label }}</th>
            <td v-if="showStart" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time v-if="period.start" :datetime="period.start">{{ formatShortDate(period.start) }}</time>
              <span v-else aria-hidden="true">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time :datetime="period.end">{{ formatShortDate(period.end) }}</time>
            </td>
            <td v-if="showNextStudentDate" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time v-if="period.nextStudentDate" :datetime="period.nextStudentDate">{{ formatShortDate(period.nextStudentDate) }}</time>
              <span v-else aria-hidden="true">—</span>
            </td>
            <td v-if="showStudentDays" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              {{ period.studentDays ?? '—' }}
            </td>
            <td v-if="showReportsIssued" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time v-if="period.reportsIssued" :datetime="period.reportsIssued">{{ formatShortDate(period.reportsIssued) }}</time>
              <span v-else aria-hidden="true">—</span>
            </td>
            <td v-if="showSecondaryReportDate" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time v-if="period.secondaryReportDate" :datetime="period.secondaryReportDate">{{ formatShortDate(period.secondaryReportDate) }}</time>
              <span v-else aria-hidden="true">—</span>
            </td>
            <td v-if="showElementaryReportDate" class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time v-if="period.elementaryReportDate" :datetime="period.elementaryReportDate">{{ formatShortDate(period.elementaryReportDate) }}</time>
              <span v-else aria-hidden="true">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="footerNote" class="border-t border-gray-100 px-6 py-4 text-xs leading-relaxed text-gray-600">{{ footerNote }}</p>
  </section>
</template>
