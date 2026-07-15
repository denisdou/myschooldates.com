<script setup lang="ts">
const { formatDate, getBreaks } = useDistrictPage()

const props = defineProps<{
  cal: any
  district: any
  yearComparison?: string
}>()

const breaks = computed(() => getBreaks(props.cal.events ?? []))
</script>

<template>
  <div v-if="cal.calendarNotes || district.about?.length" class="space-y-4">
    <div v-if="cal.calendarNotes" class="text-gray-600 leading-relaxed space-y-3 text-sm">
      <p v-for="(para, i) in cal.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
    </div>
    <div v-else class="text-gray-600 leading-relaxed space-y-3 text-sm">
      <p>
        The {{ cal.schoolYear }} academic year for {{ district.name }} runs from
        <strong>{{ formatDate(cal.firstDay) }}</strong> to
        <strong>{{ formatDate(cal.lastDay) }}</strong>,
        with {{ cal.totalSchoolDays ?? 180 }} instructional days listed on the student calendar.
      </p>
      <p v-if="breaks.length">
        Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
        {{ breaks.map(b => b.name).join(', ') }} — plus district-observed holidays and additional no-school days.
        <span v-if="yearComparison" class="italic text-gray-500"> {{ yearComparison }}</span>
      </p>
    </div>
    <template v-if="district.about?.length">
      <div v-for="card in district.about" :key="card.title" class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ card.title }}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ card.content }}</p>
      </div>
    </template>
  </div>
</template>
