<script setup lang="ts">
const { data: districts } = await useAsyncData(
  'districts-list',
  () => queryCollection('districts').order('name', 'ASC').all()
)

const toStateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

// State display order by search volume, not alphabet
const STATE_ORDER = [
  'California', 'Florida', 'Texas', 'New York',
  'Illinois', 'North Carolina', 'Nevada', 'Virginia', 'Maryland',
]

const STATE_SUMMARIES: Record<string, string> = {
  California: `California's public school system is the largest in the nation, serving more than 6 million K–12 students across over 1,000 school districts. Unlike most states, California has no uniform start date — districts set their own calendars independently. Los Angeles Unified, the second-largest district in the country, typically begins in early September. Many Central Valley districts, including Fresno Unified, start in early August. The school year generally runs through June, with winter break in late December and spring break in March or April. California requires a minimum of 180 instructional days.`,
  Florida: `Florida public schools serve more than 3 million students across 67 county-based school districts. State law mandates 180 instructional days, and most districts start school in the second week of August — earlier than most states. The Miami-Dade, Broward, and Palm Beach districts form one of the densest concentrations of students in the country. Florida's school year typically ends in early June. Hurricane season occasionally disrupts the calendar; some districts build in makeup days. Spring break typically falls in March, and winter break runs from late December through early January.`,
  Texas: `Texas has over 1,000 independent school districts (ISDs), each governed by its own elected board. The state requires 180 instructional days, and most districts start in early-to-mid August — Houston ISD, Dallas ISD, and most San Antonio-area districts typically begin around August 11. Unlike some states, Texas has no law restricting the start date, so a few districts open as early as late July. Spring break falls in mid-March across most Texas ISDs. Good Friday is an official school holiday in most Texas districts. Summer break begins in late May or early June.`,
  'New York': `New York State serves approximately 2.6 million public school students across more than 700 school districts. State regulations historically prohibited schools from opening before Labor Day, making New York one of the last states to start the school year. New York City Public Schools — the largest district in the country with over 1 million students — typically begins in early September. The school year runs through late June, covering 180 instructional days. Winter recess spans roughly two weeks in late December. Spring recess typically falls in late March or early April.`,
  Illinois: `Illinois public schools serve approximately 1.8 million students across more than 800 school districts. Chicago Public Schools, the third-largest district in the country, typically starts in late August and runs through mid-June. Illinois requires students to attend a minimum of 180 days. Winter break spans late December through early January. Spring break varies by district but generally falls in late March or early April. The Chicago metro area has some of the most searched school calendar dates in the Midwest.`,
  'North Carolina': `North Carolina requires 185 instructional days for students — more than the national standard of 180. Most districts start in mid-to-late August. A distinctive feature of the NC school calendar is a fall break in October, typically one week long, in addition to standard Thanksgiving, winter, and spring breaks. Wake County and Charlotte-Mecklenburg Schools are the two largest districts, together serving nearly 300,000 students. Spring break generally falls in mid-March. The school year ends in early June.`,
  Nevada: `Nevada's largest district, Clark County School District (Las Vegas), serves over 300,000 students and is one of the ten largest in the United States. CCSD typically starts school in early August — earlier than most states — and ends in late May. The district observes Nevada Day (last Friday of October) in addition to standard federal holidays. Spring break falls in late March or early April. The Clark County calendar is closely watched by families across the Las Vegas metro area, which includes Henderson, North Las Vegas, and surrounding communities.`,
  Virginia: `Virginia school divisions set their own academic calendars. Most begin in late August and end in mid-June. Fairfax County Public Schools, located in Northern Virginia's DC suburbs, is the tenth-largest school district in the country and consistently ranks among the top academic performers nationally. Virginia school divisions observe all federal holidays plus scheduled teacher workdays throughout the year. The DC metro area — including Fairfax and neighboring districts — tends to have high parental interest in precise calendar dates for childcare and travel planning.`,
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
  return STATE_ORDER
    .filter(s => map.has(s))
    .map(s => ({ state: s, districts: map.get(s)! }))
})

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
  title: 'US School Calendars 2025–2026 | Holidays, Breaks & Key Dates | MySchoolDates',
  description: 'School calendars for 30+ US public school districts. Find school start dates, spring break, winter break, and all holidays. Add to Google Calendar or Apple Calendar.',
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
      <section class="bg-white border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-14 text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            US School Calendar Platform
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Browse official school calendars for America's largest public school districts.
            Find school start dates, holidays, and spring break — then add them to Google Calendar.
          </p>
          <div class="flex flex-wrap justify-center gap-x-8 gap-y-2.5 text-sm text-gray-600">
            <span class="flex items-center gap-1.5"><span class="text-green-500 font-bold">✓</span> School start &amp; end dates</span>
            <span class="flex items-center gap-1.5"><span class="text-green-500 font-bold">✓</span> Holidays &amp; breaks</span>
            <span class="flex items-center gap-1.5"><span class="text-green-500 font-bold">✓</span> Add to Google Calendar</span>
            <span class="flex items-center gap-1.5"><span class="text-green-500 font-bold">✓</span> Official district sources</span>
            <span class="flex items-center gap-1.5"><span class="text-green-500 font-bold">✓</span> Free forever</span>
          </div>
        </div>
      </section>

      <!-- Stats bar -->
      <div class="bg-gray-900 text-white">
        <div class="max-w-4xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm">
          <span><strong class="text-white">30</strong> <span class="text-gray-400">school districts</span></span>
          <span><strong class="text-white">9</strong> <span class="text-gray-400">states</span></span>
          <span><strong class="text-white">2025–2026</strong> <span class="text-gray-400">&amp; 2026–2027</span></span>
          <span><strong class="text-white">Official</strong> <span class="text-gray-400">district sources</span></span>
          <span><strong class="text-white">Free</strong> <span class="text-gray-400">calendar downloads</span></span>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4">
        <!-- Search -->
        <div class="py-10">
          <div class="relative max-w-xl mx-auto">
            <label for="district-search" class="block text-sm font-medium text-gray-700 mb-2 text-center">
              Search your school district
            </label>
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="district-search"
                v-model="searchQuery"
                type="text"
                placeholder="e.g. Miami-Dade, Houston ISD, LAUSD…"
                autocomplete="off"
                class="w-full pl-12 pr-4 py-4 text-base rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
              >
              <!-- Results dropdown -->
              <div
                v-if="showDropdown && searchResults.length"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
              >
                <NuxtLink
                  v-for="d in searchResults"
                  :key="d.slug"
                  :to="`/${d.slug}`"
                  class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div class="font-medium text-gray-900 text-sm">{{ d.name }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
                <div v-if="searchResults.length === 8" class="px-5 py-2 text-xs text-gray-400 border-t border-gray-100">
                  Showing top results — type more to narrow down
                </div>
              </div>
              <div
                v-else-if="showDropdown && searchQuery.length >= 2 && !searchResults.length"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-3.5 text-sm text-gray-500"
              >
                No districts found matching "{{ searchQuery }}"
              </div>
            </div>
            <!-- Popular searches -->
            <div class="mt-3 flex flex-wrap justify-center gap-2">
              <span class="text-xs text-gray-400 self-center">Popular:</span>
              <NuxtLink
                v-for="d in popularSearches"
                :key="d.slug"
                :to="`/${d.slug}`"
                class="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {{ d.shortName ?? d.name.split(' ').slice(0, 2).join(' ') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- About (before district listing for SEO weight) -->
        <section class="mb-12">
          <div class="bg-white rounded-xl border border-gray-200 p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-5">About US School Calendars</h2>
            <div class="text-sm text-gray-600 space-y-4 leading-relaxed">
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
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Popular School Districts</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NuxtLink
              v-for="d in popularDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div>
                <div class="font-medium text-gray-900 text-sm">{{ d.name }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
              </div>
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </section>

        <!-- Browse by State -->
        <section class="mb-16">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Browse by State</h2>
          <div class="space-y-10">
            <div v-for="{ state, districts: stateDistricts } in byState" :key="state">
              <div class="flex items-baseline justify-between mb-1.5">
                <h3 class="text-base font-semibold text-gray-900">{{ state }}</h3>
                <NuxtLink
                  :to="`/${toStateSlug(state)}`"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 ml-4"
                >
                  All {{ state }} districts →
                </NuxtLink>
              </div>
              <p v-if="STATE_SUMMARIES[state]" class="text-sm text-gray-500 mb-3 leading-relaxed">
                {{ STATE_SUMMARIES[state] }}
              </p>
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="divide-y divide-gray-50">
                  <NuxtLink
                    v-for="d in stateDistricts"
                    :key="d.slug"
                    :to="`/${d.slug}`"
                    class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div class="font-medium text-gray-900 text-sm">{{ d.name }}</div>
                      <div class="text-xs text-gray-400 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ d.state }}</div>
                    </div>
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <h2 class="text-xl font-semibold text-gray-900 mb-5">Why MySchoolDates</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="font-semibold text-gray-900 mb-2">Easier than official PDFs</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                District calendar PDFs are designed for printing, not for parents on mobile. MySchoolDates presents the same data in a fast, readable format — searchable, linkable, and importable to any calendar app.
              </p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="font-semibold text-gray-900 mb-2">Add to Google or Apple Calendar</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                Download any district calendar as an ICS file and import it into Google Calendar, Apple Calendar, or Outlook. The file includes key dates such as the first day, holidays, and breaks.
              </p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="font-semibold text-gray-900 mb-2">Verified from official sources</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                All calendar data is sourced from official school district websites and board-approved calendars. Each district page links directly to the official source so you can always cross-check.
              </p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="font-semibold text-gray-900 mb-2">Built for parents, not administrators</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                See the first day of school, last day, spring break, and all holidays in plain language — no navigating confusing district websites or downloading 20-page PDFs to find a single date.
              </p>
            </div>
          </div>
        </section>

        <!-- Trust signals -->
        <div class="mb-10 flex flex-wrap justify-center gap-5 text-xs text-gray-400">
          <span>Official district sources</span>
          <span>&middot;</span>
          <span>Updated for 2025–2026 &amp; 2026–2027</span>
          <span>&middot;</span>
          <span>25 districts, 9 states</span>
          <span>&middot;</span>
          <span>Last updated July 2026</span>
        </div>
      </div>
    </main>

  </div>
</template>
