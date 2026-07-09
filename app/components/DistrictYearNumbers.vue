<script setup lang="ts">
defineProps<{
  cards: { key: string; label: string; value: number; unit: string; description: string }[]
}>()
</script>

<template>
  <div v-if="cards.length" class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">The Year, by the Numbers</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div v-for="card in cards" :key="card.key" class="border border-gray-100 rounded-xl p-5">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{{ card.label }}</div>
        <div class="text-3xl font-bold text-gray-900 mb-2">
          {{ card.value }} <span class="text-base font-normal text-gray-400">{{ card.unit }}</span>
        </div>
        <p class="text-sm text-gray-500 leading-relaxed">{{ card.description }}</p>
      </div>
    </div>
    <p class="mt-4 text-xs text-gray-400">Counts include listed weekday student no-school dates between the first and last day of school. Weekends and pre-year teacher/buyback days are not counted. Instructional weeks are approximate.</p>
  </div>
</template>
