<script setup lang="ts">
const props = defineProps<{
  district: { name: string; slug: string }
  cal: {
    schoolYear: string
    sourcePdfUrl?: string
    printablePdfUrl?: string
  }
}>()

const pdfUrl = computed(() => props.cal.sourcePdfUrl || props.cal.printablePdfUrl || '')
const icsPath = computed(() => `/calendars/${props.district.slug}-${props.cal.schoolYear}.ics`)
const icsAbsoluteUrl = computed(() => `https://myschooldates.com${icsPath.value}`)
const subscriptionUrl = computed(() => `${icsAbsoluteUrl.value}?subscription=1`)
const webcalUrl = computed(() => subscriptionUrl.value.replace(/^https:/, 'webcal:'))
const googleUrl = computed(() =>
  `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl.value)}`
)
const icsFilename = computed(() => `${props.district.slug}-${props.cal.schoolYear}.ics`)

const secondaryActions = computed(() => [
  {
    label: 'Add to Google',
    href: googleUrl.value,
    icon: 'google',
    external: true,
  },
  {
    label: 'Add to Apple',
    href: webcalUrl.value,
    icon: 'apple',
    external: false,
  },
  {
    label: 'Download ICS',
    href: icsPath.value,
    icon: 'download',
    download: icsFilename.value,
    external: false,
  },
])
</script>

<template>
  <div id="calendar-actions" class="district-calendar-actions">
    <a
      v-if="pdfUrl"
      :href="pdfUrl"
      target="_blank"
      rel="noopener"
      class="district-calendar-action district-calendar-action--primary"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M9 14h6M9 17h4" />
      </svg>
      Download Official PDF
      <span class="sr-only">(opens in a new tab)</span>
    </a>
    <button
      v-else
      type="button"
      class="district-calendar-action district-calendar-action--primary"
      disabled
      title="An official PDF is not available for this calendar"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M9 14h6M9 17h4" />
      </svg>
      Download Official PDF
    </button>

    <div class="district-calendar-actions__desktop">
      <a
        v-for="action in secondaryActions"
        :key="action.label"
        :href="action.href"
        :target="action.external ? '_blank' : undefined"
        :rel="action.external ? 'noopener' : undefined"
        :download="action.download"
        class="district-calendar-action district-calendar-action--secondary"
      >
        <svg v-if="action.icon === 'google'" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
          <path d="M12 11v6M9 14h6" />
        </svg>
        <svg v-else-if="action.icon === 'apple'" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M15.5 5.5c.8-1 1.2-2 1.1-3-1.2.1-2.3.8-3 1.7-.7.8-1.2 1.9-1 2.9 1.1.1 2.1-.6 2.9-1.6Z" />
          <path d="M18.8 13.2c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1-1.7-.2-3.3 1-4.2 1-.9 0-2.3-1-3.8-1-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.4 11.5.9 1.4 2 2.9 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.2.9 3.6.9 1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.5-3.2-.1 0-2.6-1-2.6-3.9Z" transform="scale(.8) translate(3 1)" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M5 20h14" />
        </svg>
        {{ action.label }}
        <span v-if="action.external" class="sr-only">(opens in a new tab)</span>
      </a>
    </div>

    <details class="district-calendar-actions__mobile-menu">
      <summary class="district-calendar-action district-calendar-action--secondary">
        More
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </summary>
      <div class="district-calendar-actions__popover">
        <a
          v-for="action in secondaryActions"
          :key="`mobile-${action.label}`"
          :href="action.href"
          :target="action.external ? '_blank' : undefined"
          :rel="action.external ? 'noopener' : undefined"
          :download="action.download"
          class="district-calendar-actions__popover-item"
        >
          {{ action.label }}
          <span v-if="action.external" aria-hidden="true">↗</span>
        </a>
      </div>
    </details>
  </div>
</template>
