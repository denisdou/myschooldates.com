<script setup lang="ts">
defineProps<{
  relatedDistricts: { name: string; slug: string; state: string }[]
  stateName: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">Nearby School Districts</h2>
      <p class="text-sm text-gray-500 mt-1">Compare nearby {{ stateName }} school districts.</p>
    </div>
    <div class="divide-y divide-gray-50">
      <NuxtLink
        v-for="rd in relatedDistricts"
        :key="rd.slug"
        :to="`/${rd.slug}`"
        class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div>
          <div class="font-medium text-gray-900">{{ rd.name }}</div>
          <div class="text-sm text-gray-500">{{ rd.state }}</div>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
