<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { BarChart, HeatmapChart } from 'echarts/charts'
import { CalendarComponent, GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import trendData from '../../data/school-calendar-trends-2026-2027.json'

use([BarChart, CalendarComponent, GridComponent, HeatmapChart, TooltipComponent, VisualMapComponent, CanvasRenderer])

const VChart = defineAsyncComponent(() => import('vue-echarts').then(module => module.default))

const pageUrl = 'https://myschooldates.com/datasets/school-calendar-trends'
const reportUrl = 'https://myschooldates.com/school-calendar-trends/2026-2027-report'
const hubUrl = 'https://myschooldates.com/school-calendar-trends'
const csvDownloadUrl = '/data/school-calendar-trends-2026-2027.csv'
const title = '2026-2027 U.S. School Calendar Dataset (CSV) | 205 Districts'
const description = 'Download a free 2026-2027 U.S. school calendar dataset with 205 reviewed district calendars across 31 states, dates, breaks, and source links.'
const citationText = 'Dou, Denis. (2026). School Calendar Trends Dataset 2026-2027. MySchoolDates. https://myschooldates.com/datasets/school-calendar-trends'
const authorProfile = {
  name: 'Denis Dou',
  role: 'Founder & Education Data Research Lead',
  url: 'https://myschooldates.com/author',
  linkedin: 'https://www.linkedin.com/in/denis-dou/',
  image: 'https://myschooldates.com/images/denis-dou.png',
  description: 'Denis Dou leads MySchoolDates education data research and product direction, with a focus on structured school calendar datasets, source verification workflows, and parent-facing planning resources.',
}

const datasetChartCards = [
  {
    title: 'Start Month Distribution',
    summary: 'August is the dominant start month in the current 2026-2027 dataset release.',
    fallbackRows: [
      ['July', '9 records'],
      ['August', '176 records'],
      ['September', '20 records'],
    ],
    option: {
      color: ['#2563eb'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['July', 'August', 'September'] },
      yAxis: { type: 'value', max: 205 },
      series: [{ type: 'bar', data: [9, 176, 20], barWidth: 28 }],
    },
  },
  {
    title: 'End Month Distribution',
    summary: 'May endings are more common than June endings in the current dataset release.',
    fallbackRows: [
      ['May', '125 records'],
      ['June', '80 records'],
    ],
    option: {
      color: ['#0f766e'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['May', 'June'] },
      yAxis: { type: 'value', max: 140 },
      series: [{ type: 'bar', data: [125, 80], barWidth: 34 }],
    },
  },
  {
    title: 'Winter Break Start Signals',
    summary: 'December 21, 2026 is the strongest winter break start-date signal in the CSV dataset.',
    fallbackRows: [
      ['December 18, 2026', '1 record'],
      ['December 19, 2026', '1 record'],
      ['December 21, 2026', '179 records'],
      ['December 23, 2026', '11 records'],
      ['December 24, 2026', '7 records'],
    ],
    option: {
      tooltip: { position: 'top' },
      visualMap: { min: 0, max: 179, show: false, inRange: { color: ['#dbeafe', '#2563eb'] } },
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
          ['2026-12-21', 179],
          ['2026-12-23', 11],
          ['2026-12-24', 7],
        ],
      },
    },
  },
  {
    title: 'Spring Break Start Clusters',
    summary: 'Spring break is distributed across several March and early-April start-date clusters.',
    fallbackRows: [
      ['March 8, 2027', '14 records'],
      ['March 15, 2027', '56 records'],
      ['March 22, 2027', '48 records'],
      ['March 29, 2027', '31 records'],
      ['April 5, 2027', '27 records'],
    ],
    option: {
      color: ['#7c3aed'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 48 },
      xAxis: { type: 'category', data: ['Mar 8', 'Mar 15', 'Mar 22', 'Mar 29', 'Apr 5'], axisLabel: { rotate: 25 } },
      yAxis: { type: 'value', max: 60 },
      series: [{ type: 'bar', data: [14, 56, 48, 31, 27], barWidth: 24 }],
    },
  },
]

