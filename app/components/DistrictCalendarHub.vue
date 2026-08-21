<script setup lang="ts">
const props = defineProps<{
  district: {
    name: string
    shortName?: string | null
    slug: string
    state: string
    city?: string | null
    currentSchoolYear: string
    officialWebsite?: string | null
    calendarPage?: string | null
  }
  years: string[]
}>()

const displaySchoolYear = (year: string) => {
  const match = year.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : year.replace('-', '–')
}

const yearStatus = (year: string) => {
  if (year === props.district.currentSchoolYear) return 'Current school year'
  return year > props.district.currentSchoolYear ? 'Upcoming school year' : 'Past school year'
}

const stateSlug = computed(() => props.district.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
const officialCalendarUrl = computed(() => props.district.calendarPage || props.district.officialWebsite || '')
</script>

<template>
  <main class="district-calendar-hub py-8">
    <div class="district-page-inner space-y-8">
      <Breadcrumb :items="[
        { label: 'Home', href: '/' },
        { label: district.state, href: `/${stateSlug}` },
        { label: `${district.name} Calendars` },
      ]" />

      <section class="district-hero rounded-lg border border-rds-hairline bg-rds-surface-panel p-6 sm:p-8">
        <p class="text-xs font-semibold uppercase tracking-wide text-rds-accent">School-year directory</p>
        <h1 class="district-hero__title mt-2">{{ district.name }} Calendars</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-rds-ink-muted">
          Choose a school year to view district dates, breaks, official calendar sources, and available calendar downloads. Each school year has its own permanent page so older calendar information remains available after a new year begins.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink
            :to="districtCalendarPath(district, district.currentSchoolYear)"
            class="rds-button-primary inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-semibold"
          >
            View {{ displaySchoolYear(district.currentSchoolYear) }} calendar
          </NuxtLink>
          <a
            v-if="officialCalendarUrl"
            :href="officialCalendarUrl"
            target="_blank"
            rel="noopener"
            class="rds-button-secondary inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-semibold"
          >
            Official district calendar
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="available-school-years" class="rounded-lg border border-rds-hairline bg-rds-surface-panel p-6">
        <h2 id="available-school-years" class="text-xl font-bold text-rds-ink">Available School Years</h2>
        <p class="mt-2 text-sm leading-relaxed text-rds-ink-muted">
          Select the year that matches the calendar you need. The current school year is listed first.
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="year in years"
            :key="year"
            :to="districtCalendarPath(district, year)"
            class="group rounded-lg border p-5 transition-colors"
            :class="year === district.currentSchoolYear
              ? 'border-[#9fbcbc] bg-[#eef5f4] hover:border-[#6f9b9b]'
              : 'border-rds-hairline bg-rds-surface-panel-2 hover:border-[#b8c9c9] hover:bg-[#f3f0e8]'"
          >
            <div class="rds-data text-lg font-semibold text-rds-ink">{{ displaySchoolYear(year) }}</div>
            <div class="mt-1 text-sm text-rds-ink-dim">{{ yearStatus(year) }}</div>
            <div class="mt-4 text-sm font-semibold text-rds-accent group-hover:underline">View calendar →</div>
          </NuxtLink>
        </div>
      </section>

      <section class="rounded-lg border border-rds-hairline bg-rds-surface-panel p-6">
        <h2 class="text-lg font-semibold text-rds-ink">About These Calendar Pages</h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-rds-ink-muted">
          MySchoolDates reviews school-year records against sources published by {{ district.shortName || district.name }}. Districts may revise calendars after publication, and school-specific schedules can differ from districtwide dates. Confirm campus events and last-minute changes with the district or school.
        </p>
        <div v-if="district.city" class="mt-4 text-sm text-rds-ink-dim">
          {{ district.city }}, {{ district.state }}
        </div>
      </section>
    </div>
  </main>
</template>
