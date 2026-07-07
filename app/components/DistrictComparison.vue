<script setup lang="ts">
export type ComparisonRow = {
  name: string
  slug: string
  isCurrent: boolean
  firstDay: string
  lastDay: string
  springBreak: { start: string; end: string } | null
  daysOff: number
  comparisonNote?: string
}

defineProps<{
  rows: ComparisonRow[]
  insight: string
  year: string
}>()

const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' })
</script>

<template>
  <div v-if="rows.length > 1" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">Compare with Nearby Districts</h2>
      <p class="text-sm text-gray-500 mt-1">First day, spring break, and days off for {{ year }} — side by side.</p>
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
          <tr
            v-for="stat in rows"
            :key="stat.slug"
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
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmt(stat.firstDay) }}</td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              <span v-if="stat.springBreak">{{ fmt(stat.springBreak.start) }} – {{ fmt(stat.springBreak.end) }}</span>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmt(stat.lastDay) }}</td>
            <td class="px-6 py-3 text-right font-semibold" :class="stat.isCurrent ? 'text-blue-800' : 'text-gray-900'">{{ stat.daysOff }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="insight" class="px-6 py-3 border-t border-gray-100 text-xs text-gray-500 italic">{{ insight }}</p>
  </div>
</template>