const fieldRows = [
  ['district', 'District or short district label used in the report appendix.', 'AUHSD'],
  ['state', 'U.S. state associated with the district calendar record.', 'California'],
  ['myschooldates_page', 'MySchoolDates school-year calendar page used as the reviewed record entry point.', 'https://myschooldates.com/anaheim-union-high-school-district-calendar/2026-2027'],
  ['first_day', 'Reviewed first student day or first day signal for the 2026-2027 school year.', 'Aug 12, 2026'],
  ['last_day', 'Reviewed last student day or school-year end signal.', 'May 27, 2027'],
  ['winter_break_signal', 'Reviewed winter break start signal when available in the calendar record.', 'Dec 21, 2026'],
  ['spring_break_signal', 'Reviewed spring break start signal when available in the calendar record.', 'Mar 22, 2027'],
]

const previewRows = trendData.records.slice(0, 10).map(record => [
  record.district,
  record.state,
  record.firstDay,
  record.lastDay,
  record.winterBreakSignal,
  record.springBreakSignal,
])

const keyFindingCards = [
  {
    title: 'August remains the dominant start month',
    value: '176 of 205',
    description: 'Reviewed district records begin the 2026-2027 school year in August, making August the clearest start-date pattern in the current school calendar dataset.',
  },
  {
    title: 'May endings are more common than June endings',
    value: '125 records',
    description: 'The dataset shows more May school-year endings than June endings, which helps compare last-day patterns across district calendar records.',
  },
  {
    title: 'December 21 is the strongest winter break signal',
    value: '179 records',
    description: 'Winter break signals cluster heavily around December 21, 2026, making it the most visible holiday timing pattern in this public school calendar dataset.',
  },
  {
    title: 'Spring break is more distributed',
    value: '5 clusters',
    description: 'Spring break start dates spread across March and early April, so state and district-level context matters more for spring break planning than for winter break.',
  },
]

const useCaseCards = [
  {
    audience: 'Researchers',
    description: 'Compare public school calendar data across states, districts, and academic-year timing signals.',
  },
  {
    audience: 'Journalists',
    description: 'Use reviewed source links and CSV fields for education data notes, local stories, and school calendar explainers.',
  },
  {
    audience: 'Developers',
    description: 'Import the spreadsheet into dashboards, internal tools, or lightweight school calendar database projects.',
  },
  {
    audience: 'Parents and planners',
    description: 'Understand broad school year length trends, common break timing, and regional calendar differences before checking district-specific pages.',
  },
]

const trendExplanationCards = [
  {
    title: 'Instructional day requirements shape the year',
    description: 'Many public school calendars work backward from required student days, teacher work days, holidays, testing windows, and board-approved local constraints.',
  },
  {
    title: 'August starts balance summer and holiday breaks',
    description: 'An August start gives districts more room to complete the first semester before winter break while keeping the final student day in May or June.',
  },
  {
    title: 'Breaks are easier to cluster than daily schedules',
    description: 'Districtwide winter and spring break signals are more comparable than bell schedules, minimum days, or campus events, which are often school-specific.',
  },
  {
    title: 'State and regional patterns still matter',
    description: 'The dataset can show national patterns, but school calendar decisions remain local. State rules, weather, labor calendars, and regional planning habits affect individual districts.',
  },
]

const methodologySteps = [
  ['Identify official sources', 'Find district calendar pages, board-approved calendar PDFs, and district-published calendar files.'],
  ['Verify academic-year dates', 'Check first student day, last student day, winter break signals, and spring break signals against the reviewed source record.'],
  ['Normalize date fields', 'Convert dates into consistent CSV fields so records can be compared across states and district calendar formats.'],
  ['Classify calendar signals', 'Tag start dates, end dates, break signals, and source links for school calendar data analysis.'],
  ['Review anomalies manually', 'Flag unusual calendars, alternate tracks, or source limitations before using records in trend analysis.'],
]

