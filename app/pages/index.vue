<script setup lang="ts">
const { stateLinks, coverageStats } = useAppConfig()

const { data: districts } = await useAsyncData(
  'districts-list',
  () => queryCollection('districts').order('name', 'ASC').all()
)

const { data: calendars } = await useAsyncData(
  'homepage-calendars-list',
  () => queryCollection('calendars').select('schoolYear').all()
)

const toStateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

// State display order by search volume, not alphabet
const STATE_ORDER = [
  'California', 'Florida', 'Texas', 'New York',
  'Illinois', 'Pennsylvania', 'North Carolina', 'Arizona', 'Nevada', 'Virginia', 'Kentucky', 'Hawaii', 'Maryland',
  'Colorado', 'Georgia', 'Massachusetts', 'Michigan', 'Minnesota', 'Missouri', 'Kansas', 'Indiana', 'New Mexico',
  'Idaho', 'Ohio', 'Oregon', 'Utah', 'Washington', 'Wisconsin',
]

const STATE_HUBS = new Set(stateLinks.map(state => state.name))
const stateOrderIndex = new Map(STATE_ORDER.map((state, index) => [state, index]))

const STATE_SUMMARIES: Record<string, string> = {
  California: `California's public school system is the largest in the nation, serving more than 6 million K–12 students across over 1,000 school districts. Unlike most states, California has no uniform start date — districts set their own calendars independently. Los Angeles Unified, the second-largest district in the country, typically begins in early September. Many Central Valley districts, including Fresno Unified, start in early August. The school year generally runs through June, with winter break in late December and spring break in March or April. California requires a minimum of 180 instructional days.`,
  Florida: `Florida public schools serve more than 3 million students across 67 county-based school districts. State law mandates 180 instructional days, and most districts start school in the second week of August — earlier than most states. The Miami-Dade, Broward, and Palm Beach districts form one of the densest concentrations of students in the country. Florida's school year typically ends in early June. Hurricane season occasionally disrupts the calendar; some districts build in makeup days. Spring break typically falls in March, and winter break runs from late December through early January.`,
  Texas: `Texas has over 1,000 independent school districts (ISDs), each governed by its own elected board. The state requires 180 instructional days, and most districts start in early-to-mid August — Houston ISD, Dallas ISD, and most San Antonio-area districts typically begin around August 11. Unlike some states, Texas has no law restricting the start date, so a few districts open as early as late July. Spring break falls in mid-March across most Texas ISDs. Good Friday is an official school holiday in most Texas districts. Summer break begins in late May or early June.`,
  'New York': `New York State serves approximately 2.6 million public school students across more than 700 school districts. State regulations historically prohibited schools from opening before Labor Day, making New York one of the last states to start the school year. New York City Public Schools — the largest district in the country with over 1 million students — typically begins in early September. The school year runs through late June, covering 180 instructional days. Winter recess spans roughly two weeks in late December. Spring recess typically falls in late March or early April.`,
  Illinois: `Illinois public schools serve approximately 1.8 million students across more than 800 school districts. Chicago Public Schools, the third-largest district in the country, typically starts in late August and runs through mid-June. Illinois requires students to attend a minimum of 180 days. Winter break spans late December through early January. Spring break varies by district but generally falls in late March or early April. The Chicago metro area has some of the most searched school calendar dates in the Midwest.`,
  Pennsylvania: `Pennsylvania school districts approve calendars locally, so first day, last day, professional development days, breaks, and weather make-up plans vary by district. The School District of Philadelphia is the state's largest district and a high-demand calendar for families checking citywide attendance dates, holidays, term dates, and school-year breaks.`,
  'North Carolina': `North Carolina requires 185 instructional days for students — more than the national standard of 180. Most districts start in mid-to-late August. A distinctive feature of the NC school calendar is a fall break in October, typically one week long, in addition to standard Thanksgiving, winter, and spring breaks. Wake County and Charlotte-Mecklenburg Schools are the two largest districts, together serving nearly 300,000 students. Spring break generally falls in mid-March. The school year ends in early June.`,
  Arizona: `Arizona school calendars are approved locally by district, and many large districts begin in July or early August. Reviewed Arizona pages on MySchoolDates include Mesa Public Schools, Chandler Unified School District, Tucson Unified School District, and Peoria Unified School District, with district-specific details such as intersessions, modified Wednesdays, weekly early release, teacher workdays, and approved calendar PDFs.`,
  Nevada: `Nevada districts publish their own calendars. Reviewed pages currently cover Clark County School District and Washoe County School District, including Nevada Day, staff days, multiple Washoe calendar tracks, and district-specific contingency rules. Both reviewed 2026–27 calendars start August 10, but Clark County ends May 20 while Washoe's Balanced Calendar ends June 4.`,
  'New Mexico': `New Mexico district calendars can use grade-specific opening dates, virtual or remote-learning conference days, and different return dates after breaks. Reviewed pages currently cover Albuquerque Public Schools and Las Cruces Public Schools. Their 2026–27 student openings range from July 24 to August 11, depending on district and grade.`,
  Idaho: `Idaho districts publish local calendars with school- and grade-level schedule details. Reviewed pages currently cover Boise School District and West Ada School District. Both begin K–12 classes August 12, 2026, but Boise uses an early-release opening while West Ada identifies a late-start day.`,
  Ohio: `Ohio school calendars are approved locally. The current MySchoolDates collection includes a reviewed calendar for Columbus City Schools, with districtwide dates, attendance notes, official sources, and calendar downloads.`,
  Wisconsin: `Wisconsin districts publish their own school calendars. Reviewed pages currently cover Kenosha, Madison, Milwaukee, and Racine, including district-specific breaks, staff days, schedule exceptions, official sources, and calendar downloads.`,
  Virginia: `Virginia school divisions set their own academic calendars. Most begin in late August and end in mid-June. Fairfax County Public Schools, located in Northern Virginia's DC suburbs, is the tenth-largest school district in the country and consistently ranks among the top academic performers nationally. Virginia school divisions observe all federal holidays plus scheduled teacher workdays throughout the year. The DC metro area — including Fairfax and neighboring districts — tends to have high parental interest in precise calendar dates for childcare and travel planning.`,
  Kentucky: `Kentucky school districts publish local academic calendars with district-specific first days, holidays, breaks, professional development days, and make-up day notes. Families should verify dates with the official district calendar because weather, election days, and staff-only days can affect student attendance schedules.`,
  Hawaii: `Hawaii public schools are served statewide by the Hawaii State Department of Education. Most families use the HIDOE calendar for student work year dates, teacher workdays, fall break, winter break, spring break, state holidays, institute day notes, and last-day planning, while confirming school-specific events directly with their campus.`,
  Maryland: `Maryland state law prohibits public schools from starting before Labor Day, making it one of a handful of states with this restriction. Both Montgomery County and Prince George's County Public Schools — the two largest districts — begin school in early September and run through mid-June. Maryland schools observe all federal holidays. Montgomery County is consistently ranked among the top large school districts in the country for academic achievement and is a high-demand calendar for the DC metro area.`,
}

