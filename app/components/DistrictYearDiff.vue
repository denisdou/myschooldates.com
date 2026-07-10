<script setup lang="ts">
defineProps<{
  currentYear: string
  prevYear: string
  items: string[]
  title?: string
}>()
</script>

<template>
  <div v-if="items.length" class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ title ?? `What's New for ${currentYear}` }}</h2>
    <p class="text-sm text-gray-500 mb-4">How this school year compares to {{ prevYear }} — and what it means for your family.</p>
    <ul class="space-y-2">
      <li v-for="item in items" :key="item" class="flex items-start gap-2 text-sm text-gray-700">
        <span class="text-gray-300 mt-0.5 flex-shrink-0 select-none">•</span>
        <span>{{ item }}</span>
      </li>
    </ul>
  </div>
</template>
