<script setup lang="ts">
import type { CalendarDetails } from '~/utils/calendarDetails'
import { extendedTimeOff } from '~/utils/calendarDetails'

const props = defineProps<{ cal: CalendarDetails; districtName: string; year: string }>()
const windows = computed(() => extendedTimeOff(props.cal))

function formatRange(start: string, end = start) {
  const format = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
  if (start === end) return format(start)
  if (start.slice(0, 7) === end.slice(0, 7)) {
    const date = new Date(`${start}T00:00:00Z`)
    return `${date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} ${date.getUTCDate()}–${Number(end.slice(-2))}, ${end.slice(0, 4)}`
  }
  return `${format(start)} – ${format(end)}`
}
</script>

<template>
  <section v-if="windows.length" class="district-key-dates-table district-extended-time-off" aria-labelledby="extended-time-off-title">
    <header class="district-key-dates-table__intro">
      <h2 id="extended-time-off-title">Extended Time Off</h2>
    </header>
    <div class="district-key-dates-table__frame">
      <table>
        <caption class="sr-only">Extended no-school periods for {{ districtName }} {{ year }}</caption>
        <colgroup>
          <col class="district-extended-time-off__period-col">
          <col class="district-extended-time-off__dates-col">
          <col class="district-extended-time-off__length-col">
        </colgroup>
        <thead><tr><th scope="col">Period</th><th scope="col">Date(s)</th><th scope="col">Length</th></tr></thead>
        <tbody>
          <tr v-for="period in windows" :key="period.start">
            <th scope="row">{{ period.name }}</th>
            <td>
              <strong>{{ formatRange(period.start, period.end) }}</strong>
              <p class="district-extended-time-off__detail">
                Districtwide no-school: {{ period.closures.map(range => formatRange(range.start, range.end)).join(', ') }}
                <template v-if="period.weekends.length"> · Adjacent weekend: {{ period.weekends.map(range => formatRange(range.start, range.end)).join(', ') }}</template>
              </p>
            </td>
            <td><span class="district-key-dates-table__status" data-tone="break">{{ period.days }} days</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