const faqRows = [
  {
    question: 'Where can I download school calendar data?',
    answer: 'You can download the public 2026-2027 school calendar dataset as a CSV file from this page. The file includes reviewed district calendar records with first day, last day, winter break signal, spring break signal, state, and source page fields.',
  },
  {
    question: 'How many districts are included in this school calendar dataset?',
    answer: 'The current public release includes 205 reviewed district calendar records across 31 U.S. states. It is a trend-analysis dataset, not a complete national census of every public school district.',
  },
  {
    question: 'Is this a complete U.S. school calendar database?',
    answer: 'No. The dataset is a reviewed MySchoolDates sample built for school calendar trends analysis. It should be used for research, reporting, and planning context, while official district calendars remain the source of record.',
  },
  {
    question: 'Can I use this dataset for education research or local reporting?',
    answer: 'Yes. The CSV is intended for education data notes, local school calendar roundups, parent planning analysis, and internal research. Cite the dataset and verify district-specific decisions against official district sources.',
  },
  {
    question: 'How often is the school calendar dataset updated?',
    answer: 'The v4.0 release was last verified on August 21, 2026. The next planned review is January 2027, with earlier updates possible when official district calendar sources materially change.',
  },
]

const qualityRows = [
  ['Source type', 'Official district calendar pages, board-approved PDFs, public district sources, and reviewed MySchoolDates records.'],
  ['Sample size', '205 reviewed 2026-2027 district calendar records across 31 states.'],
  ['Dataset role', 'Trend analysis and planning reference; not a complete national census of every U.S. public school district.'],
  ['Last verified', 'August 21, 2026.'],
  ['Next planned review', 'January 2027, or sooner when material source changes are identified.'],
]

const datasetFileRows = [
  ['File format', 'CSV, UTF-8'],
  ['Rows', '205 district records plus header row'],
  ['Columns', '7 public fields'],
  ['File size', 'About 31 KB'],
  ['License', 'Use with citation under MySchoolDates terms'],
]

const versionRows = [
  ['v1.0', 'July 27, 2026', 'Initial public release with 100 reviewed district calendar records across 13 states.'],
  ['v2.0', 'August 9, 2026', 'Expanded release with 150 reviewed district calendar records across 19 states.'],
  ['v3.0', 'August 14, 2026', 'Expanded release with 175 reviewed district calendar records across 25 states.'],
  ['v4.0', 'August 21, 2026', 'Expanded release with 205 reviewed district calendar records across 31 states.'],
  ['Next planned review', 'January 2027', 'Refresh verified source links, add material district updates, and expand records as new calendars are reviewed.'],
]

