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

  function getBreaks(events: Array<{ date: string; name: string; type: string }>) {
    const result: { name: string; start: string; end: string; days: number }[] = []
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'break_start') {
        const baseName = events[i].name
        const endEvent = events.find(
          (e, j) => j > i && e.type === 'break_end' && e.name.replace(' End', '') === baseName
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

  // Returns the first school day after winter break ends
  function getSecondSemesterStart(events: Array<{ date: string; name: string; type: string }>): string {
    const winterEnd = events.find(
      e => e.type === 'break_end' && e.name.toLowerCase().includes('winter')
    )
    if (!winterEnd) return ''
    const d = new Date(winterEnd.date + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
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

    return [
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
          ? `The second semester for ${district.name} begins on ${formatDate(secondSemStart)}, following the winter recess. This marks the start of the spring portion of the ${cal.schoolYear} academic year.`
          : `The second semester begins in January after the winter recess. Check the official ${district.name} calendar for the exact return date.`,
      },
      {
        q: `When is spring break ${cal.schoolYear} for ${district.name}?`,
        a: springBreak
          ? `Spring break for ${district.name} runs from ${formatShortDate(springBreak.start)} to ${formatShortDate(springBreak.end)}, a total of ${springBreak.days} days. Schools reopen the Monday following the break.`
          : `Spring break dates are listed in the calendar above. Check the official ${district.name} website for the most current schedule.`,
      },
      {
        q: `When is winter break ${cal.schoolYear} for ${district.name}?`,
        a: winterBreak
          ? `Winter break for ${district.name} runs from ${formatShortDate(winterBreak.start)} to ${formatShortDate(winterBreak.end)}, totaling ${winterBreak.days} days. ${secondSemStart ? `Schools reopen on ${formatShortDate(secondSemStart)}.` : 'Schools reopen in early January.'}`
          : `Winter break dates are listed in the calendar above. Schools typically close in late December and reopen in early January.`,
      },
      {
        q: `How long is Thanksgiving break for ${district.name} in ${cal.schoolYear}?`,
        a: thanksgivingBreak
          ? `Thanksgiving break for ${district.name} in ${cal.schoolYear} runs from ${formatShortDate(thanksgivingBreak.start)} to ${formatShortDate(thanksgivingBreak.end)}, giving students ${thanksgivingBreak.days} days off. Schools reopen the Monday after Thanksgiving week.`
          : `Thanksgiving break typically covers the Wednesday through Friday surrounding Thanksgiving. Check the official ${district.name} calendar for exact dates.`,
      },
      {
        q: `How many school days are in the ${cal.schoolYear} school year for ${district.name}?`,
        a: `${district.name} has ${totalDays} instructional days in the ${cal.schoolYear} academic year. This count excludes weekends, federal holidays, school breaks, and teacher planning days.`,
      },
      {
        q: `How many teacher work days does ${district.name} have in ${cal.schoolYear}?`,
        a: cal.teacherWorkDays
          ? `${district.name} has ${cal.teacherWorkDays} teacher work days in ${cal.schoolYear}. This includes all ${totalDays} student instructional days${planningDays ? ` plus ${planningDays} additional days for planning, professional development, and pre- and post-school year activities` : ''}.`
          : `Teacher work days include all student instructional days plus additional planning and professional development days. Visit the official ${district.name} website for the complete teacher calendar.`,
      },
      {
        q: `What holidays does ${district.name} observe in ${cal.schoolYear}?`,
        a: `${district.name} observes the following holidays in ${cal.schoolYear}: ${holidays.map(h => h.name).join(', ')}. Schools are closed on these dates and no instruction takes place.`,
      },
      {
        q: `How many semesters does ${district.name} have in ${cal.schoolYear}?`,
        a: `The ${cal.schoolYear} school year is divided into ${semesters} semester${semesters !== 1 ? 's' : ''}. The first semester begins in ${firstMonth} and ends before the winter break in December. The second semester resumes in January and runs through ${lastMonth}.`,
      },
      {
        q: `Are teacher planning days included in the ${cal.schoolYear} calendar?`,
        a: planningDays
          ? `Yes. The ${cal.schoolYear} calendar includes ${planningDays} teacher planning and professional development days on top of the ${totalDays} student instructional days. Students do not attend school on these days.`
          : `Yes. The calendar includes teacher planning days and professional development days when students do not attend. These are separate from the ${totalDays} instructional days and are marked on the official district calendar.`,
      },
      {
        q: `Is there school on Labor Day for ${district.name}?`,
        a: `No. Labor Day falls on the first Monday of September and is a non-instructional day for all students and staff at ${district.name}. It marks one of the first holidays of the school year, just weeks after the fall semester begins.`,
      },
      {
        q: `Is Memorial Day a school holiday for ${district.name}?`,
        a: `Yes. Memorial Day, observed on the last Monday of May, is a school holiday at ${district.name}. It typically falls just one to two weeks before the last day of school, giving students and families a long weekend near the end of the year.`,
      },
      {
        q: `Where can I find the official ${district.name} calendar?`,
        a: `The official ${cal.schoolYear} calendar is published at ${sourceUrl}. You can also download all important dates as an ICS file directly from this page to add them to Google Calendar, Apple Calendar, or Outlook.`,
      },
      {
        q: `How many school breaks does ${district.name} have in ${cal.schoolYear}?`,
        a: `${district.name} has ${breaks.length} major school break${breaks.length !== 1 ? 's' : ''} in the ${cal.schoolYear} school year: ${breaks.map(b => b.name).join(', ')}. Together these breaks total ${breaks.reduce((sum, b) => sum + b.days, 0)} days off outside of federal holidays.`,
      },
      {
        q: `Does ${district.name} have a fall break in ${cal.schoolYear}?`,
        a: fallBreak
          ? `Yes. ${district.name} has a fall break running from ${formatShortDate(fallBreak.start)} to ${formatShortDate(fallBreak.end)}, a total of ${fallBreak.days} days. This mid-semester break typically falls in October.`
          : `${district.name} does not have a scheduled fall break in the ${cal.schoolYear} calendar. The fall semester runs continuously from the first day of school in ${firstMonth} until the Thanksgiving recess in November.`,
      },
      {
        q: `What is the total number of holidays at ${district.name} in ${cal.schoolYear}?`,
        a: `${district.name} observes ${holidays.length} official school holidays in the ${cal.schoolYear} school year. These include: ${holidays.map(h => h.name).join(', ')}. Schools are closed and no instruction takes place on these dates.`,
      },
      {
        q: `How can I add ${district.name}'s school calendar to Google Calendar?`,
        a: `To add the ${district.name} ${cal.schoolYear} calendar to Google Calendar, download the .ics file from this page, then open Google Calendar, go to Settings → Import & Export → Import, and upload the file. All school holidays, breaks, and key dates will appear on your calendar automatically.`,
      },
      {
        q: `When does summer break start for ${district.name} in ${cal.schoolYear}?`,
        a: `Summer break for ${district.name} begins the day after the last day of school on ${formatDate(cal.lastDay)}. Students and staff are off for the summer until the first day of the next school year, typically in ${firstMonth} of the following year.`,
      },
      {
        q: `Does the ${district.name} school calendar change every year?`,
        a: `Yes. The ${district.name} school board sets a new academic calendar each year. Dates for the first and last day of school, holiday breaks, and teacher planning days may shift from year to year. Always verify the current year's schedule at the official district website before making travel or childcare plans.`,
      },
      {
        q: `Can I plan family travel during Spring Break for ${district.name} in ${cal.schoolYear}?`,
        a: springBreak
          ? `Yes. Spring Break for ${district.name} runs from ${formatShortDate(springBreak.start)} to ${formatShortDate(springBreak.end)} — a ${springBreak.days}-day window. Book travel early, as this is one of the busiest vacation periods of the year for families in the district.`
          : `Check the calendar above for the spring break dates for ${district.name} in ${cal.schoolYear}. Spring break is one of the most popular family travel periods, so booking early is recommended.`,
      },
      {
        q: `I just moved to the area — when should I enroll my child at ${district.name}?`,
        a: `Enrollment at ${district.name} is open year-round, but families who arrive before the school year begins have the most flexibility in school selection. The ${cal.schoolYear} school year starts on ${formatDate(cal.firstDay)}. Visit the official ${district.name} website at ${officialWebsite} for enrollment requirements, required documents, and your assigned school based on home address.`,
      },
      {
        q: `Can I subscribe to the ${district.name} calendar so it updates automatically?`,
        a: `The .ics file available on this page is a static snapshot of the ${cal.schoolYear} calendar. For live updates, subscribe directly from the official ${district.name} website if they provide a calendar subscription link. You can also download a fresh .ics file from this page whenever the district updates its calendar.`,
      },
      {
        q: `Does school start on Veterans Day at ${district.name}?`,
        a: `No. Veterans Day, observed on November 11, is a school holiday at ${district.name}. Schools are closed for students and staff. If November 11 falls on a weekend, the district may observe the holiday on the nearest weekday — check the official calendar for the exact date.`,
      },
      {
        q: `Can I use the ${district.name} school calendar for vacation planning?`,
        a: `Yes — that's exactly what this calendar is for. The most important dates to plan around are Spring Break (${springBreak ? `${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}` : 'check the calendar above'}), Winter Break (${winterBreak ? `${formatShortDate(winterBreak.start)}–${formatShortDate(winterBreak.end)}` : 'late December to early January'}), and the last day of school (${formatShortDate(cal.lastDay)}). You can also download the full calendar as an .ics file to add all dates directly to Google Calendar or Apple Calendar.`,
      },
      {
        q: `Is the Thanksgiving break at ${district.name} a full week off?`,
        a: thanksgivingBreak
          ? `No — Thanksgiving break at ${district.name} is ${thanksgivingBreak.days} days (${formatShortDate(thanksgivingBreak.start)} through ${formatShortDate(thanksgivingBreak.end)}), not a full week. Schools reopen the following Monday.`
          : `Thanksgiving break at ${district.name} typically covers Wednesday through Friday. Schools are not closed for the full week unless a separate district decision is made. Check the official calendar above for exact dates.`,
      },
      {
        q: `Does ${district.name} have early release days in ${cal.schoolYear}?`,
        a: `Early release (also called early dismissal) days are not always listed in the main district calendar — they are often communicated by individual schools. If your child's school has scheduled early release days, you will typically receive notice from the school directly. The key dates listed on this page reflect the official district-wide calendar published at ${sourceUrl}.`,
      },
      {
        q: `Is this school calendar official and accurate?`,
        a: `The calendar on this page is based on data sourced from the official ${district.name} website at ${sourceUrl}. ${cal.lastVerifiedAt ? `It was last verified on ${new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` : `It has not yet been verified against the current official calendar.`} School districts occasionally adjust dates after publication — always confirm critical dates directly with ${district.name} before making travel or childcare commitments.`,
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
    for (const event of cal.events) {
      const start = event.date.replace(/-/g, '')
      const nextDay = new Date(event.date + 'T00:00:00')
      nextDay.setDate(nextDay.getDate() + 1)
      const end = nextDay.toISOString().slice(0, 10).replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${event.name} – ${district.name}`,
        `UID:${start}-${event.type}@myschooldates.com`,
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
    no_school: 'No School', early_dismissal: 'Early Dismissal',
  }

  const eventTypeColor: Record<string, string> = {
    school_start: 'bg-green-100 text-green-800',
    school_end: 'bg-red-100 text-red-800',
    holiday: 'bg-blue-100 text-blue-800',
    break_start: 'bg-purple-100 text-purple-800',
    break_end: 'bg-purple-100 text-purple-800',
    no_school: 'bg-yellow-100 text-yellow-800',
    early_dismissal: 'bg-orange-100 text-orange-800',
  }

  return {
    formatDate, formatShortDate, formatMonthYear, daysUntil, daysBetween,
    getBreaks, getSecondSemesterStart, generateFaqs, downloadICS,
    eventTypeLabel, eventTypeColor,
  }
}
