<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import trendData from '../../data/school-calendar-trends-2026-2027.json'
import { getSchoolCalendarTrendStats } from '../../utils/schoolCalendarTrendStats'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const VChart = defineAsyncComponent(() => import('vue-echarts').then(module => module.default))
const trendStats = getSchoolCalendarTrendStats(trendData)
const julyStarts = trendStats.startMonthCount('Jul')
const augustStarts = trendStats.startMonthCount('Aug')
const septemberStarts = trendStats.startMonthCount('Sep')
const mayEndings = trendStats.endMonthCount('May')
const juneEndings = trendStats.endMonthCount('Jun')
const december21Breaks = trendStats.winterBreakCount('Dec 21, 2026')
const december23To24Breaks = trendStats.winterBreakCount('Dec 23, 2026') + trendStats.winterBreakCount('Dec 24, 2026')
const otherWinterBreaks = trendStats.districtCount - december21Breaks - december23To24Breaks
const studentDay180 = trendStats.instructionalDayCount('180')
const springBreakLabels = ['Mar 15, 2027', 'Mar 22, 2027', 'Mar 29, 2027', 'Apr 5, 2027', 'Mar 8, 2027']
const otherSpringBreaks = trendStats.districtCount - springBreakLabels.reduce((total, label) => total + trendStats.springBreakCount(label), 0)

const reportUrl = 'https://myschooldates.com/school-calendar-trends/2026-2027-report'
const reportTitle = `2026-2027 School Calendar Trends Report: Start Dates & Breaks From ${trendStats.districtCount} U.S. Districts`
const reportSeoTitle = `${reportTitle} | MySchoolDates`
const reportDescription = `Find 2026-2027 school calendar dates from ${trendStats.districtCount} U.S. districts across ${trendStats.stateCount} states. Compare school start dates, winter break, spring break, holidays, and last days of school.`
const csvDownloadUrl = '/data/school-calendar-trends-2026-2027.csv'
const datasetPageUrl = '/datasets/school-calendar-trends'
const trendsHubUrl = '/school-calendar-trends'
const citationText = `Dou, Denis. (2026). 2026-2027 School Calendar Trends Report: Start Dates & Breaks From ${trendStats.districtCount} U.S. Districts. MySchoolDates. https://myschooldates.com/school-calendar-trends/2026-2027-report`
const authorProfile = {
  name: 'Denis Dou',
  role: 'Founder & Education Data Research Lead',
  url: 'https://myschooldates.com/author',
  linkedin: 'https://www.linkedin.com/in/denis-dou/',
  image: 'https://myschooldates.com/images/denis-dou.png',
  description: 'Denis Dou leads MySchoolDates education data research and product direction, with a focus on structured school calendar datasets, source verification workflows, and parent-facing planning resources.',
}

const reportMetaRows = [
  ['Published', 'July 27, 2026'],
  ['Updated', 'August 21, 2026'],
  ['Reviewed', 'August 21, 2026'],
  ['By', authorProfile.name],
  ['Read time', '16 min'],
]

const faqRows = [
  {
    q: 'When does the 2026-2027 school year start?',
    a: `Most reviewed districts in the MySchoolDates sample start in August 2026. In this dataset, ${augustStarts} of ${trendStats.districtCount} reviewed districts begin in August, and August 24 is the most common first day.`,
  },
  {
    q: 'When is winter break 2026 for most schools?',
    a: `December 21, 2026 is the most common winter break start date in the reviewed dataset, appearing in ${december21Breaks} of ${trendStats.districtCount} district calendar records.`,
  },
  {
    q: 'When is spring break 2027?',
    a: 'Spring break is more varied than winter break. The most common reviewed spring break starts are March 15, 2027, March 22, 2027, and March 29, 2027.',
  },
  {
    q: 'How many school days are in 2026-2027?',
    a: `The most common listed instructional count is 180 student days. It appears in ${studentDay180} of ${trendStats.districtCount} reviewed records and in ${trendStats.percent(studentDay180, 1, trendStats.explicitInstructionalDayCount)} of records with an explicit student-day count.`,
  },
  {
    q: 'When does the 2026-2027 school year end?',
    a: `May end dates are more common in this sample. ${mayEndings} reviewed districts end in May, while ${juneEndings} end in June. May 27, 2027 is the most common last student day.`,
  },
  {
    q: 'Do all U.S. school districts use the same calendar?',
    a: 'No. School calendars vary by state, district, calendar type, weather policy, teacher workdays, track calendars, and special programs. Families should verify dates against the official district source.',
  },
  {
    q: 'Are school calendar PDFs still useful?',
    a: `Yes. PDFs remain the main official publishing format for many districts. In this sample, ${trendStats.sourcePdfCount} of ${trendStats.districtCount} reviewed pages include an official or source PDF, while MySchoolDates also provides ICS files for calendar app imports.`,
  },
  {
    q: 'Is this report a national census of every public school district?',
    a: `No. This is a reviewed MySchoolDates platform dataset of ${trendStats.districtCount} district calendar records across ${trendStats.stateCount} states as of August 21, 2026. It is intended as a trends report, not a complete national census.`,
  },
  {
    q: 'What month does school usually start in America?',
    a: `In the reviewed MySchoolDates 2026-2027 sample, August is the usual school start month. ${augustStarts} of ${trendStats.districtCount} reviewed U.S. district calendars begin in August 2026.`,
  },
  {
    q: 'How many weeks is summer break in America?',
    a: 'Summer break length varies by district and state. In this 2026-2027 sample, most reviewed districts end in late May or June and return in August, so many families see a summer planning window of roughly 10 to 12 weeks.',
  },
]

