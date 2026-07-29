<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const VChart = defineAsyncComponent(() => import('vue-echarts').then(module => module.default))

const reportUrl = 'https://myschooldates.com/school-calendar-trends/2026-2027-report'
const reportTitle = '2026-2027 School Calendar Trends Report: Start Dates & Breaks From 100 U.S. Districts'
const reportSeoTitle = `${reportTitle} | MySchoolDates`
const reportDescription = 'Find 2026-2027 school calendar dates from 100 U.S. districts. Compare school start dates, winter break, spring break, holidays, and last days of school with data-backed trends.'
const csvDownloadUrl = '/data/school-calendar-trends-2026-2027.csv'
const datasetPageUrl = '/datasets/school-calendar-trends'
const trendsHubUrl = '/school-calendar-trends'
const citationText = 'Dou, Denis. (2026). 2026-2027 School Calendar Trends Report: Start Dates & Breaks From 100 U.S. Districts. MySchoolDates. https://myschooldates.com/school-calendar-trends/2026-2027-report'
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
  ['Updated', 'July 27, 2026'],
  ['Reviewed', 'July 27, 2026'],
  ['By', authorProfile.name],
  ['Read time', '16 min'],
]

const faqRows = [
  {
    q: 'When does the 2026-2027 school year start?',
    a: 'Most reviewed districts in the MySchoolDates sample start in August 2026. In this dataset, 95 of 100 reviewed districts begin in August, with August 12 and August 24 tied as the most common first days.',
  },
  {
    q: 'When is winter break 2026 for most schools?',
    a: 'December 21, 2026 is the most common winter break start date in the reviewed dataset, appearing in 89 of 100 district calendar records.',
  },
  {
    q: 'When is spring break 2027?',
    a: 'Spring break is more varied than winter break. The most common reviewed spring break starts are March 22, 2027, March 15, 2027, and March 29, 2027.',
  },
  {
    q: 'How many school days are in 2026-2027?',
    a: 'The most common listed instructional count is 180 student days. It appears in 55 of 100 reviewed records and in about 65% of records with an explicit student-day count.',
  },
  {
    q: 'When does the 2026-2027 school year end?',
    a: 'May end dates are more common in this sample. Sixty-one reviewed districts end in May, while 39 end in June. May 27, 2027 is the most common last student day.',
  },
  {
    q: 'Do all U.S. school districts use the same calendar?',
    a: 'No. School calendars vary by state, district, calendar type, weather policy, teacher workdays, track calendars, and special programs. Families should verify dates against the official district source.',
  },
  {
    q: 'Are school calendar PDFs still useful?',
    a: 'Yes. PDFs remain the main official publishing format for many districts. In this sample, 98 of 100 reviewed pages include an official or source PDF, while MySchoolDates also provides ICS files for calendar app imports.',
  },
  {
    q: 'Is this report a national census of every public school district?',
    a: 'No. This is a reviewed MySchoolDates platform dataset of 100 district calendar records across 13 states as of July 27, 2026. It is intended as a trends report, not a complete national census.',
  },
  {
    q: 'What month does school usually start in America?',
    a: 'In the reviewed MySchoolDates 2026-2027 sample, August is the usual school start month. Ninety-five of 100 reviewed U.S. district calendars begin in August 2026.',
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
            dateModified: '2026-07-27',
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
            description: 'Reviewed 2026-2027 school calendar records for 100 U.S. districts across 13 states, including first day, last day, winter break, spring break, instructional day counts, source PDF availability, and ICS export availability.',
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
            dateModified: '2026-07-27',
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
        ],
      }),
    },
  ],
})

const startMonthRows = [
  ['August', '95 districts', '95% of reviewed 2026-2027 records'],
  ['July', '4 districts', 'Mostly California early-start, year-round, or track-calendar patterns'],
  ['September', '1 district', 'New York City Public Schools starts September 10, 2026'],
]

const topFirstDays = [
  ['August 12, 2026', '21 districts'],
  ['August 24, 2026', '21 districts'],
  ['August 10, 2026', '14 districts'],
  ['August 11, 2026', '10 districts'],
  ['August 13, 2026', '9 districts'],
]

