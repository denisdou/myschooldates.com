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
      <h2 class="text-xl font-semibold text-gray-900 mb-3">How We Collect Data</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Every calendar on MySchoolDates is sourced directly from official public school district websites. We research each district's published academic calendar — whether it's a PDF, an HTML page, or an iCal feed — and extract the key dates manually and with automated tooling.
      </p>
      <p class="text-gray-600 leading-relaxed">
        We link back to the original district source on every page so you can always verify dates yourself. When districts publish updates mid-year, we update our records accordingly.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Coverage</h2>
      <p class="text-gray-600 leading-relaxed">
        We currently cover 25+ of the largest public school districts across California, Florida, Texas, New York, Illinois, North Carolina, Nevada, Virginia, and Maryland — with more districts and states being added regularly. Our goal is comprehensive coverage of the largest districts in every state.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Always Free</h2>
      <p class="text-gray-600 leading-relaxed">
        MySchoolDates is free for everyone. School calendar information is public data, and we believe it should be easy to access without paywalls, signups, or ads that get in the way.
      </p>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
      <p class="text-gray-600 leading-relaxed">
        Have a question, found an error, or want to request a district? Reach us at
        <a href="mailto:hello@myschooldates.com" class="text-blue-600 hover:underline">hello@myschooldates.com</a>.
      </p>
    </section>
  </div>
</template>
