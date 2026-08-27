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

const accordion = computed(() => true)
const defaultOpenCount = computed(() => 2)

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

function isInternalLink(faq: FaqItem) {
  return faq.linkUrl?.startsWith('/') ?? false
}
</script>

<template>
  <div id="faq" v-if="faqs.length" class="bg-white rounded-lg border border-gray-200 p-6 scroll-mt-24">
    <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
    <div v-if="accordion" class="district-faq-accordion">
      <details
        v-for="(faq, index) in faqs"
        :key="faq.q"
        :open="index < defaultOpenCount"
        class="district-faq-accordion__item"
      >
        <summary>
          <span>{{ faq.q }}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="m7 10 5 5 5-5" />
          </svg>
        </summary>
        <div class="district-faq-accordion__answer">
          <p>
            <template v-if="answerParts(faq).link">
              {{ answerParts(faq).before }}<NuxtLink
                v-if="isInternalLink(faq)"
                :to="faq.linkUrl"
                class="font-medium text-[#0f5d6b] underline hover:text-[#0b4c58]"
              >{{ answerParts(faq).link }}</NuxtLink><a
                v-else
                :href="faq.linkUrl"
                target="_blank"
                rel="noopener"
                class="font-medium text-[#0f5d6b] underline hover:text-[#0b4c58]"
              >{{ answerParts(faq).link }}<span class="sr-only">(opens in a new tab)</span></a>{{ answerParts(faq).after }}
            </template>
            <template v-else>{{ faq.a }}</template>
          </p>
        </div>
      </details>
    </div>
    <div v-else class="space-y-5 divide-y divide-gray-100">
      <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
        <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
        <p class="text-gray-600 mt-1.5">
          <template v-if="answerParts(faq).link">
            {{ answerParts(faq).before }}<NuxtLink
              v-if="isInternalLink(faq)"
              :to="faq.linkUrl"
              class="font-medium text-[#0f5d6b] underline hover:text-[#0b4c58]"
            >{{ answerParts(faq).link }}</NuxtLink><a
              v-else
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
