<script setup lang="ts">
const route = useRoute()

const stateLinks = [
  { slug: 'arizona', name: 'Arizona' },
  { slug: 'california', name: 'California' },
  { slug: 'colorado', name: 'Colorado' },
  { slug: 'florida', name: 'Florida' },
  { slug: 'georgia', name: 'Georgia' },
  { slug: 'hawaii', name: 'Hawaii' },
  { slug: 'idaho', name: 'Idaho' },
  { slug: 'illinois', name: 'Illinois' },
  { slug: 'kentucky', name: 'Kentucky' },
  { slug: 'maryland', name: 'Maryland' },
  { slug: 'massachusetts', name: 'Massachusetts' },
  { slug: 'michigan', name: 'Michigan' },
  { slug: 'minnesota', name: 'Minnesota' },
  { slug: 'nevada', name: 'Nevada' },
  { slug: 'new-mexico', name: 'New Mexico' },
  { slug: 'new-york', name: 'New York' },
  { slug: 'north-carolina', name: 'North Carolina' },
  { slug: 'ohio', name: 'Ohio' },
  { slug: 'oregon', name: 'Oregon' },
  { slug: 'pennsylvania', name: 'Pennsylvania' },
  { slug: 'texas', name: 'Texas' },
  { slug: 'utah', name: 'Utah' },
  { slug: 'virginia', name: 'Virginia' },
  { slug: 'washington', name: 'Washington' },
]

const statePageNames = Object.fromEntries(stateLinks.map(state => [state.slug, state.name])) as Record<string, string>
const currentStateSlug = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')
const currentStateName = computed(() => statePageNames[currentStateSlug.value] ?? '')
const isStateLandingPage = computed(() => route.path === `/${currentStateSlug.value}` && !!currentStateName.value)
const mobileMenuOpen = ref(false)
const activeDesktopMenu = ref<'states' | 'calendar' | null>(null)

const calendarDataLinks = [
  {
    to: '/school-calendar-trends',
    name: 'Trends Hub',
    description: 'Reports, charts, and analysis',
  },
  {
    to: '/datasets/school-calendar-trends',
    name: 'Dataset',
    description: 'CSV data and citation details',
  },
  {
    to: '/school-calendar-trends/2026-2027-report',
    name: '2026-2027 Report',
    description: 'Full national trends report',
  },
]

const navigateCalendarData = async (to: string) => {
  mobileMenuOpen.value = false
  activeDesktopMenu.value = null
  await navigateTo(to)
}

const closeDesktopMenu = () => {
  activeDesktopMenu.value = null
}

