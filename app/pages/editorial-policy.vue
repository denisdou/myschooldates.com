<script setup lang="ts">
useSeoMeta({
  title: 'Editorial Policy | MySchoolDates',
  description: 'How MySchoolDates sources, verifies, and maintains school calendar data — including our correction process and update schedule.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://myschooldates.com/editorial-policy' }],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Editorial Policy</h1>
    <p class="text-lg text-gray-500 mb-12">How we source, verify, and maintain school calendar data on MySchoolDates.</p>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">How We Source Data</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Every calendar on MySchoolDates is sourced exclusively from official public school district websites. For each district, we identify the primary published source — typically a PDF calendar issued by the district's communications or superintendent's office — and treat that document as the authoritative record.
      </p>
      <p class="text-gray-600 leading-relaxed">
        We do not rely on third-party aggregators, news articles, or unofficial school websites. The source URL is recorded and linked on every district page so visitors can verify dates directly.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">How We Verify</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Once a source document is identified, our editorial process has two steps:
      </p>
      <ol class="space-y-3 text-gray-600 list-none">
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
          <span><strong class="text-gray-800">AI-assisted extraction.</strong> We use AI to extract key dates and events from the source document — first day of school, last day, breaks, holidays, and teacher workdays.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
          <span><strong class="text-gray-800">Source comparison.</strong> We compare extracted dates against the original source document before publication. When extracted data does not match the official source, we update the page record before the calendar is published.</span>
        </li>
      </ol>
      <p class="text-gray-600 leading-relaxed mt-3">
        The date a calendar was last reviewed is shown on each district page as "Last reviewed [date]."
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Update Schedule</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Districts typically publish the following year's calendar in late winter or spring — often between February and May. We monitor official district websites and update our calendars when new versions are published.
      </p>
      <p class="text-gray-600 leading-relaxed">
        When a district issues a mid-year revision (for example, to reschedule days lost to weather), we update our calendar and refresh the "Last reviewed" date. The source document link on each page always points to the most current official version we are aware of.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">What We Cover — and What We Don't</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        MySchoolDates publishes the <strong>district-wide traditional calendar</strong> that applies to the majority of schools in each district. This includes:
      </p>
      <ul class="space-y-2 text-gray-600 mb-3">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> First and last day of school</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> School breaks (spring, winter, fall, Thanksgiving)</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Federal and district-observed holidays</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Teacher workdays and professional development days (no-school days for students)</li>
      </ul>
      <p class="text-gray-600 leading-relaxed">
        We do not publish individual school schedules, early dismissal times, or program-specific calendars (such as year-round or magnet school tracks) unless the district has published these as a separate official document. Families should always confirm school-specific details directly with their school.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Accuracy Disclaimer</h2>
      <p class="text-gray-600 leading-relaxed">
        School districts occasionally revise their calendars after initial publication — due to weather events, board decisions, or state policy changes. While we work to keep our data current, we cannot guarantee that every page reflects the latest revision at all times. We strongly recommend confirming critical dates (travel bookings, childcare arrangements) directly with your district before making commitments.
      </p>
    </section>

    <section class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Report a Calendar Error</h2>
      <p class="text-gray-600 leading-relaxed mb-4">
        If you believe a date on MySchoolDates is incorrect or outdated, please let us know. We review all correction reports and aim to respond within 48 hours.
      </p>
      <p class="text-gray-600 leading-relaxed mb-4">
        To help us investigate quickly, please include:
      </p>
      <ul class="space-y-1.5 text-gray-600 text-sm mb-4">
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-0.5">→</span> The district name and school year</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-0.5">→</span> The specific date or event you believe is incorrect</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-0.5">→</span> What the correct information should be</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-0.5">→</span> A link to the official source document if available</li>
      </ul>
      <a
        href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
        class="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Report a Correction
      </a>
    </section>
  </div>
</template>