useSeoMeta({
  title: reportSeoTitle,
  description: reportDescription,
  ogTitle: reportSeoTitle,
  ogDescription: reportDescription,
  ogUrl: reportUrl,
  twitterTitle: reportTitle,
  twitterDescription: reportDescription,
})

useHead({
  link: [{ rel: 'canonical', href: reportUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${reportUrl}#article`,
            headline: reportTitle,
            description: reportDescription,
            datePublished: '2026-07-27',
            dateModified: '2026-08-21',
            author: {
              '@type': 'Person',
              name: authorProfile.name,
              jobTitle: authorProfile.role,
              url: authorProfile.url,
              image: authorProfile.image,
              sameAs: [authorProfile.linkedin],
              worksFor: {
                '@type': 'Organization',
                name: 'MySchoolDates',
                url: 'https://myschooldates.com',
              },
            },
            publisher: {
              '@type': 'Organization',
              name: 'MySchoolDates',
              url: 'https://myschooldates.com',
            },
            reviewedBy: {
              '@type': 'Person',
              name: authorProfile.name,
              jobTitle: authorProfile.role,
              url: authorProfile.url,
              image: authorProfile.image,
              sameAs: [authorProfile.linkedin],
            },
            mainEntityOfPage: reportUrl,
            citation: citationText,
            about: { '@id': `${reportUrl}#dataset` },
          },
          {
            '@type': 'Dataset',
            '@id': `${reportUrl}#dataset`,
            name: '2026-2027 School Calendar Dataset',
            description: `Reviewed 2026-2027 school calendar records for ${trendStats.districtCount} U.S. districts across ${trendStats.stateCount} states, including first day, last day, winter break, spring break, instructional day counts, source PDF availability, and ICS export availability.`,
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
            dateModified: '2026-08-21',
            temporalCoverage: '2026-07-01/2027-06-30',
            measurementTechnique: 'Manual review of official district calendar sources and MySchoolDates calendar records',
            variableMeasured: [
              { '@type': 'PropertyValue', name: 'firstDay' },
              { '@type': 'PropertyValue', name: 'lastDay' },
              { '@type': 'PropertyValue', name: 'winterBreak' },
              { '@type': 'PropertyValue', name: 'springBreak' },
              { '@type': 'PropertyValue', name: 'totalSchoolDays' },
              { '@type': 'PropertyValue', name: 'sourcePdfUrl' },
              { '@type': 'PropertyValue', name: 'calendarType' },
            ],
            distribution: [
              {
                '@type': 'DataDownload',
                encodingFormat: 'text/csv',
                contentUrl: `https://myschooldates.com${csvDownloadUrl}`,
              },
              {
                '@type': 'DataDownload',
                encodingFormat: 'text/html',
                contentUrl: `${reportUrl}#data-appendix`,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': `${reportUrl}#faq`,
            mainEntity: faqRows.map((row) => ({
              '@type': 'Question',
              name: row.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: row.a,
              },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'School Calendar Trends', item: 'https://myschooldates.com/school-calendar-trends' },
              { '@type': 'ListItem', position: 3, name: '2026–2027 Report', item: reportUrl },
            ],
          },
        ],
      }),
    },
  ],
})

const startMonthRows = [
  ['August', `${augustStarts} districts`, `${trendStats.percent(augustStarts)} of reviewed 2026-2027 records`],
  ['September', `${septemberStarts} districts`, 'Northern and western additions broaden the later-start sample'],
  ['July', `${julyStarts} districts`, 'Early-start and intersession calendars remain a small minority'],
]

const topFirstDays = [
  ['August 24, 2026', `${trendStats.firstDayCount('Aug 24, 2026')} districts`],
  ['August 12, 2026', `${trendStats.firstDayCount('Aug 12, 2026')} districts`],
  ['August 10, 2026', `${trendStats.firstDayCount('Aug 10, 2026')} districts`],
  ['August 11, 2026', `${trendStats.firstDayCount('Aug 11, 2026')} districts`],
  ['August 13, 2026', `${trendStats.firstDayCount('Aug 13, 2026')} districts`],
]

const lastDayRows = [
  ['May', `${mayEndings} districts`],
  ['June', `${juneEndings} districts`],
]

const topLastDays = [
  ['May 27, 2027', `${trendStats.lastDayCount('May 27, 2027')} districts`],
  ['May 26, 2027', `${trendStats.lastDayCount('May 26, 2027')} districts`],
  ['May 28, 2027', `${trendStats.lastDayCount('May 28, 2027')} districts`],
  ['June 4, 2027', `${trendStats.lastDayCount('Jun 4, 2027')} districts`],
  ['May 21, 2027', `${trendStats.lastDayCount('May 21, 2027')} districts`],
]

const springBreakRows = [
  ['March 15, 2027', `${trendStats.springBreakCount('Mar 15, 2027')} districts`],
  ['March 22, 2027', `${trendStats.springBreakCount('Mar 22, 2027')} districts`],
  ['March 29, 2027', `${trendStats.springBreakCount('Mar 29, 2027')} districts`],
  ['April 5, 2027', `${trendStats.springBreakCount('Apr 5, 2027')} districts`],
  ['March 8, 2027', `${trendStats.springBreakCount('Mar 8, 2027')} districts`],
]

