<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { BarChart, HeatmapChart } from 'echarts/charts'
import { CalendarComponent, GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import trendData from '../../data/school-calendar-trends-2026-2027.json'

use([BarChart, CalendarComponent, GridComponent, HeatmapChart, TooltipComponent, VisualMapComponent, CanvasRenderer])

const VChart = defineAsyncComponent(() => import('vue-echarts').then(module => module.default))

const pageUrl = 'https://myschooldates.com/school-calendar-trends'
const title = 'US School Calendar Trends 2026-2027 | Data Report & Analysis'
const description = 'Analyze U.S. school calendar trends from 150 reviewed district calendars across 19 states, with start dates, breaks, end dates, CSV data, and charts.'

const featuredAssets = [
  {
    label: 'Current national report',
    title: '2026-2027 School Calendar Trends',
    description: 'Start dates, winter break, spring break, last days, instructional day patterns, source examples, charts, FAQ, and data appendix from the current reviewed district calendar sample.',
    href: '/school-calendar-trends/2026-2027-report',
    tag: 'Report',
  },
  {
    label: 'CSV dataset',
    title: 'School Calendar Trends Dataset 2026-2027',
    description: 'Download the public CSV dataset with district, state, first day, last day, winter break signal, spring break signal, and MySchoolDates district page link.',
    href: '/datasets/school-calendar-trends',
    tag: 'Dataset',
  },
  {
    label: 'Methodology',
    title: 'Calendar Verification Methodology',
    description: 'How MySchoolDates verifies district calendar records against official district sources before publishing dates, downloads, and research reports.',
    href: '/calendar-verification-methodology',
    tag: 'Trust',
  },
]

const archiveRows = [
  ['2026-2027', 'National School Calendar Trends Report', '/school-calendar-trends/2026-2027-report', 'Published July 27, 2026', 'Available'],
  ['2027-2028', 'National School Calendar Trends Report', '#upcoming', 'Planned after more 2027-2028 district coverage is reviewed', 'Planned'],
  ['2025-2026', 'Historical School Calendar Trends Snapshot', '#upcoming', 'Candidate archive release based on existing prior-year district records', 'Planned'],
]

const coverage = {
  recordsLabel: '150',
  sampleSize: '150',
  states: '19',
  schoolYears: '2025-2027',
  lastUpdated: 'August 9, 2026',
  nextReview: 'January 2027',
  nextReviewShort: 'Jan 2027',
}

const trendRows = [
  ['Start dates', '131 of 150 reviewed 2026-2027 districts start in August, while 7 start in July and 12 start in September.'],
  ['Winter break', 'December 21, 2026 is the strongest winter break start-date cluster, appearing in 132 reviewed records.'],
  ['Spring break', 'Spring break is less uniform: the top five clusters begin March 22, March 15, April 5, March 29, and March 8, 2027.'],
  ['End dates', '90 reviewed districts end in May and 60 end in June. May 27, 2027 is the most common last student day.'],
  ['Calendar utility', '146 of 150 reviewed records include an official or source PDF, while every reviewed MySchoolDates record includes an ICS export.'],
]

const keyInsightRows = [
  ['87.3%', 'start in August', 'August remains the dominant U.S. school start month in the reviewed 2026-2027 dataset.'],
  ['88%', 'share a December 21 break signal', 'December 21, 2026 is the clearest national winter break start-date cluster.'],
  ['60%', 'end in May', 'May end dates are more common than June end dates in the current reviewed sample.'],
  ['73 records', 'list 180 student days', '180 student days is the most common instructional-day count where a count is published.'],
]

const liveCoverageRows = [
  ['District calendar records', coverage.recordsLabel, 'Current verified dataset for the 2026-2027 trend report.'],
  ['States represented', coverage.states, 'Coverage spans major state clusters and selected reviewed districts.'],
  ['School years covered', coverage.schoolYears, 'Current, prior-year, and forward-looking calendar records support archive growth.'],
  ['Next dataset review', coverage.nextReviewShort, 'Planned update window for new records and material source changes.'],
]

const chartCards = [
  {
    title: 'School Start Month Distribution',
    summary: 'August is the dominant start month in the current reviewed 2026-2027 district calendar sample.',
    fallbackRows: [
      ['July', '7 records'],
      ['August', '131 records'],
      ['September', '12 records'],
    ],
    option: {
      color: ['#2563eb'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['July', 'August', 'September'] },
      yAxis: { type: 'value', max: 150 },
      series: [{ type: 'bar', data: [7, 131, 12], barWidth: 28 }],
    },
  },
  {
    title: 'School Year End Month Distribution',
    summary: 'May endings are more common than June endings in the current reviewed sample.',
    fallbackRows: [
      ['May', '90 records'],
      ['June', '60 records'],
    ],
    option: {
      color: ['#0f766e'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['May', 'June'] },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: [90, 60], barWidth: 34 }],
    },
  },
  {
    title: 'Winter Break Timing Pattern',
    summary: 'December 21, 2026 is the strongest winter break start-date signal in the current report.',
    fallbackRows: [
      ['December 18, 2026', '1 record'],
      ['December 19, 2026', '1 record'],
      ['December 21, 2026', '132 records'],
      ['December 23, 2026', '6 records'],
      ['December 24, 2026', '6 records'],
    ],
    option: {
      tooltip: { position: 'top' },
      visualMap: {
        min: 0,
        max: 132,
        show: false,
        inRange: { color: ['#dbeafe', '#2563eb'] },
      },
      calendar: {
        top: 24,
        left: 32,
        right: 16,
        cellSize: ['auto', 30],
        range: ['2026-12-14', '2026-12-31'],
        itemStyle: { borderColor: '#e5e7eb' },
        dayLabel: { firstDay: 1, color: '#4b5563' },
        monthLabel: { color: '#111827' },
        yearLabel: { show: false },
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: [
          ['2026-12-18', 1],
          ['2026-12-19', 1],
          ['2026-12-21', 132],
          ['2026-12-23', 6],
          ['2026-12-24', 6],
        ],
      },
    },
  },
  {
    title: 'Spring Break Cluster Analysis',
    summary: 'Spring break is less uniform than winter break, with several March and early-April clusters.',
    fallbackRows: [
      ['March 8, 2027', '12 records'],
      ['March 15, 2027', '38 records'],
      ['March 22, 2027', '41 records'],
      ['March 29, 2027', '14 records'],
      ['April 5, 2027', '22 records'],
    ],
    option: {
      color: ['#7c3aed'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 48 },
      xAxis: {
        type: 'category',
        data: ['Mar 8', 'Mar 15', 'Mar 22', 'Mar 29', 'Apr 5'],
        axisLabel: { rotate: 25 },
      },
      yAxis: { type: 'value', max: 45 },
      series: [{ type: 'bar', data: [12, 38, 41, 14, 22], barWidth: 24 }],
    },
  },
]

