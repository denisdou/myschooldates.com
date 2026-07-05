<script setup lang="ts">
defineProps<{
  items: { label: string; href?: string }[]
}>()
</script>

<template>
  <nav class="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0">›</span>
      <NuxtLink v-if="item.href" :to="item.href" class="hover:text-blue-600">{{ item.label }}</NuxtLink>
      <span v-else class="text-gray-800 font-medium">{{ item.label }}</span>
    </template>
  </nav>
</template>
