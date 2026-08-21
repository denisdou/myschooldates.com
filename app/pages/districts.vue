<script setup lang="ts">
const { data: districts } = await useAsyncData(
  'districts-directory',
  () => queryCollection('districts').order('name', 'ASC').all()
)

const searchQuery = ref('')
const selectedState = ref('All states')
const currentPage = ref(1)
const pageSize = 18

const allDistricts = computed(() => districts.value ?? [])
const states = computed(() => {
  const names = new Set(allDistricts.value.map(d => d.state).filter(Boolean))
  return ['All states', ...Array.from(names).sort()]
})

const filteredDistricts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allDistricts.value.filter((district) => {
    const matchesState = selectedState.value === 'All states' || district.state === selectedState.value
    const haystack = [
      district.name,
      district.shortName,
      district.city,
      district.county,
      district.state,
      district.stateCode,
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesState && (!q || haystack.includes(q))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDistricts.value.length / pageSize)))
const paginatedDistricts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDistricts.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = new Set<number>([1, totalPages.value, currentPage.value])
  for (const offset of [-2, -1, 1, 2]) {
    const page = currentPage.value + offset
    if (page >= 1 && page <= totalPages.value) pages.add(page)
  }
  return Array.from(pages).sort((a, b) => a - b)
})

watch([searchQuery, selectedState], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

const setPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

useSeoMeta({
  title: 'School District Calendar Directory | MySchoolDates',
  description: 'Browse school calendar pages by district. Find official school start dates, holidays, breaks, PDFs, and calendar downloads for U.S. public school districts.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'School District Calendar Directory',
      description: 'Directory of U.S. public school district calendar pages on MySchoolDates.',
      url: 'https://myschooldates.com/districts',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: allDistricts.value.length,
        itemListElement: allDistricts.value.slice(0, 100).map((district, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: district.name,
          url: `https://myschooldates.com${districtCalendarPath(district)}`,
        })),
      },
    }),
  }],
})
</script>

<template>
  <main class="directory-page">
    <section class="directory-hero">
      <div class="site-page-shell py-12">
        <p class="directory-kicker font-semibold uppercase">District Directory</p>
        <div class="mt-3 grid gap-6 md:grid-cols-[1fr_18rem] md:items-end">
          <div>
            <h1 class="directory-title">School District Calendars</h1>
            <p class="directory-lead mt-4 max-w-2xl text-base leading-relaxed">
              Browse verified school calendar pages for U.S. public school districts. Each card links to official-source calendar dates, PDFs, holidays, breaks, and calendar exports when available.
            </p>
          </div>
          <div class="directory-count p-4">
            <div class="rds-data text-3xl font-bold text-rds-ink">{{ allDistricts.length }}</div>
            <div class="mt-1 text-sm text-rds-ink-dim">district calendar pages</div>
          </div>
        </div>
      </div>
    </section>

    <section class="site-page-shell py-8">
      <div class="grid gap-3 md:grid-cols-[1fr_14rem]">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-rds-ink-muted">Search districts</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by district, city, county, or state"
            class="directory-control w-full px-4 py-2.5 text-sm"
          >
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-rds-ink-muted">State</span>
          <select
            v-model="selectedState"
            class="directory-control w-full px-4 py-2.5 text-sm"
          >
            <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
          </select>
        </label>
      </div>

      <div class="rds-data mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-rds-ink-dim">
        <span>
          Showing {{ paginatedDistricts.length }} of {{ filteredDistricts.length }} districts
        </span>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
      </div>

      <div v-if="paginatedDistricts.length" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="district in paginatedDistricts"
          :key="district.slug"
          :to="districtCalendarPath(district)"
          class="directory-card group flex min-h-44 flex-col p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold leading-snug text-rds-ink group-hover:text-rds-accent">
                {{ district.name }}
              </h2>
              <p class="mt-1 text-sm text-rds-ink-dim">
                {{ district.city ? `${district.city}, ` : '' }}{{ district.state }}
              </p>
            </div>
            <span class="rounded-rds border border-rds-hairline bg-rds-surface-panel-2 px-2 py-1 text-xs font-semibold text-rds-ink-dim">{{ district.stateCode }}</span>
          </div>
          <p class="mt-4 line-clamp-3 text-sm leading-relaxed text-rds-ink-muted">
            {{ district.districtFact || `${district.name} calendar dates, holidays, breaks, and official calendar source links.` }}
          </p>
          <div class="rds-data mt-auto flex items-center justify-between pt-5 text-sm">
            <span class="text-rds-ink-dim">{{ district.currentSchoolYear || 'Current year' }}</span>
            <span class="font-semibold text-rds-accent">View calendar</span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="rds-panel mt-8 p-8 text-center">
        <h2 class="text-lg font-semibold text-rds-ink">No districts found</h2>
        <p class="mt-2 text-sm text-rds-ink-dim">Try a different search term or state filter.</p>
      </div>

      <nav v-if="totalPages > 1" class="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="District pagination">
        <button
          type="button"
          class="directory-page-button px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="directory-page-button px-3 py-2 text-sm font-medium"
          :class="page === currentPage ? 'directory-page-button--active' : ''"
          @click="setPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="directory-page-button px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          Next
        </button>
      </nav>
    </section>
  </main>
</template>