const lastDayRows = [
  ['May', '61 districts'],
  ['June', '39 districts'],
]

const topLastDays = [
  ['May 27, 2027', '23 districts'],
  ['May 28, 2027', '14 districts'],
  ['May 26, 2027', '13 districts'],
  ['June 4, 2027', '8 districts'],
  ['June 9, 2027', '8 districts'],
]

const springBreakRows = [
  ['March 22, 2027', '29 districts'],
  ['March 15, 2027', '25 districts'],
  ['March 29, 2027', '14 districts'],
  ['April 5, 2027', '10 districts'],
  ['March 8, 2027', '9 districts'],
]

const instructionalDayRows = [
  ['180 student days', '55 districts', 'Most common count; 55% of all reviewed records and about 65% of records with a listed count'],
  ['175 student days', '5 districts', 'Second most common listed count'],
  ['172 student days', '4 districts', 'Common among some Texas and locally structured calendars'],
  ['No count listed', '16 districts', 'Calendar record has dates but no explicit totalSchoolDays value'],
]

const stateRows = [
  ['California', '26'],
  ['Texas', '25'],
  ['Virginia', '15'],
  ['North Carolina', '15'],
  ['Florida', '10'],
  ['Maryland', '2'],
  ['Georgia, Hawaii, Illinois, Kentucky, Nevada, New York, Pennsylvania', '1 each'],
]

const startMonthChartRows = [
  ['August', '95 districts', '95%'],
  ['July', '4 districts', '4%'],
  ['September', '1 district', '1%'],
]

const endMonthChartRows = [
  ['May', '61 districts', '61%'],
  ['June', '39 districts', '39%'],
]

const winterBreakChartRows = [
  ['December 21, 2026', '89 records', '89%'],
  ['December 23-24, 2026', '8 records', '8%'],
  ['Other or not listed', '3 records', '3%'],
]

const springBreakChartRows = [
  ['March 22, 2027', '29 districts', '29%'],
  ['March 15, 2027', '25 districts', '25%'],
  ['March 29, 2027', '14 districts', '14%'],
  ['April 5, 2027', '10 districts', '10%'],
  ['March 8, 2027', '9 districts', '9%'],
  ['Other or not listed', '13 districts', '13%'],
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
      xAxis: { type: 'category', data: ['August', 'July', 'September'] },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: [95, 4, 1], barWidth: 28 }],
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
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: [61, 39], barWidth: 34 }],
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
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: [89, 8, 3], barWidth: 28 }],
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
        data: ['Mar 22', 'Mar 15', 'Mar 29', 'Apr 5', 'Mar 8', 'Other'],
        axisLabel: { rotate: 25 },
      },
      yAxis: { type: 'value', max: 35 },
      series: [{ type: 'bar', data: [29, 25, 14, 10, 9, 13], barWidth: 22 }],
    },
  },
]

const statePatternRows = [
  ['California', '26 reviewed records', 'More calendar variety than most states in the sample, including July starts, year-round or track-calendar signals, and several June end dates.'],
  ['Texas', '25 reviewed records', 'Highly concentrated August starts, frequent May endings, and strong 180-day calendar signals across major metro-area districts.'],
  ['Virginia', '15 reviewed records', 'Late-August starts are common, and June end dates appear more often than in Texas or Florida.'],
  ['North Carolina', '15 reviewed records', 'August 24 is a common first-day signal, with a mix of May and June last-day patterns.'],
  ['Florida', '10 reviewed records', 'August starts are consistent, while most reviewed districts end in late May or early June.'],
  ['Northeast and Mid-Atlantic examples', '5 reviewed records', 'New York City, Maryland, and Pennsylvania examples show later end dates and more June school-year endings.'],
]

const calendarOverviewRows = [
  ['2026 school holidays overview', 'Labor Day, Veterans Day, Thanksgiving week, and Winter Break are the major 2026 planning anchors in most reviewed calendars. December 21, 2026 is the clearest winter break cluster.'],
  ['2027 school break dates overview', 'Spring break patterns are more distributed in 2027. The largest clusters begin March 22, March 15, March 29, April 5, and March 8.'],
]

