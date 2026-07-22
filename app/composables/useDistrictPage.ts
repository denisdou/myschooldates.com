export function useDistrictPage() {
  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  function formatShortDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  function formatMonthYear(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', year: 'numeric',
    })
  }

  function daysUntil(dateStr: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr + 'T00:00:00')
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function daysBetween(startStr: string, endStr: string) {
    const start = new Date(startStr + 'T00:00:00')
    const end = new Date(endStr + 'T00:00:00')
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function weekdaysBetween(startStr: string, endStr: string) {
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

  function getBreaks(events: Array<{ date: string; name: string; type: string }>) {
    const result: { name: string; start: string; end: string; days: number }[] = []
    const normalizeBreakName = (name: string) => name
      .toLowerCase()
      .replace(/\bend\b/g, '')
      .replace(/\bstart\b/g, '')
      .replace(/\/.*$/g, '')
      .replace(/[-:]+.*$/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'break_start') {
        const baseName = events[i].name
        const normalizedBase = normalizeBreakName(baseName)
        const endEvent = events.find(
          (e, j) => {
            if (j <= i || e.type !== 'break_end') return false
            const normalizedEnd = normalizeBreakName(e.name)
            return normalizedEnd === normalizedBase ||
              normalizedEnd.includes(normalizedBase) ||
              normalizedBase.includes(normalizedEnd)
          }
        )
        if (endEvent) {
          result.push({
            name: baseName,
            start: events[i].date,
            end: endEvent.date,
            days: daysBetween(events[i].date, endEvent.date),
          })
        }
      }
    }
    return result
  }

  function isCoveredByBreak(
    event: { date: string; type: string },
    events: Array<{ date: string; name: string; type: string }>
  ) {
    if (!['holiday', 'no_school', 'student_holiday', 'teacher_workday'].includes(event.type)) return false
    return getBreaks(events).some(b => event.date >= b.start && event.date <= b.end)
  }

  // Returns the first student school day after winter break ends (skips weekends and no_school days)
  function getSecondSemesterStart(events: Array<{ date: string; name: string; type: string }>): string {
    const winterEnd = events.find(
      e => e.type === 'break_end' && e.name.toLowerCase().includes('winter')
    )
    if (!winterEnd) return ''
    // Prefer an explicit student return event before falling back to the next weekday.
    const resumeEvent = events.find(e =>
      ['school_resume', 'school_reopen', 'semester_start'].includes(e.type) && e.date > winterEnd.date
    )
    if (resumeEvent) return resumeEvent.date
    // Fallback: advance past weekends and any no-student day
    const noStudentDates = new Set(
      events.filter(e => ['no_school', 'student_holiday', 'holiday'].includes(e.type)).map(e => e.date)
    )
    const toDateStr = (dt: Date) => {
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const d = new Date(winterEnd.date + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    let dateStr = toDateStr(d)
    while (d.getDay() === 0 || d.getDay() === 6 || noStudentDates.has(dateStr)) {
      d.setDate(d.getDate() + 1)
      dateStr = toDateStr(d)
    }
    return dateStr
  }

  function generateFaqs(
    district: { name: string },
    cal: {
      schoolYear: string
      firstDay: string
      lastDay: string
      totalSchoolDays?: number
      teacherWorkDays?: number
      semesters?: number
      sourceUrl?: string
      events: Array<{ date: string; name: string; type: string }>
    },
    officialWebsite: string
  ) {
    const breaks = getBreaks(cal.events)
    const springBreak = breaks.find(b => b.name.toLowerCase().includes('spring'))
    const winterBreak = breaks.find(b => b.name.toLowerCase().includes('winter'))
    const thanksgivingBreak = breaks.find(b => b.name.toLowerCase().includes('thanksgiving'))
    const fallBreak = breaks.find(b => b.name.toLowerCase().includes('fall'))
    const holidays = cal.events.filter(e => e.type === 'holiday')
    const sourceUrl = cal.sourceUrl ?? officialWebsite
    const secondSemStart = getSecondSemesterStart(cal.events)
    const semesters = cal.semesters ?? 2
    const totalDays = cal.totalSchoolDays ?? 180
    const planningDays = cal.teacherWorkDays ? cal.teacherWorkDays - totalDays : null
    const firstMonth = new Date(cal.firstDay + 'T00:00:00').toLocaleString('en-US', { month: 'long' })
    const lastMonth = new Date(cal.lastDay + 'T00:00:00').toLocaleString('en-US', { month: 'long' })
    const springBreakLength = springBreak ? weekdaysBetween(springBreak.start, springBreak.end) : 0

    // Utility questions first — these are NOT duplicated elsewhere on the page.
    // Date questions come after; they're still useful for districts without districtFaqs.
    return [
      {
        q: `Does ${district.name} have a fall break in ${cal.schoolYear}?`,
        a: fallBreak
          ? `Yes. ${district.name} has a fall break running from ${formatShortDate(fallBreak.start)} to ${formatShortDate(fallBreak.end)}, a total of ${fallBreak.days} calendar days.`
          : `${district.name} does not have a scheduled fall break in the ${cal.schoolYear} calendar. The fall semester runs continuously from the first day of school in ${firstMonth} until the Thanksgiving recess in November.`,
      },
      {
        q: `How can I add ${district.name}'s school calendar to Google Calendar?`,
        a: `To add the ${district.name} ${cal.schoolYear} calendar to Google Calendar, download the .ics file from this page, then open Google Calendar, go to Settings → Import & Export → Import, and upload the file. This is a one-time import and will not automatically update if the district revises its calendar.`,
      },
      {
        q: `When is Spring Break for ${district.name} in ${cal.schoolYear}?`,
        a: springBreak
          ? `Spring Break for ${district.name} runs ${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}, a ${springBreakLength}-weekday break.`
          : `Spring break dates for ${district.name} ${cal.schoolYear} are listed in the calendar above.`,
      },
      {
        q: `Does ${district.name} have early release days in ${cal.schoolYear}?`,
        a: `Early release (also called early dismissal) days are not always listed in the main district calendar — they are often communicated by individual schools. If your child's school has scheduled early release days, you will typically receive notice from the school directly. The key dates listed on this page reflect the official district-wide calendar published at ${sourceUrl}.`,
      },
      {
        q: `Is this school calendar official and accurate?`,
        a: `The calendar on this page is sourced from the official ${district.name} website at ${sourceUrl}. ${cal.lastVerifiedAt ? `Last checked against the public official source on ${new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` : `Not yet checked against the current official calendar.`} MySchoolDates is an independent reference, and districts occasionally revise published calendars — confirm directly with ${district.name} before making plans.`,
      },
      {
        q: `When does school start for ${district.name} in ${cal.schoolYear}?`,
        a: `The first day of school for ${district.name} is ${formatDate(cal.firstDay)}. Students and staff are expected to report on this date to begin the new academic year.`,
      },
      {
        q: `When is the last day of school for ${district.name} in ${cal.schoolYear}?`,
        a: `The last day of school for ${district.name} is ${formatDate(cal.lastDay)}. The school year runs from ${firstMonth} through ${lastMonth}, covering ${totalDays} instructional days.`,
      },
      {
        q: `When does the second semester start for ${district.name} in ${cal.schoolYear}?`,
        a: secondSemStart
          ? `Students return after winter break on ${formatDate(secondSemStart)}. Check the official ${district.name} calendar if you need confirmation of semester or grading-period labels.`
          : `Students usually return in January after the winter recess. Check the official ${district.name} calendar for the exact return date.`,
      },
      {
        q: `When is spring break ${cal.schoolYear} for ${district.name}?`,
        a: springBreak
          ? `Spring break for ${district.name} runs ${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}, ${springBreakLength} weekdays.`
          : `Spring break dates are listed in the calendar above.`,
      },
      {
        q: `When is winter break ${cal.schoolYear} for ${district.name}?`,
        a: winterBreak
          ? `Winter break for ${district.name} runs ${formatShortDate(winterBreak.start)}–${formatShortDate(winterBreak.end)}, ${winterBreak.days} calendar days.${secondSemStart ? ` School resumes ${formatShortDate(secondSemStart)}.` : ''}`
          : `Winter break dates are listed in the calendar above.`,
      },
      {
        q: `How long is Thanksgiving break for ${district.name} in ${cal.schoolYear}?`,
        a: thanksgivingBreak
          ? `Thanksgiving break for ${district.name} runs ${formatShortDate(thanksgivingBreak.start)}–${formatShortDate(thanksgivingBreak.end)}, ${thanksgivingBreak.days} calendar days.`
          : `Thanksgiving break dates are listed in the calendar above.`,
      },
      {
        q: `How many school days are in the ${cal.schoolYear} school year for ${district.name}?`,
        a: `${district.name} has ${totalDays} instructional days in the ${cal.schoolYear} academic year. This count excludes weekends, listed school breaks, district-observed holidays, and teacher planning days.`,
      },
      {
        q: `How many teacher work days does ${district.name} have in ${cal.schoolYear}?`,
        a: cal.teacherWorkDays
          ? `${district.name} has ${cal.teacherWorkDays} teacher work days in ${cal.schoolYear}. This includes all ${totalDays} student instructional days${planningDays ? ` plus ${planningDays} additional days for planning, professional development, and pre- and post-school year activities` : ''}. Based on the official ${district.name} teacher work calendar.`
          : `Teacher work days include all student instructional days plus additional planning and professional development days. Visit the official ${district.name} website for the complete teacher calendar.`,
      },
      {
        q: `What holidays does ${district.name} observe in ${cal.schoolYear}?`,
        a: `${district.name} observes the following holidays in ${cal.schoolYear}: ${holidays.map(h => h.name).join(', ')}. Schools are closed on these dates and no instruction takes place.`,
      },
      {
        q: `How many school breaks does ${district.name} have in ${cal.schoolYear}?`,
        a: `${district.name} has ${breaks.length} major school break${breaks.length !== 1 ? 's' : ''} in the ${cal.schoolYear} school year: ${breaks.map(b => b.name).join(', ')}. Together these listed break periods total ${breaks.reduce((sum, b) => sum + b.days, 0)} calendar days.`,
      },
    ]
  }

  function downloadICS(
    district: { name: string; slug: string },
    cal: { schoolYear: string; events: Array<{ date: string; name: string; type: string }> }
  ) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SchoolCalendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${district.name} ${cal.schoolYear}`,
    ]
    const eventsForExport = cal.events.filter(event =>
      event.type !== 'break_end' &&
      !isCoveredByBreak(event, cal.events)
    )
    const breaks = getBreaks(cal.events)
    for (const event of eventsForExport) {
      const start = event.date.replace(/-/g, '')
      const breakRange = event.type === 'break_start'
        ? breaks.find(b => b.name === event.name && b.start === event.date)
        : null
      const nextDay = new Date((breakRange?.end ?? event.date) + 'T00:00:00')
      nextDay.setDate(nextDay.getDate() + 1)
      const end = nextDay.toISOString().slice(0, 10).replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${event.name} – ${district.name}`,
        `UID:${start}-${end}-${event.type}@myschooldates.com`,
        'END:VEVENT',
      )
    }
    lines.push('END:VCALENDAR')

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${district.slug}-${cal.schoolYear}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  const eventTypeLabel: Record<string, string> = {
    school_start: 'First Day', school_end: 'Last Day', holiday: 'Holiday',
    break_start: 'Break Starts', break_end: 'Break Ends',
    no_school: 'No School', student_holiday: 'No School',
    early_release: 'Early Release', early_dismissal: 'Early Dismissal',
    makeup_day: 'Make-Up Day', school_resume: 'School Resumes', school_reopen: 'School Resumes',
    quarter_start: 'Start of Quarter', quarter_end: 'End of Quarter', semester_end: 'End of Semester',
    graduation: 'Graduation', academic: 'Academic', observance: 'Observance',
    teacher_workday: 'Teacher Workday',
  }

  const eventTypeColor: Record<string, string> = {
    school_start: 'bg-green-100 text-green-800',
    school_end: 'bg-red-100 text-red-800',
    holiday: 'bg-blue-100 text-blue-800',
    break_start: 'bg-purple-100 text-purple-800',
    break_end: 'bg-purple-100 text-purple-800',
    no_school: 'bg-yellow-100 text-yellow-800',
    student_holiday: 'bg-yellow-100 text-yellow-800',
    early_release: 'bg-orange-100 text-orange-800',
    early_dismissal: 'bg-orange-100 text-orange-800',
    makeup_day: 'bg-orange-100 text-orange-800',
    school_resume: 'bg-green-100 text-green-800',
    school_reopen: 'bg-green-100 text-green-800',
    quarter_start: 'bg-gray-100 text-gray-700',
    quarter_end: 'bg-gray-100 text-gray-700',
    semester_end: 'bg-gray-100 text-gray-700',
    graduation: 'bg-green-100 text-green-800',
    academic: 'bg-gray-100 text-gray-700',
    observance: 'bg-blue-50 text-blue-700',
    teacher_workday: 'bg-yellow-100 text-yellow-800',
  }

  return {
    formatDate, formatShortDate, formatMonthYear, daysUntil, daysBetween,
    getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, isCoveredByBreak,
    eventTypeLabel, eventTypeColor,
  }
}
