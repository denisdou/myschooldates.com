<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const year = route.params.year as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, eventTypeLabel, eventTypeColor } = useDistrictPage()

const [{ data: district }, { data: cal }] = await Promise.all([
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`cal:${slug}:${year}`, async () => {
    const d = await queryCollection('districts').where('slug', '=', slug).first()
    if (!d) return null
    return queryCollection('calendars')
      .where('institutionId', '=', d.institutionId)
      .where('schoolYear', '=', year)
      .first()
  }),
])

if (!district.value || !cal.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found' })
}

const isCurrentYear = district.value.currentSchoolYear === year
const hubUrl = `https://myschooldates.com/${slug}`
const canonicalUrl = isCurrentYear ? hubUrl : `${hubUrl}/${year}`

const daysUntilStart = computed(() => daysUntil(cal.value!.firstDay))
const today = new Date(); today.setHours(0, 0, 0, 0)
const nextEvent = computed(() =>
  cal.value!.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal.value!.events))
const faqs = computed(() => generateFaqs(district.value!, cal.value!, district.value!.officialWebsite))
const secondSemStart = computed(() => getSecondSemesterStart(cal.value!.events))

useSeoMeta({
  title: `${district.value.name} Calendar ${year} | MySchoolDates`,
  description: `${district.value.name} academic calendar ${year}. First day ${formatShortDate(cal.value.firstDay)}, last day ${formatShortDate(cal.value.lastDay)}. All holidays, breaks, and important dates.`,
  ogTitle: `${district.value.name} Calendar ${year}`,
  ogUrl: canonicalUrl,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
          { '@type': 'ListItem', position: 2, name: district.value.state, item: `https://myschooldates.com/${district.value.state.toLowerCase().replace(/\s+/g, '-')}` },
          { '@type': 'ListItem', position: 3, name: `${district.value.name} Calendar`, item: hubUrl },
          { '@type': 'ListItem', position: 4, name: year, item: canonicalUrl },
        ],
      },
      ...(faqs.value.length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.value.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ]),
  }],
})
</script>

<template>
  <div>
    <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <!-- Breadcrumb -->
      <Breadcrumb :items="[
        { label: 'Home', href: '/' },
        { label: district!.state, href: `/${district!.state.toLowerCase().replace(/\s+/g, '-')}` },
        { label: district!.name, href: `/${slug}` },
        { label: year },
      ]" />

      <!-- Archive notice for non-current year -->
      <div v-if="!isCurrentYear" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm text-blue-700">
          You're viewing the archived <strong>{{ year }}</strong> calendar.
          <NuxtLink :to="`/${slug}`" class="underline font-medium">View the current {{ district!.currentSchoolYear }} calendar →</NuxtLink>
        </p>
      </div>

      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ district!.name }} Calendar {{ year }}
        </h1>
        <div class="mt-3 text-gray-600 leading-relaxed space-y-2">
          <p>
            The {{ year }} academic year for {{ district!.name }} ran from
            <strong>{{ formatDate(cal!.firstDay) }}</strong> to
            <strong>{{ formatDate(cal!.lastDay) }}</strong>,
            covering {{ cal!.totalSchoolDays ?? 180 }} instructional days across {{ cal!.semesters ?? 2 }} semesters.
            <span v-if="secondSemStart">
              The second semester began {{ formatShortDate(secondSemStart) }} following the winter recess.
            </span>
          </p>
          <p v-if="breaks.length">
            The year included {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }}:
            {{ breaks.map(b => b.name).join(', ') }}.
          </p>
        </div>
      </div>

      <!-- Key Date Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.firstDay) }}</div>
          <div v-if="isCurrentYear && daysUntilStart > 0" class="mt-2 text-sm text-blue-600">{{ daysUntilStart }} days away</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.lastDay) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ isCurrentYear ? 'Next Event' : 'School Breaks' }}</div>
          <template v-if="isCurrentYear && nextEvent">
            <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
          </template>
          <div v-else class="text-lg font-bold text-gray-900">{{ breaks.length }} breaks</div>
        </div>
      </div>

      <!-- Quick Facts -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ year }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">{{ cal!.totalSchoolDays ?? 180 }}</div>
            <div class="text-xs text-gray-500 mt-1">School Days</div>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">{{ cal!.teacherWorkDays ?? '—' }}</div>
            <div class="text-xs text-gray-500 mt-1">Teacher Work Days</div>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">{{ cal!.semesters ?? 2 }}</div>
            <div class="text-xs text-gray-500 mt-1">Semesters</div>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">{{ breaks.length }}</div>
            <div class="text-xs text-gray-500 mt-1">School Breaks</div>
          </div>
        </div>
      </div>

      <!-- All Dates -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">All Important Dates — {{ year }}</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="event in cal!.events" :key="event.date" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div>
              <div class="font-medium text-gray-900">{{ event.name }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(event.date) }}</div>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="eventTypeColor[event.type]">
              {{ eventTypeLabel[event.type] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Export Calendar</h2>
        <p class="text-sm text-gray-500 mb-4">Download {{ year }} dates for {{ district!.name }}.</p>
        <div class="flex flex-wrap gap-3">
          <button @click="downloadICS(district!, cal!)" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download ICS
          </button>
          <a :href="cal!.sourceUrl ?? district!.officialWebsite" target="_blank" rel="nofollow noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors">
            Official Source
          </a>
        </div>
      </div>

      <!-- FAQ -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
        <div class="space-y-5 divide-y divide-gray-100">
          <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
            <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
            <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
          </div>
        </div>
      </div>

      <!-- Back to current -->
      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Back to {{ district!.name }} current calendar ({{ district!.currentSchoolYear }})
        </NuxtLink>
      </div>

    </main>
  </div>
</template>
