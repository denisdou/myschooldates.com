<script setup lang="ts">
import trendData from '../data/school-calendar-trends-2026-2027.json'
import { getSchoolCalendarTrendStats } from '../utils/schoolCalendarTrendStats'

const trendStats = getSchoolCalendarTrendStats(trendData)
const pageUrl = 'https://myschooldates.com/author'
const authorName = 'Denis Dou'
const authorRole = 'Founder & Education Data Research Lead'
const linkedinUrl = 'https://www.linkedin.com/in/denis-dou/'
const authorImageUrl = 'https://myschooldates.com/images/denis-dou.png'
const organizationId = 'https://myschooldates.com/#organization'
const personId = `${pageUrl}#person`

const researchFocusRows = [
  {
    title: 'U.S. school calendar datasets',
    description: 'Collecting and organizing district calendar records into structured fields such as first day, last day, break signals, source URLs, and reviewed dates.',
  },
  {
    title: 'Official source verification',
    description: 'Reviewing district calendar pages, board-approved PDFs, source versions, and update notes before dates are published or included in datasets.',
  },
  {
    title: 'Education information architecture',
    description: 'Designing state, county, district, year, trend, and dataset pages so school calendar information can be searched, compared, and cited.',
  },
  {
    title: 'Parent planning tools',
    description: 'Turning school-year dates into practical planning context for breaks, minimum days, calendar downloads, transportation, and childcare schedules.',
  },
]

const workflowRows = [
  'Identify official district calendar sources and public PDF files',
  'Normalize school-year dates, break ranges, student days, and source metadata',
  'Review unusual calendar patterns against district context before publication',
  'Maintain correction paths, update history, and independent-reference disclaimers',
]

const backgroundRows = [
  ['Role', 'Founder of MySchoolDates and lead for education data research direction'],
  ['Current dataset scope', `${trendStats.districtCount} reviewed district calendar records across ${trendStats.stateCount} states in the public 2026-2027 trends dataset`],
  ['Primary output', 'District calendar pages, annual trends reports, CSV datasets, and verification methodology documentation'],
  ['Research method', 'Official district source review, public PDF checks, date normalization, and anomaly review before publication'],
]

const selectedResearchRows = [
  {
    title: '2026-2027 School Calendar Trends Report',
    href: '/school-calendar-trends/2026-2027-report',
    description: `Original research report analyzing start dates, winter break timing, spring break clusters, end dates, and instructional day patterns from ${trendStats.districtCount} reviewed U.S. district calendar records.`,
  },
  {
    title: '2026-2027 U.S. School Calendar Dataset',
    href: '/datasets/school-calendar-trends',
    description: 'Downloadable CSV dataset with preview records, field definitions, version history, citation guidance, and Dataset Schema for school calendar research use.',
  },
  {
    title: 'School Calendar Trends Hub',
    href: '/school-calendar-trends',
    description: 'Data hub connecting national trends, interactive charts, topic guides, state calendar hubs, and the annual research archive.',
  },
  {
    title: 'Calendar Verification Methodology',
    href: '/calendar-verification-methodology',
    description: 'Editorial process explaining how MySchoolDates reviews district calendar sources, official PDFs, source versions, and correction updates.',
  },
]