const relatedRows = [
  ['Read the full report', '/school-calendar-trends/2026-2027-report', 'National 2026-2027 trend analysis with charts, state patterns, FAQ, source examples, and limitations.'],
  ['Browse the trends hub', '/school-calendar-trends', 'Archive and entry point for school calendar trends reports, data releases, and future state-level analysis.'],
  ['Review methodology', '/calendar-verification-methodology', 'How MySchoolDates verifies official district calendar sources before publishing structured records.'],
  ['Browse California calendars', '/california', 'State hub with district pages used in the current dataset sample.'],
  ['Browse Texas calendars', '/texas', 'State hub with large-district school calendar records and calendar app downloads.'],
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
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: title,
            description,
            isPartOf: {
              '@type': 'WebSite',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            about: { '@id': `${pageUrl}#dataset` },
            hasPart: [
              { '@type': 'WebPageElement', name: 'Dataset download', url: `${pageUrl}#download` },
              { '@type': 'WebPageElement', name: 'Quick answer', url: `${pageUrl}#quick-answer` },
              { '@type': 'WebPageElement', name: 'Dataset charts', url: `${pageUrl}#charts` },
              { '@type': 'WebPageElement', name: 'Key findings', url: `${pageUrl}#findings` },
              { '@type': 'WebPageElement', name: 'Why calendar trends exist', url: `${pageUrl}#trend-context` },
              { '@type': 'WebPageElement', name: 'CSV preview', url: `${pageUrl}#preview` },
              { '@type': 'WebPageElement', name: 'Field definitions', url: `${pageUrl}#fields` },
              { '@type': 'WebPageElement', name: 'Methodology and scope', url: `${pageUrl}#methodology` },
              { '@type': 'WebPageElement', name: 'Research team', url: `${pageUrl}#research-team` },
              { '@type': 'FAQPage', name: 'Dataset FAQ', url: `${pageUrl}#faq` },
              { '@type': 'WebPageElement', name: 'Version history', url: `${pageUrl}#version-history` },
              { '@type': 'WebPageElement', name: 'Citation', url: `${pageUrl}#citation` },
            ],
          },
          {
            '@type': 'Dataset',
            '@id': `${pageUrl}#dataset`,
            name: 'School Calendar Trends Dataset 2026-2027',
            description: 'CSV dataset of 205 reviewed 2026-2027 U.S. district calendar records across 31 states with first day, last day, winter break signal, spring break signal, and MySchoolDates district page URL.',
            creator: {
              '@type': 'Organization',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            datePublished: '2026-07-27',
            dateModified: '2026-08-21',
            temporalCoverage: '2026-07-01/2027-06-30',
            spatialCoverage: 'United States',
            keywords: [
              'school calendar dataset',
              'education data',
              'district calendar data',
              'academic calendar dataset',
              'school calendar trends',
              'public school calendar CSV',
              'school calendar database',
              'public school calendar data',
              'K-12 calendar dataset',
              'education statistics dataset',
            ],
            measurementTechnique: 'Manual review of official district calendar sources and MySchoolDates structured calendar records',
            license: 'https://myschooldates.com/terms',
            citation: citationText,
            accountablePerson: {
              '@type': 'Person',
              name: authorProfile.name,
              jobTitle: authorProfile.role,
              url: authorProfile.url,
              image: authorProfile.image,
              sameAs: [authorProfile.linkedin],
            },
            variableMeasured: fieldRows.map(row => ({
              '@type': 'PropertyValue',
              name: row[0],
              description: row[1],
            })),
            distribution: [
              {
                '@type': 'DataDownload',
                name: 'School calendar trends CSV dataset',
                encodingFormat: 'text/csv',
                contentUrl: `https://myschooldates.com${csvDownloadUrl}`,
              },
              {
                '@type': 'DataDownload',
                name: 'School calendar trends report appendix',
                encodingFormat: 'text/html',
                contentUrl: `${reportUrl}#data-appendix`,
              },
            ],
            isBasedOn: {
              '@type': 'CreativeWork',
              name: '2026-2027 School Calendar Trends Report',
              url: reportUrl,
            },
          },
          {
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            mainEntity: faqRows.map(row => ({
              '@type': 'Question',
              name: row.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: row.answer,
              },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'School Calendar Trends', item: 'https://myschooldates.com/school-calendar-trends' },
              { '@type': 'ListItem', position: 3, name: 'School Calendar Trends Dataset', item: pageUrl },
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
    <div class="site-page-shell py-10">
      <Breadcrumb
        class="mb-6"
        :items="[
          { label: 'Home', href: '/' },
          { label: 'School Calendar Trends', href: '/school-calendar-trends' },
          { label: 'School Calendar Trends Dataset' },
        ]"
      />

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">School Calendar Dataset</p>
        <h1 class="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
          School Calendar Trends Dataset 2026-2027
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Download the reviewed CSV dataset behind the MySchoolDates 2026-2027 School Calendar Trends Report. The v4.0 release covers 205 district calendar records across 31 states, including start dates, end dates, winter break signals, spring break signals, and district page links for U.S. school calendar data analysis.
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">205 reviewed records</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">31 states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">CSV download</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Last verified August 21, 2026</span>
        </div>
      </header>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div class="space-y-8">
          <section id="download" class="rounded-lg border border-blue-100 bg-blue-50 p-6">
            <h2 class="text-2xl font-bold text-gray-900">Download the CSV Dataset</h2>
            <p class="mt-3 text-blue-950 leading-relaxed">
              Use the CSV for education research notes, school calendar roundups, parent planning analysis, local reporting, or internal trend checks. The file is a reviewed platform dataset, not a complete national census.
            </p>
            <p class="mt-3 text-blue-950 leading-relaxed">
              Researchers can use the spreadsheet to compare public school calendar trends such as first student day timing, last day patterns, winter break signals, spring break clusters, and district source coverage.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <a :href="csvDownloadUrl" download class="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Download school calendar trends CSV
              </a>
              <NuxtLink to="/school-calendar-trends/2026-2027-report#data-appendix" class="inline-flex rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:border-blue-300">
                View HTML appendix
              </NuxtLink>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div
                v-for="row in datasetFileRows"
                :key="row[0]"
                class="rounded-lg border border-blue-100 bg-white/80 p-3"
              >
                <div class="text-xs font-semibold uppercase tracking-wide text-blue-700">{{ row[0] }}</div>
                <div class="mt-1 text-sm font-medium text-blue-950">{{ row[1] }}</div>
              </div>
            </div>
          </section>

          <section id="quick-answer" class="rounded-lg border border-emerald-100 bg-emerald-50 p-6">
            <h2 class="text-2xl font-bold text-gray-900">Quick Answer: What Is This Dataset?</h2>
            <p class="mt-3 text-emerald-950 leading-relaxed">
              This 2026-2027 U.S. school calendar dataset contains 205 reviewed district calendar records across 31 states. It covers first student day, last student day, winter break timing, spring break patterns, and source page links for school calendar data analysis.
            </p>
            <p class="mt-3 text-emerald-950 leading-relaxed">
              The CSV is best used as a school calendar database sample for trend analysis, education statistics, public school calendar data comparisons, and reporting workflows that need reusable spreadsheet fields.
            </p>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Dataset Summary</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-2xl font-bold text-gray-900">205</div>
                <p class="mt-1 text-sm text-gray-600">reviewed district calendar records</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-2xl font-bold text-gray-900">19</div>
                <p class="mt-1 text-sm text-gray-600">states represented in this release</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-2xl font-bold text-gray-900">7</div>
                <p class="mt-1 text-sm text-gray-600">CSV fields in the public download</p>
              </div>
            </div>
            <div id="charts" class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900">Dataset Charts</h3>
              <p class="mt-2 text-sm leading-relaxed text-gray-600">
                Interactive charts summarize the CSV release while fallback tables keep the dataset readable when JavaScript is unavailable.
              </p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div
                  v-for="chart in datasetChartCards"
                  :key="chart.title"
                  class="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <h4 class="font-semibold text-gray-900">{{ chart.title }}</h4>
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
            </div>
          </section>

          <section id="findings" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Key Findings From the 2026-2027 School Calendar Data</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The 2026-2027 school calendar dataset is designed to make district calendar records easier to compare. Instead of reading 205 separate district calendar pages, users can quickly analyze the most visible patterns in U.S. public school calendar data.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div
                v-for="finding in keyFindingCards"
                :key="finding.title"
                class="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div class="text-2xl font-bold text-gray-900">{{ finding.value }}</div>
                <h3 class="mt-2 font-semibold text-gray-900">{{ finding.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ finding.description }}</p>
              </div>
            </div>
            <p class="mt-5 text-gray-600 leading-relaxed">
              These findings support searches such as school calendar statistics, average school start date in the U.S., winter break dates by district, spring break trends, and free school calendar CSV download. For deeper analysis, use the full report and the HTML appendix alongside this dataset.
            </p>
          </section>

          <section id="trend-context" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Why These School Calendar Trends Exist</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The dataset shows that August starts, May or June endings, winter break clusters, and spring break variation are not random. District calendars reflect academic requirements, local operations, staffing calendars, board approval timelines, and regional planning patterns.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div
                v-for="item in trendExplanationCards"
                :key="item.title"
                class="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <h3 class="font-semibold text-gray-900">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ item.description }}</p>
              </div>
            </div>
            <p class="mt-5 text-gray-600 leading-relaxed">
              This is why the dataset separates district-level calendar signals from school-specific schedules. A district PDF can usually support start-date and break analysis, while bell schedules, early release days, and campus events often require separate school-level confirmation.
            </p>
          </section>

          <section id="contains" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">What This School Calendar Dataset Contains</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Each CSV row represents one reviewed district calendar record for the 2026-2027 school year. The dataset is intentionally compact so it can be opened in spreadsheet tools, cited in education data analysis, or combined with local reporting notes for a school year calendar dataset or K-12 education data project.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Best uses</h3>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                  <li>School calendar trends analysis</li>
                  <li>Education data download and spreadsheet review</li>
                  <li>Parent planning roundups and local reporting</li>
                  <li>District calendar database comparisons</li>
                </ul>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Important limits</h3>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                  <li>Not a full U.S. school district census</li>
                  <li>Not a replacement for official district calendars</li>
                  <li>Not enrollment-weighted or randomly sampled</li>
                  <li>Reviewed for trend analysis, not legal reliance</li>
                </ul>
              </div>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div
                v-for="useCase in useCaseCards"
                :key="useCase.audience"
                class="rounded-lg border border-gray-100 p-4"
              >
                <h3 class="font-semibold text-gray-900">{{ useCase.audience }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ useCase.description }}</p>
              </div>
            </div>
          </section>

          <section id="preview" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">CSV Preview: First 10 Dataset Records</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This preview shows the first 10 rows from the public school calendar CSV so researchers can inspect the structure before downloading the full 205-record dataset.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">District</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">State</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">First Day</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Last Day</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Winter Break Signal</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Spring Break Signal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in previewRows" :key="`${row[0]}-${row[2]}`">
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
            <div class="mt-5 flex flex-wrap gap-3">
              <a :href="csvDownloadUrl" download class="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Download full CSV
              </a>
              <NuxtLink to="/school-calendar-trends/2026-2027-report#data-appendix" class="inline-flex rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">
                View report appendix
              </NuxtLink>
            </div>
          </section>

          <section id="fields" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Field Definitions</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The public CSV is intentionally compact so it can be cited and reused easily. Each row represents one reviewed district calendar record for the 2026-2027 school year.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Field</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Definition</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Example</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in fieldRows" :key="row[0]">
                    <td class="px-4 py-2 font-mono text-xs font-semibold text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-500">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="methodology" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Methodology and Scope</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This dataset is built from MySchoolDates district calendar records that are reviewed against official district calendar pages, board-approved PDFs, source calendar pages, and district-published calendar files when available.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              It is designed for trend analysis: school start dates, last days, winter break timing, spring break clusters, and regional planning patterns. It should not be read as a complete list of all U.S. public school district calendars.
            </p>
            <div class="mt-5 grid gap-3">
              <div
                v-for="step in methodologySteps"
                :key="step[0]"
                class="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <h3 class="font-semibold text-gray-900">{{ step[0] }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ step[1] }}</p>
              </div>
            </div>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in qualityRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="research-team" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Research Team and Review Notes</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This dataset is prepared by Denis Dou and the MySchoolDates calendar data workflow for readers who need a reusable U.S. school calendar dataset rather than a single district calendar lookup page.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Prepared by</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">
                  Denis Dou, with records reviewed against official district calendar sources before inclusion in the public CSV.
                </p>
              </div>
              <div class="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div class="flex gap-4">
                  <img src="/images/denis-dou.png" alt="Denis Dou" class="h-14 w-14 rounded-lg border border-blue-100 bg-white object-cover" />
                  <div>
                    <h3 class="font-semibold text-gray-900">Author and editorial lead</h3>
                    <p class="mt-2 text-sm font-medium text-gray-700">{{ authorProfile.name }} — {{ authorProfile.role }}</p>
                    <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ authorProfile.description }}</p>
                    <div class="mt-3 flex flex-wrap gap-3 text-sm">
                      <a :href="authorProfile.url" target="_blank" rel="noopener" class="font-semibold text-blue-600 hover:underline">Author profile</a>
                      <a :href="authorProfile.linkedin" target="_blank" rel="noopener" class="font-semibold text-blue-600 hover:underline">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Editorial ownership</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">
                  Published by MySchoolDates Education Data Research. Dataset questions, corrections, or source updates can be sent to <a href="mailto:hello@myschooldates.com" class="font-semibold text-blue-600 hover:underline">hello@myschooldates.com</a>.
                </p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Review cycle</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">
                  Last verified August 21, 2026. The next planned dataset review is January 2027, or sooner when material source changes are identified.
                </p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">Editorial standards</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">
                  Records are checked for source availability, date consistency, normalized field formatting, and anomaly notes before being used in the public school calendar dataset.
                </p>
              </div>
            </div>
          </section>

          <section id="faq" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar Dataset FAQ</h2>
            <div class="mt-5 divide-y divide-gray-100">
              <details
                v-for="row in faqRows"
                :key="row.question"
                class="group py-4"
              >
                <summary class="cursor-pointer font-semibold text-gray-900 group-open:text-blue-700">
                  {{ row.question }}
                </summary>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.answer }}</p>
              </details>
            </div>
          </section>

          <section id="version-history" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Dataset Version History</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Version notes help researchers and publishers understand which release they cited or downloaded.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Version</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in versionRows" :key="row[0]">
                    <td class="px-4 py-2 font-semibold text-gray-900">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="citation" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">How to Cite This Dataset</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Use this citation when referencing the CSV dataset in education analysis, local planning articles, data notes, or research summaries.
            </p>
            <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {{ citationText }}
            </div>
            <p class="mt-4 text-sm leading-relaxed text-gray-600">
              Share this dataset with the CSV link, the report appendix, or the citation above so readers can verify the source and review the current release notes.
            </p>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Related School Calendar Data Assets</h2>
            <div class="mt-5 grid gap-3">
              <NuxtLink
                v-for="row in relatedRows"
                :key="row[1]"
                :to="row[1]"
                class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                <div class="font-semibold text-gray-900">{{ row[0] }}</div>
                <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ row[2] }}</p>
              </NuxtLink>
            </div>
          </section>
        </div>

        <aside class="space-y-4">
          <div class="sticky top-4 rounded-lg border border-gray-200 bg-white p-5">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Dataset Links</h2>
            <nav class="mt-3 grid gap-2 text-sm">
              <a href="#download" class="text-blue-600 hover:underline">Download CSV</a>
              <a href="#quick-answer" class="text-blue-600 hover:underline">Quick answer</a>
              <a href="#charts" class="text-blue-600 hover:underline">Dataset charts</a>
              <a href="#findings" class="text-blue-600 hover:underline">Key findings</a>
              <a href="#trend-context" class="text-blue-600 hover:underline">Why trends exist</a>
              <a href="#contains" class="text-blue-600 hover:underline">What it contains</a>
              <a href="#preview" class="text-blue-600 hover:underline">CSV preview</a>
              <a href="#fields" class="text-blue-600 hover:underline">Field definitions</a>
              <a href="#methodology" class="text-blue-600 hover:underline">Methodology</a>
              <a href="#research-team" class="text-blue-600 hover:underline">Research team</a>
              <a href="#faq" class="text-blue-600 hover:underline">FAQ</a>
              <a href="#version-history" class="text-blue-600 hover:underline">Version history</a>
              <a href="#citation" class="text-blue-600 hover:underline">How to cite</a>
              <NuxtLink to="/school-calendar-trends/2026-2027-report" class="text-blue-600 hover:underline">Full report</NuxtLink>
              <NuxtLink to="/school-calendar-trends" class="text-blue-600 hover:underline">Trends hub</NuxtLink>
              <NuxtLink to="/calendar-verification-methodology" class="text-blue-600 hover:underline">Verification methodology</NuxtLink>
            </nav>
            <div class="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
              Public release: 205 reviewed 2026-2027 calendar records across 31 states. Next planned review: January 2027.
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
