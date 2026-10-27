<script setup lang="ts">
import type { TurnstileClient } from '~/utils/turnstile'
import { loadTurnstile } from '~/utils/turnstile'

const props = defineProps<{ districtName: string; year: string; pageUrl: string }>()
const config = useRuntimeConfig()
const dialog = ref<HTMLDialogElement>()
const verificationContainer = ref<HTMLElement>()
const message = ref('')
const email = ref('')
const token = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const verificationError = ref(false)
let client: TurnstileClient | undefined
let widgetId: string | undefined
let loadingWidget = false
let disposed = false
let observer: MutationObserver | undefined

const attachmentHref = computed(() => {
  const context = `Page: ${props.pageUrl}\nDistrict: ${props.districtName}\nSchool year: ${props.year}`
  return `mailto:hello@myschooldates.com?subject=${encodeURIComponent(`Calendar correction attachment — ${props.districtName} ${props.year}`)}&body=${encodeURIComponent(context)}`
})

async function prepareVerification() {
  if (submitting.value || loadingWidget || !dialog.value?.open || submitted.value) return
  token.value = ''
  verificationError.value = false
  if (!config.public.turnstileSiteKey) {
    errorMessage.value = 'The correction form is temporarily unavailable. Please try again later.'
    return
  }
  if (client && widgetId !== undefined) {
    client.reset(widgetId)
    return
  }
  loadingWidget = true
  try {
    client = await loadTurnstile()
    if (disposed || !dialog.value?.open || !verificationContainer.value) return
    widgetId = client.render(verificationContainer.value, {
      sitekey: config.public.turnstileSiteKey,
      action: 'calendar-correction',
      size: 'flexible',
      theme: 'auto',
      callback: (value) => {
        token.value = value
        verificationError.value = false
      },
      'expired-callback': () => { token.value = '' },
      'error-callback': () => {
        token.value = ''
        verificationError.value = true
      },
    })
  } catch {
    verificationError.value = true
  } finally {
    loadingWidget = false
  }
}

onMounted(() => {
  observer = new MutationObserver(() => {
    if (dialog.value?.open) void prepareVerification()
    else token.value = ''
  })
  if (dialog.value) observer.observe(dialog.value, { attributes: true, attributeFilter: ['open'] })
})
onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  if (client && widgetId !== undefined) client.remove(widgetId)
})
function open() {
  dialog.value?.showModal()
}
function close() {
  if (submitting.value) return
  dialog.value?.close()
  if (submitted.value) {
    submitted.value = false
    message.value = ''
    email.value = ''
    errorMessage.value = ''
  }
}
async function submit() {
  if (submitting.value || submitted.value || !token.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<{ success: boolean }>('/api/corrections', {
      method: 'POST',
      body: {
        message: message.value,
        email: email.value,
        district: props.districtName,
        school_year: props.year,
        page_url: props.pageUrl,
        turnstile_token: token.value,
      },
      retry: 0,
      timeout: 30_000,
    })
    if (!response.success) throw new Error('Correction was not accepted')
    submitted.value = true
  } catch (error) {
    const failure = error as { data?: { message?: string } }
    errorMessage.value = failure.data?.message || 'We couldn’t send your correction. Please try again later.'
  } finally {
    submitting.value = false
    token.value = ''
    if (!disposed && client && widgetId !== undefined && !submitted.value) client.reset(widgetId)
  }
}
</script>

<template>
  <div class="calendar-correction-prompt">
    <p>Spot an error? Help us keep this calendar accurate.</p>
    <button type="button" @click="open">Report a correction →</button>
    <dialog
      id="calendar-correction-dialog" ref="dialog" class="calendar-correction-dialog"
      aria-labelledby="correction-title" :aria-describedby="submitted ? 'correction-success' : 'correction-help'"
      @cancel.prevent="close" @click="event => { if (event.target === dialog) close() }"
    >
      <header>
        <h2 id="correction-title">Report a Correction</h2>
        <button type="button" class="calendar-correction-dialog__close" aria-label="Close correction form" :disabled="submitting" @click="close">×</button>
      </header>
      <p v-if="submitted" id="correction-success" class="calendar-correction-dialog__success" role="status">Thank you. Your correction has been submitted for review.</p>
      <form v-show="!submitted" :aria-busy="submitting" @submit.prevent="submit">
        <div>
          <label for="correction-message">What needs correcting?</label>
          <p id="correction-help">We’ll automatically include this page, district, and school year.</p>
          <textarea id="correction-message" v-model="message" required maxlength="2000" rows="5" autofocus :disabled="submitting" />
        </div>
        <div>
          <label for="correction-email">Email (optional)</label>
          <p>Only if you'd like us to follow up.</p>
          <input id="correction-email" v-model="email" type="email" autocomplete="email" maxlength="254" :disabled="submitting">
        </div>
        <p>Have a file to share? Send it to <a :href="attachmentHref" class="rds-link underline">hello@myschooldates.com</a>.</p>
        <div ref="verificationContainer" class="calendar-correction-dialog__verification" />
        <p v-if="verificationError" role="alert">
          Verification could not load. <button type="button" class="rds-link underline" @click="prepareVerification">Try again</button>
        </p>
        <p v-if="errorMessage" class="calendar-correction-dialog__error" role="alert">{{ errorMessage }}</p>
        <footer>
          <button type="button" class="district-calendar-action district-calendar-action--secondary" :disabled="submitting" @click="close">Cancel</button>
          <button type="submit" class="district-calendar-action district-calendar-action--primary" :disabled="submitting || !token">{{ submitting ? 'Submitting…' : 'Submit' }}</button>
        </footer>
      </form>
      <footer v-if="submitted" class="mt-4">
        <button type="button" class="district-calendar-action district-calendar-action--primary" @click="close">Done</button>
      </footer>
    </dialog>
  </div>
</template>
