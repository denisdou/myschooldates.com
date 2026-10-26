<script setup lang="ts">
const props = defineProps<{ districtName: string; year: string; pageUrl: string }>()
const dialog = ref<HTMLDialogElement>()
const message = ref('')
const email = ref('')
const draftRequested = ref(false)

const emailHref = computed(() => {
  const context = `Page: ${props.pageUrl}\nDistrict: ${props.districtName}\nSchool year: ${props.year}`
  const body = `${context}\n${email.value ? `Reply to: ${email.value}\n` : ''}\n${message.value}`
  return `mailto:hello@myschooldates.com?subject=${encodeURIComponent(`Calendar correction — ${props.districtName} ${props.year}`)}&body=${encodeURIComponent(body)}`
})
function open() {
  draftRequested.value = false
  dialog.value?.showModal()
}
function submit() {
  window.location.href = emailHref.value
  draftRequested.value = true
}
</script>

<template>
  <div class="calendar-correction-prompt">
    <p>Spot an error? Help us keep this calendar accurate.</p>
    <button type="button" @click="open">Report a correction →</button>
    <dialog id="calendar-correction-dialog" ref="dialog" class="calendar-correction-dialog" aria-labelledby="correction-title" aria-describedby="correction-help" @close="draftRequested = false" @click="event => { if (event.target === dialog) dialog?.close() }">
      <header>
        <h2 id="correction-title">Report a Correction</h2>
        <button type="button" class="calendar-correction-dialog__close" aria-label="Close correction form" @click="dialog?.close()">×</button>
      </header>
      <form @submit.prevent="submit">
        <div>
          <label for="correction-message">What needs correcting?</label>
          <p id="correction-help">We’ll include this page, district, and school year in your email draft.</p>
          <textarea id="correction-message" v-model="message" required maxlength="2000" rows="5" autofocus />
        </div>
        <div>
          <label for="correction-email">Email (optional)</label>
          <p>Only if you'd like us to follow up.</p>
          <input id="correction-email" v-model="email" type="email" autocomplete="email" maxlength="254">
        </div>
        <p>Have a file to share? Attach it to your email to <a :href="emailHref" class="rds-link underline">hello@myschooldates.com</a>.</p>
        <p v-if="draftRequested" role="status">Continue in your email app and send the draft to complete your report. If it didn’t open, email hello@myschooldates.com directly.</p>
        <footer>
          <button type="button" class="district-calendar-action district-calendar-action--secondary" @click="dialog?.close()">Cancel</button>
          <button type="submit" class="district-calendar-action district-calendar-action--primary">Send by email</button>
        </footer>
      </form>
    </dialog>
  </div>
</template>