const instructionalDayRows = [
  ['180 student days', `${studentDay180} districts`, `Most common count; ${trendStats.percent(studentDay180)} of all reviewed records and ${trendStats.percent(studentDay180, 1, trendStats.explicitInstructionalDayCount)} of records with a listed count`],
  ['175 or 176 student days', `${trendStats.instructionalDayCount('175')} and ${trendStats.instructionalDayCount('176')} districts`, 'Other recurring instructional-day totals in the expanded sample'],
  ['172, 174, or 178 student days', `${trendStats.instructionalDayCount('172')}, ${trendStats.instructionalDayCount('174')}, and ${trendStats.instructionalDayCount('178')} districts`, 'Less common listed counts in the expanded sample'],
  ['No count listed', `${trendStats.instructionalDayCount('Not listed')} districts`, 'Calendar record has dates but no explicit totalSchoolDays value'],
]

const stateRows = trendData.summary.stateCounts.map(([state, count]) => [state, String(count)])

const startMonthChartRows = [
  ['August', `${augustStarts} districts`, trendStats.percent(augustStarts)],
  ['September', `${septemberStarts} districts`, trendStats.percent(septemberStarts)],
  ['July', `${julyStarts} districts`, trendStats.percent(julyStarts)],
]

const endMonthChartRows = [
  ['May', `${mayEndings} districts`, trendStats.percent(mayEndings, 0)],
  ['June', `${juneEndings} districts`, trendStats.percent(juneEndings, 0)],
]

const winterBreakChartRows = [
  ['December 21, 2026', `${december21Breaks} records`, trendStats.percent(december21Breaks)],
  ['December 23-24, 2026', `${december23To24Breaks} records`, trendStats.percent(december23To24Breaks)],
  ['Other or not listed', `${otherWinterBreaks} records`, trendStats.percent(otherWinterBreaks)],
]

const springBreakChartRows = [
  ['March 15, 2027', `${trendStats.springBreakCount('Mar 15, 2027')} districts`, trendStats.percent(trendStats.springBreakCount('Mar 15, 2027'))],
  ['March 22, 2027', `${trendStats.springBreakCount('Mar 22, 2027')} districts`, trendStats.percent(trendStats.springBreakCount('Mar 22, 2027'))],
  ['March 29, 2027', `${trendStats.springBreakCount('Mar 29, 2027')} districts`, trendStats.percent(trendStats.springBreakCount('Mar 29, 2027'))],
  ['April 5, 2027', `${trendStats.springBreakCount('Apr 5, 2027')} districts`, trendStats.percent(trendStats.springBreakCount('Apr 5, 2027'))],
  ['March 8, 2027', `${trendStats.springBreakCount('Mar 8, 2027')} districts`, trendStats.percent(trendStats.springBreakCount('Mar 8, 2027'))],
  ['Other or not listed', `${otherSpringBreaks} districts`, trendStats.percent(otherSpringBreaks)],
]

const reportChartCards = [
  {
    title: 'School Start Month Distribution',
    summary: 'August is the dominant start month in the reviewed 2026-2027 district calendar sample.',
    fallbackRows: startMonthChartRows,
    option: {
      color: ['#2563eb'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['August', 'September', 'July'] },
      yAxis: { type: 'value', max: trendStats.districtCount },
      series: [{ type: 'bar', data: [augustStarts, septemberStarts, julyStarts], barWidth: 28 }],
    },
  },
  {
    title: 'School End Month Distribution',
    summary: 'May endings are more common than June endings in the reviewed 2026-2027 sample.',
    fallbackRows: endMonthChartRows,
    option: {
      color: ['#059669'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ['May', 'June'] },
      yAxis: { type: 'value', max: Math.ceil(Math.max(mayEndings, juneEndings) / 20) * 20 },
      series: [{ type: 'bar', data: [mayEndings, juneEndings], barWidth: 34 }],
    },
  },
  {
    title: 'Winter Break Start Dates',
    summary: 'December 21, 2026 is the strongest winter break start-date signal in the report.',
    fallbackRows: winterBreakChartRows,
    option: {
      color: ['#0284c7'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 48 },
      xAxis: {
        type: 'category',
        data: ['Dec 21', 'Dec 23-24', 'Other'],
        axisLabel: { rotate: 20 },
      },
      yAxis: { type: 'value', max: trendStats.districtCount },
      series: [{ type: 'bar', data: [december21Breaks, december23To24Breaks, otherWinterBreaks], barWidth: 28 }],
    },
  },
  {
    title: 'Spring Break Clusters',
    summary: 'Spring break is less uniform than winter break, with several March and early-April clusters.',
    fallbackRows: springBreakChartRows,
    option: {
      color: ['#4f46e5'],
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 24, bottom: 52 },
      xAxis: {
        type: 'category',
        data: ['Mar 15', 'Mar 22', 'Mar 29', 'Apr 5', 'Mar 8', 'Other'],
        axisLabel: { rotate: 25 },
      },
      yAxis: { type: 'value', max: Math.max(...springBreakChartRows.map(row => Number.parseInt(row[1], 10))) + 4 },
      series: [{ type: 'bar', data: [...springBreakLabels.map(label => trendStats.springBreakCount(label)), otherSpringBreaks], barWidth: 22 }],
    },
  },
]

