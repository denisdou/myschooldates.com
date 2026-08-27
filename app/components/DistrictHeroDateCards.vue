<script setup lang="ts">
const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    events: Array<{ date?: string; endDate?: string; name: string; type: string }>
  }
}>()

const { getBreaks } = useDistrictPage()

const breaks = computed(() => getBreaks(props.cal.events))
const winterRecess = computed(() =>
  breaks.value.find(item => /winter|christmas/i.test(item.name))
)
const springRecess = computed(() =>
  breaks.value.find(item => /spring/i.test(item.name))
)

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRange(start?: string, end?: string) {
  if (!start || !end) return 'See key dates'
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth()

  if (sameMonth) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
  }

  if (sameYear) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()} – ${endDate.toLocaleDateString('en-US', { month: 'short' })} ${endDate.getDate()}, ${endDate.getFullYear()}`
  }

  return `${formatDate(start)} – ${formatDate(end)}`
}

const cards = computed(() => [
  {
    label: 'First Day',
    value: formatDate(props.cal.firstDay),
    datetime: props.cal.firstDay,
    icon: 'first',
  },
  {
    label: 'Winter Recess',
    value: formatRange(winterRecess.value?.start, winterRecess.value?.end),
    datetime: winterRecess.value?.start,
    icon: 'winter',
  },
  {
    label: 'Spring Recess',
    value: formatRange(springRecess.value?.start, springRecess.value?.end),
    datetime: springRecess.value?.start,
    icon: 'spring',
  },
  {
    label: 'Last Day',
    value: formatDate(props.cal.lastDay),
    datetime: props.cal.lastDay,
    icon: 'last',
  },
])
</script>

<template>
  <div class="district-overview-facts" aria-label="School year dates at a glance">
    <article v-for="card in cards" :key="card.label" class="district-overview-fact-card">
      <span class="district-overview-fact-card__icon" aria-hidden="true">
        <svg v-if="card.icon === 'first'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
          <path d="m9 14 2 2 4-5" />
        </svg>
        <svg v-else-if="card.icon === 'winter'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11M9 4l3 2 3-2M9 20l3-2 3 2M4.5 10l.2 3.6-3 .6M22.3 9.8l-3 .6.2 3.6" />
        </svg>
        <svg v-else-if="card.icon === 'spring'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="2.3" />
          <path d="M12 9.7C9 7 9.7 4 12 4s3 3 0 5.7ZM14.3 12c2.7-3 5.7-2.3 5.7 0s-3 3-5.7 0ZM12 14.3c3 2.7 2.3 5.7 0 5.7s-3-3 0-5.7ZM9.7 12C7 15 4 14.3 4 12s3-3 5.7 0Z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 21V3M6 4h11l-2 3 2 3H6" />
          <path d="m9 16 2 2 4-5" />
        </svg>
      </span>
      <span class="district-overview-fact-card__label">{{ card.label }}</span>
      <time v-if="card.datetime" :datetime="card.datetime" class="district-overview-fact-card__value">{{ card.value }}</time>
      <span v-else class="district-overview-fact-card__value">{{ card.value }}</span>
    </article>
  </div>
</template>