useSeoMeta({
  title: `${authorName} | Education Data Research Lead at MySchoolDates`,
  description: 'Meet Denis Dou, founder and education data research lead for MySchoolDates school calendar datasets, verification workflows, and parent-facing calendar planning pages.',
  ogTitle: `${authorName} | MySchoolDates`,
  ogDescription: 'Founder and education data research lead for MySchoolDates school calendar data resources and verification workflows.',
  ogUrl: pageUrl,
  twitterTitle: `${authorName} | MySchoolDates`,
  twitterDescription: 'Founder and education data research lead for MySchoolDates school calendar data resources and verification workflows.',
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
            '@type': 'Organization',
            '@id': organizationId,
            name: 'MySchoolDates',
            url: 'https://myschooldates.com',
          },
          {
            '@type': 'Person',
            '@id': personId,
            name: authorName,
            jobTitle: authorRole,
            url: pageUrl,
            image: authorImageUrl,
            sameAs: [linkedinUrl],
            worksFor: { '@id': organizationId },
            knowsAbout: [
              'school calendar data',
              'K-12 education data',
              'district calendar verification',
              'education data publishing',
              'education information architecture',
              'structured calendar datasets',
              'official source verification',
              'parent-facing planning resources',
            ],
          },
          {
            '@type': 'ProfilePage',
            '@id': pageUrl,
            url: pageUrl,
            name: `${authorName} | MySchoolDates Author Profile`,
            description: 'Author profile for Denis Dou, founder and education data research lead for MySchoolDates calendar data resources.',
            publisher: { '@id': organizationId },
            mainEntity: { '@id': personId },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'Author', item: pageUrl },
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
    <article class="mx-auto max-w-4xl px-4 py-12">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <NuxtLink to="/" class="font-medium text-gray-600 hover:text-blue-600">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="font-semibold text-gray-900" aria-current="page">Author</span>
      </nav>

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Author Profile</p>
        <div class="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{{ authorName }}</h1>
            <p class="mt-3 text-lg font-medium text-gray-700">{{ authorRole }}</p>
            <p class="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              Denis Dou is the founder of MySchoolDates, where he leads education data research and product direction for structured school calendar datasets. His work focuses on collecting, normalizing, and verifying official district calendar information so families, researchers, and publishers can use reliable school-year date records.
            </p>
          </div>
          <img
            src="/images/denis-dou.png"
            alt="Denis Dou"
            class="h-28 w-28 rounded-lg border border-blue-100 bg-blue-50 object-cover shadow-sm"
          />
        </div>
        <div class="mt-5 flex flex-wrap gap-3">
          <a :href="linkedinUrl" target="_blank" rel="noopener" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">LinkedIn</a>
          <NuxtLink to="/about" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">About MySchoolDates</NuxtLink>
          <a href="mailto:hello@myschooldates.com" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Contact MySchoolDates</a>
        </div>
      </header>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Background</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          Denis founded MySchoolDates to make fragmented school district calendar information easier to verify, compare, and use. The work centers on public education information that is often published across district calendar pages, board-approved PDFs, school-year files, and local update notices.
        </p>
        <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in backgroundRows" :key="row[0]">
                <th class="w-48 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-800">{{ row[0] }}</th>
                <td class="px-4 py-3 leading-relaxed text-gray-600">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">About MySchoolDates</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          MySchoolDates is a U.S. school calendar data platform that publishes independent district calendar references, state calendar hubs, annual school calendar trend reports, and reusable dataset pages. It is not affiliated with school districts; official district websites remain the source of record.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink to="/about" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">About the site</NuxtLink>
          <NuxtLink to="/districts" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">Browse district calendars</NuxtLink>
          <NuxtLink to="/school-calendar-trends" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">Calendar data hub</NuxtLink>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Research Focus</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          MySchoolDates publishes school calendar pages and calendar data resources built from official district sources. Denis oversees the research and editorial direction for making those records understandable, searchable, and useful for parents, researchers, and local planning use cases.
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div v-for="row in researchFocusRows" :key="row.title" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 class="font-semibold text-gray-900">{{ row.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.description }}</p>
          </div>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Calendar Data Workflow</h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          MySchoolDates is an independent reference, not an official school district website. The editorial workflow is designed to keep district calendar pages and data reports grounded in official source material while making the information easier to search and compare.
        </p>
        <ol class="mt-5 space-y-3">
          <li v-for="(row, index) in workflowRows" :key="row" class="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">{{ index + 1 }}</span>
            <span class="text-sm leading-relaxed text-gray-700">{{ row }}</span>
          </li>
        </ol>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink to="/calendar-verification-methodology" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">Verification methodology</NuxtLink>
          <NuxtLink to="/editorial-policy" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">Editorial policy</NuxtLink>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Selected Research and Data Assets</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <NuxtLink v-for="row in selectedResearchRows" :key="row.href" :to="row.href" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50">
            <div class="font-semibold text-gray-900">{{ row.title }}</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.description }}</p>
          </NuxtLink>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Corrections and Source Updates</h2>
        <p class="mt-2 text-sm leading-relaxed text-amber-950">
          School calendars can change after board action, weather closures, or district revisions. Send corrections, source updates, or dataset questions to
          <a href="mailto:hello@myschooldates.com" class="font-semibold text-amber-900 underline">hello@myschooldates.com</a>.
        </p>
      </section>
    </article>
  </main>
</template>