const quickAnswerRows = [
  ['Most common start month', 'August 2026'],
  ['Most common first days', 'August 12 and August 24, 2026'],
  ['Strongest winter break signal', 'December 21, 2026'],
  ['Largest spring break cluster', 'March 22, 2027'],
  ['Most common last student day', 'May 27, 2027'],
  ['Typical listed calendar length', '180 student days'],
]

const evidenceRows = [
  ['Claim', 'Most reviewed U.S. districts in this dataset start the 2026-2027 school year in August.'],
  ['Evidence', '95 of 100 reviewed district calendar records list an August 2026 first student day.'],
  ['Source', 'MySchoolDates reviewed 2026-2027 school calendar dataset, last verified July 27, 2026.'],
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
    stat: '95%',
    label: 'August starts',
    detail: '95 of 100 reviewed district calendars begin the 2026-2027 school year in August.',
    color: 'blue',
  },
  {
    title: 'Winter Break 2026 Distribution',
    stat: '89',
    label: 'Dec 21 records',
    detail: 'December 21, 2026 is the strongest winter break start-date signal in the dataset.',
    color: 'sky',
  },
  {
    title: 'School Year End Dates 2027',
    stat: '61%',
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
  ['Start date examples', 'Los Angeles Unified', '/los-angeles-unified-school-district-calendar', 'https://www.lausd.org/apps/pages/index.jsp?uREC_ID=4432518&type=d&pREC_ID=2672183'],
  ['Start date examples', 'Fontana Unified', '/fontana-unified-school-district-calendar', 'https://www.fusd.net/quicklinks/school-year-calendars'],
  ['Track calendar example', 'Corona-Norco USD', '/corona-norco-unified-school-district-calendar', 'https://www.cnusd.k12.ca.us/about_us/school_calendars___bell_schedules'],
  ['Winter break examples', 'Chicago Public Schools', '/chicago-public-schools-calendar', 'https://www.cps.edu/calendar/?calendars=1149%2C1151%2C1135%2C1150%2C1106%2C1115%2C1118'],
  ['Spring break examples', 'Houston ISD', '/houston-independent-school-district-calendar', 'https://www.houstonisd.org/our-district/district-calendar'],
  ['Late-start example', 'New York City Public Schools', '/new-york-city-public-schools-calendar', 'https://www.schools.nyc.gov/calendar'],
]