const growthRows = [
  ['July 27, 2026', '100 records', 'Initial public trends hub, report, and CSV dataset release.'],
  [coverage.lastUpdated, `${coverage.recordsLabel} records`, 'v2.0 expansion to 19 states with 50 additional reviewed district calendars.'],
  [coverage.nextReview, 'Next review planned', 'Add newly verified district records and material calendar revisions.'],
  ['2027-2028 cycle', 'Expanded coverage planned', 'Move toward larger state samples, annual archive comparisons, and more district-level records.'],
]

const datasetPreviewRows = trendData.records.slice(0, 8).map(record => [
  record.district,
  record.state,
  record.firstDay,
  record.lastDay,
  record.winterBreakSignal,
  record.springBreakSignal,
])

const stateComparisonRows = [
  ['California', '26 records', 'Mixed July and August starts', 'Track calendars, year-round calendars, and June endings appear more often than in most states in the sample.'],
  ['Texas', '25 records', 'August starts with May endings', 'Large metro-area ISDs show strong August start and May end patterns, with 180-day calendars common.'],
  ['Florida', '16 records', 'August starts with statewide planning context', 'The expanded sample includes additional Gulf Coast and Central Florida districts with weather-planning notes.'],
  ['Virginia', '15 records', 'Late-August starts and June endings', 'Northern Virginia and Hampton Roads examples show more June school-year endings than Texas or Florida.'],
  ['North Carolina', '15 records', 'Late-August starts', 'August 24 is a strong first-day signal in the current sample, with varied spring break timing.'],
  ['Washington', '10 records', 'Later starts and June endings', 'September starts and June last days are more visible after the v2.0 expansion.'],
  ['Arizona and Colorado', '17 records', 'Early starts and intersession variety', 'Western additions broaden July and early-August opening patterns.'],
]

