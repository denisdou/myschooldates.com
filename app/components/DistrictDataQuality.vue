<script setup lang="ts">
const props = defineProps<{
  cal: any
  district: any
  year: string
}>()

const isEstimated = computed(() => !props.cal?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!props.cal?.lastVerifiedAt) return null
  return new Date(props.cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})
const sourceUrl = computed(() => props.cal?.sourceUrl ?? props.district?.officialWebsite ?? '')
</script>

<template>
  <div v-if="isEstimated" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="text-sm text-gray-600 space-y-1">
        <p class="font-medium text-gray-700">Dates not yet verified</p>
        <p>
          These dates have not been confirmed against the official {{ year }} calendar.
          Always check the
          <a :href="sourceUrl" target="_blank" rel="noopener" class="underline font-medium text-gray-700">
            official {{ district.name }} calendar
            <span class="sr-only">(opens in a new tab)</span>
          </a>
          before making travel or childcare plans.
        </p>
      </div>
    </div>
  </div>

  <div v-else class="bg-green-50 border border-green-200 rounded-xl p-5">
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="text-sm text-green-700 space-y-1">
        <p class="font-medium">Calendar data checked against the official district calendar</p>
        <p>
          Dates sourced directly from the
          <a :href="sourceUrl" target="_blank" rel="noopener" class="underline font-medium">
            official {{ district.shortName || district.name }} calendar
            <span class="sr-only">(opens in a new tab)</span>
          </a>.
          Dates are subject to board approval and may change — always confirm before making travel or childcare plans.
        </p>
        <p class="text-green-600 text-xs">Last verified: {{ verifiedDate }}</p>
      </div>
    </div>
  </div>
</template>
