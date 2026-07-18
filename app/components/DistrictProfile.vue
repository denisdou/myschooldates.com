<script setup lang="ts">
defineProps<{
  studentCount?: number
  schoolCount?: number
  calendarType?: string
  grades?: string[]
  founded?: number
  county?: string
  metro?: string
  districtFact?: string
  title?: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{{ title || 'District Profile' }}</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
      <div v-if="studentCount">
        <div class="text-2xl font-bold text-gray-900">{{ studentCount.toLocaleString('en-US') }}</div>
        <div class="text-xs text-gray-400 mt-0.5">students enrolled</div>
      </div>
      <div v-if="schoolCount">
        <div class="text-2xl font-bold text-gray-900">{{ schoolCount }}+</div>
        <div class="text-xs text-gray-400 mt-0.5">schools &amp; campuses</div>
      </div>
      <div v-if="calendarType">
        <div class="text-sm font-semibold text-gray-900 leading-snug mt-1">
          {{ calendarType === 'traditional' ? 'Traditional' : calendarType === 'year-round' ? 'Year-Round' : 'Traditional + Year-Round' }}
        </div>
        <div class="text-xs text-gray-400 mt-0.5">calendar type</div>
      </div>
      <div v-if="grades?.length">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ grades[0] }} – {{ grades[grades.length - 1] }}</div>
        <div class="text-xs text-gray-400 mt-0.5">grades served</div>
      </div>
      <div v-if="founded">
        <div class="text-2xl font-bold text-gray-900">{{ founded }}</div>
        <div class="text-xs text-gray-400 mt-0.5">year founded</div>
      </div>
      <div v-if="county">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ county }}</div>
        <div class="text-xs text-gray-400 mt-0.5">county</div>
      </div>
      <div v-if="metro">
        <div class="text-sm font-semibold text-gray-900 mt-1">{{ metro }}</div>
        <div class="text-xs text-gray-400 mt-0.5">metro area</div>
      </div>
    </div>
    <p v-if="districtFact" class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">{{ districtFact }}</p>
    <p class="mt-3 text-xs text-gray-400">District profile figures are approximate and sourced from public district information. Enrollment counts, school totals, and program details may change by school year.</p>
  </div>
</template>
