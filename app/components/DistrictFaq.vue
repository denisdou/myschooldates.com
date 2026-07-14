<script setup lang="ts">
const props = defineProps<{
  cal: any
  district: any
}>()

const faqs = computed((): { q: string; a: string }[] => {
  const specificFaqs: { q: string; a: string }[] = (props.district as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (props.cal as any).calendarFaqs ?? []
  return [...specificFaqs, ...calendarFaqs]
})
</script>

<template>
  <div v-if="faqs.length" class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
    <div class="space-y-5 divide-y divide-gray-100">
      <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
        <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
        <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
      </div>
    </div>
  </div>
</template>
