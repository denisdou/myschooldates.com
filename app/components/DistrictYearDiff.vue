<script setup lang="ts">
const { getBreaks, formatShortDate } = useDistrictPage()

const props = defineProps<{
  cal: any
  prevCal?: any
}>()

function computeYearDiff(curCal: any, prevCalData: any, prevYearStr: string): string[] {
  if (!prevCalData) return []
  const items: string[] = []

  const mmddDiff = (a: string, b: string) =>
    Math.round(
      (new Date(`2000-${a.slice(5)}T00:00:00`).getTime() - new Date(`2000-${b.slice(5)}T00:00:00`).getTime()) / 86400000
    )

  const sd = mmddDiff(curCal.firstDay, prevCalData.firstDay)
  if (sd === 0) items.push(`First day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else if (sd > 0) items.push(`School starts ${sd} day${sd !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else items.push(`School starts ${Math.abs(sd)} day${Math.abs(sd) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)

  const ed = mmddDiff(curCal.lastDay, prevCalData.lastDay)
  if (ed === 0) items.push(`Last day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else if (ed > 0) items.push(`Last day of school is ${ed} day${ed !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else items.push(`Last day of school is ${Math.abs(ed)} day${Math.abs(ed) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)

  const curSp = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  const prevSp = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  if (curSp && prevSp) {
    const diff = Math.round(
      (new Date(`2000-${curSp.start.slice(5)}T00:00:00`).getTime() - new Date(`2000-${prevSp.start.slice(5)}T00:00:00`).getTime()) / 86400000
    )
    if (Math.abs(diff) >= 5) {
      if (diff > 0) items.push(`Spring Break starts ${diff} days later than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
      else items.push(`Spring Break starts ${Math.abs(diff)} days earlier than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
    }
  }

  const curTh = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  const prevTh = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  if (curTh && prevTh) {
    const ld = curTh.days - prevTh.days
    if (ld === 0) items.push(`Thanksgiving Break is ${curTh.days} days — unchanged from ${prevYearStr}.`)
    else if (ld > 0) items.push(`Thanksgiving Break is ${ld} day${ld !== 1 ? 's' : ''} longer than ${prevYearStr} — ${curTh.days} days total.`)
    else items.push(`Thanksgiving Break is ${Math.abs(ld)} day${Math.abs(ld) !== 1 ? 's' : ''} shorter than ${prevYearStr} — ${curTh.days} days total.`)
  }

  return items
}

const prevYear = computed(() => props.prevCal?.schoolYear ?? '')
const currentYear = computed(() => props.cal?.schoolYear ?? '')

const items = computed(() => {
  if (!props.cal) return []
  const whatsNew = props.cal.whatsNew
  if (whatsNew?.content?.length) return whatsNew.content as string[]
  const base = props.prevCal ? computeYearDiff(props.cal, props.prevCal, prevYear.value) : []
  const extra: string[] = props.cal.diffNotes ?? []
  return [...base, ...extra]
})

const title = computed(() => props.cal?.whatsNew?.title)
</script>

<template>
  <details v-if="items.length" class="bg-white rounded-xl border border-gray-200 p-6 group">
    <summary class="cursor-pointer list-none">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ title ?? `What's New for ${currentYear}` }}</h2>
          <p class="text-sm text-gray-500">How this school year compares to {{ prevYear }}.</p>
        </div>
        <span class="mt-1 text-sm font-medium text-blue-600 group-open:hidden">Show</span>
        <span class="mt-1 text-sm font-medium text-blue-600 hidden group-open:inline">Hide</span>
      </div>
    </summary>
    <ul class="mt-4 space-y-2">
      <li v-for="item in items" :key="item" class="flex items-start gap-2 text-sm text-gray-700">
        <span class="text-gray-300 mt-0.5 flex-shrink-0 select-none">•</span>
        <span>{{ item }}</span>
      </li>
    </ul>
  </details>
</template>