const appendixRows = [
  ['AUHSD', 'California', '/anaheim-union-high-school-district-calendar', 'Aug 12, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['BCSD', 'California', '/bakersfield-city-school-district-calendar', 'Aug 12, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['Corona-Norco USD', 'California', '/corona-norco-unified-school-district-calendar', 'Jul 6, 2026', 'Jun 24, 2027', 'Dec 21, 2026', 'Not listed'],
  ['CUSD', 'California', '/capistrano-unified-school-district-calendar', 'Aug 18, 2026', 'Jun 3, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['CVESD', 'California', '/chula-vista-elementary-school-district-calendar', 'Jul 22, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['EGUSD', 'California', '/elk-grove-unified-school-district-calendar', 'Aug 13, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Fontana Unified', 'California', '/fontana-unified-school-district-calendar', 'Aug 6, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['FUSD', 'California', '/fresno-unified-school-district-calendar', 'Aug 17, 2026', 'Jun 10, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['GGUSD', 'California', '/garden-grove-unified-school-district-calendar', 'Aug 17, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['IUSD', 'California', '/irvine-unified-school-district-calendar', 'Aug 18, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['LAUSD', 'California', '/los-angeles-unified-school-district-calendar', 'Aug 12, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['LBUSD', 'California', '/long-beach-unified-school-district-calendar', 'Aug 25, 2026', 'Jun 10, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['MVUSD', 'California', '/moreno-valley-unified-school-district-calendar', 'Aug 12, 2026', 'Jun 11, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['OUSD', 'California', '/oakland-unified-school-district-calendar', 'Aug 10, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['Poway USD', 'California', '/poway-unified-school-district-calendar', 'Aug 13, 2026', 'Jun 3, 2027', 'Dec 21, 2026', 'Not listed'],
  ['PUSD', 'California', '/pomona-unified-school-district-calendar', 'Aug 12, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['RUSD', 'California', '/riverside-unified-school-district-calendar', 'Aug 10, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['San Juan Unified', 'California', '/san-juan-unified-school-district-calendar', 'Aug 13, 2026', 'Jun 8, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['SAUSD', 'California', '/santa-ana-unified-school-district-calendar', 'Aug 10, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['SBCUSD', 'California', '/san-bernardino-city-unified-school-district-calendar', 'Aug 3, 2026', 'Jun 3, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['SCUSD', 'California', '/sacramento-city-unified-school-calendar', 'Aug 11, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 23, 2027'],
  ['SDUSD', 'California', '/san-diego-unified-school-district-calendar', 'Aug 10, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['SFUSD', 'California', '/san-francisco-unified-school-district-calendar', 'Aug 17, 2026', 'Jun 2, 2027', 'Dec 21, 2026', 'Mar 26, 2027'],
  ['SJUSD', 'California', '/san-jose-unified-school-calendar', 'Aug 6, 2026', 'May 27, 2027', 'Feb 15, 2027', 'Apr 5, 2027'],
  ['SUSD', 'California', '/stockton-unified-school-district-calendar', 'Jul 30, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Sweetwater UHSD', 'California', '/sweetwater-union-high-school-district-calendar', 'Jul 22, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['BCPS', 'Florida', '/broward-county-school-calendar', 'Aug 10, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['DCPS', 'Florida', '/duval-county-school-calendar', 'Aug 10, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['HCPS', 'Florida', '/hillsborough-county-school-calendar', 'Aug 10, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['M-DCPS', 'Florida', '/miami-dade-school-calendar', 'Aug 13, 2026', 'Jun 3, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['OCPS', 'Florida', '/orange-county-school-calendar', 'Aug 11, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['PBCSD', 'Florida', '/palm-beach-county-school-calendar', 'Aug 10, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 10, 2027'],
  ['PCPS', 'Florida', '/polk-county-school-calendar', 'Aug 11, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['PCS', 'Florida', '/pasco-county-school-calendar', 'Aug 13, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['PCS', 'Florida', '/pinellas-county-school-calendar', 'Aug 11, 2026', 'May 27, 2027', 'Dec 19, 2026', 'Mar 13, 2027'],
  ['SDLC', 'Florida', '/lee-county-school-calendar', 'Aug 11, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['GCPS', 'Georgia', '/gwinnett-county-public-schools-calendar', 'Aug 5, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['HIDOE', 'Hawaii', '/hawaii-state-department-of-education-calendar', 'Aug 3, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['CPS', 'Illinois', '/chicago-public-schools-calendar', 'Aug 24, 2026', 'Jun 11, 2027', 'Dec 21, 2026', 'Not listed'],
  ['HCS', 'Kentucky', '/henderson-county-schools-ky-calendar', 'Aug 13, 2026', 'May 25, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['MCPS', 'Maryland', '/montgomery-county-school-calendar', 'Aug 25, 2026', 'Jun 11, 2027', 'Dec 24, 2026', 'Mar 31, 2027'],
  ['PGCPS', 'Maryland', '/prince-georges-county-school-calendar', 'Aug 25, 2026', 'Jun 15, 2027', 'Dec 21, 2026', 'Mar 26, 2027'],
  ['CCSD', 'Nevada', '/clark-county-school-district-calendar', 'Aug 10, 2026', 'May 20, 2027', 'Not listed', 'Not listed'],
  ['NYCPS', 'New York', '/new-york-city-public-schools-calendar', 'Sep 10, 2026', 'Jun 28, 2027', 'Dec 24, 2026', 'Apr 22, 2027'],
  ['BCS', 'North Carolina', '/brunswick-county-schools-calendar', 'Aug 24, 2026', 'May 28, 2027', 'Not listed', 'Mar 29, 2027'],
  ['CCS', 'North Carolina', '/cabarrus-county-school-calendar', 'Aug 12, 2026', 'May 26, 2027', 'Dec 23, 2026', 'Mar 8, 2027'],
  ['CCS', 'North Carolina', '/catawba-county-schools-calendar', 'Aug 24, 2026', 'May 21, 2027', 'Dec 23, 2026', 'Apr 12, 2027'],
  ['CCS', 'North Carolina', '/cumberland-county-school-calendar', 'Aug 7, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['CMS', 'North Carolina', '/charlotte-mecklenburg-schools-calendar', 'Aug 25, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['DPS', 'North Carolina', '/durham-public-schools-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['GCS', 'North Carolina', '/guilford-county-school-calendar', 'Aug 24, 2026', 'Jun 10, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['HCPS', 'North Carolina', '/henderson-county-public-schools-calendar', 'Aug 12, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['I-SS', 'North Carolina', '/iredell-statesville-schools-calendar', 'Aug 12, 2026', 'May 27, 2027', 'Dec 23, 2026', 'Mar 8, 2027'],
  ['JCPS', 'North Carolina', '/johnston-county-school-calendar', 'Aug 24, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 26, 2027'],
  ['NHCS', 'North Carolina', '/new-hanover-county-school-calendar', 'Aug 24, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 25, 2027'],
  ['RCSS', 'North Carolina', '/randolph-county-school-system-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Not listed'],
  ['UCPS', 'North Carolina', '/union-county-school-calendar', 'Aug 24, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['WCPSS', 'North Carolina', '/wake-county-school-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['WSFCS', 'North Carolina', '/winston-salem-forsyth-school-calendar', 'Aug 10, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 26, 2027'],
  ['SDP', 'Pennsylvania', '/school-district-of-philadelphia-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 23, 2026', 'Mar 22, 2027'],
  ['Aldine ISD', 'Texas', '/aldine-independent-school-district-calendar', 'Aug 12, 2026', 'Jun 3, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Arlington ISD', 'Texas', '/arlington-isd-calendar', 'Aug 12, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Austin ISD', 'Texas', '/austin-independent-school-district-calendar', 'Aug 18, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['CFISD', 'Texas', '/cypress-fairbanks-isd-calendar', 'Aug 12, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Conroe ISD', 'Texas', '/conroe-independent-school-district-calendar', 'Aug 12, 2026', 'May 27, 2027', 'Not listed', 'Mar 15, 2027'],
  ['Dallas ISD', 'Texas', '/dallas-independent-school-district-calendar', 'Aug 11, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['FISD', 'Texas', '/frisco-independent-school-district-calendar', 'Aug 12, 2026', 'May 14, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Fort Bend ISD', 'Texas', '/fort-bend-independent-school-district-calendar', 'Aug 11, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Fort Worth ISD', 'Texas', '/fort-worth-independent-school-district-calendar', 'Aug 10, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['GISD', 'Texas', '/garland-independent-school-district-calendar', 'Aug 10, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Houston ISD', 'Texas', '/houston-independent-school-district-calendar', 'Aug 10, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Humble ISD', 'Texas', '/humble-isd-calendar', 'Aug 12, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Judson ISD', 'Texas', '/judson-isd-calendar', 'Aug 12, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Katy ISD', 'Texas', '/katy-independent-school-district-calendar', 'Aug 12, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Klein ISD', 'Texas', '/klein-isd-calendar', 'Aug 12, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['LISD', 'Texas', '/lewisville-independent-school-district-calendar', 'Aug 12, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Mansfield ISD', 'Texas', '/mansfield-isd-calendar', 'Aug 12, 2026', 'May 20, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['McKinney ISD', 'Texas', '/mckinney-isd-calendar', 'Aug 13, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Mesquite ISD', 'Texas', '/mesquite-isd-calendar', 'Aug 11, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['North East ISD', 'Texas', '/north-east-isd-calendar', 'Aug 17, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Northside ISD', 'Texas', '/northside-independent-school-district-calendar', 'Aug 10, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Pasadena ISD', 'Texas', '/pasadena-independent-school-district-calendar', 'Aug 13, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 8, 2027'],
  ['Plano ISD', 'Texas', '/plano-independent-school-district-calendar', 'Aug 11, 2026', 'May 21, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Round Rock ISD', 'Texas', '/round-rock-independent-school-district-calendar', 'Aug 19, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['Spring ISD', 'Texas', '/spring-isd-calendar', 'Aug 12, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 15, 2027'],
  ['ACPS', 'Virginia', '/alexandria-city-public-schools-calendar', 'Aug 24, 2026', 'Jun 17, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['APS', 'Virginia', '/arlington-public-schools-calendar', 'Aug 31, 2026', 'Jun 17, 2027', 'Dec 23, 2026', 'Mar 22, 2027'],
  ['CCPS', 'Virginia', '/chesterfield-county-school-calendar', 'Aug 24, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['FCPS', 'Virginia', '/fairfax-county-school-calendar', 'Aug 24, 2026', 'Jun 16, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['HCPS', 'Virginia', '/henrico-county-school-calendar', 'Aug 24, 2026', 'Jun 4, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['HCS', 'Virginia', '/hampton-city-schools-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['LCPS', 'Virginia', '/loudoun-county-school-calendar', 'Aug 17, 2026', 'Jun 11, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['NNPS', 'Virginia', '/newport-news-public-schools-calendar', 'Aug 24, 2026', 'Jun 8, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['PWCS', 'Virginia', '/prince-william-county-school-calendar', 'Aug 24, 2026', 'Jun 17, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['RCPS', 'Virginia', '/roanoke-county-public-schools-calendar', 'Aug 13, 2026', 'May 27, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['SCPS', 'Virginia', '/spotsylvania-county-public-schools-calendar', 'Aug 11, 2026', 'May 28, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['SCPS', 'Virginia', '/stafford-county-public-schools-calendar', 'Aug 12, 2026', 'May 26, 2027', 'Dec 21, 2026', 'Mar 22, 2027'],
  ['VBCPS', 'Virginia', '/virginia-beach-school-calendar', 'Aug 24, 2026', 'Jun 11, 2027', 'Dec 21, 2026', 'Mar 29, 2027'],
  ['WJCC Schools', 'Virginia', '/williamsburg-james-city-county-schools-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
  ['YCSD', 'Virginia', '/york-county-school-division-calendar', 'Aug 24, 2026', 'Jun 9, 2027', 'Dec 21, 2026', 'Apr 5, 2027'],
]
</script>

<template>
  <main id="top" class="bg-gray-50">
    <article class="max-w-5xl mx-auto px-4 py-10">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <NuxtLink to="/" class="font-medium text-gray-600 hover:text-blue-600">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/school-calendar-trends" class="font-medium text-gray-600 hover:text-blue-600">Calendar Data</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="font-semibold text-gray-900" aria-current="page">2026-2027 Report</span>
      </nav>

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">School Calendar Research Report</p>
        <h1 class="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
          {{ reportTitle }}
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Based on 100 reviewed 2026-2027 district calendar records in the current MySchoolDates dataset, the dominant pattern is clear: most districts begin in August, most end in May, winter break usually begins December 21, and 180 student days remains the most common listed instructional count.
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
          <span class="rounded-lg bg-gray-100 px-3 py-1">100 reviewed 2026-2027 calendars</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">13 states</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">Next review January 2027</span>
          <span class="rounded-lg bg-gray-100 px-3 py-1">MySchoolDates dataset</span>
        </div>
      </header>

      <section id="quick-answer" class="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Quick Answer: When Do Schools Start in 2026?</h2>
        <p class="mt-3 text-sm leading-relaxed text-emerald-950">
          Most reviewed U.S. school districts start the 2026-2027 school year in August 2026. In this 100-district dataset, August 12 and August 24 are tied as the most common first student days, December 21 is the strongest winter break signal, and May 27 is the most common last student day.
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
          Calendar availability varies by district approval status. Data last verified July 27, 2026; official district sources remain the record for final family planning.
        </p>
      </section>

      <section class="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-6">
        <h2 class="text-xl font-semibold text-gray-900">Key Takeaways</h2>
        <ul class="mt-4 grid gap-3 text-sm leading-relaxed text-blue-950 sm:grid-cols-2">
          <li><strong>95 of 100</strong> reviewed districts start school in August for 2026-2027.</li>
          <li><strong>61 of 100</strong> reviewed districts end the school year in May, while 39 end in June.</li>
          <li><strong>December 21, 2026</strong> is the most common winter break start date, appearing in 89 reviewed records.</li>
          <li><strong>March 22, 2027</strong> is the most common spring break start date, appearing in 29 reviewed records.</li>
          <li><strong>180 student days</strong> is the most common listed instructional count.</li>
          <li><strong>98 of 100</strong> reviewed pages include an official or source PDF, and all 100 have an ICS calendar export on MySchoolDates.</li>
        </ul>
      </section>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div class="space-y-8">
          <section id="executive-summary" class="rounded-lg border border-gray-200 bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">Executive Summary</h2>
            <p class="mt-3 text-gray-600 leading-relaxed">
              This report analyzes 100 reviewed 2026-2027 public school district calendar records from the MySchoolDates dataset. The sample is designed to identify calendar-planning patterns, not to act as a complete national census.
            </p>
            <div class="mt-5 grid gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div class="text-sm font-semibold text-gray-900">Start dates</div>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">August is the dominant start month, with 95 reviewed districts beginning in August 2026.</p>
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
              These lightweight charts summarize the strongest signals in the 100-record dataset: start month, end month, winter break timing, and spring break clusters.
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
              This report uses the current MySchoolDates calendar dataset as of July 27, 2026. The sample includes 100 reviewed district records for the 2026-2027 school year across 13 states. It is a reviewed platform dataset, not a census of every public school district in the United States.
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
                <div class="mt-1 text-sm font-semibold text-gray-900">July 27, 2026</div>
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
              In the reviewed 2026-2027 dataset, August is the overwhelming start-month norm. Ninety-five districts start in August, compared with four July starts and one September start. The July starts are not random outliers; they are concentrated in calendar systems with early-start, year-round, track, or specialized regional patterns, especially in California.
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
              For many families, summer break 2027 begins after the final student day listed by the district. Sixty-one reviewed districts end the 2026-2027 school year in May, while 39 end in June. The most common last student day is May 27, 2027, followed by May 28 and May 26. June endings remain important in the Northeast, Mid-Atlantic, and some California districts.
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
              Spring break is less uniform than winter break. The largest spring break cluster begins March 22, 2027, followed closely by March 15, 2027. Additional clusters begin March 29, April 5, and March 8. This matters for families comparing neighboring districts, because a one-week difference can affect childcare, travel pricing, shared custody planning, and multi-district households.
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
              Among the reviewed records, 84 calendars include an explicit totalSchoolDays value. Of those, 55 list 180 student days. That makes 180 days the dominant published count in the dataset, even though several districts list shorter or longer counts depending on state law, calendar type, teacher workday treatment, and local board rules.
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
              PDFs are still central to school calendar publishing. In this dataset, 98 of 100 reviewed 2026-2027 pages include an official or source PDF. But parent behavior is shifting toward usable calendar files. MySchoolDates generates ICS calendar exports for all 100 reviewed records so families can import dates into Google Calendar, Apple Calendar, or Outlook.
            </p>
            <p class="mt-3 text-gray-600 leading-relaxed">
              Translated calendars are also visible but not yet universal. Seven reviewed records include translated or Spanish calendar signals. Fontana Unified, for example, provides a Spanish PDF alongside its English board-approved calendar. These files are useful for household planning, but the official district source remains the record to verify before making fixed plans.
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
              <NuxtLink to="/fontana-unified-school-district-calendar" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
                <div class="font-semibold text-gray-900">Fontana Unified example</div>
                <div class="mt-1 text-sm text-gray-600">See PDF, ICS, minimum days, Spanish PDF, and school-level entry points.</div>
              </NuxtLink>
              <NuxtLink to="/corona-norco-unified-school-district-calendar" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition">
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
              This appendix lists the 100 reviewed 2026-2027 district records used for the report. Break columns are listed as reviewed winter break and spring break start signals when available in the local calendar record; families should use the linked district page and official source for final planning.
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
              <summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">Show all 100 reviewed district records</summary>
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
              Data scope: 100 reviewed 2026-2027 calendar records, 13 states, current site dataset as of July 27, 2026.
            </div>
          </div>
        </aside>
      </div>
    </article>
  </main>
</template>
