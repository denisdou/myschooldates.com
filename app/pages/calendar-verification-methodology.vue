<script setup lang="ts">
const pageUrl = 'https://myschooldates.com/calendar-verification-methodology'
const pageTitle = 'School Calendar Verification Methodology | MySchoolDates'
const pageDescription = 'How MySchoolDates verifies district school calendar dates against official PDFs, board-approved calendars, and district source pages before publishing.'
const organizationId = 'https://myschooldates.com/#organization'
const authorId = 'https://myschooldates.com/author#person'
const researchTeamId = 'https://myschooldates.com/#education-research-team'

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
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
            '@type': 'Organization',
            '@id': organizationId,
            name: 'MySchoolDates',
            url: 'https://myschooldates.com',
          },
          {
            '@type': 'Organization',
            '@id': researchTeamId,
            name: 'MySchoolDates Calendar Data Team',
            url: pageUrl,
            parentOrganization: { '@id': organizationId },
          },
          {
            '@type': 'Person',
            '@id': authorId,
            name: 'Denis Dou',
            jobTitle: 'Founder & Education Data Research Lead',
            url: 'https://myschooldates.com/author',
            image: 'https://myschooldates.com/images/denis-dou.png',
            sameAs: ['https://www.linkedin.com/in/denis-dou/'],
            worksFor: { '@id': organizationId },
          },
          {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: pageTitle,
            description: pageDescription,
            inLanguage: 'en-US',
            dateModified: '2026-07-27',
            lastReviewed: '2026-07-27',
            publisher: { '@id': organizationId },
            author: { '@id': authorId },
            reviewedBy: { '@id': researchTeamId },
            about: [
              { '@type': 'Thing', name: 'school calendar verification' },
              { '@type': 'Thing', name: 'district calendar source review' },
              { '@type': 'Thing', name: 'structured school calendar data' },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
              { '@type': 'ListItem', position: 2, name: 'Calendar Verification Methodology', item: pageUrl },
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">School Calendar Verification Methodology</h1>
    <p class="text-lg text-gray-500 mb-12">
      How MySchoolDates turns official district calendar sources into searchable dates, PDF references, and calendar import files.
    </p>
    <dl class="mb-12 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
      <div>
        <dt class="inline font-semibold uppercase tracking-wide text-gray-400">By</dt>
        <dd class="ml-1 inline font-medium">
          <NuxtLink to="/author" class="text-blue-600 hover:underline">Denis Dou</NuxtLink>
        </dd>
      </div>
      <div>
        <dt class="inline font-semibold uppercase tracking-wide text-gray-400">Reviewed</dt>
        <dd class="ml-1 inline font-medium text-gray-700">July 27, 2026</dd>
      </div>
      <div>
        <dt class="inline font-semibold uppercase tracking-wide text-gray-400">Maintained by</dt>
        <dd class="ml-1 inline font-medium text-gray-700">MySchoolDates Calendar Data Team</dd>
      </div>
    </dl>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">1. Identify the Official Source</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        For each district and school year, we start with the source published or linked by the district itself. This is usually a board-approved PDF, an official calendar page, or a district-hosted calendar file.
      </p>
      <p class="text-gray-600 leading-relaxed">
        We record the district source URL, direct PDF URL when available, source version, and review date so families can compare our page against the official record.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">2. Extract Calendar Events</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        We extract the dates families most often need: first day, last day, major breaks, holidays, student no-school days, early dismissals, teacher workdays, grading periods, make-up days, and school resume dates when those items appear in the official source.
      </p>
      <p class="text-gray-600 leading-relaxed">
        Each date is normalized into a structured record with an event name, ISO date, event type, and optional notes such as early dismissal or weather make-up status.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">3. Compare Against the Source</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Before publication, we compare extracted records against the official district source. The review checks school-year boundaries, break ranges, holiday names, student attendance status, and special notes such as storm make-up days.
      </p>
      <p class="text-gray-600 leading-relaxed">
        If a date does not match the source, we update the calendar record before the page is published or refreshed.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">4. Maintain Independent Source Attribution</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        MySchoolDates is an independent calendar reference. We do not claim to be an official school district website, and we identify the district source of record on each calendar page so families can verify high-impact plans directly with the district.
      </p>
      <p class="text-gray-600 leading-relaxed">
        When a page includes planning notes, FAQ answers, or downloadable calendar files, those additions are maintained by MySchoolDates and are separate from the official district publication.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">5. Publish Searchable and Downloadable Formats</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        Once verified, the calendar is published as a district page with visible dates, FAQ answers, source links, structured data, and an optional .ics calendar import file.
      </p>
      <p class="text-gray-600 leading-relaxed">
        The .ics file is an unofficial one-time import generated from the reviewed records on the page. It does not replace district alerts or future revisions.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">6. Track Updates and Corrections</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        District calendars can change after publication because of weather, board decisions, staffing needs, or emergency closures. When we identify a revised official source, we update the affected date records and refresh the page review date.
      </p>
      <p class="text-gray-600 leading-relaxed">
        Families should still verify high-impact plans such as travel, childcare, transportation, graduation, athletics, and school-specific events with the district or assigned school.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">7. Update Frequency</h2>
      <p class="text-gray-600 leading-relaxed mb-3">
        We refresh a district calendar when a new school year source is published, when an official source is revised, or when a correction report points to a public district update. The page review date reflects the most recent source check for that school-year record.
      </p>
      <p class="text-gray-600 leading-relaxed">
        We do not change review dates just to make pages appear newer. Review dates should correspond to a source check, data correction, or calendar refresh.
      </p>
    </section>

    <section class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Report a Calendar Correction</h2>
      <p class="text-gray-600 leading-relaxed mb-4">
        If a district changes its calendar or a date appears incorrect, send us the district name, school year, event date, and official source link.
      </p>
      <a
        href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
        class="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Report a Correction
      </a>
    </section>
  </div>
</template>
