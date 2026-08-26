type CountRow = ReadonlyArray<string | number>

type TrendRecord = {
  state?: string
}

type TrendSummary = {
  startMonths?: CountRow[]
  topFirstDays?: CountRow[]
  endMonths?: CountRow[]
  topLastDays?: CountRow[]
  winterBreakSignals?: CountRow[]
  springBreakSignals?: CountRow[]
  stateCounts?: CountRow[]
  instructionalDayCounts?: CountRow[]
  explicitInstructionalDayCounts?: number
  sourcePdfCount?: number
}

type TrendDataset = {
  records?: TrendRecord[]
  summary?: TrendSummary
}

function rowsToMap(rows: CountRow[] = []) {
  return new Map(rows.map(row => [String(row[0]), Number(row[1] ?? 0)]))
}

export function getSchoolCalendarTrendStats(dataset: TrendDataset) {
  const records = Array.isArray(dataset.records) ? dataset.records : []
  const summary = dataset.summary ?? {}
  const districtCount = records.length
  const stateCount = new Set(records.map(record => record.state).filter(Boolean)).size

  const startMonths = rowsToMap(summary.startMonths)
  const firstDays = rowsToMap(summary.topFirstDays)
  const endMonths = rowsToMap(summary.endMonths)
  const lastDays = rowsToMap(summary.topLastDays)
  const winterBreakSignals = rowsToMap(summary.winterBreakSignals)
  const springBreakSignals = rowsToMap(summary.springBreakSignals)
  const stateCounts = rowsToMap(summary.stateCounts)
  const instructionalDayCounts = rowsToMap(summary.instructionalDayCounts)

  const count = (values: Map<string, number>, label: string) => values.get(label) ?? 0
  const percent = (value: number, digits = 1, denominator = districtCount) => {
    if (!denominator) return '0%'
    return `${((value / denominator) * 100).toFixed(digits).replace(/\.0$/, '')}%`
  }

  return {
    districtCount,
    stateCount,
    sourcePdfCount: Number(summary.sourcePdfCount ?? 0),
    explicitInstructionalDayCount: Number(summary.explicitInstructionalDayCounts ?? 0),
    startMonthCount: (label: string) => count(startMonths, label),
    firstDayCount: (label: string) => count(firstDays, label),
    endMonthCount: (label: string) => count(endMonths, label),
    lastDayCount: (label: string) => count(lastDays, label),
    winterBreakCount: (label: string) => count(winterBreakSignals, label),
    springBreakCount: (label: string) => count(springBreakSignals, label),
    stateDistrictCount: (label: string) => count(stateCounts, label),
    instructionalDayCount: (label: string) => count(instructionalDayCounts, label),
    percent,
  }
}
