<script setup lang="ts">
const props = defineProps<{
  cal: any
  district: any
  faqs?: { q: string; a: string; linkText?: string; linkUrl?: string }[]
}>()

type FaqItem = { q: string; a: string; linkText?: string; linkUrl?: string }

const faqs = computed((): FaqItem[] => {
  if (props.faqs) return props.faqs
  const specificFaqs: FaqItem[] = (props.district as any).districtFaqs ?? []
  const calendarFaqs: FaqItem[] = (props.cal as any).calendarFaqs ?? []
  return [...specificFaqs, ...calendarFaqs]
})

function answerParts(faq: FaqItem) {
  if (!faq.linkText || !faq.linkUrl) return { before: faq.a, link: '', after: '' }
  const index = faq.a.indexOf(faq.linkText)
  if (index === -1) return { before: faq.a, link: '', after: '' }
  return {
    before: faq.a.slice(0, index),
    link: faq.linkText,
    after: faq.a.slice(index + faq.linkText.length),
  }
}
</script>

<template>
  <div id="faq" v-if="faqs.length" class="bg-white rounded-lg border border-gray-200 p-6 scroll-mt-24">
    <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
    <div class="space-y-5 divide-y divide-gray-100">
      <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
        <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
        <p class="text-gray-600 mt-1.5">
          <template v-if="answerParts(faq).link">
            {{ answerParts(faq).before }}<a
              :href="faq.linkUrl"
              target="_blank"
              rel="noopener"
              class="font-medium text-[#0f5d6b] underline hover:text-[#0b4c58]"
            >{{ answerParts(faq).link }}<span class="sr-only">(opens in a new tab)</span></a>{{ answerParts(faq).after }}
          </template>
          <template v-else>{{ faq.a }}</template>
        </p>
      </div>
    </div>
  </div>
</template>
