<script setup lang="ts">
defineProps<{
  name: string
  tips: string[]
  title?: string
  links?: { label: string; to: string; description?: string }[]
}>()
</script>

<template>
  <div v-if="tips.length" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ title ?? `Planning Tips for ${name} Families` }}</h2>
    <ul class="space-y-3">
      <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
        <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ tip }}
      </li>
    </ul>
    <div v-if="links?.length" class="mt-4 flex flex-wrap gap-3">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="inline-flex items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100 transition-colors"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </div>
</template>
