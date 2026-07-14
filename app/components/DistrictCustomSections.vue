<script setup lang="ts">
const props = defineProps<{
  sections: { id: string; label: string; content: string; position?: string }[]
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
      <p class="text-sm text-gray-600 leading-relaxed">{{ section.content }}</p>
    </div>
  </template>
</template>
