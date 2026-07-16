<script setup lang="ts">
const props = defineProps<{
  districtName: string
  year: string
  sourceUrl: string
  district: any
  cal: any
}>()

const pdfUrl = computed(() => String(props.cal?.sourcePdfUrl ?? ''))
const isDrivePdf = computed(() => pdfUrl.value.includes('drive.google.com'))
const isArchivedPdfCopy = computed(() => pdfUrl.value.includes('assets.myschooldates.com'))
const pdfHeading = computed(() => isArchivedPdfCopy.value
  ? `${props.districtName} Calendar ${props.year}: Official Calendar PDF — Archived Copy`
  : isDrivePdf.value
  ? `${props.districtName} Calendar ${props.year}: Printable PDF`
  : `${props.districtName} Calendar ${props.year}: Printable PDF`
)
const pdfDescription = computed(() => isArchivedPdfCopy.value
  ? `This is an archived copy of the official ${props.year} calendar published by ${props.districtName}. MySchoolDates stores the file for reliable long-term access because original district file URLs may expire. Check the official district source for revisions or newer versions.`
  : isDrivePdf.value
  ? `Open or print the calendar PDF linked from the ${props.districtName} calendar page. Verify the latest version on the official district source before making critical plans.`
  : `Open or print the official calendar PDF published by ${props.districtName}. Verify the latest version on the official district source before making critical plans.`
)
const pdfButtonLabel = computed(() => isArchivedPdfCopy.value ? 'View Archived Copy of Official PDF' : isDrivePdf.value ? 'View Printable PDF' : 'View Official PDF')

const copied = ref(false)
const icsHref = computed(() => `/calendars/${props.district.slug}-${props.cal.schoolYear}.ics`)
const icsFilename = computed(() => `${props.district.slug}-${props.cal.schoolYear}.ics`)
const compatibleCalendars = ['Apple Calendar', 'Google Calendar', 'Outlook']
const icsIncludedItems = computed(() => {
  const events = props.cal?.events ?? []
  const hasType = (types: string[]) => events.some((event: any) => types.includes(event.type))
  const items = ['student holidays', 'break ranges']
  if (hasType(['no_school', 'student_holiday'])) items.push('student no-school dates')
  if (hasType(['early_dismissal', 'early_release'])) items.push('early-release dates')
  if (hasType(['school_resume', 'school_reopen'])) items.push('school resume dates')
  if (hasType(['academic', 'quarter_end', 'semester_end'])) items.push('key academic dates')
  return [...new Set(items)]
})
const icsIncludedText = computed(() => {
  const items = icsIncludedItems.value
  if (items.length <= 1) return items[0] ?? 'school calendar dates'
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
})
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function shareWhatsApp() {
  const text = encodeURIComponent(`${props.districtName} ${props.year} school calendar — ${window.location.href}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
function shareSMS() {
  const text = encodeURIComponent(`${props.districtName} ${props.year} school calendar: ${window.location.href}`)
  window.open(`sms:?body=${text}`)
}
function shareTwitter() {
  const text = encodeURIComponent(`${props.districtName} ${props.year} school calendar — holidays, spring break, and all important dates`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}
function shareReddit() {
  const title = encodeURIComponent(`${props.districtName} ${props.year} School Calendar`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank')
}

const icsAriaLabel = computed(() => `Download ${props.districtName} ${props.year} calendar file for Google Calendar, Apple Calendar, and Outlook`)
</script>

<template>
  <div id="add-to-calendar" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Add to Calendar -->
    <div class="p-6 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">Add School Dates to Calendar</h2>
      <p class="text-sm text-gray-500 mb-4">Download one standard .ics file containing {{ icsIncludedText }}.</p>
      <!-- Primary CTA -->
      <a
        :href="icsHref"
        :download="icsFilename"
        :aria-label="icsAriaLabel"
        class="w-full flex items-center justify-center gap-2.5 px-4 py-3 mb-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold text-sm shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download calendar file (.ics)
      </a>
      <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p class="text-xs font-medium text-gray-500 mb-2">Compatible with</p>
        <ul class="flex flex-wrap gap-2" aria-label="Compatible calendar apps">
          <li
            v-for="calendarName in compatibleCalendars"
            :key="calendarName"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700"
          >
            <svg class="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
              <path d="M3 9h18" stroke-width="1.5"/>
              <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ calendarName }}
          </li>
        </ul>
      </div>
      <p class="text-xs text-gray-600 mt-3">
        The .ics file is generated from the same reviewed records shown on this page. After downloading, import the file into your preferred calendar app.
      </p>
      <p class="text-xs text-gray-600 mt-2">
        This is an unofficial convenience file generated by MySchoolDates from the reviewed {{ districtName }} calendar. It is a one-time import and will not automatically update if the district revises its calendar. Always verify schedule changes with the district.
      </p>
    </div>

    <!-- PDF Download -->
    <div v-if="cal.sourcePdfUrl" class="p-6 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ pdfHeading }}</h2>
      <p class="text-sm text-gray-500 mb-4">{{ pdfDescription }}</p>
      <div class="flex flex-wrap gap-3">
        <a
          :href="cal.sourcePdfUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ pdfButtonLabel }}
        </a>
        <a
          :href="sourceUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all text-gray-700 text-sm font-semibold rounded-lg"
        >
          Verify on official source
        </a>
      </div>
    </div>

    <!-- Share with Parents -->
    <div class="p-6">
      <h2 class="text-base font-semibold text-gray-900 mb-3">Share with Parents</h2>
      <div class="flex flex-wrap gap-3">
        <!-- Copy Link -->
        <button
          type="button"
          @click="copyLink"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy Link' }}
        </button>
        <span class="sr-only" aria-live="polite">{{ copied ? 'Link copied to clipboard.' : '' }}</span>
        <!-- WhatsApp -->
        <button
          type="button"
          @click="shareWhatsApp"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 text-sm font-medium text-gray-700 transition-all"
        >
          <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a7.947 7.947 0 01-3.794-.964l-4.21 1.104 1.126-4.108a7.934 7.934 0 01-1.062-3.965C4.09 7.148 7.666 3.573 12.03 3.573c2.116 0 4.099.823 5.59 2.317a7.862 7.862 0 012.31 5.587c-.002 4.358-3.579 7.403-7.901 7.403z"/>
          </svg>
          WhatsApp
        </button>
        <!-- Text / SMS -->
        <button
          type="button"
          @click="shareSMS"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Text
        </button>
        <!-- Twitter / X -->
        <button
          type="button"
          @click="shareTwitter"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </button>
        <!-- Reddit -->
        <button
          type="button"
          @click="shareReddit"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-medium text-gray-700 transition-all"
        >
          <svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
          Reddit
        </button>
        <!-- Official source -->
        <a
          :href="sourceUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Official Source
        </a>
      </div>
    </div>
  </div>
</template>
