<script setup lang="ts">
defineProps<{
  city: string
  intro?: string
  highlights: { label: string; detail: string }[]
}>()
</script>

<template>
  <div v-if="highlights.length" class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-1">Living in {{ city }}</h2>
    <p v-if="intro" class="text-sm text-gray-500 mb-4 leading-relaxed">{{ intro }}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      <div v-for="h in highlights" :key="h.label" class="flex items-start gap-2.5">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
        <div>
          <span class="font-medium text-gray-900 text-sm">{{ h.label }}</span>
          <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ h.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