// Popular districts by institutionId, in display priority order
const POPULAR_IDS = [
  'lausd', 'miami-dade', 'nyc-doe', 'houston-isd',
  'chicago-public-schools', 'broward-county', 'clark-county', 'fairfax-county',
]

// Popular searches (shown as quick links below search input)
const POPULAR_SEARCH_IDS = [
  'miami-dade', 'lausd', 'houston-isd', 'nyc-doe', 'chicago-public-schools', 'dallas-isd',
]

const popularDistricts = computed(() => {
  const all = districts.value ?? []
  return POPULAR_IDS
    .map(id => all.find(d => d.institutionId === id))
    .filter((d): d is NonNullable<typeof d> => d != null)
})

const popularSearches = computed(() => {
  const all = districts.value ?? []
  return POPULAR_SEARCH_IDS
    .map(id => all.find(d => d.institutionId === id))
    .filter((d): d is NonNullable<typeof d> => d != null)
})

const byState = computed(() => {
  const map = new Map<string, NonNullable<typeof districts.value>>()
  for (const d of (districts.value ?? [])) {
    if (!map.has(d.state)) map.set(d.state, [])
    map.get(d.state)!.push(d)
  }
  return [...map.entries()]
    .sort(([stateA], [stateB]) => {
      const rankA = stateOrderIndex.get(stateA) ?? Number.MAX_SAFE_INTEGER
      const rankB = stateOrderIndex.get(stateB) ?? Number.MAX_SAFE_INTEGER
      return rankA - rankB || stateA.localeCompare(stateB)
    })
    .map(([state, stateDistricts]) => ({ state, districts: stateDistricts }))
})

