<script setup lang="ts">
const route = useRoute()

const statePageNames: Record<string, string> = {
  california: 'California',
  florida: 'Florida',
  texas: 'Texas',
  'north-carolina': 'North Carolina',
  virginia: 'Virginia',
  kentucky: 'Kentucky',
  illinois: 'Illinois',
  nevada: 'Nevada',
  georgia: 'Georgia',
  hawaii: 'Hawaii',
  'new-york': 'New York',
  pennsylvania: 'Pennsylvania',
  maryland: 'Maryland',
}

const currentStateSlug = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')
const currentStateName = computed(() => statePageNames[currentStateSlug.value] ?? '')
const isStateLandingPage = computed(() => route.path === `/${currentStateSlug.value}` && !!currentStateName.value)
const mobileMenuOpen = ref(false)

const stateLinks = [
  { slug: 'florida', name: 'Florida' },
  { slug: 'texas', name: 'Texas' },
  { slug: 'california', name: 'California' },
  { slug: 'new-york', name: 'New York' },
  { slug: 'illinois', name: 'Illinois' },
  { slug: 'georgia', name: 'Georgia' },
  { slug: 'nevada', name: 'Nevada' },
  { slug: 'north-carolina', name: 'North Carolina' },
  { slug: 'virginia', name: 'Virginia' },
  { slug: 'kentucky', name: 'Kentucky' },
  { slug: 'hawaii', name: 'Hawaii' },
  { slug: 'pennsylvania', name: 'Pennsylvania' },
  { slug: 'maryland', name: 'Maryland' },
]

