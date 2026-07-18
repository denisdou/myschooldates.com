<script setup lang="ts">
useSeoMeta({
  title: 'About MySchoolDates | US Public School Calendar Platform',
  description: 'MySchoolDates makes it easy to find school start dates, holidays, and breaks for public school districts across the United States — and add them to your calendar in seconds.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://myschooldates.com/about' }],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">About MySchoolDates</h1>
    <p class="text-lg text-gray-500 mb-12">Making school calendar information fast, free, and actually useful.</p>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
      <p class="text-gray-600 leading-relaxed">
        Finding your child's first day of school, spring break dates, or holiday schedule should take seconds — not the twenty minutes it currently takes to track down a PDF buried on a district website. MySchoolDates exists to fix that.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">What We Provide</h2>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-start gap-2"><span class="text-green-500 font-bold mt-0.5">✓</span> First and last day of school for the current and upcoming year</li>
        <li class="flex items-start gap-2"><span class="text-green-500 font-bold mt-0.5">✓</span> School breaks — spring, winter, fall, and Thanksgiving</li>
        <li class="flex items-start gap-2"><span class="text-green-500 font-bold mt-0.5">✓</span> Holidays and teacher in-service days</li>
        <li class="flex items-start gap-2"><span class="text-green-500 font-bold mt-0.5">✓</span> Free iCal downloads compatible with Google Calendar, Apple Calendar, and Outlook</li>
        <li class="flex items-start gap-2"><span class="text-green-500 font-bold mt-0.5">✓</span> Direct links to official district sources for every calendar</li>
      </ul>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">How We Collect and Verify Data</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Every calendar on MySchoolDates is sourced directly from official public school district websites — typically the PDF calendar published by the district each year. We use AI to extract key dates from source documents, then manually cross-check every date against the original PDF before publishing. The source URL is linked on every district page.
      </p>
      <p class="text-gray-600 leading-relaxed">
        When districts issue mid-year revisions, we update our records and refresh the "Last reviewed" date shown on each page.
        See our <NuxtLink to="/calendar-verification-methodology" class="text-blue-600 hover:underline">Calendar Verification Methodology</NuxtLink> and <NuxtLink to="/editorial-policy" class="text-blue-600 hover:underline">Editorial Policy</NuxtLink> for the full details on our verification process.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Coverage</h2>
      <p class="text-gray-600 leading-relaxed">
        We currently cover 30 of the largest public school districts across California, Florida, Texas, North Carolina, and Virginia — with more districts and states being added regularly. Our goal is comprehensive coverage of the largest districts in every state.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Always Free</h2>
      <p class="text-gray-600 leading-relaxed">
        MySchoolDates is free for everyone. School calendar information is public data, and we believe it should be easy to access without paywalls, signups, or ads that get in the way.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
      <p class="text-gray-600 leading-relaxed">
        Have a question or want to request a district? Reach us at
        <a href="mailto:hello@myschooldates.com" class="text-blue-600 hover:underline">hello@myschooldates.com</a>.
      </p>
    </section>

    <section class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Found an Error?</h2>
      <p class="text-gray-600 leading-relaxed mb-4">
        Calendar dates can change after initial publication. If you spot an incorrect date or a missing update, please let us know — we review all corrections and aim to respond within 48 hours.
      </p>
      <a
        href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
        class="inline-flex items-center gap-2 text-sm font-medium text-amber-800 border border-amber-300 bg-white px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
      >
        Report a Calendar Error →
      </a>
    </section>
  </div>
</template>