const statePatternRows = [
  ['California', `${trendStats.stateDistrictCount('California')} reviewed records`, 'More calendar variety than most states in the sample, including July starts, year-round or track-calendar signals, and several June end dates.'],
  ['Texas', `${trendStats.stateDistrictCount('Texas')} reviewed records`, 'Highly concentrated August starts, frequent May endings, and strong 180-day calendar signals across major metro-area districts.'],
  ['Florida', `${trendStats.stateDistrictCount('Florida')} reviewed records`, 'August starts remain consistent across the expanded sample, with most last days falling in late May.'],
  ['Virginia', `${trendStats.stateDistrictCount('Virginia')} reviewed records`, 'Late-August starts are common, and June end dates appear more often than in Texas or Florida.'],
  ['North Carolina', `${trendStats.stateDistrictCount('North Carolina')} reviewed records`, 'August 24 is a common first-day signal, with a mix of May and June last-day patterns.'],
  ['Washington, Arizona, and Colorado', `${['Washington', 'Arizona', 'Colorado'].reduce((total, state) => total + trendStats.stateDistrictCount(state), 0)} reviewed records`, 'Western districts add more September starts, intersession calendars, and June endings.'],
  ['Indiana, Kansas, Missouri, Nebraska, Oklahoma, and Tennessee', `${['Indiana', 'Kansas', 'Missouri', 'Nebraska', 'Oklahoma', 'Tennessee'].reduce((total, state) => total + trendStats.stateDistrictCount(state), 0)} reviewed records`, 'The current release includes Midwestern, Plains, and Tennessee calendars with distinct start dates and local break patterns.'],
]

const calendarOverviewRows = [
  ['2026 school holidays overview', 'Labor Day, Veterans Day, Thanksgiving week, and Winter Break are the major 2026 planning anchors in most reviewed calendars. December 21, 2026 is the clearest winter break cluster.'],
  ['2027 school break dates overview', 'Spring break patterns are more distributed in 2027. The largest clusters begin March 15, March 22, March 29, April 5, and March 8.'],
]

const quickAnswerRows = [
  ['Most common start month', 'August 2026'],
  ['Most common first day', 'August 24, 2026'],
  ['Strongest winter break signal', 'December 21, 2026'],
  ['Largest spring break cluster', 'March 15, 2027'],
  ['Most common last student day', 'May 27, 2027'],
  ['Typical listed calendar length', '180 student days'],
]

const evidenceRows = [
  ['Claim', 'Most reviewed U.S. districts in this dataset start the 2026-2027 school year in August.'],
  ['Evidence', `${augustStarts} of ${trendStats.districtCount} reviewed district calendar records list an August 2026 first student day.`],
  ['Source', 'MySchoolDates reviewed 2026-2027 school calendar dataset, last verified August 21, 2026.'],
]

const holidayRows = [
  ['Labor Day', 'September 7, 2026', 'Common student holiday across reviewed calendars.'],
  ['Veterans Day', 'November 11, 2026', 'Often listed as a school holiday or district closure.'],
  ['Thanksgiving Break', 'November 23-27, 2026', 'Many districts show a full Thanksgiving week or a shorter Thanksgiving closure.'],
  ['Winter Break', 'December 21, 2026', 'The strongest reviewed winter break start-date signal.'],
]

const infographicCards = [
  {
    title: 'When Does School Start in 2026?',
    stat: trendStats.percent(augustStarts, 0),
    label: 'August starts',
    detail: `${augustStarts} of ${trendStats.districtCount} reviewed district calendars begin the 2026-2027 school year in August.`,
    color: 'blue',
  },
  {
    title: 'Winter Break 2026 Distribution',
    stat: String(december21Breaks),
    label: 'Dec 21 records',
    detail: 'December 21, 2026 is the strongest winter break start-date signal in the dataset.',
    color: 'sky',
  },
  {
    title: 'School Year End Dates 2027',
    stat: trendStats.percent(mayEndings, 0),
    label: 'May endings',
    detail: 'May endings are more common than June endings among reviewed district records.',
    color: 'emerald',
  },
]

const topicClusterCards = [
  ['School Start Dates 2026', '/school-start-dates-2026', 'A focused guide to the August start-date pattern and the most common first days in the 2026-2027 dataset.'],
  ['Winter Break 2026', '/winter-break-2026', 'A break-focused page explaining the December 21 winter break cluster and related holiday planning signals.'],
  ['Spring Break 2027', '/spring-break-2027', 'A cluster analysis page for March and April 2027 spring break start dates across reviewed districts.'],
  ['Summer Break 2027', '/summer-break-2027', 'A last-day and summer-planning page covering May and June 2027 end-date patterns.'],
]

const sourceExampleRows = [
  ['Start date examples', 'Los Angeles Unified', '/los-angeles-unified-school-district-calendar/2026-2027', 'https://www.lausd.org/apps/pages/index.jsp?uREC_ID=4432518&type=d&pREC_ID=2672183'],
  ['Start date examples', 'Fontana Unified', '/fontana-unified-school-district-calendar/2026-2027', 'https://www.fusd.net/quicklinks/school-year-calendars'],
  ['Track calendar example', 'Corona-Norco USD', '/corona-norco-unified-school-district-calendar/2026-2027', 'https://www.cnusd.k12.ca.us/about_us/school_calendars___bell_schedules'],
  ['Winter break examples', 'Chicago Public Schools', '/chicago-public-schools-calendar/2026-2027', 'https://www.cps.edu/calendar/?calendars=1149%2C1151%2C1135%2C1150%2C1106%2C1115%2C1118'],
  ['Spring break examples', 'Houston ISD', '/houston-independent-school-district-calendar/2026-2027', 'https://www.houstonisd.org/our-district/district-calendar'],
  ['Late-start example', 'New York City Public Schools', '/new-york-city-public-schools-calendar/2026-2027', 'https://www.schools.nyc.gov/calendar'],
]

