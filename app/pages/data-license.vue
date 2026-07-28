<script setup lang="ts">
useSeoMeta({
  title: 'MySchoolDates Data License',
  description: 'Data license and attribution terms for MySchoolDates school calendar datasets.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://myschooldates.com/data-license' }],
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900">MySchoolDates Data License</h1>
    <div class="mt-6 space-y-5 text-sm leading-relaxed text-gray-600">
      <p>
        MySchoolDates publishes independently reviewed school calendar datasets created from public official district sources.
        You may cite or link to MySchoolDates calendar pages with attribution.
      </p>
      <p>
        Calendar summaries, normalized date records, and generated .ics files are provided for reference use. Do not present
        MySchoolDates data as an official school district calendar, and verify time-sensitive plans with the official district source.
      </p>
      <p>
        Official district PDFs, logos, names, and source documents remain the property of their respective school districts or publishers.
        MySchoolDates does not grant rights to redistribute official district source documents.
      </p>
      <p>
        For corrections or licensing questions, contact
        <a href="mailto:hello@myschooldates.com" class="font-medium text-blue-600 hover:text-blue-800 underline">hello@myschooldates.com</a>.
      </p>
    </div>
  </main>
</template>
