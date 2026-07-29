<script setup lang="ts">
const districtLinks = [
  {
    name: 'San Juan Unified School District',
    shortName: 'San Juan Unified',
    to: '/san-juan-unified-school-district-calendar',
    area: 'Carmichael and northeastern Sacramento County',
    note: 'Student calendar with translated PDF links, Presidents Week Break, Spring Break, no-school days, and ICS download.',
  },
  {
    name: 'Sacramento City Unified School District',
    shortName: 'SCUSD',
    to: '/sacramento-city-unified-school-calendar',
    area: 'Sacramento',
    note: 'City district calendar for Sacramento families comparing first day, breaks, school choice timing, and major holidays.',
  },
  {
    name: 'Elk Grove Unified School District',
    shortName: 'EGUSD',
    to: '/elk-grove-unified-school-district-calendar',
    area: 'Elk Grove and south Sacramento County',
    note: 'Traditional calendar reference with reminders to verify Modified Traditional and A/B/C/D track calendars when applicable.',
  },
]

useSeoMeta({
  title: 'Sacramento Area School Calendars 2026-2027 | San Juan, SCUSD & Elk Grove',
  description: 'Compare Sacramento area school calendars for San Juan Unified, Sacramento City Unified, and Elk Grove Unified with first day, holidays, breaks, PDFs, and ICS downloads.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://myschooldates.com/sacramento-school-calendar' }],
})
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <section class="bg-white border-b border-gray-100">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <NuxtLink to="/california" class="text-sm font-medium text-blue-600 hover:underline">
          California school calendars
        </NuxtLink>
        <h1 class="mt-3 text-4xl font-bold text-gray-900 tracking-tight">
          Sacramento Area School Calendars 2026-2027
        </h1>
        <p class="mt-4 text-lg text-gray-600 leading-relaxed max-w-3xl">
          Compare Sacramento area school calendar pages currently available on MySchoolDates, including San Juan Unified, Sacramento City Unified, and Elk Grove Unified. Use each district page for verified first day, last day, holidays, breaks, PDF links, and ICS calendar downloads.
        </p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <section class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Sacramento Area Calendar Links
        </h2>
        <div class="grid gap-4">
          <NuxtLink
            v-for="district in districtLinks"
            :key="district.to"
            :to="district.to"
            class="block rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ district.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ district.area }}</p>
              </div>
              <span class="text-sm font-medium text-blue-600">{{ district.shortName }} calendar</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mt-3">{{ district.note }}</p>
          </NuxtLink>
        </div>
      </section>

      <section class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-3">
          Why Sacramento Area Dates Need Separate Checks
        </h2>
        <p class="text-gray-600 leading-relaxed">
          Sacramento area districts set their own calendars. San Juan Unified, Sacramento City Unified, and Elk Grove Unified can differ on the first day of school, Spring Break timing, no-school days, teacher work days, and track or program calendars. Families with students, childcare providers, or activities across multiple districts should verify each district separately before making travel or childcare plans.
        </p>
      </section>

      <section class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-3">
          Verification
        </h2>
        <p class="text-gray-600 leading-relaxed">
          MySchoolDates links each Sacramento area calendar page to official district sources and review notes. Use the district page for the reviewed PDF source, calendar file, last reviewed date, and correction process.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink to="/calendar-verification-methodology" class="text-sm font-medium text-blue-600 hover:underline">
            Calendar Verification Methodology
          </NuxtLink>
          <NuxtLink to="/editorial-policy" class="text-sm font-medium text-blue-600 hover:underline">
            Editorial Policy
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>
