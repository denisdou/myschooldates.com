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
  <main id="top" class="bg-gray-50">
    <article class="site-page-shell py-10">
      <Breadcrumb
        class="mb-6"
        :items="[
          { label: 'Home', href: '/' },
          { label: 'California School Calendars', href: '/california' },
          { label: 'Sacramento Area School Calendars' },
        ]"
      />

      <header class="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Regional Calendar Guide</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Sacramento Area School Calendars 2026-2027
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Compare Sacramento area school calendar pages currently available on MySchoolDates, including San Juan Unified, Sacramento City Unified, and Elk Grove Unified. Use each district page for verified first day, last day, holidays, breaks, PDF links, and ICS calendar downloads.
        </p>
      </header>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">
          Sacramento Area Calendar Links
        </h2>
        <div class="mt-5 grid gap-4">
          <NuxtLink
            v-for="district in districtLinks"
            :key="district.to"
            :to="district.to"
            class="block rounded-lg border border-gray-200 p-5 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ district.name }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ district.area }}</p>
              </div>
              <span class="text-sm font-medium text-blue-600">{{ district.shortName }} calendar</span>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ district.note }}</p>
          </NuxtLink>
        </div>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">
          Why Sacramento Area Dates Need Separate Checks
        </h2>
        <p class="mt-3 leading-relaxed text-gray-600">
          Sacramento area districts set their own calendars. San Juan Unified, Sacramento City Unified, and Elk Grove Unified can differ on the first day of school, Spring Break timing, no-school days, teacher work days, and track or program calendars. Families with students, childcare providers, or activities across multiple districts should verify each district separately before making travel or childcare plans.
        </p>
      </section>

      <section class="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">
          Verification
        </h2>
        <p class="mt-3 leading-relaxed text-gray-600">
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
    </article>
  </main>
</template>
