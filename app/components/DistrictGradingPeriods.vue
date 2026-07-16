<script setup lang="ts">
const { formatShortDate } = useDistrictPage()

const props = defineProps<{
  periods?: { label: string; start: string; end: string }[]
}>()
</script>

<template>
  <section v-if="props.periods?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">Grading Periods</h2>
      <p class="text-sm text-gray-500 mt-1">Start and end dates from the published student calendar.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th scope="col" class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grading Period</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="period in props.periods" :key="period.label" class="hover:bg-gray-50 transition-colors">
            <th scope="row" class="px-6 py-3 text-left font-medium text-gray-900 whitespace-nowrap">{{ period.label }}</th>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time :datetime="period.start">{{ formatShortDate(period.start) }}</time>
            </td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <time :datetime="period.end">{{ formatShortDate(period.end) }}</time>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