const districtCount = computed(() => coverageStats.districts)
const stateCount = computed(() => coverageStats.states)
const availableYears = computed(() => {
  const years = new Set((calendars.value ?? []).map(c => c.schoolYear).filter(Boolean))
  return Array.from(years).sort().reverse()
})
const yearCoverage = computed(() => {
  const counts = new Map<string, number>()
  for (const cal of calendars.value ?? []) {
    if (!cal.schoolYear) continue
    counts.set(cal.schoolYear, (counts.get(cal.schoolYear) ?? 0) + 1)
  }
  return counts
})
const featuredYears = ['2027-2028', '2026-2027']
const supportingYears = computed(() => availableYears.value.filter(year => !featuredYears.includes(year)))

// Client-side search
const searchQuery = ref('')
const showDropdown = ref(false)

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (q.length < 2) return []
  return (districts.value ?? [])
    .filter(d => d.name.toLowerCase().includes(q))
    .slice(0, 8)
})

function onSearchFocus() { showDropdown.value = true }
function onSearchBlur() { setTimeout(() => { showDropdown.value = false }, 150) }

useSeoMeta({
  title: 'US School Calendars 2026-2027 & 2027-2028 | Holidays, Breaks & Key Dates | MySchoolDates',
  description: 'School calendars for 175 US public school districts. Find school start dates, spring break, winter break, holidays, PDFs, and calendar downloads for 2027-2028 and 2026-2027.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MySchoolDates',
      description: 'US School Calendar Platform — school start dates, holidays, and breaks for America\'s largest public school districts.',
      url: 'https://myschooldates.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://myschooldates.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }),
  }],
})
</script>

