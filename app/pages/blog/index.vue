<script setup lang="ts">
const pageUrl = 'https://myschooldates.com/blog'
const title = 'MySchoolDates Blog | School Calendar Research and Data'
const description = 'Read MySchoolDates school calendar research, dataset releases, trend reports, and planning notes for U.S. district calendars.'

const featuredPosts = [
  {
    title: '2026-2027 School Calendar Trends: Start Dates, Breaks & End Dates From 100 Districts',
    description: 'A data-backed report on U.S. school start dates, winter break timing, spring break clusters, last days, and downloadable calendar dataset records.',
    href: '/school-calendar-trends/2026-2027-report',
    label: 'Research report',
  },
]

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: pageUrl,
  twitterTitle: title,
  twitterDescription: description,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: {
          '@type': 'WebSite',
          name: 'MySchoolDates',
          url: 'https://myschooldates.com',
        },
        hasPart: featuredPosts.map(post => ({
          '@type': 'Article',
          name: post.title,
          url: `https://myschooldates.com${post.href}`,
        })),
      }),
    },
  ],
})
</script>

<template>
  <main class="bg-gray-50">
    <div class="mx-auto max-w-5xl px-4 py-10">
      <header class="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">MySchoolDates Blog</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          School Calendar Research and Data
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Research notes, data releases, and school calendar trend analysis from the MySchoolDates Calendar Data Team.
        </p>
      </header>

      <section class="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Featured Research</h2>
        <div class="mt-5 grid gap-4">
          <NuxtLink
            v-for="post in featuredPosts"
            :key="post.href"
            :to="post.href"
            class="rounded-lg border border-gray-200 bg-gray-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">{{ post.label }}</p>
            <h3 class="mt-2 text-xl font-bold text-gray-900">{{ post.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ post.description }}</p>
          </NuxtLink>
        </div>
      </section>

      <section class="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="text-2xl font-bold text-gray-900">Data Resources</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/school-calendar-trends" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50">
            <h3 class="font-semibold text-gray-900">School Calendar Trends Hub</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">Browse reports, charts, datasets, archive plans, and school calendar analysis.</p>
          </NuxtLink>
          <NuxtLink to="/datasets/school-calendar-trends" class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50">
            <h3 class="font-semibold text-gray-900">School Calendar Dataset</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">Download the 2026-2027 U.S. school calendar CSV dataset and citation details.</p>
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>
