<script setup lang="ts">
const pageTitle = 'Summer Break 2027 | Last Day of School Trends'
const pageDescription = 'See when summer break starts in 2027 using MySchoolDates trend data from 100 reviewed district calendars, including May and June last-day patterns.'
const pageUrl = 'https://myschooldates.com/summer-break-2027'

const endRows = [
  ['May', '61 districts', 'May endings are more common in the reviewed 2026-2027 sample.'],
  ['June', '39 districts', 'June endings remain important in Northeast, Mid-Atlantic, and some California district records.'],
]

const lastDayRows = [
  ['May 27, 2027', '23 districts'],
  ['May 28, 2027', '14 districts'],
  ['May 26, 2027', '13 districts'],
  ['June 4, 2027', '8 districts'],
  ['June 9, 2027', '8 districts'],
]

const faqRows = [
  {
    q: 'When does summer break start in 2027?',
    a: 'Summer break usually begins after the final student day on the district calendar. In the current MySchoolDates 2026-2027 sample, May 27, 2027 is the most common last student day.',
  },
  {
    q: 'Do most schools end in May or June 2027?',
    a: 'In the reviewed dataset, 61 of 100 district calendars end in May and 39 end in June.',
  },
  {
    q: 'How many weeks is summer break in America?',
    a: 'Summer break varies by district. Many families see roughly 10 to 12 weeks between a late-May or June last day and an August first day, but official calendars should be checked locally.',
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
              { '@type': 'ListItem', position: 2, name: 'Summer Break 2027', item: pageUrl },
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
        <span class="font-semibold text-gray-900" aria-current="page">Summer Break 2027</span>
      </nav>

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">School Calendar Trend Guide</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Summer Break 2027</h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Summer break 2027 usually begins after a district's final student day. In the current MySchoolDates trend dataset, May endings are more common than June endings, and May 27, 2027 is the most common last student day.
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
          May 27, 2027 is the most common last student day in the reviewed dataset. For most families, summer break begins after the final student day listed on the local district calendar.
        </p>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Do Schools End in May or June 2027?</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div v-for="row in endRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div class="text-2xl font-bold text-gray-900">{{ row[1] }}</div>
            <div class="mt-1 text-sm font-semibold text-gray-900">end in {{ row[0] }}</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
          </div>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Most Common Last Days of School in 2027</h2>
        <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in lastDayRows" :key="row[0]">
                <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Summer Break 2027 FAQ</h2>
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
          <NuxtLink to="/school-start-dates-2026" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">School start dates 2026</NuxtLink>
        </div>
      </section>
    </article>
  </main>
</template>
