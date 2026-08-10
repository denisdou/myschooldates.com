<script setup lang="ts">
defineProps<{
  items: { label: string; href?: string }[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="site-breadcrumb flex flex-wrap items-center gap-2">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" aria-hidden="true">›</span>
      <NuxtLink v-if="item.href" :to="item.href">{{ item.label }}</NuxtLink>
      <span v-else class="font-medium text-rds-ink-muted">{{ item.label }}</span>
    </template>
  </nav>
</template>
