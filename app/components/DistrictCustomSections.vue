<script setup lang="ts">
const props = defineProps<{
  sections: {
    id: string
    label: string
    content: string
    position?: string
    groups?: { label: string; items: string[] }[]
    links?: { label: string; to?: string; url?: string; description?: string }[]
    table?: { columns?: string[]; headers?: string[]; rows: string[][] }
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
</script>

<template>
  <div v-if="filtered.length" class="space-y-8">
    <div
      v-for="section in filtered"
      :id="section.id"
      :key="section.id"
      class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24"
    >
      <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ section.label }}</h2>
      <div v-if="section.groups?.length" class="space-y-4">
        <p v-if="section.content" class="text-sm text-gray-600 leading-relaxed">{{ section.content }}</p>
        <div v-for="group in section.groups" :key="group.label">
          <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ group.label }}</h3>
          <ul class="space-y-1.5">
            <li v-for="item in group.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
              <span class="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="text-sm text-gray-600 leading-relaxed">{{ section.content }}</p>
      <div v-if="tableColumns(section).length && section.table?.rows?.length" class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
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
      <div v-if="section.links?.length" class="mt-4 grid gap-3 sm:grid-cols-2">
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
</template>
