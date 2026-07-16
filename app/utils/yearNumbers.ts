export type NumberCard = {
  key:          string
  label:        string
  value:        number
  unit:         string
  description:  string
  displayValue?: string
}

export interface YearNumbersPool {
  instructionalDays: number
  instructionalDaysLabel?: string
  instructionalDaysDescription?: string
  noSchoolDayCount:  number
  semesters:         number
  extraCards:        { label: string; value: string; detail: string }[]
  winterBreakLength: number | null
  winterBreakStart:  string | null
  winterBreakEnd:    string | null
  secondSemStart:    string | null
  firstDay:          string
  lastDay:           string
}

// Fixed layout: Instructional Days · Student No-School Days · Winter Break
// Plus extra cards from the calendar's yearNumbers field (change indicators + district-specific).
export function scoreYearNumbers(
  pool: YearNumbersPool,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const cards: NumberCard[] = []
  const weekdaysBetween = (startStr: string, endStr: string) => {
    const cursor = new Date(startStr + 'T00:00:00')
    const end = new Date(endStr + 'T00:00:00')
    let count = 0
    while (cursor <= end) {
      const day = cursor.getDay()
      if (day !== 0 && day !== 6) count++
      cursor.setDate(cursor.getDate() + 1)
    }
    return count
  }

  // Card 1: Instructional Days
  cards.push({
    key: 'instructionalDays',
    label: pool.instructionalDaysLabel ?? 'Instructional Days',
    value: pool.instructionalDays,
    unit: 'days',
    description: pool.instructionalDaysDescription ?? `Instructional-day count for the ${currentYearVal} student calendar.`,
  })

  // Card 2: Student no-school weekdays
  cards.push({
    key: 'studentHolidays',
    label: 'Additional Student No-School Weekdays',
    value: pool.noSchoolDayCount,
    unit: 'days',
    description: `Additional weekdays without classes, excluding listed Thanksgiving, Winter, and Spring Break periods.`,
  })

  // Card 3: Winter Break
  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const winterWeekdays = weekdaysBetween(pool.winterBreakStart, pool.winterBreakEnd)
    cards.push({
      key: 'winterBreakLength',
      label: 'Winter Break',
      value: pool.winterBreakLength,
      unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} – ${fmtShort(pool.winterBreakEnd)} (${winterWeekdays} weekdays without school / ${pool.winterBreakLength} calendar days).`,
    })
  } else {
    cards.push({
      key: 'winterBreakLength',
      label: 'Winter Break',
      value: 0,
      unit: 'days',
      description: `Winter break dates are listed in the calendar above.`,
    })
  }

  // Extra cards from yearNumbers field (change indicators + district-specific)
  for (const [i, extra] of pool.extraCards.entries()) {
    cards.push({
      key: `extra_${i}`,
      label: extra.label,
      value: 0,
      unit: '',
      description: extra.detail,
      displayValue: extra.value,
    })
  }

  return cards
}
