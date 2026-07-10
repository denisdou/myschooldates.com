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
        <nav class="hidden sm:flex items-center gap-5">
          <NuxtLink to="/florida" class="text-sm text-gray-600 hover:text-blue-600 transition-colors">Florida</NuxtLink>
          <NuxtLink to="/texas" class="text-sm text-gray-600 hover:text-blue-600 transition-colors">Texas</NuxtLink>
          <NuxtLink to="/california" class="text-sm text-gray-600 hover:text-blue-600 transition-colors">California</NuxtLink>
          <NuxtLink to="/north-carolina" class="text-sm text-gray-600 hover:text-blue-600 transition-colors hidden md:inline">NC</NuxtLink>
          <NuxtLink to="/virginia" class="text-sm text-gray-600 hover:text-blue-600 transition-colors hidden md:inline">Virginia</NuxtLink>
        </nav>
      </div>
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
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Popular Districts</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/los-angeles-unified-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Los Angeles Unified</NuxtLink></li>
              <li><NuxtLink to="/miami-dade-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Miami-Dade</NuxtLink></li>
              <li><NuxtLink to="/houston-independent-school-district-calendar" class="text-sm text-gray-500 hover:text-blue-600">Houston ISD</NuxtLink></li>
              <li><NuxtLink to="/wake-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Wake County</NuxtLink></li>
              <li><NuxtLink to="/fairfax-county-school-calendar" class="text-sm text-gray-500 hover:text-blue-600">Fairfax County</NuxtLink></li>
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
