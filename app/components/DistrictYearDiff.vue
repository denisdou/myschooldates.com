<script setup lang="ts">
const { getBreaks, formatShortDate } = useDistrictPage()

const props = defineProps<{
  cal: any
  prevCal?: any
}>()

function formatComparisonDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatComparisonRange(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  if (startDate.getFullYear() === endDate.getFullYear()) {
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'long' })
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startMonth} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
    }
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'long' })
    return `${startMonth} ${startDate.getDate()}–${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  return `${formatComparisonDate(start)}–${formatComparisonDate(end)}`
}

function countWord(value: number) {
  const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  return words[value] ?? String(value)
}

function computeYearDiff(curCal: any, prevCalData: any, prevYearStr: string): string[] {
  if (!prevCalData) return []
  const currentTrack = curCal.calendarTrackId ?? curCal.meta?.calendarTrackId
  const previousTrack = prevCalData.calendarTrackId ?? prevCalData.meta?.calendarTrackId

  // Calendar-track identity is part of the comparison key. Preserve legacy
  // behavior only when neither record declares a track; never compare a
  // track-aware record with a missing or different track.
  if ((currentTrack || previousTrack) && (!currentTrack || !previousTrack || currentTrack !== previousTrack)) return []

  const items: string[] = []
  const comparisonStyle = curCal.yearComparisonStyle ?? curCal.meta?.yearComparisonStyle
  const useMovementStyle = comparisonStyle === 'movement' || comparisonStyle === 'movement-simple'
  const useSimpleMovementStyle = comparisonStyle === 'movement-simple'
  const hideThanksgiving = Boolean(curCal.hideThanksgivingYearComparison ?? curCal.meta?.hideThanksgivingYearComparison)

  const mmddDiff = (a: string, b: string) =>
    Math.round(
      (new Date(`2000-${a.slice(5)}T00:00:00`).getTime() - new Date(`2000-${b.slice(5)}T00:00:00`).getTime()) / 86400000
    )

  const sd = mmddDiff(curCal.firstDay, prevCalData.firstDay)
  if (useMovementStyle && sd !== 0) items.push(`The first day moves from ${formatComparisonDate(prevCalData.firstDay)} to ${formatComparisonDate(curCal.firstDay)}.`)
  else if (sd === 0) items.push(`First day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else if (sd > 0) items.push(`School starts ${sd} day${sd !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else items.push(`School starts ${Math.abs(sd)} day${Math.abs(sd) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)

  const ed = mmddDiff(curCal.lastDay, prevCalData.lastDay)
  if (useMovementStyle && ed !== 0) items.push(`The last student day moves from ${formatComparisonDate(prevCalData.lastDay)} to ${formatComparisonDate(curCal.lastDay)}.`)
  else if (ed === 0) items.push(`Last day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else if (ed > 0) items.push(`Last day of school is ${ed} day${ed !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else items.push(`Last day of school is ${Math.abs(ed)} day${Math.abs(ed) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)

  const curSp = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  const prevSp = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  if (curSp && prevSp) {
    const diff = Math.round(
      (new Date(`2000-${curSp.start.slice(5)}T00:00:00`).getTime() - new Date(`2000-${prevSp.start.slice(5)}T00:00:00`).getTime()) / 86400000
    )
    if (Math.abs(diff) >= 5) {
      if (useMovementStyle) {
        if (useSimpleMovementStyle) {
          items.push(`Spring Break moves from ${formatComparisonRange(prevSp.start, prevSp.end)} to ${formatComparisonRange(curSp.start, curSp.end)}.`)
        }
        else {
          const direction = diff > 0 ? 'later' : 'earlier'
          items.push(`Spring Break moves ${countWord(Math.abs(diff))} days ${direction} on the calendar, from ${formatComparisonRange(prevSp.start, prevSp.end)} to ${formatComparisonRange(curSp.start, curSp.end)}.`)
        }
      }
      else if (diff > 0) items.push(`Spring Break starts ${diff} days later than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
      else items.push(`Spring Break starts ${Math.abs(diff)} days earlier than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
    }
  }

  const curTh = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  const prevTh = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  if (curTh && prevTh && !hideThanksgiving) {
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

const title = computed(() => props.cal?.yearComparisonTitle ?? props.cal?.whatsNew?.title)
const subtitle = computed(() => props.cal?.yearComparisonSubtitle ?? props.cal?.whatsNew?.subtitle)
const hideSubtitle = computed(() => Boolean(
  props.cal?.hideYearComparisonSubtitle ?? props.cal?.meta?.hideYearComparisonSubtitle
))
const displayPrevYear = computed(() => {
  const match = prevYear.value.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : prevYear.value
})
</script>

<template>
  <section v-if="items.length" class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="m-0 min-w-0">
      <span class="block text-lg font-semibold text-gray-900 mb-1">{{ title ?? `What's New for ${currentYear}` }}</span>
      <span v-if="!hideSubtitle" class="block text-sm font-normal text-gray-500">{{ subtitle ?? `How this school year compares with ${displayPrevYear}.` }}</span>
    </h2>
    <ul class="mt-4 space-y-2">
      <li v-for="item in items" :key="item" class="flex items-start gap-2 text-sm text-gray-700">
        <span class="text-gray-300 mt-0.5 flex-shrink-0 select-none">•</span>
        <span>{{ item }}</span>
      </li>
    </ul>
  </section>
</template>
