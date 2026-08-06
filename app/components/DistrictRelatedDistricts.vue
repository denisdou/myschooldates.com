<script setup lang="ts">
const props = defineProps<{
  relatedDistricts: { name: string; slug: string; state: string; linkLabel?: string; reason?: string; comparisonNote?: string }[]
  stateName: string
  title?: string
  description?: string
  hideDescriptions?: boolean
  year?: string
  yearAvailableSlugs?: string[]
  forceYearLinks?: boolean
}>()

const validRelatedDistricts = computed(() => props.relatedDistricts.filter(rd => rd.slug))
const allRelatedInState = computed(() => validRelatedDistricts.value.every(rd => rd.state === props.stateName))
const heading = computed(() => props.title ?? (allRelatedInState.value ? `More ${props.stateName} School Calendars` : 'More School Calendars'))
const description = computed(() => props.description ?? (allRelatedInState.value
  ? `Browse calendars for other ${props.stateName} school districts.`
  : 'Browse calendars for other school districts.'))
const stateSlug = computed(() => props.stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
const yearAvailableSlugs = computed(() => new Set(props.yearAvailableSlugs ?? []))
const relatedDistrictPath = (rd: { slug: string }) =>
  props.year && (props.forceYearLinks || yearAvailableSlugs.value.has(rd.slug)) ? `/${rd.slug}/${props.year}` : `/${rd.slug}`
</script>

<template>
  <div v-if="validRelatedDistricts.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden">
    <div class="px-6 py-4 border-b border-[#eee9df]">
      <h2 class="text-lg font-semibold text-[#1f2933]">{{ heading }}</h2>
      <p class="text-sm text-[#7b756d] mt-1">{{ description }}</p>
    </div>
    <div class="divide-y divide-[#eee9df]">
      <NuxtLink
        v-for="rd in validRelatedDistricts"
        :key="rd.slug"
        :to="relatedDistrictPath(rd)"
        class="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#f3f0e8] transition-colors"
      >
        <div>
          <div class="font-medium text-[#1f2933]">{{ rd.linkLabel || rd.name }}</div>
          <div v-if="!hideDescriptions" class="text-sm text-[#7b756d]">{{ rd.reason || rd.comparisonNote || rd.state }}</div>
        </div>
        <svg class="w-5 h-5 flex-shrink-0 text-[#9a938a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
    <div v-if="allRelatedInState" class="border-t border-[#eee9df] px-6 py-4">
      <NuxtLink
        :to="`/${stateSlug}`"
        class="inline-flex text-sm font-medium text-[#0f5d6b] hover:underline"
      >
        Explore {{ stateName }} school calendars
      </NuxtLink>
    </div>
  </div>
</template>