const sourceMixRows = [
  ['Official or source PDF available', '146 of 150 records', 'PDFs remain the dominant official publishing format for district calendars.'],
  ['ICS export available on MySchoolDates', '150 of 150 records', 'ICS files support Google Calendar, Apple Calendar, and Outlook imports.'],
  ['Reviewed district page link', '150 of 150 records', 'Every dataset row links back to a district calendar page for context and source verification.'],
]

const topicGuideRows = [
  ['School Start Dates 2026', '/school-start-dates-2026', 'Focused guide for when U.S. schools start in 2026, including August start patterns and common first days.'],
  ['Winter Break 2026', '/winter-break-2026', 'Winter break trend guide centered on the December 21, 2026 start-date cluster.'],
  ['Spring Break 2027', '/spring-break-2027', 'Spring break cluster guide for March and April 2027 district calendar patterns.'],
  ['Summer Break 2027', '/summer-break-2027', 'Last-day and summer break guide for May and June 2027 school-year endings.'],
]

const faqRows = [
  {
    q: 'What are the biggest school calendar trends for 2026-2027?',
    a: 'The biggest trends in the reviewed MySchoolDates dataset are August school starts, winter break clustering around December 21, 2026, more May endings than June endings, and broad continued use of official PDF calendars alongside ICS downloads.',
  },
  {
    q: 'How large is the school calendar trends dataset?',
    a: 'The public trends hub currently summarizes a 150-record verified dataset across 19 states for the 2026-2027 report, and coverage continues expanding as additional district calendar pages and official sources are reviewed.',
  },
  {
    q: 'What month do most U.S. schools start?',
    a: 'In the current reviewed 2026-2027 MySchoolDates sample, August is the dominant start month. One hundred thirty-one of 150 reviewed district calendar records start in August.',
  },
  {
    q: 'What is the average school start date in the U.S.?',
    a: 'This page does not claim a national average across all U.S. districts. In the reviewed 150-record sample, the most common first days are concentrated in August, especially August 10-24, 2026.',
  },
  {
    q: 'Why do school districts have different spring break dates?',
    a: 'Spring break varies because districts set local calendars around state rules, testing windows, teacher workdays, weather make-up needs, track calendars, and regional planning constraints.',
  },
  {
    q: 'How many instructional days are typical in U.S. school calendars?',
    a: 'The most common listed count in the reviewed MySchoolDates sample is 180 student days. Seventy-three reviewed records list 180 student days, though state and district rules vary.',
  },
  {
    q: 'Where does the school calendar data come from?',
    a: 'The data comes from reviewed MySchoolDates district calendar records, which are built from official district calendar pages, board-approved PDFs, and public district source pages when available.',
  },
  {
    q: 'Is this a complete national school calendar dataset?',
    a: 'No. The current dataset is a reviewed platform sample, not a complete census of every U.S. public school district. It is designed for trend analysis and planning signals.',
  },
  {
    q: 'Can I download the school calendar trends data?',
    a: 'Yes. MySchoolDates provides a public CSV dataset with district, state, first day, last day, winter break signal, spring break signal, and district page URL fields.',
  },
]

const futureRows = [
  ['State-level trend reports', 'California, Texas, Florida, Virginia, and North Carolina are the strongest candidates because the current dataset already has meaningful state-level samples.'],
  ['Break-date reports', 'Dedicated winter break and spring break trend pages can serve users searching by calendar year instead of district name.'],
  ['Expanded dataset releases', 'The v2.0 release expanded from 100 to 150 records; future reports can continue toward 500+ reviewed district calendars.'],
  ['Historical archive', 'Annual archive pages can show how school start dates, end dates, and break timing change over time.'],
]