<template>
  <div>
    <main>
      <!-- Hero -->
      <section class="home-hero">
        <div class="site-page-shell py-14 text-center">
          <h1 class="home-hero__title mb-4">
            US School Calendar Platform
          </h1>
          <p class="home-hero__lead max-w-2xl mx-auto mb-8">
            Browse official school calendars for America's largest public school districts.
            Find school start dates, holidays, and spring break — then add them to Google Calendar.
          </p>
          <div class="home-proof-list flex flex-wrap justify-center gap-x-7 gap-y-2.5 text-sm">
            <span class="flex items-center gap-1.5"><span class="home-proof-mark">✓</span> School start &amp; end dates</span>
            <span class="flex items-center gap-1.5"><span class="home-proof-mark">✓</span> Holidays &amp; breaks</span>
            <span class="flex items-center gap-1.5"><span class="home-proof-mark">✓</span> Add to Google Calendar</span>
            <span class="flex items-center gap-1.5"><span class="home-proof-mark">✓</span> Official district sources</span>
            <span class="flex items-center gap-1.5"><span class="home-proof-mark">✓</span> Free forever</span>
          </div>
        </div>
      </section>

      <!-- Stats bar -->
      <div class="home-stats">
        <div class="site-page-shell home-stats__inner py-4 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm">
          <span><strong>{{ districtCount }}</strong> <span class="home-stats__label">school districts</span></span>
          <span><strong>{{ stateCount }}</strong> <span class="home-stats__label">states</span></span>
          <span>
            <strong>2027–2028</strong>
            <span class="home-stats__label"> &amp; </span>
            <strong>2026–2027</strong>
            <span v-if="supportingYears.includes('2025-2026')" class="home-stats__label"> · 2025–2026 available</span>
          </span>
          <span><strong>Official</strong> <span class="home-stats__label">district sources</span></span>
          <span><strong>Free</strong> <span class="home-stats__label">calendar downloads</span></span>
        </div>
      </div>

      <div class="site-page-shell">
        <!-- Search -->
        <div class="py-10">
          <div class="relative max-w-xl mx-auto">
            <label for="district-search" class="home-search-label block text-sm font-medium mb-2 text-center">
              Search your school district
            </label>
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rds-ink-dim pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="district-search"
                v-model="searchQuery"
                type="text"
                placeholder="e.g. Miami-Dade, Houston ISD, LAUSD…"
                autocomplete="off"
                class="home-search-input pl-12 pr-4 py-3 text-base"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
              >
              <!-- Results dropdown -->
              <div
                v-if="showDropdown && searchResults.length"
                class="home-search-menu absolute z-10 w-full mt-1"
              >
                <NuxtLink
                  v-for="d in searchResults"
                  :key="d.slug"
                  :to="districtCalendarPath(d)"
                  class="home-directory-row flex items-center justify-between px-5 py-3.5 border-b border-rds-hairline last:border-b-0"
                >
                  <div>
                    <div class="home-directory-row__title font-medium text-sm">{{ d.name }}</div>
                    <div class="home-directory-row__meta text-xs mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
                  </div>
                  <svg class="w-4 h-4 text-rds-ink-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
                <div v-if="searchResults.length === 8" class="px-5 py-2 text-xs text-rds-ink-dim border-t border-rds-hairline bg-rds-surface-panel-2">
                  Showing top results — type more to narrow down
                </div>
              </div>
              <div
                v-else-if="showDropdown && searchQuery.length >= 2 && !searchResults.length"
                class="home-search-menu absolute z-10 w-full mt-1 px-5 py-3.5 text-sm text-rds-ink-muted"
              >
                No districts found matching "{{ searchQuery }}"
              </div>
            </div>
            <!-- Popular searches -->
            <div class="mt-3 flex flex-wrap justify-center gap-2">
              <span class="text-xs text-rds-ink-dim self-center">Popular:</span>
              <NuxtLink
                v-for="d in popularSearches"
                :key="d.slug"
                :to="districtCalendarPath(d)"
                class="home-chip text-xs px-3 py-1.5"
              >
                {{ d.shortName ?? d.name.split(' ').slice(0, 2).join(' ') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- About (before district listing for SEO weight) -->
        <section class="mb-12">
          <h2 class="rds-section-title">Current School Years</h2>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="home-year-card home-year-card--current p-5">
              <div class="rds-data text-lg font-semibold text-rds-ink">2027-2028</div>
              <p class="mt-1 text-sm text-rds-ink-muted">
                Newest school year pages available for {{ yearCoverage.get('2027-2028') ?? 0 }} districts.
              </p>
            </div>
            <div class="home-year-card home-year-card--current p-5">
              <div class="rds-data text-lg font-semibold text-rds-ink">2026-2027</div>
              <p class="mt-1 text-sm text-rds-ink-muted">
                Primary planning year with {{ yearCoverage.get('2026-2027') ?? 0 }} district calendars.
              </p>
            </div>
            <div class="home-year-card p-5">
              <div class="rds-data text-lg font-semibold text-rds-ink">2025-2026</div>
              <p class="mt-1 text-sm text-rds-ink-dim">
                Archive year available for {{ yearCoverage.get('2025-2026') ?? 0 }} districts.
              </p>
            </div>
          </div>
        </section>

        <section class="mb-12">
          <div class="rds-panel p-8">
            <h2 class="rds-section-title mb-5">About US School Calendars</h2>
            <div class="home-about-copy text-sm space-y-4 leading-relaxed">
              <p>
                American public school calendars vary significantly by state, county, and district. While most schools follow a traditional academic year — starting in August or September and ending in May or June — the exact dates for the first day of school, winter break, spring break, and graduation differ from one district to the next.
              </p>
              <p>
                In <strong class="text-gray-800">Florida</strong>, state law requires 180 instructional days and most districts start in mid-August. In <strong class="text-gray-800">Texas</strong>, many districts begin in early August. <strong class="text-gray-800">California</strong> districts vary widely — LAUSD typically starts in September, while Fresno Unified starts in early August. States like <strong class="text-gray-800">New York</strong> and <strong class="text-gray-800">Maryland</strong> traditionally restrict school from starting before Labor Day.
              </p>
              <p>
                Each school board votes on its own calendar, balancing state-mandated instructional day requirements, teacher contract days, local holidays, and community preferences. Spring break — one of the most searched calendar events — typically falls in March or April and lasts one week, with exact dates depending on when Easter falls and district tradition.
              </p>
              <p>
                MySchoolDates aggregates official calendars from America's largest public school districts into one searchable platform. Instead of downloading PDFs from each district's website, parents can find all key dates at a glance and import them directly into Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
          </div>
        </section>

        <!-- Popular Districts -->
        <section class="mb-12">
          <h2 class="rds-section-title">Popular School Districts</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NuxtLink
              v-for="d in popularDistricts"
              :key="d.slug"
              :to="districtCalendarPath(d)"
              class="rds-panel home-directory-row flex items-center justify-between px-5 py-4"
            >
              <div>
                <div class="home-directory-row__title font-medium text-sm">{{ d.name }}</div>
                <div class="home-directory-row__meta text-xs mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
              </div>
              <svg class="w-4 h-4 text-rds-ink-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </section>

        <!-- Browse by State -->
        <section class="mb-16">
          <h2 class="rds-section-title mb-6">Browse by State</h2>
          <div class="space-y-10">
            <div v-for="{ state, districts: stateDistricts } in byState" :key="state">
              <div class="flex items-baseline justify-between mb-1.5">
                <h3 class="text-base font-semibold text-rds-ink">{{ state }}</h3>
                <NuxtLink
                  v-if="STATE_HUBS.has(state)"
                  :to="`/${toStateSlug(state)}`"
                  class="rds-link text-sm flex-shrink-0 ml-4"
                >
                  All {{ state }} districts →
                </NuxtLink>
                <span v-else class="text-sm text-rds-ink-dim flex-shrink-0 ml-4">
                  {{ stateDistricts.length }} {{ stateDistricts.length === 1 ? 'district' : 'districts' }}
                </span>
              </div>
              <p v-if="STATE_SUMMARIES[state]" class="text-sm text-rds-ink-muted mb-3 leading-relaxed">
                {{ STATE_SUMMARIES[state] }}
              </p>
              <div class="rds-panel overflow-hidden">
                <div class="divide-y divide-rds-hairline">
                  <NuxtLink
                    v-for="d in stateDistricts"
                    :key="d.slug"
                    :to="districtCalendarPath(d)"
                    class="home-directory-row flex items-center justify-between px-5 py-3.5"
                  >
                    <div>
                      <div class="home-directory-row__title font-medium text-sm">{{ d.name }}</div>
                      <div class="home-directory-row__meta text-xs mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
                    </div>
                    <svg class="w-4 h-4 text-rds-ink-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Why MySchoolDates -->
        <section class="mb-16">
          <h2 class="rds-section-title mb-5">Why MySchoolDates</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="home-feature-card p-5">
              <h3 class="font-semibold mb-2">Easier than official PDFs</h3>
              <p class="text-sm leading-relaxed">
                District calendar PDFs are designed for printing, not for parents on mobile. MySchoolDates presents the same data in a fast, readable format — searchable, linkable, and importable to any calendar app.
              </p>
            </div>
            <div class="home-feature-card p-5">
              <h3 class="font-semibold mb-2">Add to Google or Apple Calendar</h3>
              <p class="text-sm leading-relaxed">
                Download any district calendar as an ICS file and import it into Google Calendar, Apple Calendar, or Outlook. The file includes key dates such as the first day, holidays, and breaks.
              </p>
            </div>
            <div class="home-feature-card p-5">
              <h3 class="font-semibold mb-2">Verified from official sources</h3>
              <p class="text-sm leading-relaxed">
                All calendar data is sourced from official school district websites and board-approved calendars. Each district page links directly to the official source so you can always cross-check.
              </p>
            </div>
            <div class="home-feature-card p-5">
              <h3 class="font-semibold mb-2">Built for parents, not administrators</h3>
              <p class="text-sm leading-relaxed">
                See the first day of school, last day, spring break, and all holidays in plain language — no navigating confusing district websites or downloading 20-page PDFs to find a single date.
              </p>
            </div>
          </div>
        </section>

        <!-- Trust signals -->
        <div class="home-trust mb-10 flex flex-wrap justify-center gap-5 text-xs">
          <span>Official district sources</span>
          <span>&middot;</span>
          <span>Updated for 2027–2028 &amp; 2026–2027</span>
          <span>&middot;</span>
          <span>{{ districtCount }} districts, {{ stateCount }} states</span>
          <span>&middot;</span>
          <span>Last updated August 2026</span>
        </div>
      </div>
    </main>

  </div>
</template>
