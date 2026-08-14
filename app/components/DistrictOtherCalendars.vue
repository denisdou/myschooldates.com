<script setup lang="ts">
const { formatShortDate } = useDistrictPage()

const props = defineProps<{
  alternateCalendars: { label: string; type: string; description?: string; group?: string; firstDay?: string; pdfUrl?: string; buttonLabel?: string; ariaLabel?: string }[]
  districtName: string
  title?: string
  description?: string
  buttonLabel?: string
  collapsible?: boolean
  summaryLabel?: string
  footerTitle?: string
  footerDescription?: string
  footerLinkLabel?: string
  footerLinkUrl?: string
  embedded?: boolean
  hideHeading?: boolean
}>()

const calendarGroups = computed(() => {
  const groups = new Map<string, typeof props.alternateCalendars>()
  for (const calendar of props.alternateCalendars) {
    const label = calendar.group?.trim() ?? ''
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(calendar)
  }
  return [...groups.entries()].map(([label, calendars]) => ({ label, calendars }))
})
</script>

<template>
  <div
    id="other-calendars"
    :class="embedded ? 'district-utility-panel__section p-6' : 'bg-white rounded-lg border border-gray-200 p-6'"
  >
    <component v-if="!hideHeading" :is="embedded ? 'h3' : 'h2'" class="text-lg font-semibold text-gray-900 mb-1">
      {{ title || 'Other Official Calendars' }}
    </component>
    <p class="text-sm text-gray-500 mb-4">{{ description || `${districtName} publishes separate calendars for specific programs.` }}</p>
    <component :is="collapsible ? 'details' : 'div'" class="group">
      <summary
        v-if="collapsible"
        class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 marker:content-none hover:bg-gray-100"
      >
        {{ summaryLabel || `View ${alternateCalendars.length} official calendars` }}
        <svg class="h-4 w-4 flex-shrink-0 text-gray-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
      </summary>
      <div :class="collapsible ? 'mt-4' : ''" class="space-y-5">
        <section v-for="group in calendarGroups" :key="group.label || 'calendars'">
          <component
            :is="embedded && hideHeading ? 'h3' : embedded ? 'h4' : 'h3'"
            v-if="group.label"
            class="text-sm font-semibold text-gray-900"
          >
            {{ group.label }}
          </component>
          <ul :class="group.label ? 'mt-1' : ''" class="space-y-0">
            <li
              v-for="alt in group.calendars"
              :key="alt.type"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-900">{{ alt.label }}</div>
                <div v-if="alt.description" class="text-xs text-gray-500 mt-0.5">{{ alt.description }}</div>
                <div v-else-if="alt.firstDay" class="text-xs text-gray-500 mt-0.5">First day: {{ formatShortDate(alt.firstDay) }}</div>
              </div>
              <a
                v-if="alt.pdfUrl"
                :href="alt.pdfUrl"
                :aria-label="alt.ariaLabel"
                target="_blank"
                rel="noopener"
                class="w-full sm:w-auto sm:flex-shrink-0 inline-flex items-center justify-center gap-1.5 text-center whitespace-normal text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ alt.buttonLabel || buttonLabel || `View ${alt.label} PDF` }}
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </component>
    <div v-if="footerTitle || footerDescription || footerLinkUrl" class="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
      <p v-if="footerTitle" class="font-medium text-gray-900">{{ footerTitle }}</p>
      <p v-if="footerDescription" class="mt-1">
        {{ footerDescription }}
        <a
          v-if="footerLinkUrl"
          :href="footerLinkUrl"
          target="_blank"
          rel="noopener"
          class="underline hover:text-[#0f5d6b] transition-colors"
        >
          {{ footerLinkLabel || 'official calendar page' }}.<span class="sr-only">(opens in a new tab)</span>
        </a>
      </p>
      <p v-else-if="footerLinkUrl" class="mt-1">
        <a
          :href="footerLinkUrl"
          target="_blank"
          rel="noopener"
          class="underline hover:text-[#0f5d6b] transition-colors"
        >
          {{ footerLinkLabel || 'official calendar page' }}<span class="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </div>
  </div>
</template>
