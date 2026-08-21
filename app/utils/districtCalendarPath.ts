type DistrictCalendarRoute = {
  slug?: string | null
  currentSchoolYear?: string | null
}

export function districtCalendarPath(
  district: DistrictCalendarRoute,
  schoolYear?: string | null,
) {
  if (!district.slug) return '/districts'
  const year = schoolYear ?? district.currentSchoolYear
  return year ? `/${district.slug}/${year}` : `/${district.slug}`
}
