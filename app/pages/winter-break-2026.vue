<script setup lang="ts">
const pageTitle = 'Winter Break 2026 | School Calendar Dates and Trends'
const pageDescription = 'See 2026 winter break school calendar trends from 100 reviewed U.S. district calendars, including the December 21, 2026 start-date cluster.'
const pageUrl = 'https://myschooldates.com/winter-break-2026'

const breakRows = [
  ['December 21, 2026', '89 records', 'Strongest winter break start-date signal in the current dataset.'],
  ['December 23-24, 2026', '8 records', 'Later starts appear in some district calendars and regional patterns.'],
  ['Other or not listed', '3 records', 'Some records use different labels or do not list a clean winter break start signal.'],
]

const faqRows = [
  {
    q: 'When does winter break start in 2026 for most schools?',
    a: 'In the current MySchoolDates 2026-2027 trend dataset, December 21, 2026 is the most common winter break start-date signal.',
  },
  {
    q: 'Do all districts start winter break on December 21, 2026?',
    a: 'No. December 21 is the strongest cluster, but districts can use different winter break dates based on state rules, board calendars, teacher workdays, and local scheduling decisions.',
  },
  {
    q: 'Should families use this page instead of the official district calendar?',
    a: 'No. This page summarizes trend data. Families should verify final dates on their district calendar page and official district source before making fixed plans.',
  },
]

useSeoMeta({
  title: `${pageTitle} | MySchoolDates`,
  description: pageDescription,
  ogTitle: `${pageTitle} | MySchoolDates`,
  ogDescription: pageDescription,
  ogUrl: pageUrl,
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': pageUrl,
            name: pageTitle,
            description: pageDescription,
            isPartOf: { '@type': 'WebSite', name: 'MySchoolDates', url: 'https://myschooldates.com' },
            about: { '@id': 'https://myschooldates.com/school-calendar-trends/2026-2027-report#dataset' },
          },
          {
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            mainEntity: faqRows.map(row => ({
              '@type': 'Question',
              name: row.q,
              acceptedAnswer: { '@type': 'Answer', text: row.a },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'Winter Break 2026', item: pageUrl },
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <main class="bg-gray-50">
    <article class="mx-auto max-w-4xl px-4 py-10">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <NuxtLink to="/" class="font-medium text-gray-600 hover:text-blue-600">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/school-calendar-trends" class="font-medium text-gray-600 hover:text-blue-600">Calendar Data</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="font-semibold text-gray-900" aria-current="page">Winter Break 2026</span>
      </nav>

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">School Break Trend Guide</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Winter Break 2026</h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          December 21, 2026 is the dominant winter break start-date signal in the current MySchoolDates 2026-2027 trend dataset, appearing in 89 of 100 reviewed district calendar records.
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">100 reviewed calendars</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">13 states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Last verified July 27, 2026</span>
        </div>
      </header>

      <section class="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Quick Answer</h2>
        <p class="mt-3 text-sm leading-relaxed text-emerald-950">
          Most reviewed district calendars point to Monday, December 21, 2026 as the start of winter break. Local calendars can vary, so district source verification still matters.
        </p>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Winter Break Start-Date Distribution</h2>
        <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Start-date signal</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed records</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Interpretation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in breakRows" :key="row[0]">
                <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Why Winter Break Is More Consistent Than Spring Break</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          Winter break is anchored by late-December holidays, semester calendars, and district closure patterns. That makes it more consistent across districts than spring break, which is more affected by state testing windows, Easter timing, local board decisions, and regional travel calendars.
        </p>
      </section>

      <section id="faq" class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Winter Break 2026 FAQ</h2>
        <div class="mt-5 divide-y divide-gray-100">
          <div v-for="row in faqRows" :key="row.q" class="py-4 first:pt-0 last:pb-0">
            <h3 class="font-semibold text-gray-900">{{ row.q }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.a }}</p>
          </div>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Related Calendar Data</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink to="/school-calendar-trends/2026-2027-report" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Full trends report</NuxtLink>
          <NuxtLink to="/datasets/school-calendar-trends" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">CSV dataset</NuxtLink>
          <NuxtLink to="/spring-break-2027" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">Spring break 2027</NuxtLink>
        </div>
      </section>
    </article>
  </main>
</template>