const appendixRows = trendData.records.map(record => [
  record.district,
  record.state,
  new URL(record.page).pathname,
  record.firstDay,
  record.lastDay,
  record.winterBreakSignal,
  record.springBreakSignal,
])
</script>

<template>
  <main id="top" class="bg-gray-50">
    <article class="site-page-shell py-10">
      <Breadcrumb
        class="mb-6"
        :items="[
          { label: 'Home', href: '/' },
          { label: 'School Calendar Trends', href: '/school-calendar-trends' },
          { label: '2026–2027 Report' },
        ]"
      />

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">School Calendar Research Report</p>
        <h1 class="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
          {{ reportTitle }}
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Based on {{ trendStats.districtCount }} reviewed 2026-2027 district calendar records in the current MySchoolDates dataset, the dominant pattern is clear: most districts begin in August, most end in May, winter break usually begins December 21, and 180 student days remains the most common listed instructional count.
        </p>
        <dl class="mt-5 grid gap-3 border-y border-gray-100 py-4 text-sm sm:grid-cols-5">
          <div v-for="row in reportMetaRows" :key="row[0]">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ row[0] }}</dt>
            <dd class="mt-1 font-medium text-gray-700">
              <NuxtLink v-if="row[0] === 'By'" to="/author" class="text-blue-600 hover:underline">{{ row[1] }}</NuxtLink>
              <span v-else>{{ row[1] }}</span>
            </dd>
          </div>
        </dl>
        <div class="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
          <span class="rounded-lg bg-gray-100 px-3 py-1">{{ trendStats.districtCount }} reviewed 2026-2027 calendars</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">{{ trendStats.stateCount }} states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Next review January 2027</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">MySchoolDates dataset</span>
        </div>
      </header>

      <section id="quick-answer" class="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Quick Answer: When Do Schools Start in 2026?</h2>
        <p class="mt-3 text-sm leading-relaxed text-emerald-950">
          Most reviewed U.S. school districts start the 2026-2027 school year in August 2026. In this {{ trendStats.districtCount }}-district dataset, August 24 is the most common first student day, December 21 is the strongest winter break signal, and May 27 is the most common last student day.
        </p>
        <div class="mt-4 overflow-x-auto rounded-lg border border-emerald-100 bg-white">
          <table class="w-full text-sm">
            <tbody class="divide-y divide-emerald-50">
              <tr v-for="row in quickAnswerRows" :key="row[0]">
                <th class="w-56 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700">{{ row[0] }}</th>
                <td class="px-4 py-2 text-gray-700">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs leading-relaxed text-emerald-800">
          Calendar availability varies by district approval status. Data last verified August 21, 2026; official district sources remain the record for final family planning.
        </p>
      </section>

      <section class="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Key Takeaways</h2>
        <ul class="mt-4 grid gap-3 text-sm leading-relaxed text-blue-950 sm:grid-cols-2">
          <li><strong>{{ augustStarts }} of {{ trendStats.districtCount }}</strong> reviewed districts start school in August for 2026-2027.</li>
          <li><strong>{{ mayEndings }} of {{ trendStats.districtCount }}</strong> reviewed districts end the school year in May, while {{ juneEndings }} end in June.</li>
          <li><strong>December 21, 2026</strong> is the most common winter break start date, appearing in {{ december21Breaks }} reviewed records.</li>
          <li><strong>March 15, 2027</strong> is the most common spring break start date, appearing in {{ trendStats.springBreakCount('Mar 15, 2027') }} reviewed records.</li>
          <li><strong>180 student days</strong> is the most common listed instructional count.</li>
          <li><strong>{{ trendStats.sourcePdfCount }} of {{ trendStats.districtCount }}</strong> reviewed pages include an official or source PDF, and all {{ trendStats.districtCount }} have an ICS calendar export on MySchoolDates.</li>
        </ul>
      </section>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div class="space-y-8">
          <section id="executive-summary" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Executive Summary</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This report analyzes {{ trendStats.districtCount }} reviewed 2026-2027 public school district calendar records from the MySchoolDates dataset. The sample is designed to identify calendar-planning patterns, not to act as a complete national census.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-sm font-semibold text-gray-900">Start dates</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">August is the dominant start month, with {{ augustStarts }} reviewed districts beginning in August 2026.</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-sm font-semibold text-gray-900">Break patterns</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">Winter break is tightly clustered around December 21, while spring break spreads across several March and April weeks.</p>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-sm font-semibold text-gray-900">Planning value</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">The strongest family-planning differences come from state patterns, end dates, track calendars, and district-specific break timing.</p>
              </div>
            </div>
            <div class="mt-6 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in evidenceRows" :key="row[0]">
                    <th class="w-28 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-blue-700">{{ row[0] }}</th>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="charts" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">School Calendar Trends Charts</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              These lightweight charts summarize the strongest signals in the {{ trendStats.districtCount }}-record dataset: start month, end month, winter break timing, and spring break clusters.
            </p>
            <div class="mt-5 grid gap-4 md:grid-cols-3">
              <div
                v-for="card in infographicCards"
                :key="card.title"
                class="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <h3 class="text-sm font-semibold text-gray-900">{{ card.title }}</h3>
                <div
                  class="mt-4 flex h-28 items-center justify-center rounded-lg border"
                  :class="{
                    'border-blue-100 bg-blue-50 text-blue-700': card.color === 'blue',
                    'border-sky-100 bg-sky-50 text-sky-700': card.color === 'sky',
                    'border-emerald-100 bg-emerald-50 text-emerald-700': card.color === 'emerald',
                  }"
                >
                  <div class="text-center">
                    <div class="text-4xl font-bold tracking-tight">{{ card.stat }}</div>
                    <div class="mt-1 text-xs font-semibold uppercase tracking-wide">{{ card.label }}</div>
                  </div>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ card.detail }}</p>
              </div>
            </div>
            <div class="mt-6 grid gap-5 md:grid-cols-2">
              <div v-for="chart in reportChartCards" :key="chart.title" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">{{ chart.title }}</h3>
                <ClientOnly>
                  <VChart :option="chart.option" autoresize class="mt-3 h-64 w-full" />
                  <template #fallback>
                    <div class="mt-3 overflow-x-auto">
                      <table class="w-full text-sm">
                        <tbody>
                          <tr v-for="fallbackRow in chart.fallbackRows" :key="fallbackRow[0]">
                            <td class="border-b border-gray-100 py-2 pr-3 font-medium text-gray-700">{{ fallbackRow[0] }}</td>
                            <td class="border-b border-gray-100 py-2 text-right text-gray-500">{{ fallbackRow[1] }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </template>
                </ClientOnly>
                <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ chart.summary }}</p>
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Methodology and Data Scope</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This report uses the current MySchoolDates calendar dataset as of August 21, 2026. The sample includes {{ trendStats.districtCount }} reviewed district records for the 2026-2027 school year across {{ trendStats.stateCount }} states. It is a reviewed platform dataset, not a census of every public school district in the United States.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The data comes from district calendar JSON records that MySchoolDates builds from official district sources, including public calendar pages, board-approved PDFs, translated PDFs when available, and manually reviewed key dates. See the <NuxtLink to="/calendar-verification-methodology" class="font-medium text-blue-600 hover:underline">Calendar Verification Methodology</NuxtLink> for how official sources are checked.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The dataset intentionally includes large district samples from multiple states, but it should not be interpreted as a population-weighted national estimate. California and Texas have larger sample groups in this report because they are high-demand calendar search markets with many reviewed district records in the current MySchoolDates coverage.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">State coverage in this report</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed 2026-2027 records</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in stateRows" :key="row[0]">
                    <td class="px-4 py-2 text-gray-700">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="research-ownership" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Research Ownership and Freshness</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This report is authored by Denis Dou and reviewed through the MySchoolDates calendar data workflow against official district calendar sources, district calendar pages, and board-approved PDFs where available. Dataset questions, corrections, or source updates can be sent to <a href="mailto:hello@myschooldates.com" class="font-semibold text-blue-600 hover:underline">hello@myschooldates.com</a>.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Editorial ownership is held by MySchoolDates Education Data Research. The review focus is school district calendar publishing systems, official-source verification workflows, date normalization, and parent-facing calendar planning accuracy.
            </p>
            <div class="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div class="flex gap-4">
                <img src="/images/denis-dou.png" alt="Denis Dou" class="h-16 w-16 rounded-lg border border-blue-100 bg-white object-cover" />
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide text-blue-700">Author and editorial lead</div>
                  <h3 class="mt-1 text-lg font-semibold text-gray-900">{{ authorProfile.name }}</h3>
                  <p class="mt-1 text-sm font-medium text-gray-700">{{ authorProfile.role }}</p>
                  <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ authorProfile.description }}</p>
                  <div class="mt-3 flex flex-wrap gap-3 text-sm">
                    <a :href="authorProfile.url" target="_blank" rel="noopener" class="font-semibold text-blue-600 hover:underline">Author profile</a>
                    <a :href="authorProfile.linkedin" target="_blank" rel="noopener" class="font-semibold text-blue-600 hover:underline">LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-wide text-gray-500">Published</div>
                <div class="mt-1 text-sm font-semibold text-gray-900">July 27, 2026</div>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-wide text-gray-500">Last verified</div>
                <div class="mt-1 text-sm font-semibold text-gray-900">August 21, 2026</div>
              </div>
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-wide text-gray-500">Next review</div>
                <div class="mt-1 text-sm font-semibold text-gray-900">January 2027</div>
              </div>
            </div>
          </section>

          <section id="state-patterns" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">State-Level Calendar Patterns</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The national view is useful, but state patterns matter for searchers comparing local districts. The strongest sample groups in this report are California, Texas, Virginia, North Carolina, and Florida.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">State or region</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Sample size</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Calendar pattern</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in statePatternRows" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="source-examples" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Official Source Examples</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The report is based on reviewed MySchoolDates district records, which are built from official district calendar pages, board-approved PDFs, and public calendar sources. These examples show the types of official sources used to verify the trend data.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Trend signal</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">District page</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Official source</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in sourceExampleRows" :key="row[1]">
                    <td class="px-4 py-2 text-gray-600">{{ row[0] }}</td>
                    <td class="px-4 py-2">
                      <NuxtLink :to="row[2]" class="font-medium text-blue-600 hover:underline">{{ row[1] }}</NuxtLink>
                    </td>
                    <td class="px-4 py-2">
                      <a :href="row[3]" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Official calendar source</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="holiday-overview" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">2026 School Holidays Calendar and 2027 School Break Dates Overview</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Families often search by calendar year rather than school year. These two summaries connect the 2026-2027 school-year data to common searches for 2026 school holidays and 2027 school break dates.
            </p>
            <div class="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">2026 holiday or break</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Typical date signal</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Planning note</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in holidayRows" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="row in calendarOverviewRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">{{ row[0] }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row[1] }}</p>
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">When Does School Start in 2026? August Is the Standard Start Month</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              In the reviewed 2026-2027 dataset, August is the overwhelming start-month norm. {{ augustStarts }} districts start in August, compared with {{ julyStarts }} July starts and {{ septemberStarts }} September starts. The July starts are not random outliers; they are concentrated in calendar systems with early-start, year-round, track, or specialized regional patterns, especially in California.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Start month</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed districts</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Planning note</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in startMonthRows" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 class="mt-6 text-lg font-semibold text-gray-900">Most Common First Days</h3>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <div v-for="row in topFirstDays" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div class="font-semibold text-gray-900">{{ row[0] }}</div>
                <div class="text-sm text-gray-600">{{ row[1] }}</div>
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">When Is Summer Break 2027? May End Dates Are More Common Than June</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              For many families, summer break 2027 begins after the final student day listed by the district. {{ mayEndings }} reviewed districts end the 2026-2027 school year in May, while {{ juneEndings }} end in June. The most common last student day is May 27, 2027, followed by May 26 and May 28. June endings remain important in the Northeast, Mid-Atlantic, West Coast, and some California districts.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="row in lastDayRows" :key="row[0]" class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-2xl font-bold text-gray-900">{{ row[1] }}</div>
                <div class="mt-1 text-sm text-gray-600">end in {{ row[0] }}</div>
              </div>
            </div>
            <h3 class="mt-6 text-lg font-semibold text-gray-900">Most Common Last Days</h3>
            <div class="mt-3 overflow-x-auto">
              <table class="w-full text-sm">
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in topLastDays" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Trend 3: Spring Break Clusters Around Three Main Weeks</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Spring break is less uniform than winter break. The largest spring break cluster begins March 15, 2027, followed by March 22 and March 29. Additional clusters begin April 5 and March 8. This matters for families comparing neighboring districts, because a one-week difference can affect childcare, travel pricing, shared custody planning, and multi-district households.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Spring break start</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Reviewed districts</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in springBreakRows" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Trend 4: 180 Student Days Still Anchors the School Year</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Among the reviewed records, {{ trendStats.explicitInstructionalDayCount }} calendars include an explicit totalSchoolDays value. Of those, {{ studentDay180 }} list 180 student days. That makes 180 days the dominant published count in the dataset, even though several districts list shorter or longer counts depending on state law, calendar type, teacher workday treatment, and local board rules.
            </p>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Instructional day signal</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Count</th>
                    <th class="px-4 py-2 text-left font-semibold text-gray-700">Interpretation</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in instructionalDayRows" :key="row[0]">
                    <td class="px-4 py-2 font-medium text-gray-800">{{ row[0] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-4 py-2 text-gray-600">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Trend 5: Calendar Utility Is Moving Beyond PDFs</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              PDFs are still central to school calendar publishing. In this dataset, {{ trendStats.sourcePdfCount }} of {{ trendStats.districtCount }} reviewed 2026-2027 pages include an official or source PDF. But parent behavior is shifting toward usable calendar files. MySchoolDates generates ICS calendar exports for all {{ trendStats.districtCount }} reviewed records so families can import dates into Google Calendar, Apple Calendar, or Outlook.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Translated calendars are also visible but not yet universal. Several reviewed districts provide Spanish or other translated calendar files alongside their English calendars. These files are useful for household planning, but the official district source remains the record to verify before making fixed plans.
            </p>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">What This Means for Families</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Families should not assume nearby districts share the same first day, spring break, or last day. Even in the same region, districts may use traditional calendars, track calendars, year-round calendars, early release days, minimum days, or separate program calendars. The safest planning path is to use the districtwide calendar for first day, last day, holidays, and major breaks, then verify campus-level details for bell schedules, finals, athletics, transportation, and same-day announcements.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <NuxtLink to="/california" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
                <div class="font-semibold text-gray-900">Browse California calendars</div>
                <div class="mt-1 text-sm text-gray-600">Compare districts with July, August, track, and traditional calendar patterns.</div>
              </NuxtLink>
              <NuxtLink to="/texas" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
                <div class="font-semibold text-gray-900">Browse Texas calendars</div>
                <div class="mt-1 text-sm text-gray-600">Review August starts, May endings, and 180-day planning patterns.</div>
              </NuxtLink>
              <NuxtLink to="/fontana-unified-school-district-calendar/2026-2027" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
                <div class="font-semibold text-gray-900">Fontana Unified example</div>
                <div class="mt-1 text-sm text-gray-600">See PDF, ICS, minimum days, Spanish PDF, and school-level entry points.</div>
              </NuxtLink>
              <NuxtLink to="/corona-norco-unified-school-district-calendar/2026-2027" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
                <div class="font-semibold text-gray-900">Corona-Norco example</div>
                <div class="mt-1 text-sm text-gray-600">See how track and traditional calendar complexity changes planning.</div>
              </NuxtLink>
            </div>
          </section>

          <section id="topic-cluster" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Focused School Calendar Topic Guides</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              The report summarizes national trends. These focused guides answer the most common date-specific searches with shorter explanations and links back to the full dataset.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="card in topicClusterCards"
                :key="card[1]"
                :to="card[1]"
                class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                <div class="font-semibold text-gray-900">{{ card[0] }}</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ card[2] }}</p>
              </NuxtLink>
            </div>
          </section>

          <section id="faq" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">2026-2027 School Calendar Trends FAQ</h2>
            <div class="mt-5 divide-y divide-gray-100">
              <div v-for="row in faqRows" :key="row.q" class="py-4 first:pt-0 last:pb-0">
                <h3 class="text-base font-semibold text-gray-900">{{ row.q }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ row.a }}</p>
              </div>
            </div>
          </section>

          <section id="data-appendix" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Data Appendix: Reviewed District Calendar Records</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This appendix lists the {{ trendStats.districtCount }} reviewed 2026-2027 district records used for the report. Break columns are listed as reviewed winter break and spring break start signals when available in the local calendar record; families should use the linked district page and official source for final planning.
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <a :href="csvDownloadUrl" download class="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Download CSV dataset
              </a>
              <NuxtLink :to="datasetPageUrl" class="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">
                Dataset details
              </NuxtLink>
              <a href="#source-examples" class="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">
                View source examples
              </a>
            </div>
            <h3 class="mt-6 text-lg font-semibold text-gray-900">Top 20 Visible Records</h3>
            <div class="mt-3 overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">District</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">State</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">First day</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">Last day</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">Winter break signal</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">Spring break signal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in appendixRows.slice(0, 20)" :key="`visible-${row[1]}-${row[0]}-${row[2]}`">
                    <td class="px-3 py-2">
                      <NuxtLink :to="row[2]" class="font-medium text-blue-600 hover:underline">{{ row[0] }}</NuxtLink>
                    </td>
                    <td class="px-3 py-2 text-gray-600">{{ row[1] }}</td>
                    <td class="px-3 py-2 text-gray-600">{{ row[3] }}</td>
                    <td class="px-3 py-2 text-gray-600">{{ row[4] }}</td>
                    <td class="px-3 py-2 text-gray-600">{{ row[5] }}</td>
                    <td class="px-3 py-2 text-gray-600">{{ row[6] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details class="mt-5 rounded-lg border border-gray-200 bg-gray-50">
              <summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">Show all {{ trendStats.districtCount }} reviewed district records</summary>
              <div class="overflow-x-auto border-t border-gray-200 bg-white">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-gray-200 bg-gray-50">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">District</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">State</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">First day</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Last day</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Winter break signal</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Spring break signal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in appendixRows" :key="`${row[1]}-${row[0]}-${row[2]}`">
                      <td class="px-3 py-2">
                        <NuxtLink :to="row[2]" class="font-medium text-blue-600 hover:underline">{{ row[0] }}</NuxtLink>
                      </td>
                      <td class="px-3 py-2 text-gray-600">{{ row[1] }}</td>
                      <td class="px-3 py-2 text-gray-600">{{ row[3] }}</td>
                      <td class="px-3 py-2 text-gray-600">{{ row[4] }}</td>
                      <td class="px-3 py-2 text-gray-600">{{ row[5] }}</td>
                      <td class="px-3 py-2 text-gray-600">{{ row[6] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <section id="citation" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">How to Cite This Report</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Use this citation when referencing the report in education research notes, local planning articles, school calendar roundups, or data summaries.
            </p>
            <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {{ citationText }}
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <NuxtLink :to="datasetPageUrl" class="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">
                View dataset landing page
              </NuxtLink>
              <NuxtLink :to="trendsHubUrl" class="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">
                View trends archive
              </NuxtLink>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Limitations</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This report reflects the current MySchoolDates coverage, which is weighted toward large districts and states where district calendar pages have been reviewed. It should be used as a platform dataset report, not as a claim about every school district in the United States. Calendar records can change after board action, emergency closures, state policy changes, or district revisions.
            </p>
          </section>
        </div>

        <aside class="space-y-4">
          <div class="sticky top-4 rounded-lg border border-gray-200 bg-white p-5">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Report Links</h2>
            <nav class="mt-3 grid gap-2 text-sm">
              <a href="#top" class="text-blue-600 hover:underline">Top of report</a>
              <a href="#quick-answer" class="text-blue-600 hover:underline">Quick answer</a>
              <a href="#executive-summary" class="text-blue-600 hover:underline">Executive summary</a>
              <a href="#charts" class="text-blue-600 hover:underline">Data charts</a>
              <a href="#research-ownership" class="text-blue-600 hover:underline">Research ownership</a>
              <a href="#state-patterns" class="text-blue-600 hover:underline">State patterns</a>
              <a href="#holiday-overview" class="text-blue-600 hover:underline">2026 and 2027 overview</a>
              <a href="#topic-cluster" class="text-blue-600 hover:underline">Topic guides</a>
              <a href="#source-examples" class="text-blue-600 hover:underline">Official source examples</a>
              <a href="#faq" class="text-blue-600 hover:underline">FAQ</a>
              <a href="#data-appendix" class="text-blue-600 hover:underline">Data appendix</a>
              <a href="#citation" class="text-blue-600 hover:underline">How to cite</a>
              <a :href="csvDownloadUrl" download class="text-blue-600 hover:underline">Download CSV</a>
              <NuxtLink :to="datasetPageUrl" class="text-blue-600 hover:underline">Dataset page</NuxtLink>
              <NuxtLink :to="trendsHubUrl" class="text-blue-600 hover:underline">Trends hub</NuxtLink>
              <NuxtLink to="/calendar-verification-methodology" class="text-blue-600 hover:underline">Verification methodology</NuxtLink>
              <NuxtLink to="/editorial-policy" class="text-blue-600 hover:underline">Editorial policy</NuxtLink>
            </nav>
            <div class="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
              Data scope: {{ trendStats.districtCount }} reviewed 2026-2027 calendar records, {{ trendStats.stateCount }} states, v4.0 dataset verified August 21, 2026.
            </div>
          </div>
        </aside>
      </div>
    </article>
  </main>
</template>
