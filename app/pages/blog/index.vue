<script setup lang="ts">
useSeoMeta({
  title: 'School Calendar Research Blog | MySchoolDates',
  description: 'Research notes, school calendar trends, and data reports from the MySchoolDates calendar dataset.',
  ogTitle: 'School Calendar Research Blog | MySchoolDates',
  ogDescription: 'Research notes, school calendar trends, and data reports from the MySchoolDates calendar dataset.',
})

const posts = [
  {
    title: '2026-2027 School Calendar Trends: Start Dates, Breaks & End Dates From 100 Districts',
    description: 'A data-backed look at when schools start, winter break dates, spring break patterns, last days, PDFs, ICS files, and planning trends across 100 reviewed district calendars.',
    href: '/school-calendar-trends/2026-2027-report',
    date: 'July 27, 2026',
    tag: 'Research Report',
  },
]

const researchLinks = [
  {
    title: 'School Calendar Trends Hub',
    description: 'A central entry point for annual school calendar trends reports, current findings, archive planning, and state calendar hubs.',
    href: '/school-calendar-trends',
    tag: 'Hub',
  },
  {
    title: 'School Calendar Trends Dataset 2026-2027',
    description: 'Download the public CSV dataset behind the 2026-2027 report, with field definitions, methodology, and citation guidance.',
    href: '/datasets/school-calendar-trends',
    tag: 'Dataset',
  },
]
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-10">
    <div class="mb-8">
      <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">MySchoolDates Blog</p>
      <h1 class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">School Calendar Research and Trends</h1>
      <p class="mt-3 max-w-3xl text-gray-600 leading-relaxed">
        Data reports and planning notes based on reviewed public school district calendar records, official source PDFs, and MySchoolDates calendar exports.
      </p>
    </div>

    <section class="grid gap-4">
      <article
        v-for="post in posts"
        :key="post.href"
        class="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-sm transition"
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span class="rounded-lg bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{{ post.tag }}</span>
          <time>{{ post.date }}</time>
        </div>
        <h2 class="mt-3 text-xl font-semibold text-gray-900">
          <NuxtLink :to="post.href" class="hover:text-blue-700 transition-colors">
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ post.description }}</p>
        <NuxtLink :to="post.href" class="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800">
          Read the report
        </NuxtLink>
      </article>
    </section>

    <section class="mt-8">
      <h2 class="text-xl font-semibold text-gray-900">Research Assets</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="link in researchLinks"
          :key="link.href"
          :to="link.href"
          class="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-sm transition"
        >
          <span class="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{{ link.tag }}</span>
          <h3 class="mt-3 text-lg font-semibold text-gray-900">{{ link.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ link.description }}</p>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
