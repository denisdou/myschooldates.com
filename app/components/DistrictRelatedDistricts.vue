<script setup lang="ts">
const props = defineProps<{
  relatedDistricts: { name: string; slug: string; state: string }[]
  stateName: string
  title?: string
  description?: string
}>()

const allRelatedInState = computed(() => props.relatedDistricts.every(rd => rd.state === props.stateName))
const heading = computed(() => props.title ?? (allRelatedInState.value ? `Related ${props.stateName} School Calendars` : 'Related Large District Calendars'))
const description = computed(() => props.description ?? (allRelatedInState.value
  ? `Compare nearby ${props.stateName} school districts for different start dates, spring breaks, and no-school periods.`
  : 'Compare other large school district calendars for different start dates, spring breaks, and no-school periods.'))
const stateSlug = computed(() => props.stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900">{{ heading }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
      <NuxtLink
        v-if="allRelatedInState"
        :to="`/${stateSlug}`"
        class="mt-2 inline-flex text-sm font-medium text-blue-600 hover:underline"
      >
        Explore {{ stateName }} school calendars
      </NuxtLink>
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
