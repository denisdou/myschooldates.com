<script setup lang="ts">
const props = defineProps<{
  sections: {
    id: string
    label: string
    content: string
    position?: string
    collapsible?: boolean
    defaultOpen?: boolean
    summaryLabel?: string
    image?: { src: string; alt: string; caption?: string; width?: number; height?: number }
    groups?: { label: string; items: string[] }[]
    definitions?: { term: string; description: string }[]
    links?: { label: string; to?: string; url?: string; description?: string }[]
    linksDisplay?: 'cards' | 'inline'
    linksLabel?: string
    timeline?: { marker: string; label: string; detail: string }[]
    table?: { caption?: string; columns?: string[]; headers?: string[]; rows: string[][]; footnote?: string }
  }[]
  position: string
}>()

const filtered = computed(() => {
  if (props.position === 'afterAbout') {
    return props.sections.filter(s => s.position === 'afterAbout' || !s.position)
  }
  return props.sections.filter(s => s.position === props.position)
})

const tableColumns = (section: (typeof props.sections)[number]) => section.table?.columns ?? section.table?.headers ?? []
const linkTarget = (link: { to?: string; url?: string }) => link.to ?? link.url ?? ''
const isExternalLink = (link: { to?: string; url?: string }) => /^https?:\/\//.test(linkTarget(link))
const contentParagraphs = (content?: string) =>
  String(content ?? '')
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
</script>