const primaryStateLinks = stateLinks.slice(0, 3)

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Shared Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 flex-shrink-0">
          <img src="/icons/myschooldates-logo.svg" alt="MySchoolDates" class="h-8 w-auto" />
          <span class="text-xl font-bold text-gray-900">MySchoolDates</span>
          <span class="text-sm text-gray-400 hidden lg:inline">US School Calendar Platform</span>
        </NuxtLink>
        <!-- State navigation -->
        <nav class="hidden sm:flex items-center gap-4">
          <NuxtLink
            v-for="state in primaryStateLinks"
            :key="state.slug"
            :to="`/${state.slug}`"
            class="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {{ state.name }}
          </NuxtLink>
          <div class="relative group">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-haspopup="true"
            >
              <span>More States</span>
              <svg class="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="invisible absolute right-0 top-full z-30 w-64 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div class="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <NuxtLink
                  v-for="state in stateLinks"
                  :key="state.slug"
                  :to="`/${state.slug}`"
                  class="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  {{ state.name }} School Calendars
                </NuxtLink>
              </div>
            </div>
          </div>
        </nav>
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 sm:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Open navigation menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg v-if="!mobileMenuOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
      </div>
      <nav v-if="mobileMenuOpen" class="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
        <div class="mx-auto grid max-w-5xl grid-cols-2 gap-2">
          <NuxtLink
            v-for="state in stateLinks"
            :key="state.slug"
            :to="`/${state.slug}`"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
          >
            {{ state.name }}
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- Page content -->
    <div class="flex-1">
      <slot />
    </div>

    <!-- Shared Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Popular States</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/california" class="text-sm text-gray-500 hover:text-blue-600">California School Calendars</NuxtLink></li>
              <li><NuxtLink to="/florida" class="text-sm text-gray-500 hover:text-blue-600">Florida School Calendars</NuxtLink></li>
              <li><NuxtLink to="/texas" class="text-sm text-gray-500 hover:text-blue-600">Texas School Calendars</NuxtLink></li>
              <li><NuxtLink to="/north-carolina" class="text-sm text-gray-500 hover:text-blue-600">North Carolina School Calendars</NuxtLink></li>
              <li><NuxtLink to="/virginia" class="text-sm text-gray-500 hover:text-blue-600">Virginia School Calendars</NuxtLink></li>
              <li><NuxtLink to="/kentucky" class="text-sm text-gray-500 hover:text-blue-600">Kentucky School Calendars</NuxtLink></li>
              <li><NuxtLink to="/illinois" class="text-sm text-gray-500 hover:text-blue-600">Illinois School Calendars</NuxtLink></li>
              <li><NuxtLink to="/nevada" class="text-sm text-gray-500 hover:text-blue-600">Nevada School Calendars</NuxtLink></li>
              <li><NuxtLink to="/georgia" class="text-sm text-gray-500 hover:text-blue-600">Georgia School Calendars</NuxtLink></li>
              <li><NuxtLink to="/hawaii" class="text-sm text-gray-500 hover:text-blue-600">Hawaii School Calendars</NuxtLink></li>
              <li><NuxtLink to="/new-york" class="text-sm text-gray-500 hover:text-blue-600">New York School Calendars</NuxtLink></li>
              <li><NuxtLink to="/pennsylvania" class="text-sm text-gray-500 hover:text-blue-600">Pennsylvania School Calendars</NuxtLink></li>
              <li><NuxtLink to="/maryland" class="text-sm text-gray-500 hover:text-blue-600">Maryland School Calendars</NuxtLink></li>
            </ul>
          </div>
          <div v-if="!isStateLandingPage">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Popular Districts</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/los-angeles-unified-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Los Angeles Unified</NuxtLink></li>
              <li><NuxtLink to="/miami-dade-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Miami-Dade School Calendar</NuxtLink></li>
              <li><NuxtLink to="/houston-independent-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Houston ISD</NuxtLink></li>
              <li><NuxtLink to="/wake-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Wake County</NuxtLink></li>
              <li><NuxtLink to="/fairfax-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Fairfax County</NuxtLink></li>
            </ul>
          </div>
          <div v-else>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ currentStateName }} Resources</h4>
            <ul class="space-y-2">
              <li><NuxtLink :to="`/${currentStateSlug}`" class="text-sm text-gray-500 hover:text-blue-600">{{ currentStateName }} District Calendars</NuxtLink></li>
              <li><NuxtLink to="/calendar-verification-methodology" class="text-sm text-gray-500 hover:text-blue-600">Verification Methodology</NuxtLink></li>
              <li><NuxtLink to="/editorial-policy" class="text-sm text-gray-500 hover:text-blue-600">Editorial Policy</NuxtLink></li>
              <li><a href="mailto:hello@myschooldates.com?subject=Calendar%20Correction" class="text-sm text-gray-500 hover:text-blue-600">Report a Calendar Correction</a></li>
            </ul>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <NuxtLink to="/" class="flex items-center gap-2 mb-3">
              <img src="/icons/myschooldates-logo.svg" alt="MySchoolDates" class="h-7 w-auto" />
              <span class="text-sm font-semibold text-gray-700">MySchoolDates</span>
            </NuxtLink>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              US School Calendar Platform. All data is sourced from official school district websites.
              Dates are subject to board approval — always verify with your district before making plans.
            </p>
            <ul class="space-y-2">
              <li><NuxtLink to="/about" class="text-sm text-gray-500 hover:text-blue-600">About</NuxtLink></li>
              <li><NuxtLink to="/calendar-verification-methodology" class="text-sm text-gray-500 hover:text-blue-600">Verification Methodology</NuxtLink></li>
              <li><NuxtLink to="/editorial-policy" class="text-sm text-gray-500 hover:text-blue-600">Editorial Policy</NuxtLink></li>
              <li><a href="mailto:hello@myschooldates.com?subject=Calendar%20Correction" class="text-sm text-gray-500 hover:text-blue-600">Report a Correction</a></li>
              <li><NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-blue-600">Terms of Service</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} MySchoolDates &mdash; US School Calendar Platform</p>
        </div>
      </div>
    </footer>
  </div>
</template>