const stateLinks = [
  ['California school calendars', '/california', 'Large sample with July starts, track-calendar signals, and varied spring break patterns.'],
  ['Texas school calendars', '/texas', 'Strong August-start and May-ending patterns across major metro districts.'],
  ['Florida school calendars', '/florida', 'Central and South Florida planning context around August starts, spring break, and weather make-up days.'],
  ['Virginia school calendars', '/virginia', 'Late-August starts and June endings are common in the current reviewed records.'],
  ['North Carolina school calendars', '/north-carolina', 'Useful state sample for August 24 starts and regional break patterns.'],
  ['Oregon school calendars', '/oregon', 'New v2.0 coverage with local first-day rules, program calendars, and conditional make-up dates.'],
  ['Washington school calendars', '/washington', 'Later starts and June endings across ten reviewed district calendars.'],
  ['Utah school calendars', '/utah', 'New v2.0 coverage beginning with Alpine School District and its A/B calendar details.'],
]

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: pageUrl,
  twitterTitle: title,
  twitterDescription: description,
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
            '@type': 'CollectionPage',
            '@id': `${pageUrl}#collection`,
            url: pageUrl,
            name: title,
            description,
            isPartOf: {
              '@type': 'WebSite',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'School calendar trends reports and datasets',
              itemListElement: featuredAssets.map((asset, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: asset.title,
                url: `https://myschooldates.com${asset.href}`,
              })),
            },
          },
          {
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            mainEntity: faqRows.map(row => ({
              '@type': 'Question',
              name: row.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: row.a,
              },
            })),
          },
          {
            '@type': 'Dataset',
            '@id': `${pageUrl}#dataset`,
            name: 'US School Calendar Trends Dataset',
            description: 'Reviewed U.S. school district calendar records used for MySchoolDates trend reporting, including first day, last day, winter break signal, spring break signal, source availability, and district page references.',
            url: 'https://myschooldates.com/datasets/school-calendar-trends',
            dateModified: '2026-08-09',
            version: 'v2.0',
            temporalCoverage: '2026-2027',
            spatialCoverage: 'United States',
            creator: {
              '@type': 'Organization',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            isBasedOn: {
              '@type': 'CreativeWork',
              name: 'Official district calendar pages and board-approved calendar PDFs',
            },
            measurementTechnique: 'Manual review of public district calendar sources and normalization into structured calendar fields',
            variableMeasured: [
              'district',
              'state',
              'firstDay',
              'lastDay',
              'winterBreak',
              'springBreak',
              'studentDays',
              'sourcePdfUrl',
              'districtPageUrl',
            ],
            distribution: [
              {
                '@type': 'DataDownload',
                name: 'School Calendar Trends CSV Dataset',
                contentUrl: 'https://myschooldates.com/data/school-calendar-trends-2026-2027.csv',
                encodingFormat: 'text/csv',
              },
              {
                '@type': 'DataDownload',
                name: 'School Calendar Trends Dataset Landing Page',
                contentUrl: 'https://myschooldates.com/datasets/school-calendar-trends',
                encodingFormat: 'text/html',
              },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'School Calendar Trends', item: pageUrl },
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
    <div class="max-w-5xl mx-auto px-4 py-10">
      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">School Calendar Trends Hub</p>
        <h1 class="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
          US School Calendar Trends 2026-2027: Data Report & Analysis
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          A research hub for U.S. school calendar statistics, start-date patterns, winter break dates, spring break trends, school-year end dates, CSV datasets, charts, and annual reports from the reviewed MySchoolDates calendar dataset.
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">Last updated {{ coverage.lastUpdated }}</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Next review {{ coverage.nextReview }}</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">{{ coverage.recordsLabel }} reviewed records</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Growing U.S. coverage</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Reports</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">CSV datasets</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Charts</span>
        </div>
      </header>

      <section id="live-coverage" class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Live Coverage Snapshot</p>
            <h2 class="mt-2 text-2xl font-bold text-gray-900">Current Verified School Calendar Dataset Coverage</h2>
          </div>
          <NuxtLink to="/datasets/school-calendar-trends" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            View dataset
          </NuxtLink>
        </div>
        <p class="mt-3 max-w-3xl text-gray-600 leading-relaxed">
          The published 2026-2027 analysis currently uses a {{ coverage.sampleSize }}-record reviewed sample, while the underlying MySchoolDates dataset continues expanding as additional district calendar sources are verified.
        </p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="row in liveCoverageRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ row[0] }}</p>
            <div class="mt-2 text-2xl font-bold text-gray-900">{{ row[1] }}</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
          </div>
        </div>
      </section>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div class="space-y-8">
          <section id="dataset-preview" class="rounded-lg border border-gray-200 bg-white p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Dataset Preview</h2>
                <p class="mt-3 text-gray-600 leading-relaxed">
                  Preview the normalized fields used in the public CSV dataset. The full file includes district, state, first day, last day, winter break signal, spring break signal, and MySchoolDates page URL.
                </p>
              </div>
              <NuxtLink to="/datasets/school-calendar-trends" class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">
                Download CSV
              </NuxtLink>
            </div>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">District</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">State</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">First day</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Last day</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Winter break signal</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Spring break signal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in datasetPreviewRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-900">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[3] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[4] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[5] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="key-insights" class="rounded-lg border border-blue-100 bg-blue-50 p-6">
            <h2 class="text-2xl font-bold text-gray-900">Key Insights From 2026-2027 School Calendar Data</h2>
            <p class="mt-3 text-blue-950 leading-relaxed">
              The current MySchoolDates report analyzes a {{ coverage.sampleSize }}-record reviewed district calendar sample across {{ coverage.states }} states. These are the highest-signal findings for users searching for school calendar statistics, school start date trends, winter break dates, and spring break patterns.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="row in keyInsightRows" :key="row[1]" class="rounded-lg border border-blue-100 bg-white p-4">
                <div class="text-2xl font-bold text-gray-900">{{ row[0] }}</div>
                <h3 class="mt-1 font-semibold text-gray-900">{{ row[1] }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
              </div>
            </div>
          </section>

          <section id="charts" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar Statistics and Interactive Charts</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              These charts summarize the current U.S. school calendar analysis: start month distribution, end month distribution, winter break concentration, and spring break clustering.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="chart in chartCards" :key="chart.title" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">{{ chart.title }}</h3>
                <ClientOnly>
                  <VChart :option="chart.option" autoresize class="mt-3 h-64 w-full" />
                  <template #fallback>
                    <div class="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-gray-100 text-left text-gray-500">
                            <th class="py-2 font-semibold">Value</th>
                            <th class="py-2 font-semibold">Count</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          <tr v-for="fallbackRow in chart.fallbackRows" :key="fallbackRow[0]">
                            <td class="py-2 font-medium text-gray-900">{{ fallbackRow[0] }}</td>
                            <td class="py-2 text-gray-600">{{ fallbackRow[1] }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </template>
                </ClientOnly>
                <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ chart.summary }}</p>
              </div>
            </div>
            <p class="mt-4 text-xs leading-relaxed text-gray-500">
              Text summaries remain below each chart so the underlying findings are readable even when interactive charts are unavailable.
            </p>
          </section>

          <section id="growth-history" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Dataset Growth History</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              MySchoolDates treats school calendar trends as a growing dataset, not a one-time article. This timeline tracks the public coverage milestones used for trend reporting and future archive comparisons.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Dataset size</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in growthRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-900">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="state-comparison" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar by State: Current Sample Comparison</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              State-level calendar patterns matter because school start dates, spring break timing, instructional days, and weather make-up rules are not nationally uniform. The current sample is strongest for California, Texas, Virginia, North Carolina, and Florida.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">State</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Sample</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Start-date pattern</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Planning interpretation</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in stateComparisonRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-900">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[3] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="source-mix" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">PDF and ICS Calendar Adoption Signals</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              One reason school calendar data is hard to compare nationally is that districts publish calendars in different formats. The current MySchoolDates sample tracks both official source formats and user-facing calendar exports.
            </p>
            <div class="mt-5 grid gap-4">
              <div v-for="row in sourceMixRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="font-semibold text-gray-900">{{ row[0] }}</h3>
                  <span class="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-blue-700">{{ row[1] }}</span>
                </div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
              </div>
            </div>
          </section>

          <section id="dataset-methodology" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Dataset Methodology: How Current Calendar Records Are Reviewed</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The current published analysis uses {{ coverage.sampleSize }} reviewed records from the broader MySchoolDates platform dataset. The sample is not a random national survey and not an enrollment-weighted census; it is designed to identify school calendar trends from districts with public, reviewable calendar sources while coverage continues to expand.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Included records</h3>
                <ul class="mt-2 space-y-2 text-sm leading-relaxed text-gray-600">
                  <li>Large and high-search public school districts.</li>
                  <li>Districts with official calendar pages or public PDFs.</li>
                  <li>State clusters where multiple nearby districts can be compared.</li>
                  <li>Calendar records that can be normalized into first day, last day, break, and source fields.</li>
                </ul>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Not claimed</h3>
                <ul class="mt-2 space-y-2 text-sm leading-relaxed text-gray-600">
                  <li>Not a complete census of every U.S. district.</li>
                  <li>Not a statistically random sample.</li>
                  <li>Not a replacement for official district sources.</li>
                  <li>Not automatically updated when a district revises a PDF after review.</li>
                </ul>
              </div>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-gray-500">
              For the field-level CSV and citation format, see the <NuxtLink to="/datasets/school-calendar-trends" class="font-medium text-blue-600 hover:underline">School Calendar Trends Dataset</NuxtLink>. For source review standards, see the <NuxtLink to="/calendar-verification-methodology" class="font-medium text-blue-600 hover:underline">Calendar Verification Methodology</NuxtLink>.
            </p>
          </section>

          <section id="featured" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Featured School Calendar Data Assets</h2>
            <div class="mt-5 grid gap-4">
              <NuxtLink
                v-for="asset in featuredAssets"
                :key="asset.href"
                :to="asset.href"
                class="rounded-lg border border-gray-200 bg-gray-50 p-5 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span class="rounded-lg bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{{ asset.tag }}</span>
                  <span>{{ asset.label }}</span>
                </div>
                <h3 class="mt-3 text-lg font-semibold text-gray-900">{{ asset.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ asset.description }}</p>
              </NuxtLink>
            </div>
          </section>

          <section id="topic-guides" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Focused School Calendar Topic Guides</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              These guides support high-intent date searches while the national report remains the source for full methodology, appendix records, and downloadable data.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="row in topicGuideRows"
                :key="row[1]"
                :to="row[1]"
                class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                <div class="font-semibold text-gray-900">{{ row[0] }}</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
              </NuxtLink>
            </div>
          </section>

          <section id="current-findings" class="rounded-lg border border-blue-100 bg-blue-50 p-6">
            <h2 class="text-2xl font-bold text-gray-900">Current 2026-2027 Findings</h2>
            <p class="mt-3 text-blue-950 leading-relaxed">
              The current report is based on a {{ coverage.sampleSize }}-record reviewed sample across {{ coverage.states }} states. These findings summarize the main trends that should guide deeper analysis while the dataset continues expanding.
            </p>
            <div class="mt-5 grid gap-3">
              <div v-for="row in trendRows" :key="row[0]" class="rounded-lg border border-blue-100 bg-white p-4">
                <h3 class="font-semibold text-gray-900">{{ row[0] }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ row[1] }}</p>
              </div>
            </div>
          </section>

          <section id="research-team" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Research Team and Update Notes</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Published by the MySchoolDates Calendar Data Team, this hub summarizes reviewed district calendar records from official source pages, board-approved PDFs, and MySchoolDates structured calendar pages. The current data collection period for the 2026-2027 report runs through {{ coverage.lastUpdated }}.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Research lead</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">MySchoolDates Calendar Data Team</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Reviewed by</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">MySchoolDates Editorial Review</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Data collection</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">Reviewed official district calendar sources and structured MySchoolDates records.</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Last verified</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ coverage.lastUpdated }} for the current published report and public CSV dataset.</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Next review</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ coverage.nextReview }}, or sooner when material district calendar revisions are identified.</p>
              </div>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-gray-500">
              Editorial standards are documented in the <NuxtLink to="/editorial-policy" class="font-medium text-blue-600 hover:underline">MySchoolDates Editorial Policy</NuxtLink>.
            </p>
          </section>

          <section id="faq" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar Trends FAQ</h2>
            <div class="mt-5 divide-y divide-gray-100">
              <div v-for="row in faqRows" :key="row.q" class="py-4 first:pt-0 last:pb-0">
                <h3 class="text-base font-semibold text-gray-900">{{ row.q }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.a }}</p>
              </div>
            </div>
          </section>

          <section id="archive" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar Trends Archive</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This hub will collect annual trend reports as more school-year datasets are reviewed. The 2026-2027 report is the current published national report; future reports will be added as coverage expands.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">School year</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Asset</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in archiveRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-900">{{ row[0] }}</td>
                    <td class="px-4 py-2">
                      <NuxtLink :to="row[2]" class="font-medium text-blue-600 hover:underline">{{ row[1] }}</NuxtLink>
                    </td>
                    <td class="px-4 py-2 text-gray-600">{{ row[4] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[3] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="state-hubs" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">State Calendar Hubs for Trend Analysis</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              State hubs provide the district-level pages that support future state-specific trend reports. Use these hubs to compare district calendars by region, calendar type, break timing, and source availability.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="row in stateLinks"
                :key="row[1]"
                :to="row[1]"
                class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                <div class="font-semibold text-gray-900">{{ row[0] }}</div>
                <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
              </NuxtLink>
            </div>
          </section>

          <section id="upcoming" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Planned Research Releases</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              MySchoolDates will expand the report series as additional district records are reviewed. The next meaningful upgrades are not more prose on the current report, but larger samples, annual archives, and state-specific reports.
            </p>
            <div class="mt-5 grid gap-3">
              <div v-for="row in futureRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">{{ row[0] }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ row[1] }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="space-y-4">
          <div class="sticky top-4 rounded-lg border border-gray-200 bg-white p-5">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Trends Links</h2>
            <nav class="mt-3 grid gap-2 text-sm">
              <a href="#live-coverage" class="text-blue-600 hover:underline">Live coverage</a>
              <a href="#dataset-preview" class="text-blue-600 hover:underline">Dataset preview</a>
              <a href="#key-insights" class="text-blue-600 hover:underline">Key insights</a>
              <a href="#charts" class="text-blue-600 hover:underline">Charts</a>
              <a href="#growth-history" class="text-blue-600 hover:underline">Growth history</a>
              <a href="#state-comparison" class="text-blue-600 hover:underline">State comparison</a>
              <a href="#source-mix" class="text-blue-600 hover:underline">PDF and ICS signals</a>
              <a href="#dataset-methodology" class="text-blue-600 hover:underline">Dataset methodology</a>
              <a href="#featured" class="text-blue-600 hover:underline">Featured assets</a>
              <a href="#topic-guides" class="text-blue-600 hover:underline">Topic guides</a>
              <a href="#current-findings" class="text-blue-600 hover:underline">Current findings</a>
              <a href="#research-team" class="text-blue-600 hover:underline">Research team</a>
              <a href="#faq" class="text-blue-600 hover:underline">FAQ</a>
              <a href="#archive" class="text-blue-600 hover:underline">Archive</a>
              <a href="#state-hubs" class="text-blue-600 hover:underline">State hubs</a>
              <a href="#upcoming" class="text-blue-600 hover:underline">Planned releases</a>
              <NuxtLink to="/school-calendar-trends/2026-2027-report" class="text-blue-600 hover:underline">2026-2027 report</NuxtLink>
              <NuxtLink to="/datasets/school-calendar-trends" class="text-blue-600 hover:underline">CSV dataset</NuxtLink>
              <NuxtLink to="/blog" class="text-blue-600 hover:underline">Research blog</NuxtLink>
            </nav>
            <div class="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
              Current anchor asset: 2026-2027 report based on a {{ coverage.sampleSize }}-record reviewed sample, with dataset coverage expanding over time.
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