<template>
  <div v-if="filtered.length" class="district-custom-sections space-y-8">
    <div
      v-for="section in filtered"
      :id="section.id"
      :key="section.id"
      class="bg-white rounded-lg border border-gray-200 scroll-mt-24"
    >
      <div v-if="section.collapsible" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900">{{ section.label }}</h2>
        <div v-if="section.content" class="mt-2 space-y-2">
          <p v-for="paragraph in contentParagraphs(section.content)" :key="paragraph" class="text-sm text-gray-600 leading-relaxed">{{ paragraph }}</p>
        </div>
        <details :open="section.defaultOpen" class="group mt-4">
          <summary class="cursor-pointer list-none">
            <span class="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span class="text-sm font-semibold text-gray-900">{{ section.summaryLabel || 'View details' }}</span>
              <span class="text-sm font-medium text-blue-600 group-open:hidden">Show</span>
              <span class="text-sm font-medium text-blue-600 hidden group-open:inline">Hide</span>
            </span>
        </summary>
        <div class="mt-4">
          <div v-if="section.groups?.length" class="space-y-4">
            <div v-for="group in section.groups" :key="group.label">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ group.label }}</h3>
              <p v-if="group.items.length === 1" class="text-sm leading-relaxed text-gray-600">
                {{ group.items[0] }}
              </p>
              <ul v-else class="space-y-1.5">
                <li v-for="item in group.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                  <span class="mt-2 h-1.5 w-1.5 rounded-lg bg-blue-400 flex-shrink-0" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
          <dl v-if="section.definitions?.length" class="mt-4 divide-y divide-gray-100">
            <div
              v-for="item in section.definitions"
              :key="item.term"
              class="grid gap-1 py-3 first:pt-0 sm:grid-cols-[180px_1fr] sm:gap-4"
            >
              <dt class="text-sm font-semibold text-gray-900">{{ item.term }}</dt>
              <dd class="text-sm leading-relaxed text-gray-600">{{ item.description }}</dd>
            </div>
          </dl>
          <figure v-if="section.image" class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img
              :src="section.image.src"
              :alt="section.image.alt"
              :width="section.image.width"
              :height="section.image.height"
              class="w-full h-auto"
              loading="lazy"
            >
            <figcaption v-if="section.image.caption" class="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
              {{ section.image.caption }}
            </figcaption>
          </figure>
          <ol v-if="section.timeline?.length" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="item in section.timeline"
              :key="`${section.id}-${item.marker}-${item.label}`"
              class="relative rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <span class="block text-xs font-semibold uppercase tracking-wide text-blue-600">{{ item.marker }}</span>
              <span class="mt-1 block text-sm font-semibold text-gray-900">{{ item.label }}</span>
              <span class="mt-1 block text-xs leading-relaxed text-gray-600">{{ item.detail }}</span>
            </li>
          </ol>
          <div v-if="tableColumns(section).length && section.table?.rows?.length" class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <caption v-if="section.table.caption" class="sr-only">{{ section.table.caption }}</caption>
              <thead class="bg-gray-50">
                <tr>
                  <th
                    v-for="column in tableColumns(section)"
                    :key="column"
                    scope="col"
                    class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(row, rowIndex) in section.table.rows" :key="rowIndex">
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="`${rowIndex}-${cellIndex}`"
                    class="px-4 py-2 text-gray-700"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="section.table?.footnote" class="mt-2 text-xs leading-relaxed text-gray-500">
            {{ section.table.footnote }}
          </p>
          <p v-if="section.links?.length && section.linksDisplay === 'inline'" class="mt-4 text-sm text-gray-600">
            <span class="font-medium text-gray-900">{{ section.linksLabel || 'Sources:' }}</span>
            <template v-for="(link, linkIndex) in section.links" :key="linkTarget(link)">
              <template v-if="linkIndex"> · </template>
              <a
                v-if="isExternalLink(link)"
                :href="linkTarget(link)"
                target="_blank"
                rel="noopener"
                class="underline hover:text-[#0f5d6b] transition-colors"
              >{{ link.label }}<span class="sr-only">(opens in a new tab)</span></a>
              <NuxtLink v-else :to="linkTarget(link)" class="underline hover:text-[#0f5d6b] transition-colors">{{ link.label }}</NuxtLink>
            </template>
          </p>
          <div v-else-if="section.links?.length" class="mt-4 grid gap-3 sm:grid-cols-2">
            <NuxtLink
              v-for="link in section.links"
              :key="linkTarget(link)"
              :to="linkTarget(link)"
              class="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span class="block text-sm font-semibold text-gray-900">{{ link.label }}</span>
              <span v-if="link.description" class="mt-1 block text-xs text-gray-600 leading-relaxed">{{ link.description }}</span>
            </NuxtLink>
          </div>
        </div>
      </details>
      </div>
      <div v-else class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ section.label }}</h2>
        <div v-if="section.groups?.length" class="space-y-4">
          <div v-if="section.content" class="space-y-2">
            <p v-for="paragraph in contentParagraphs(section.content)" :key="paragraph" class="text-sm text-gray-600 leading-relaxed">{{ paragraph }}</p>
          </div>
          <div v-for="group in section.groups" :key="group.label">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ group.label }}</h3>
            <p v-if="group.items.length === 1" class="text-sm leading-relaxed text-gray-600">
              {{ group.items[0] }}
            </p>
            <ul v-else class="space-y-1.5">
              <li v-for="item in group.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <span class="mt-2 h-1.5 w-1.5 rounded-lg bg-blue-400 flex-shrink-0" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div v-else-if="section.content" class="space-y-2">
          <p v-for="paragraph in contentParagraphs(section.content)" :key="paragraph" class="text-sm text-gray-600 leading-relaxed">{{ paragraph }}</p>
        </div>
        <dl v-if="section.definitions?.length" class="mt-4 divide-y divide-gray-100">
          <div
            v-for="item in section.definitions"
            :key="item.term"
            class="grid gap-1 py-3 first:pt-0 sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt class="text-sm font-semibold text-gray-900">{{ item.term }}</dt>
            <dd class="text-sm leading-relaxed text-gray-600">{{ item.description }}</dd>
          </div>
        </dl>
        <figure v-if="section.image" class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <img
            :src="section.image.src"
            :alt="section.image.alt"
            :width="section.image.width"
            :height="section.image.height"
            class="w-full h-auto"
            loading="lazy"
          >
          <figcaption v-if="section.image.caption" class="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
            {{ section.image.caption }}
          </figcaption>
        </figure>
        <ol v-if="section.timeline?.length" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="item in section.timeline"
            :key="`${section.id}-${item.marker}-${item.label}`"
            class="relative rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span class="block text-xs font-semibold uppercase tracking-wide text-blue-600">{{ item.marker }}</span>
            <span class="mt-1 block text-sm font-semibold text-gray-900">{{ item.label }}</span>
            <span class="mt-1 block text-xs leading-relaxed text-gray-600">{{ item.detail }}</span>
          </li>
        </ol>
        <div v-if="tableColumns(section).length && section.table?.rows?.length" class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <caption v-if="section.table.caption" class="sr-only">{{ section.table.caption }}</caption>
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="column in tableColumns(section)"
                  :key="column"
                  scope="col"
                  class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="(row, rowIndex) in section.table.rows" :key="rowIndex">
                <td
                  v-for="(cell, cellIndex) in row"
                  :key="`${rowIndex}-${cellIndex}`"
                  class="px-4 py-2 text-gray-700"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="section.table?.footnote" class="mt-2 text-xs leading-relaxed text-gray-500">
          {{ section.table.footnote }}
        </p>
        <p v-if="section.links?.length && section.linksDisplay === 'inline'" class="mt-4 text-sm text-gray-600">
          <span class="font-medium text-gray-900">{{ section.linksLabel || 'Sources:' }}</span>
          <template v-for="(link, linkIndex) in section.links" :key="linkTarget(link)">
            <template v-if="linkIndex"> · </template>
            <a
              v-if="isExternalLink(link)"
              :href="linkTarget(link)"
              target="_blank"
              rel="noopener"
              class="underline hover:text-[#0f5d6b] transition-colors"
            >{{ link.label }}<span class="sr-only">(opens in a new tab)</span></a>
            <NuxtLink v-else :to="linkTarget(link)" class="underline hover:text-[#0f5d6b] transition-colors">{{ link.label }}</NuxtLink>
          </template>
        </p>
        <div v-else-if="section.links?.length" class="mt-4 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="link in section.links"
            :key="linkTarget(link)"
            :to="linkTarget(link)"
            class="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span class="block text-sm font-semibold text-gray-900">{{ link.label }}</span>
            <span v-if="link.description" class="mt-1 block text-xs text-gray-600 leading-relaxed">{{ link.description }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
