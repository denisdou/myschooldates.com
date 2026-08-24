function localCalendarDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useHydrationDate() {
  const date = useState<string>('calendar-hydration-date', () => localCalendarDate())

  onMounted(() => {
    const currentDate = localCalendarDate()
    if (date.value !== currentDate) date.value = currentDate
  })

  return date
}
