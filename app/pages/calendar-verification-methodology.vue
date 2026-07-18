<script setup lang="ts">
useSeoMeta({
  title: 'School Calendar Verification Methodology | MySchoolDates',
  description: 'How MySchoolDates verifies district school calendar dates against official PDFs, board-approved calendars, and district source pages before publishing.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://myschooldates.com/calendar-verification-methodology' }],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">School Calendar Verification Methodology</h1>
    <p class="text-lg text-gray-500 mb-12">
      How MySchoolDates turns official district calendar sources into searchable dates, PDF references, and calendar import files.
    </p>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">1. Identify the Official Source</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        For each district and school year, we start with the source published or linked by the district itself. This is usually a board-approved PDF, an official calendar page, or a district-hosted calendar file.
      </p>
      <p class="text-gray-600 leading-relaxed">
        We record the district source URL, direct PDF URL when available, source version, and review date so families can compare our page against the official record.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">2. Extract Calendar Events</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        We extract the dates families most often need: first day, last day, major breaks, holidays, student no-school days, early dismissals, teacher workdays, grading periods, make-up days, and school resume dates when those items appear in the official source.
      </p>
      <p class="text-gray-600 leading-relaxed">
        Each date is normalized into a structured record with an event name, ISO date, event type, and optional notes such as early dismissal or weather make-up status.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">3. Compare Against the Source</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Before publication, we compare extracted records against the official district source. The review checks school-year boundaries, break ranges, holiday names, student attendance status, and special notes such as storm make-up days.
      </p>
      <p class="text-gray-600 leading-relaxed">
        If a date does not match the source, we update the calendar record before the page is published or refreshed.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">4. Publish Searchable and Downloadable Formats</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Once verified, the calendar is published as a district page with visible dates, FAQ answers, source links, structured data, and an optional .ics calendar import file.
      </p>
      <p class="text-gray-600 leading-relaxed">
        The .ics file is an unofficial one-time import generated from the reviewed records on the page. It does not replace district alerts or future revisions.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">5. Track Updates and Corrections</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        District calendars can change after publication because of weather, board decisions, staffing needs, or emergency closures. When we identify a revised official source, we update the affected date records and refresh the page review date.
      </p>
      <p class="text-gray-600 leading-relaxed">
        Families should still verify high-impact plans such as travel, childcare, transportation, graduation, athletics, and school-specific events with the district or assigned school.
      </p>
    </section>

    <section class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Report a Calendar Correction</h2>
      <p class="text-gray-600 leading-relaxed mb-4">
        If a district changes its calendar or a date appears incorrect, send us the district name, school year, event date, and official source link.
      </p>
      <a
        href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
        class="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Report a Correction
      </a>
    </section>
  </div>
</template>
