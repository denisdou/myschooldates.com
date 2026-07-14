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

// Fixed 4-card layout: Instructional Days · Student Holidays · Winter Break · Semester Split
// Plus extra cards from the calendar's yearNumbers field (change indicators + district-specific).
export function scoreYearNumbers(
  pool: YearNumbersPool,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const cards: NumberCard[] = []

  // Card 1: Instructional Days
  cards.push({
    key: 'instructionalDays',
    label: 'Instructional Days',
    value: pool.instructionalDays,
    unit: 'days',
    description: pool.secondSemStart
      ? `${fmtShort(pool.firstDay)} – ${fmtShort(pool.lastDay)} · Semester 2 begins ${fmtShort(pool.secondSemStart)}.`
      : `The ${currentYearVal} school year runs ${fmtShort(pool.firstDay)} through ${fmtShort(pool.lastDay)}.`,
  })

  // Card 2: Student Holidays
  cards.push({
    key: 'studentHolidays',
    label: 'Student Holidays',
    value: pool.noSchoolDayCount,
    unit: 'days',
    description: `Individual no-school days for students, not counting named multi-day breaks like Thanksgiving, Winter, or Spring Break.`,
  })

  // Card 3: Winter Break
  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    cards.push({
      key: 'winterBreakLength',
      label: 'Winter Break',
      value: pool.winterBreakLength,
      unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} – ${fmtShort(pool.winterBreakEnd)}.`,
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

  // Card 4: Semester Split
  cards.push({
    key: 'semesterSplit',
    label: 'Semester Split',
    value: pool.semesters,
    unit: pool.semesters === 1 ? 'semester' : 'semesters',
    description: pool.secondSemStart
      ? `Semester 2 begins ${fmtShort(pool.secondSemStart)}.`
      : `The school year is divided into ${pool.semesters} ${pool.semesters === 1 ? 'semester' : 'semesters'}.`,
  })

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
