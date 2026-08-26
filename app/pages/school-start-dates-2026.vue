<script setup lang="ts">
import trendData from '../data/school-calendar-trends-2026-2027.json'
import { getSchoolCalendarTrendStats } from '../utils/schoolCalendarTrendStats'

const trendStats = getSchoolCalendarTrendStats(trendData)
const augustStarts = trendStats.startMonthCount('Aug')
const julyStarts = trendStats.startMonthCount('Jul')
const septemberStarts = trendStats.startMonthCount('Sep')
const pageTitle = 'School Start Dates 2026 | When Do U.S. Schools Start?'
const pageDescription = `See when U.S. schools start in 2026 using MySchoolDates calendar trend data from ${trendStats.districtCount} reviewed district calendars, including August start patterns and common first days.`
const pageUrl = 'https://myschooldates.com/school-start-dates-2026'

const startRows = [
  ['August', `${augustStarts} of ${trendStats.districtCount} reviewed districts`, 'Dominant start month in the current 2026-2027 dataset.'],
  ['July', `${julyStarts} of ${trendStats.districtCount} reviewed districts`, 'Mostly early-start, year-round, track-calendar, or regional calendar patterns.'],
  ['September', `${septemberStarts} of ${trendStats.districtCount} reviewed districts`, 'Later starts appear in several northern and western district calendars.'],
]

const firstDayRows = [
  ['August 24, 2026', `${trendStats.firstDayCount('Aug 24, 2026')} districts`],
  ['August 12, 2026', `${trendStats.firstDayCount('Aug 12, 2026')} districts`],
  ['August 10, 2026', `${trendStats.firstDayCount('Aug 10, 2026')} districts`],
  ['August 11, 2026', `${trendStats.firstDayCount('Aug 11, 2026')} districts`],
  ['August 13, 2026', `${trendStats.firstDayCount('Aug 13, 2026')} districts`],
]

const faqRows = [
  {
    q: 'What month do most U.S. schools start in 2026?',
    a: `In the current MySchoolDates 2026-2027 trend dataset, August is the dominant start month. ${augustStarts} of ${trendStats.districtCount} reviewed district calendars begin in August 2026.`,
  },
  {
    q: 'What are the most common first days of school in 2026?',
    a: `August 24, 2026 is the most common first student day in the reviewed dataset, appearing in ${trendStats.firstDayCount('Aug 24, 2026')} district records, followed by August 12 in ${trendStats.firstDayCount('Aug 12, 2026')} records.`,
  },
  {
    q: 'Do some schools start in July 2026?',
    a: `Yes. ${julyStarts} reviewed district calendars start in July 2026, usually because of early-start, year-round, track-calendar, or regional scheduling patterns.`,
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
              { '@type': 'ListItem', position: 2, name: 'School Start Dates 2026', item: pageUrl },
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <main id="top" class="bg-gray-50">
    <article class="site-page-shell py-10">
      <Breadcrumb
        class="mb-6"
        :items="[
          { label: 'Home', href: '/' },
          { label: 'School Calendar Trends', href: '/school-calendar-trends' },
          { label: 'School Start Dates 2026' },
        ]"
      />

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">School Calendar Trend Guide</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">School Start Dates 2026</h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Most reviewed U.S. school districts start the 2026-2027 school year in August 2026. In the current MySchoolDates trend dataset, {{ augustStarts }} of {{ trendStats.districtCount }} reviewed district calendars begin in August.
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">{{ trendStats.districtCount }} reviewed calendars</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">{{ trendStats.stateCount }} states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Last verified August 21, 2026</span>
        </div>
      </header>

      <section class="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Quick Answer</h2>
        <p class="mt-3 text-sm leading-relaxed text-emerald-950">
          August is the standard school start month in the reviewed 2026-2027 sample. August 24, 2026 is the most common first student day, followed by August 12.
        </p>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Start Month Distribution</h2>
        <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Start month</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed records</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-700">Interpretation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in startRows" :key="row[0]">
                <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Most Common First Days of School in 2026</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div v-for="row in firstDayRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div class="font-semibold text-gray-900">{{ row[0] }}</div>
            <div class="mt-1 text-sm text-gray-600">{{ row[1] }}</div>
          </div>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Why August Starts Dominate</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          August starts help districts fit instructional day requirements, teacher planning days, semester breaks, winter holidays, spring break, and weather make-up policies into one academic year. State rules and local board approval timelines also shape whether a district starts in early August, late August, July, or September.
        </p>
      </section>

      <section id="faq" class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">School Start Dates 2026 FAQ</h2>
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
          <NuxtLink to="/winter-break-2026" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">Winter break 2026</NuxtLink>
        </div>
      </section>
    </article>
  </main>
</template>
