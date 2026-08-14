<script setup lang="ts">
const pageTitle = 'Spring Break 2027 | School Calendar Dates and Trends'
const pageDescription = 'Compare spring break 2027 timing patterns from 175 reviewed U.S. district calendars, including March 22, March 15, April 5, and March 29 clusters.'
const pageUrl = 'https://myschooldates.com/spring-break-2027'

const breakRows = [
  ['March 22, 2027', '44 districts'],
  ['March 15, 2027', '42 districts'],
  ['April 5, 2027', '26 districts'],
  ['March 29, 2027', '25 districts'],
  ['March 8, 2027', '12 districts'],
  ['Other or not listed', '26 districts'],
]

const faqRows = [
  {
    q: 'When is spring break 2027 for most schools?',
    a: 'In the current MySchoolDates 2026-2027 trend dataset, March 22, 2027 is the largest spring break start-date cluster, followed by March 15, April 5, and March 29.',
  },
  {
    q: 'Why do school districts have different spring break dates?',
    a: 'Spring break varies by district because of state testing windows, semester calendars, local board decisions, Easter timing, regional travel patterns, and make-up day policies.',
  },
  {
    q: 'Is spring break 2027 the same for nearby districts?',
    a: 'Not always. Nearby districts can use different spring break weeks, so families should verify the district calendar and campus notices before making travel or childcare plans.',
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
              { '@type': 'ListItem', position: 2, name: 'Spring Break 2027', item: pageUrl },
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
        <span class="font-semibold text-gray-900" aria-current="page">Spring Break 2027</span>
      </nav>

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">School Break Trend Guide</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Spring Break 2027</h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Spring break 2027 is more varied than winter break. In the current MySchoolDates trend dataset, the largest cluster begins March 22, 2027, followed by March 15, April 5, and March 29.
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">175 reviewed calendars</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">25 states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Last verified August 14, 2026</span>
        </div>
      </header>

      <section class="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Quick Answer</h2>
        <p class="mt-3 text-sm leading-relaxed text-emerald-950">
          March 22, 2027 is the most common spring break start-date signal in the reviewed dataset, but March 15, March 29, April 5, and March 8 are also important clusters.
        </p>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Spring Break 2027 Cluster Table</h2>
        <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Spring break start</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed districts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in breakRows" :key="row[0]">
                <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Why Spring Break Dates Differ</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          Spring break is more flexible than winter break because it is not anchored to a single national holiday period. Districts often balance state assessment windows, semester timing, local board policy, Easter timing, staff planning days, and regional travel pressure when choosing a spring break week.
        </p>
      </section>

      <section id="faq" class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Spring Break 2027 FAQ</h2>
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
          <NuxtLink to="/summer-break-2027" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">Summer break 2027</NuxtLink>
        </div>
      </section>
    </article>
  </main>
</template>
