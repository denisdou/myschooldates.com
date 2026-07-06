<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, eventTypeLabel, eventTypeColor } = useDistrictPage()

// Load all data in parallel (allDistricts needed for state detection)
const [{ data: allDistricts }, { data: district }, { data: allCals }, { data: statePageData }] = await Promise.all([
  useAsyncData('districts-all', () => queryCollection('districts').order('name', 'ASC').all()),
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`cals:${slug}`, async () => {
    const d = await queryCollection('districts').where('slug', '=', slug).first()
    if (!d) return []
    return queryCollection('calendars').where('institutionId', '=', d.institutionId).order('schoolYear', 'DESC').all()
  }),
  useAsyncData(`state:${slug}`, () => queryCollection('states').where('stateSlug', '=', slug).first()),
])

// State detection — derive state slug from state name (e.g. "New York" → "new-york")
const toStateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
const uniqueStates = [...new Set((allDistricts.value ?? []).map(d => d.state))]
const matchedStateName = uniqueStates.find(s => toStateSlug(s) === slug) ?? null
const isStatePage = !!matchedStateName
const stateDistricts = (allDistricts.value ?? [])
  .filter(d => d.state === matchedStateName)

if (!isStatePage && !district.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// ── State page SEO ─────────────────────────────────────────────────────────
// Derive the most common school year from state districts to keep title current
const stateCurrentYear = (() => {
  if (!stateDistricts.length) return '2025-2026'
  const years = stateDistricts.map(d => d.currentSchoolYear).filter(Boolean)
  const freq: Record<string, number> = {}
  for (const y of years) freq[y] = (freq[y] ?? 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '2025-2026'
})()

if (isStatePage) {
  const stateTitle = `${matchedStateName} School Calendars ${stateCurrentYear} | MySchoolDates`
  const stateDesc = `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school district${stateDistricts.length !== 1 ? 's' : ''} in ${matchedStateName}. First day of school, spring break, winter break, and all important dates.`
  useSeoMeta({ title: stateTitle, description: stateDesc })
  useHead({
    link: [{ rel: 'canonical', href: `https://myschooldates.com/${slug}` }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: `${matchedStateName} School Calendars`, item: `https://myschooldates.com/${slug}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${matchedStateName} Public School Districts — ${stateCurrentYear} Calendars`,
          description: `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school districts in ${matchedStateName}.`,
          numberOfItems: stateDistricts.length,
          itemListElement: stateDistricts.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.name,
            url: `https://myschooldates.com/${d.slug}`,
            item: {
              '@type': 'EducationalOrganization',
              name: d.name,
              url: `https://myschooldates.com/${d.slug}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: d.city ?? '',
                addressRegion: (d as any).stateCode ?? d.state,
                addressCountry: 'US',
              },
            },
          })),
        },
        ...(statePageData.value?.faqs?.length ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: statePageData.value.faqs.map((f: { q: string; a: string }) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
      ]),
    }],
  })
}

// ── State page: load first days for district cards ─────────────────────────
const { data: stateCals } = await useAsyncData(`state-cals:${slug}`, async () => {
  if (!isStatePage || !stateDistricts.length) return []
  const all = await queryCollection('calendars').all()
  const ids = new Set(stateDistricts.map(d => d.institutionId))
  return (all ?? []).filter(c => ids.has(c.institutionId) && c.schoolYear === stateCurrentYear)
})

const stateCalsMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of stateCals.value ?? []) {
    map[c.institutionId] = c.firstDay
  }
  return map
})

// ── District page logic ────────────────────────────────────────────────────
const currentYear = district.value?.currentSchoolYear ?? ''
const cal = allCals.value?.find(y => y.schoolYear === currentYear) ?? null
const meta = district

const archivedYears = computed(() =>
  (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
)
const daysUntilStart = computed(() => cal ? daysUntil(cal.firstDay) : 0)
const today = new Date(); today.setHours(0, 0, 0, 0)
const nextEvent = computed(() =>
  cal?.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal?.events ?? []))
const faqs = computed(() => cal && district.value ? generateFaqs(district.value, cal, district.value.officialWebsite) : [])
const secondSemStart = computed(() => cal ? getSecondSemesterStart(cal.events) : '')

// Today status — answers "is school in session right now?"
const todayStr = today.toISOString().slice(0, 10)

const todayStatus = computed(() => {
  if (!cal) return null
  if (todayStr < cal.firstDay) {
    const d = daysUntilStart.value
    return { type: 'upcoming', headline: d === 0 ? 'School starts today!' : d === 1 ? 'School starts tomorrow' : `School starts in ${d} days`, detail: `First day: ${formatShortDate(cal.firstDay)}`, color: 'blue' }
  }
  if (todayStr > cal.lastDay) {
    return { type: 'ended', headline: 'School year has ended', detail: `Last day was ${formatShortDate(cal.lastDay)}`, color: 'gray' }
  }
  for (const b of breaks.value) {
    if (todayStr >= b.start && todayStr <= b.end) {
      const d = daysUntil(b.end)
      return { type: 'break', headline: b.name, detail: `${d + 1} day${d !== 0 ? 's' : ''} remaining`, color: 'purple' }
    }
  }
  const holiday = cal.events.find(e => e.date === todayStr && (e.type === 'holiday' || e.type === 'no_school'))
  if (holiday) {
    return { type: 'holiday', headline: `No school today — ${holiday.name}`, detail: nextEvent.value ? `Next school event: ${formatShortDate(nextEvent.value.date)}` : '', color: 'amber' }
  }
  return { type: 'school', headline: 'School is in session', detail: nextEvent.value ? `Next: ${nextEvent.value.name} — ${formatShortDate(nextEvent.value.date)}` : '', color: 'green' }
})

// Next upcoming events (excludes break_end since break_start already shows the range)
const upcomingEvents = computed(() => {
  if (!cal) return []
  return cal.events
    .filter(e => e.date >= todayStr && e.type !== 'break_end')
    .slice(0, 6)
})

// Share / copy link
const copied = ref(false)
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function shareWhatsApp() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar — ${window.location.href}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
function shareSMS() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar: ${window.location.href}`)
  window.open(`sms:?body=${text}`)
}
function shareTwitter() {
  const text = encodeURIComponent(`${district.value?.name} ${currentYear} school calendar — holidays, spring break, and all important dates`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}
function shareReddit() {
  const title = encodeURIComponent(`${district.value?.name} ${currentYear} School Calendar`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank')
}

// Data quality: estimated when no lastVerifiedAt is set
const isEstimated = computed(() => !cal?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!cal?.lastVerifiedAt) return null
  return new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const prevYear = computed(() => {
  const [y1, y2] = currentYear.split('-').map(Number)
  return `${y1 - 1}-${y2 - 1}`
})
const prevCal = computed(() => allCals.value?.find(c => c.schoolYear === prevYear.value) ?? null)
const yearComparison = computed(() => {
  if (!prevCal.value) return ''
  const prevBreaks = getBreaks(prevCal.value.events)
  const curSpring = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const prevSpring = prevBreaks.find(b => b.name.toLowerCase().includes('spring'))
  if (!curSpring || !prevSpring) return ''
  const diff = Math.round(
    (new Date(curSpring.start + 'T00:00:00').getTime() - new Date(prevSpring.start + 'T00:00:00').getTime())
    / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return `Spring break starts on the same date as ${prevYear.value}.`
  if (diff > 0) return `Compared to ${prevYear.value}, spring break starts ${diff} day${diff !== 1 ? 's' : ''} later this year.`
  return `Compared to ${prevYear.value}, spring break starts ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} earlier this year.`
})

if (!isStatePage && district.value) {
  const canonicalUrl = `https://myschooldates.com/${slug}`
  useSeoMeta({
    title: `${meta.value!.name} Calendar ${currentYear} | MySchoolDates`,
    description: `${meta.value!.name} academic calendar ${currentYear}. First day of school ${formatShortDate(cal!.firstDay)}, last day ${formatShortDate(cal!.lastDay)}. View all holidays, spring break, and important dates for ${meta.value!.state} public schools.`,
    ogTitle: `${meta.value!.name} Calendar ${currentYear}`,
    ogDescription: `Complete ${currentYear} school calendar for ${meta.value!.name}. All holidays, breaks, and key dates.`,
    ogUrl: canonicalUrl,
  })

  const orgAddress = {
    '@type': 'PostalAddress',
    addressLocality: meta.value!.city ?? '',
    addressRegion: (meta.value! as any).stateCode ?? meta.value!.state,
    addressCountry: 'US',
  }
  const orgRef = { '@type': 'EducationalOrganization', name: meta.value!.name, url: meta.value!.officialWebsite || canonicalUrl }

  const keyEvents = cal ? [
    ...(cal.firstDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `First Day of School — ${meta.value!.name} ${currentYear}`,
      startDate: cal.firstDay, endDate: cal.firstDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...(cal.lastDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `Last Day of School — ${meta.value!.name} ${currentYear}`,
      startDate: cal.lastDay, endDate: cal.lastDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...breaks.value.map(b => ({
      '@context': 'https://schema.org', '@type': 'Event',
      name: `${b.name} — ${meta.value!.name} ${currentYear}`,
      startDate: b.start, endDate: b.end,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    })),
  ] : []

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
            { '@type': 'ListItem', position: 2, name: meta.value!.state, item: `https://myschooldates.com/${toStateSlug(meta.value!.state)}` },
            { '@type': 'ListItem', position: 3, name: `${meta.value!.name} Calendar`, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: meta.value!.name,
          url: meta.value!.officialWebsite || canonicalUrl,
          sameAs: [canonicalUrl, meta.value!.officialWebsite].filter(Boolean),
          description: meta.value!.about ?? '',
          address: orgAddress,
        },
        ...keyEvents,
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
}
</script>

<template>
  <div>
    <!-- ── State Page ─────────────────────────────────────────────────────── -->
    <template v-if="isStatePage">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: matchedStateName! }]" />

        <!-- Hero -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ matchedStateName }} School Calendars {{ stateCurrentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Official {{ stateCurrentYear }} school calendars · {{ stateDistricts.length }} public school district{{ stateDistricts.length !== 1 ? 's' : '' }} · Sourced from official district websites
          </p>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              {{ stateDistricts.length }} districts covered
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Updated for {{ stateCurrentYear }}
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Google Calendar support
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Official district sources
            </span>
          </div>
        </div>

        <!-- Quick Facts from state data -->
        <div v-if="statePageData?.quickFacts?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="fact in statePageData.quickFacts" :key="fact.label" class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ fact.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ fact.label }}</div>
          </div>
        </div>

        <!-- About section -->
        <div v-if="statePageData?.about" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">About {{ matchedStateName }} School Calendars</h2>
          <div class="text-gray-600 leading-relaxed space-y-3">
            <p v-for="(para, i) in statePageData.about.split('\n\n')" :key="i">{{ para }}</p>
          </div>
        </div>

        <!-- District Cards -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Districts — {{ stateCurrentYear }}</h2>
          <p class="text-sm text-gray-500 mb-4">Click any district to view its full calendar, download an ICS file, or add dates to Google Calendar.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="d in stateDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div class="font-semibold text-gray-900 leading-snug">{{ d.name }}</div>
              <div class="text-sm text-gray-500 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.stateCode }}{{ d.shortName ? ` · ${d.shortName}` : '' }}</div>
              <div class="mt-3 flex items-center justify-between">
                <div>
                  <span v-if="stateCalsMap[d.institutionId]" class="text-xs font-medium text-blue-700">
                    Starts {{ formatShortDate(stateCalsMap[d.institutionId]) }}
                  </span>
                  <span v-else class="text-xs text-gray-400">{{ d.currentSchoolYear }}</span>
                </div>
                <span class="text-xs font-medium text-blue-600">View calendar →</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Common Holidays -->
        <div v-if="statePageData?.commonHolidays?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Common {{ matchedStateName }} School Holidays</h2>
          <p class="text-sm text-gray-500 mb-4">Exact dates vary by district. Always verify with your district's official calendar before making plans.</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="holiday in statePageData.commonHolidays"
              :key="holiday"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
            >{{ holiday }}</span>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="statePageData?.planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Planning Tips for {{ matchedStateName }} Families</h2>
          <ul class="space-y-3">
            <li v-for="tip in statePageData.planningTips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- FAQ -->
        <div v-if="statePageData?.faqs?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in statePageData.faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Related States -->
        <div v-if="statePageData?.relatedStates?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare Nearby States</h2>
            <p class="text-sm text-gray-500 mt-1">School start dates, spring break, and holiday schedules vary significantly between states — even for neighboring districts across state lines.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink
              v-for="rs in statePageData.relatedStates"
              :key="rs.slug"
              :to="`/${rs.slug}`"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ rs.name }} School Calendars</div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- SEO footer note -->
        <p class="text-xs text-gray-400 text-center">
          All calendar data is sourced from official {{ matchedStateName }} school district websites.
          Dates are subject to board approval — always verify with your district before making plans.
        </p>

      </main>
    </template>

    <!-- ── District Page ──────────────────────────────────────────────────── -->
    <template v-else-if="district && cal">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[
          { label: 'Home', href: '/' },
          { label: district.state, href: `/${toStateSlug(district.state)}` },
          { label: district.name },
        ]" />

        <!-- Title -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ district.name }} Calendar {{ currentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Official {{ currentYear }} school calendar · Sourced from {{ district.name }} ·
            <button @click="downloadICS(district, cal)" class="underline hover:text-blue-600 transition-colors">Add to Google Calendar</button>
          </p>
        </div>

        <!-- Today Status — HERO: first thing users see after the title -->
        <div
          v-if="todayStatus"
          class="rounded-2xl px-6 py-6"
          :class="{
            'bg-green-50 border border-green-200': todayStatus.type === 'school',
            'bg-blue-50 border border-blue-200': todayStatus.type === 'upcoming',
            'bg-purple-50 border border-purple-200': todayStatus.type === 'break',
            'bg-amber-50 border border-amber-200': todayStatus.type === 'holiday',
            'bg-gray-100 border border-gray-200': todayStatus.type === 'ended',
          }"
        >
          <div class="text-xs font-semibold uppercase tracking-wide mb-1"
            :class="{
              'text-green-500': todayStatus.type === 'school',
              'text-blue-500': todayStatus.type === 'upcoming',
              'text-purple-500': todayStatus.type === 'break',
              'text-amber-500': todayStatus.type === 'holiday',
              'text-gray-400': todayStatus.type === 'ended',
            }"
          >Today</div>
          <div
            class="font-bold text-2xl leading-tight"
            :class="{
              'text-green-800': todayStatus.type === 'school',
              'text-blue-800': todayStatus.type === 'upcoming',
              'text-purple-800': todayStatus.type === 'break',
              'text-amber-800': todayStatus.type === 'holiday',
              'text-gray-600': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.headline }}
          </div>
          <div v-if="todayStatus.detail" class="text-sm mt-1"
            :class="{
              'text-green-600': todayStatus.type === 'school',
              'text-blue-600': todayStatus.type === 'upcoming',
              'text-purple-600': todayStatus.type === 'break',
              'text-amber-600': todayStatus.type === 'holiday',
              'text-gray-500': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.detail }}
          </div>
          <!-- Primary CTA -->
          <button
            @click="downloadICS(district, cal)"
            class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </button>
        </div>

        <!-- Key Date Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.firstDay) }}</div>
            <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {{ daysUntilStart }} days away
            </div>
            <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
            <div v-else class="mt-2 text-sm text-green-600">School is in session</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.lastDay) }}</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Next Event</div>
            <template v-if="nextEvent">
              <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
            </template>
            <div v-else class="text-gray-400">No upcoming events</div>
          </div>
        </div>

        <!-- Year Switcher -->
        <div v-if="archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-500">Other years:</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ y }}
          </NuxtLink>
        </div>

        <!-- About / Calendar Context -->
        <div class="text-gray-600 leading-relaxed space-y-3 text-sm">
          <p v-if="district.calendarNotes">{{ district.calendarNotes }}</p>
          <template v-else>
            <p>
              The {{ currentYear }} academic year for {{ district.name }} runs from
              <strong>{{ formatDate(cal.firstDay) }}</strong> to
              <strong>{{ formatDate(cal.lastDay) }}</strong>,
              covering {{ cal.totalSchoolDays ?? 180 }} instructional days across {{ cal.semesters ?? 2 }} semesters.
              <span v-if="secondSemStart">
                The second semester begins {{ formatShortDate(secondSemStart) }} following the winter recess.
              </span>
            </p>
            <p v-if="breaks.length">
              Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
              {{ breaks.map(b => b.name).join(', ') }} — plus all federal holidays.
              <span v-if="yearComparison" class="italic text-gray-500"> {{ yearComparison }}</span>
            </p>
          </template>
          <p v-if="district.about" class="text-gray-500">{{ district.about }}</p>
        </div>

        <!-- Upcoming Events — timeline of next 6 events -->
        <div v-if="upcomingEvents.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Upcoming Dates</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="event in upcomingEvents"
              :key="event.date + event.type"
              class="flex items-center gap-4 px-6 py-3.5"
            >
              <!-- Date column -->
              <div class="w-16 flex-shrink-0 text-center">
                <div class="text-xs font-semibold text-gray-400 uppercase">
                  {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }) }}
                </div>
                <div class="text-xl font-bold text-gray-900 leading-tight">
                  {{ new Date(event.date + 'T00:00:00').getDate() }}
                </div>
              </div>
              <!-- Divider -->
              <div class="w-px h-8 bg-gray-200 flex-shrink-0" />
              <!-- Event info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 text-sm">{{ event.name }}</div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }) }}
                </div>
              </div>
              <!-- Badge -->
              <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" :class="eventTypeColor[event.type]">
                {{ eventTypeLabel[event.type] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Facts -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ currentYear }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.totalSchoolDays ?? 180 }}</div>
              <div class="text-xs text-gray-500 mt-1">Instructional Days</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.teacherWorkDays ?? '—' }}</div>
              <div class="text-xs text-gray-500 mt-1">Teacher Work Days</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ cal.semesters ?? 2 }}</div>
              <div class="text-xs text-gray-500 mt-1">Semesters</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ breaks.length }}</div>
              <div class="text-xs text-gray-500 mt-1">Major Breaks</div>
            </div>
          </div>
          <!-- Data source row -->
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Source:</span>
            <a
              :href="cal.sourceUrl ?? district.calendarPage ?? district.officialWebsite"
              target="_blank"
              rel="nofollow noopener"
              class="underline text-gray-500 hover:text-blue-600 transition-colors"
            >{{ district.name }} official calendar</a>
            <span v-if="!isEstimated" class="ml-1 text-green-600 font-medium">· Verified {{ verifiedDate }}</span>
            <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
          </div>
        </div>

        <!-- Break Summary -->
        <div v-if="breaks.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Major School Breaks</h2>
          <div class="space-y-3">
            <div v-for="b in breaks" :key="b.name" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <div class="font-medium text-gray-900">{{ b.name }}</div>
                <div class="text-sm text-gray-500">{{ formatShortDate(b.start) }} – {{ formatShortDate(b.end) }}</div>
                <div v-if="daysUntil(b.start) > 0" class="text-xs text-blue-600 mt-0.5 font-medium">
                  Starts in {{ daysUntil(b.start) }} day{{ daysUntil(b.start) !== 1 ? 's' : '' }}
                </div>
                <div v-else-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-purple-600 mt-0.5 font-medium">
                  In progress
                </div>
              </div>
              <div class="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{{ b.days }} days</div>
            </div>
          </div>
        </div>

        <!-- Add to Calendar + Share -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <!-- Add to Calendar -->
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Add to Calendar</h2>
            <p class="text-sm text-gray-500 mb-4">Download the {{ district.name }} {{ currentYear }} calendar and import it into your calendar app.</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <!-- Apple Calendar -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 14h2l1 2 2-5 1 3h2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Apple<br>Calendar</span>
              </button>
              <!-- Google Calendar -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="12" cy="15" r="2.5" stroke-width="1.5"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Google<br>Calendar</span>
              </button>
              <!-- Outlook -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
              >
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <path d="M3 9h18" stroke-width="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 13h8M8 17h5" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="text-xs font-medium text-gray-700 leading-tight">Outlook</span>
              </button>
              <!-- Download .ics -->
              <button
                @click="downloadICS(district, cal)"
                class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all text-center"
              >
                <svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="text-xs font-medium text-blue-700 leading-tight">Download<br>.ics File</span>
              </button>
            </div>
            <p class="text-xs text-gray-400">All formats use the standard .ics file. After downloading, open the file to import into your calendar app.</p>
          </div>

          <!-- Share with Parents -->
          <div class="p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-3">Share with Parents</h3>
            <div class="flex flex-wrap gap-3">
              <!-- Copy Link -->
              <button
                @click="copyLink"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ copied ? 'Copied!' : 'Copy Link' }}
              </button>
              <!-- WhatsApp -->
              <button
                @click="shareWhatsApp"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a7.947 7.947 0 01-3.794-.964l-4.21 1.104 1.126-4.108a7.934 7.934 0 01-1.062-3.965C4.09 7.148 7.666 3.573 12.03 3.573c2.116 0 4.099.823 5.59 2.317a7.862 7.862 0 012.31 5.587c-.002 4.358-3.579 7.403-7.901 7.403z"/>
                </svg>
                WhatsApp
              </button>
              <!-- Text / SMS -->
              <button
                @click="shareSMS"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Text
              </button>
              <!-- Twitter / X -->
              <button
                @click="shareTwitter"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </button>
              <!-- Reddit -->
              <button
                @click="shareReddit"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                Reddit
              </button>
              <!-- Official source -->
              <a
                :href="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
                target="_blank"
                rel="nofollow noopener"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Official Source
              </a>
            </div>
          </div>
        </div>

        <!-- All Dates -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">All Important Dates</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="event in cal.events" :key="event.date" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
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

        <!-- Related Districts -->
        <div v-if="district.relatedDistricts?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Nearby School Districts</h2>
            <p class="text-sm text-gray-500 mt-1">Compare nearby {{ district.state }} school districts.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink v-for="rd in district.relatedDistricts" :key="rd.slug" :to="`/${rd.slug}`" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <div class="font-medium text-gray-900">{{ rd.name }}</div>
                <div class="text-sm text-gray-500">{{ rd.state }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Data quality notice -->
        <div v-if="isEstimated" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-gray-700">Dates not yet verified</p>
              <p>
                These dates have not been confirmed against the official {{ currentYear }} calendar.
                Always check the
                <a :href="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium text-gray-700">official {{ district.name }} calendar</a>
                before making travel or childcare plans.
              </p>
            </div>
          </div>
        </div>

        <div v-else class="bg-green-50 border border-green-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-green-700 space-y-1">
              <p class="font-medium">Verified from official source</p>
              <p>
                Calendar data sourced from the official
                <a :href="district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium">{{ district.name }} website</a>.
                Dates are subject to board approval and may change.
              </p>
              <p class="text-green-600 text-xs">Last verified: {{ verifiedDate }}</p>
            </div>
          </div>
        </div>

      </main>
    </template>
  </div>
</template>