const handleDesktopMenuFocusout = (event: FocusEvent) => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (!currentTarget || !relatedTarget || !currentTarget.contains(relatedTarget)) {
    closeDesktopMenu()
  }
}

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
  activeDesktopMenu.value = null
})
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--background))] text-rds-ink flex flex-col">
    <!-- Shared Header -->
    <header class="site-header">
      <div class="site-page-shell site-header__row flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="site-brand flex items-center gap-2.5 flex-shrink-0">
          <img src="/icons/myschooldates-logo.svg" alt="MySchoolDates" class="h-8 w-auto" />
          <span class="site-brand__name">MySchoolDates</span>
          <span class="site-brand__tagline hidden lg:inline">US School Calendar Platform</span>
        </NuxtLink>
        <!-- Main navigation -->
        <nav class="hidden sm:flex items-center gap-6">
          <NuxtLink
            to="/"
            class="site-nav-link"
          >
            Home
          </NuxtLink>
          <div
            class="relative"
            @mouseenter="activeDesktopMenu = 'states'"
            @mouseleave="closeDesktopMenu"
            @focusout="handleDesktopMenuFocusout"
            @keydown.escape.stop="closeDesktopMenu"
          >
            <button
              type="button"
              id="states-menu-button"
              class="site-nav-link gap-1"
              :aria-expanded="activeDesktopMenu === 'states'"
              aria-controls="states-menu"
              @click="activeDesktopMenu = 'states'"
              @focus="activeDesktopMenu = 'states'"
            >
              <span>States</span>
              <svg class="h-4 w-4 transition-transform" :class="{ 'rotate-180': activeDesktopMenu === 'states' }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
              </svg>
            </button>
            <div
              id="states-menu"
              aria-labelledby="states-menu-button"
              v-show="activeDesktopMenu === 'states'"
              class="absolute left-0 top-full z-30 w-[34rem] pt-3"
            >
              <div class="site-menu-panel grid grid-cols-3 gap-1 p-2">
                <NuxtLink
                  v-for="state in stateLinks"
                  :key="state.slug"
                  :to="`/${state.slug}`"
                  class="site-menu-item px-3 py-2 text-sm"
                  @click="closeDesktopMenu"
                >
                  {{ state.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
          <NuxtLink
            to="/districts"
            class="site-nav-link"
          >
            Districts
          </NuxtLink>
          <div
            class="relative"
            @mouseenter="activeDesktopMenu = 'calendar'"
            @mouseleave="closeDesktopMenu"
            @focusout="handleDesktopMenuFocusout"
            @keydown.escape.stop="closeDesktopMenu"
          >
            <button
              type="button"
              id="calendar-data-menu-button"
              class="site-nav-link gap-1"
              :aria-expanded="activeDesktopMenu === 'calendar'"
              aria-controls="calendar-data-menu"
              @click="activeDesktopMenu = 'calendar'"
              @focus="activeDesktopMenu = 'calendar'"
            >
              <span>Calendar Data</span>
              <svg class="h-4 w-4 transition-transform" :class="{ 'rotate-180': activeDesktopMenu === 'calendar' }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
              </svg>
            </button>
            <div
              id="calendar-data-menu"
              aria-labelledby="calendar-data-menu-button"
              v-show="activeDesktopMenu === 'calendar'"
              class="absolute right-0 top-full z-30 w-72 pt-3"
            >
              <div class="site-menu-panel p-2">
                <NuxtLink
                  v-for="link in calendarDataLinks"
                  :key="link.to"
                  :to="link.to"
                  class="site-menu-item block px-3 py-2.5"
                  @click.prevent="navigateCalendarData(link.to)"
                >
                  <span class="site-menu-item__title block text-sm font-semibold">{{ link.name }}</span>
                  <span class="site-menu-item__description block text-xs">{{ link.description }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </nav>
        <button
          type="button"
          class="rds-icon-button sm:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-navigation"
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
      <nav id="mobile-navigation" v-show="mobileMenuOpen" class="site-mobile-nav px-4 py-3 sm:hidden">
        <div class="site-page-shell space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <NuxtLink
              to="/"
              class="site-menu-item px-3 py-2 text-sm font-medium"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/districts"
              class="site-menu-item px-3 py-2 text-sm font-medium"
            >
              Districts
            </NuxtLink>
          </div>
          <div>
            <p class="site-mobile-nav__label px-3 pb-1 text-xs font-semibold uppercase tracking-wide">Calendar Data</p>
            <div class="grid grid-cols-1 gap-2">
              <NuxtLink
                v-for="link in calendarDataLinks"
                :key="link.to"
                :to="link.to"
                class="site-menu-item px-3 py-2 text-sm font-medium"
                @click.prevent="navigateCalendarData(link.to)"
              >
                <span class="block">{{ link.name }}</span>
                <span class="site-menu-item__description block text-xs font-normal">{{ link.description }}</span>
              </NuxtLink>
            </div>
          </div>
          <div>
            <p class="site-mobile-nav__label px-3 pb-1 text-xs font-semibold uppercase tracking-wide">States</p>
            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                v-for="state in stateLinks"
                :key="state.slug"
                :to="`/${state.slug}`"
                class="site-menu-item px-3 py-2 text-sm font-medium"
              >
                {{ state.name }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Page content -->
    <slot />

    <!-- Shared Footer -->
    <footer class="site-footer">
      <div class="site-page-shell py-10">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p class="site-footer__heading text-sm font-semibold mb-3">Popular States</p>
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
            <p class="site-footer__heading text-sm font-semibold mb-3">Popular Districts</p>
            <ul class="space-y-2">
              <li><NuxtLink to="/los-angeles-unified-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Los Angeles Unified</NuxtLink></li>
              <li><NuxtLink to="/miami-dade-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Miami-Dade School Calendar</NuxtLink></li>
              <li><NuxtLink to="/houston-independent-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Houston ISD</NuxtLink></li>
              <li><NuxtLink to="/wake-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Wake County</NuxtLink></li>
              <li><NuxtLink to="/fairfax-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Fairfax County</NuxtLink></li>
              <li><NuxtLink to="/rosemount-apple-valley-eagan-public-schools-calendar" class="text-sm text-gray-500 hover:text-blue-600">District 196 Calendar</NuxtLink></li>
            </ul>
          </div>
          <div v-else>
            <p class="site-footer__heading text-sm font-semibold mb-3">{{ currentStateName }} Resources</p>
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
              <span class="site-footer__brand text-sm font-semibold">MySchoolDates</span>
            </NuxtLink>
            <p class="site-footer__copy text-sm leading-relaxed mb-4">
              US School Calendar Platform. Calendar information is based on official school district sources.
              Districts may revise calendars after publication — always verify with your district before making plans.
            </p>
            <ul class="space-y-2">
              <li><NuxtLink to="/about" class="text-sm text-gray-500 hover:text-blue-600">About</NuxtLink></li>
              <li><NuxtLink to="/author" class="text-sm text-gray-500 hover:text-blue-600">Author</NuxtLink></li>
              <li><NuxtLink to="/school-calendar-trends" class="text-sm text-gray-500 hover:text-blue-600">School Calendar Trends</NuxtLink></li>
              <li><NuxtLink to="/datasets/school-calendar-trends" class="text-sm text-gray-500 hover:text-blue-600">Calendar Trends Dataset</NuxtLink></li>
              <li><NuxtLink to="/calendar-verification-methodology" class="text-sm text-gray-500 hover:text-blue-600">Verification Methodology</NuxtLink></li>
              <li><NuxtLink to="/editorial-policy" class="text-sm text-gray-500 hover:text-blue-600">Editorial Policy</NuxtLink></li>
              <li><a href="mailto:hello@myschooldates.com?subject=Calendar%20Correction" class="text-sm text-gray-500 hover:text-blue-600">Report a Correction</a></li>
              <li><NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-blue-600">Terms of Service</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="site-footer__bottom pt-6 text-center text-xs">
          <p>&copy; {{ new Date().getFullYear() }} MySchoolDates &mdash; US School Calendar Platform</p>
        </div>
      </div>
    </footer>
  </div>
</template>
