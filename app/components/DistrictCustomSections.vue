<script setup lang="ts">
const props = defineProps<{
  sections: {
    id: string
    label: string
    content: string
    position?: string
    groups?: { label: string; items: string[] }[]
  }[]
  position: string
}>()

const filtered = computed(() => {
  if (props.position === 'afterAbout') {
    return props.sections.filter(s => s.position === 'afterAbout' || !s.position)
  }
  return props.sections.filter(s => s.position === props.position)
})
</script>

<template>
  <template v-for="section in filtered" :key="section.id">
    <div class="bg-white rounded-xl border border-gray-200 p-6">
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
    </div>
  </template>
</template>
