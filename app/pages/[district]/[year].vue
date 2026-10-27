<script setup lang="ts">
import '~/assets/css/district-details.css'
import { isPairedStudentEventEnd, isStudentCalendarEvent, pairedBreakEndDate, pairedStudentEventEndDate } from '~/utils/calendarOverview'
import { formatCalendarRange } from '~/utils/calendarDetails'

definePageMeta({ key: route => route.path })

const route = useRoute()
const slug = route.params.district as string
const year = route.params.year as string
const { formatShortDate, getBreaks } = useDistrictPage()
const { data: district } = await useAsyncData(`district:${slug}`, () =>
  queryCollection('districts').where('slug', '=', slug).first()
)
if (!district.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found' })
}
const [{ data: cal }, { data: yearOptions }] = await Promise.all([
  useAsyncData(`cal:${slug}:${year}`, () => queryCollection('calendars')
    .where('institutionId', '=', district.value!.institutionId)
    .where('schoolYear', '=', year).first()),
  useAsyncData(`years:${slug}`, async () => {
    const calendars = await queryCollection('calendars')
      .where('institutionId', '=', district.value!.institutionId)
      .order('schoolYear', 'DESC').all()
    return calendars.map(calendar => calendar.schoolYear)
  }),
])
if (!cal.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found' })
}

const availableYears = computed(() => yearOptions.value ?? [])
const hubUrl = `https://myschooldates.com/${slug}`
const canonicalUrl = `${hubUrl}/${year}`
const breaks = computed(() => getBreaks(cal.value!.events))
const editorialAuthorName = 'Denis Dou'
const updatedDate = computed(() => cal.value!.dateModified ?? cal.value!.lastVerifiedAt)
const summary = computed(() => cal.value!.heroSummary ?? cal.value!.meta?.heroSummary
  ?? `School holidays, breaks, and important dates for ${district.value!.name} in ${year}. The school year runs from ${formatCalendarRange(cal.value!.firstDay)} to ${formatCalendarRange(cal.value!.lastDay)}. Download the PDF or add these dates to Google or Apple Calendar below.`)
const notes = computed(() => {
  const text = cal.value!.calendarNotes ?? cal.value!.meta?.calendarNotes
  if (typeof text === 'string' && text.trim()) return text.split(/\n{2,}/).filter(Boolean)
  return [
    `${district.value!.name}'s ${year} school year begins ${formatCalendarRange(cal.value!.firstDay)} and ends ${formatCalendarRange(cal.value!.lastDay)}.`,
    ...(breaks.value.length ? [`Published school breaks include ${breaks.value.map(item => `${item.name.replace(/\b(?:Begins|Starts)\b/gi, '').trim()} (${formatCalendarRange(item.start, item.end)})`).join('; ')}.`] : []),
    'School calendars may change. Check the district calendar for emergency closures, make-up days, and school-specific schedules before making plans.',
  ]
})
const notesExpanded = ref(false)
const { data: relatedCalendars } = await useAsyncData(`detail-related:${slug}:${year}`, async () => {
  const configured = district.value!.relatedDistricts ?? []
  if (!configured.length) return []
  const slugs = new Set(configured.map(item => item.slug).filter(Boolean))
  const [districts, calendars] = await Promise.all([
    queryCollection('districts').all(),
    queryCollection('calendars').where('schoolYear', '=', year).all(),
  ])
  const availableIds = new Set(calendars.map(calendar => calendar.institutionId))
  return districts.filter(item => slugs.has(item.slug)).map(item => ({
    name: item.shortName || item.name,
    href: availableIds.has(item.institutionId) ? `/${item.slug}/${year}` : `/${item.slug}`,
    year: availableIds.has(item.institutionId) ? year : '',
  }))
})
const officialHost = computed(() => new URL(district.value!.officialWebsite).hostname.replace(/^www\./, ''))
const sourceLinks = computed(() => {
  const configured = cal.value!.sources ?? cal.value!.meta?.sources ?? district.value!.sources ?? []
  const links = [
    { label: `${district.value!.shortName || district.value!.name} calendar source`, url: cal.value!.sourceUrl ?? district.value!.calendarPage },
    ...(Array.isArray(configured) ? configured : []),
  ] as Array<{ label: string; url: string }>
  return links.filter((link, index) => link.url && links.findIndex(item => item.url === link.url) === index)
})

function eventSchemaLocation() {
  return {
    '@type': 'Place',
    name: `${district.value!.name} districtwide calendar`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: district.value!.city ?? '',
      addressRegion: district.value!.stateCode ?? district.value!.state,
      addressCountry: district.value!.country ?? 'US',
    },
  }
}

const _dn = district.value.name
const _sn = (district.value as any).shortName || _dn
const _titleSuffix = (cal.value as any).sourcePdfUrl ? ': PDF & Holidays' : ': Holidays & Key Dates'
const _fd = formatShortDate(cal.value.firstDay)
const _ld = formatShortDate(cal.value.lastDay)
const _hasSpring = breaks.value.some(b => b.name.toLowerCase().includes('spring'))
const _descTemplates = [
  // A — PDF + key dates (~130 chars)
  `${_sn} Calendar ${year} with holidays${_hasSpring ? ', spring break' : ''} and key dates. Download the official PDF or calendar import file.`,
  // B — verified + download (~125 chars)
  `${_sn} Calendar ${year}: first day ${_fd}, last day ${_ld}${_hasSpring ? ', spring break' : ''}. Checked against district source. Download the PDF or .ics calendar file.`,
  // C — user benefit (~135 chars)
  `${_sn} Calendar ${year} — verified holidays${_hasSpring ? ', spring break' : ''}, key dates, and official PDF download. Works with Google Calendar.`,
  // D — ICS/sync (~130 chars)
  `${_sn} ${year} calendar dates sourced from official district calendars, with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or importable .ics file.`,
  // E — verified dates (~130 chars)
  `${_sn} ${year}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''}, official PDF, and calendar import file.`,
]
const _autoDesc = _descTemplates[simpleHash(district.value.slug + year) % _descTemplates.length]
const _autoTitle = `${_dn} Calendar ${year}${_titleSuffix}`

const _replacePlaceholders = (s: string) =>
  s.replace(/\{year\}/g, year).replace(/\{shortName\}/g, _sn).replace(/\{name\}/g, _dn)
const _districtTitle = (district.value as any).seoTitle ? _replacePlaceholders((district.value as any).seoTitle) : undefined
const _districtDesc = (district.value as any).seoDescription ? _replacePlaceholders((district.value as any).seoDescription) : undefined
const _pageTitle = (cal.value as any).seoTitle ?? _districtTitle ?? _autoTitle
const _pageDesc = (cal.value as any).seoDescription ?? _districtDesc ?? _autoDesc
const schemaLogoUrl = 'https://myschooldates.com/icons/icon-512.png'
const schemaLicenseUrl = 'https://myschooldates.com/data-license'

useSeoMeta({
  title: _pageTitle,
  description: _pageDesc,
  ogTitle: _pageTitle,
  ogDescription: _pageDesc,
  ogUrl: canonicalUrl,
  twitterTitle: _pageTitle,
  twitterDescription: _pageDesc,
})

const sitePublisher = {
  '@type': 'Organization',
  '@id': 'https://myschooldates.com/#organization',
  name: 'MySchoolDates',
  url: 'https://myschooldates.com',
  logo: {
    '@type': 'ImageObject',
    url: schemaLogoUrl,
    width: 512,
    height: 512,
  },
}
const reviewTeamEntity = {
  '@type': 'Organization',
  '@id': 'https://myschooldates.com/#education-research-team',
  name: 'MySchoolDates Calendar Data Team',
  url: 'https://myschooldates.com/calendar-verification-methodology',
  parentOrganization: { '@id': 'https://myschooldates.com/#organization' },
}
const authorPersonEntity = {
  '@type': 'Person',
  '@id': 'https://myschooldates.com/author#person',
  name: editorialAuthorName,
  jobTitle: 'Founder & Education Data Research Lead',
  url: 'https://myschooldates.com/author',
  image: 'https://myschooldates.com/images/denis-dou.png',
  sameAs: ['https://www.linkedin.com/in/denis-dou/'],
  worksFor: { '@id': 'https://myschooldates.com/#organization' },
  knowsAbout: [
    'school calendar data',
    'K-12 education data',
    'district calendar verification',
    'structured calendar datasets',
    'official source verification',
    'parent-facing planning resources',
  ],
}
const siteEntity = {
  '@type': 'WebSite',
  '@id': 'https://myschooldates.com/#website',
  name: 'MySchoolDates',
  url: 'https://myschooldates.com',
  publisher: { '@id': 'https://myschooldates.com/#organization' },
}
const districtAbout = {
  '@type': 'EducationalOrganization',
  '@id': `${hubUrl}#district`,
  name: district.value.name,
  ...(district.value.shortName && district.value.shortName !== district.value.name ? { alternateName: district.value.shortName } : {}),
  url: district.value.officialWebsite,
}
const pageDateCreated = (cal.value as any).dateCreated
const pageDateModified = (cal.value as any).dateModified ?? (cal.value as any).lastVerifiedAt
const pageLastReviewed = (cal.value as any).lastReviewedAt ?? (cal.value as any).lastReviewed ?? (cal.value as any).lastVerifiedAt
const pageDatePublished = (cal.value as any).datePublished
const sourcePdfUrl = (cal.value as any).sourcePdfUrl
const printablePdfPath = (cal.value as any).printablePdfUrl
const printablePdfUrl = typeof printablePdfPath === 'string'
  ? printablePdfPath.startsWith('http') ? printablePdfPath : `https://myschooldates.com${printablePdfPath}`
  : ''
const includePrintablePdfInDatasetDistribution = Boolean(printablePdfUrl) &&
  !((cal.value as any)?.excludePrintablePdfFromDatasetDistribution || (cal.value as any)?.meta?.excludePrintablePdfFromDatasetDistribution)
const sourceUrl = (cal.value as any).sourceUrl ?? district.value.calendarPage
const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
const sourceCalendarName = (cal.value as any).sourceCalendarName ?? (cal.value as any).meta?.sourceCalendarName
  ?? `${district.value.name} ${year} Calendar ${sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'PDF' : 'Source'}`
const sourceVersion = (cal.value as any).sourceVersion ?? (cal.value as any).meta?.sourceVersion
const sourceCalendarId = String((cal.value as any).sourceCalendarId ?? (cal.value as any).meta?.sourceCalendarId ?? 'source-calendar').replace(/^#/, '')
const sourceCalendarDateCreated = (cal.value as any).sourceCalendarDateCreated ?? (cal.value as any).meta?.sourceCalendarDateCreated
const sourceCalendarDateModified = (cal.value as any).sourceCalendarDateModified ?? (cal.value as any).meta?.sourceCalendarDateModified
const sourcePdfSameAs = (cal.value as any).sourcePdfSameAs ?? (cal.value as any).meta?.sourcePdfSameAs
const sourcePageCitationUrl = sourceUrl && sourceUrl !== basedOnUrl ? sourceUrl : ''
const sourceCalendarEntityId = basedOnUrl
const sourceCalendarPageEntityId = sourcePageCitationUrl
const sourceCitation = [
  ...(sourceCalendarEntityId ? [{ '@id': sourceCalendarEntityId }] : []),
  ...(sourceCalendarPageEntityId ? [{ '@id': sourceCalendarPageEntityId }] : []),
]
const calendarTypeName = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const schemaCalendarName = (cal.value as any)?.schemaCalendarName ?? (cal.value as any)?.meta?.schemaCalendarName ?? (calendarTypeName
  ? `${district.value.name} ${calendarTypeName} Calendar ${year}`
  : `${district.value.name} Calendar ${year}`)
const schemaDatasetName = (cal.value as any)?.schemaDatasetName ?? (cal.value as any)?.meta?.schemaDatasetName ?? `${schemaCalendarName} Dataset`
const datasetDescription = (cal.value as any)?.schemaDatasetDescription ?? (cal.value as any)?.meta?.schemaDatasetDescription ?? (calendarTypeName
  ? `Major ${calendarTypeName} Calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`
  : `Major calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`)
const schemaCalendarDownloadName = (cal.value as any)?.schemaCalendarDownloadName ?? (cal.value as any)?.meta?.schemaCalendarDownloadName ?? `${schemaCalendarName} calendar file`
const schemaCalendarDownloadDescription = (cal.value as any)?.schemaCalendarDownloadDescription ?? (cal.value as any)?.meta?.schemaCalendarDownloadDescription ?? 'Calendar import file generated from district-published dates checked against the official sources used for this page.'
const schemaKeywords = [
  ...(((district.value as any).schemaKeywords ?? (district.value as any).meta?.schemaKeywords ?? []) as string[]),
  ...(((cal.value as any)?.schemaKeywords ?? (cal.value as any)?.meta?.schemaKeywords ?? []) as string[]),
]
const schemaIsAccessibleForFree = (cal.value as any)?.schemaIsAccessibleForFree ?? (cal.value as any)?.meta?.schemaIsAccessibleForFree ?? (district.value as any)?.schemaIsAccessibleForFree ?? (district.value as any)?.meta?.schemaIsAccessibleForFree
const schemaDatasetVersion = (cal.value as any)?.schemaDatasetVersion ?? (cal.value as any)?.meta?.schemaDatasetVersion
const schemaDatasetDateModified = (cal.value as any)?.schemaDatasetDateModified ?? (cal.value as any)?.meta?.schemaDatasetDateModified ?? pageDateModified
const configuredSchemaVariableMeasured = (((cal.value as any)?.schemaVariableMeasured ?? (cal.value as any)?.meta?.schemaVariableMeasured ?? []) as Array<string | Record<string, any>>)
const schemaVariableMeasured = (configuredSchemaVariableMeasured.length
  ? configuredSchemaVariableMeasured
  : [
      'School calendar event name',
      'School calendar event date',
      'School calendar event type',
    ]
).map(variable => typeof variable === 'string'
  ? { '@type': 'PropertyValue', name: variable }
  : variable)
const isPdfResource = (url?: string, encodingFormat?: string) =>
  encodingFormat === 'application/pdf' ||
  Boolean(url && (/\.pdf(?:$|[?#])/i.test(url) || /drive\.google\.com\/file\//i.test(url)))
const sourceCalendarIsPdf = isPdfResource(
  basedOnUrl,
  sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'application/pdf' : undefined,
)
const sourceCalendarEntity = basedOnUrl ? {
  '@type': sourceCalendarIsPdf ? 'DigitalDocument' : 'WebPage',
  '@id': sourceCalendarEntityId,
  name: sourceCalendarName,
  ...(sourceCalendarIsPdf ? { encodingFormat: 'application/pdf' } : {}),
  ...(sourceVersion ? { version: sourceVersion } : {}),
  ...(sourceCalendarDateCreated ? { dateCreated: sourceCalendarDateCreated } : {}),
  ...(sourceCalendarDateModified ? { dateModified: sourceCalendarDateModified } : {}),
  ...(sourcePdfSameAs ? { sameAs: sourcePdfSameAs } : {}),
  url: basedOnUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const additionalSourceCalendarConfigs = (((cal.value as any)?.schemaAdditionalSourceCalendars ?? (cal.value as any)?.meta?.schemaAdditionalSourceCalendars ?? []) as any[])
  .filter(source => source?.url && source?.name)
  .filter((source, index, sources) =>
    source.url !== sourceCalendarEntityId &&
    source.url !== sourceCalendarPageEntityId &&
    sources.findIndex(candidate => candidate.url === source.url) === index,
  )
const additionalSourceCalendarEntities = additionalSourceCalendarConfigs
  .map((source) => {
    const sourceIsPdf = isPdfResource(source.url, source.encodingFormat)
    return {
      '@type': sourceIsPdf ? 'DigitalDocument' : source.type ?? 'CreativeWork',
      '@id': source.url,
      name: source.name,
      ...(sourceIsPdf ? { encodingFormat: 'application/pdf' } : source.encodingFormat ? { encodingFormat: source.encodingFormat } : {}),
      ...(source.version ? { version: source.version } : {}),
      ...(source.dateCreated ? { dateCreated: source.dateCreated } : {}),
      ...(source.dateModified ? { dateModified: source.dateModified } : {}),
      ...(source.datePublished ? { datePublished: source.datePublished } : {}),
      ...(source.sameAs ? { sameAs: source.sameAs } : {}),
      url: source.url,
      publisher: source.publisherName ? {
        '@type': 'EducationalOrganization',
        name: source.publisherName,
        ...(source.publisherUrl ? { url: source.publisherUrl } : {}),
      } : { '@id': districtAbout['@id'] },
    }
  })
const sourceCalendarPageEntity = sourcePageCitationUrl ? {
  '@type': 'WebPage',
  '@id': sourceCalendarPageEntityId,
  name: `${district.value.name} calendar page`,
  url: sourcePageCitationUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const sourceBasedOnRefs = [
  ...(sourceCalendarEntityId ? [{ '@id': sourceCalendarEntityId }] : []),
  ...(sourceCalendarPageEntityId ? [{ '@id': sourceCalendarPageEntityId }] : []),
  ...additionalSourceCalendarEntities.map(source => ({ '@id': source['@id'] })),
]
const selectSourceRefs = (sourceIds: string[] | undefined) => Array.isArray(sourceIds)
  ? sourceIds
      .map(id => {
        if ((id === 'source-calendar' || id === sourceCalendarId) && sourceCalendarEntityId) return { '@id': sourceCalendarEntityId }
        if (id === 'source-calendar-page' && sourceCalendarPageEntityId) return { '@id': sourceCalendarPageEntityId }
        const additionalSourceIndex = additionalSourceCalendarConfigs.findIndex(source => source.id === id)
        if (additionalSourceIndex >= 0) return { '@id': additionalSourceCalendarEntities[additionalSourceIndex]!['@id'] }
        return null
      })
      .filter(Boolean)
  : sourceBasedOnRefs
const datasetSourceCalendarIds = (((cal.value as any)?.schemaDatasetSourceCalendarIds ?? (cal.value as any)?.meta?.schemaDatasetSourceCalendarIds) as string[] | undefined)
const datasetBasedOnRefs = selectSourceRefs(datasetSourceCalendarIds)
const datasetBasedOnValue = datasetBasedOnRefs.length === 1 ? datasetBasedOnRefs[0] : datasetBasedOnRefs
const webPageIsBasedOnSourceIds = (((cal.value as any)?.schemaWebPageIsBasedOnSourceIds ?? (cal.value as any)?.meta?.schemaWebPageIsBasedOnSourceIds) as string[] | undefined)
const webPageBasedOnRefs = selectSourceRefs(webPageIsBasedOnSourceIds)
const webPageBasedOnValue = webPageBasedOnRefs.length === 1 ? webPageBasedOnRefs[0] : webPageBasedOnRefs
const calendarIcsUrl = `https://myschooldates.com/calendars/${district.value.slug}-${cal.value.schoolYear}.ics`
const hideIcsFromDatasetDistribution = computed(() => Boolean((cal.value as any)?.hideIcsFromDatasetDistribution || (cal.value as any)?.meta?.hideIcsFromDatasetDistribution))
const calendarTrackDistributions = computed(() => hideIcsFromDatasetDistribution.value
  ? []
  : (((cal.value as any)?.calendarTrackDownloads ?? (cal.value as any)?.meta?.calendarTrackDownloads ?? []) as Array<{ id?: string; label?: string; description?: string }>)
      .filter(track => track.id && track.label)
      .map(track => ({
        '@type': 'DataDownload',
        name: String(track.label).replace(/\s+—\s+\.ics$/, ''),
        description: track.description || `One-time calendar import for the ${track.label}.`,
        encodingFormat: 'text/calendar',
        contentUrl: `https://myschooldates.com/calendars/${district.value!.slug}-${cal.value!.schoolYear}-${track.id}.ics`,
      })))
const hideDatasetSchema = computed(() => false)
const spatialCoverageOverride = (cal.value as any)?.schemaSpatialCoverage ?? (cal.value as any)?.meta?.schemaSpatialCoverage ?? (district.value as any)?.schemaSpatialCoverage ?? (district.value as any)?.meta?.schemaSpatialCoverage
const spatialCoverageValue = Array.isArray(spatialCoverageOverride)
  ? spatialCoverageOverride
      .map(area => typeof area === 'string' ? { '@type': 'Place', name: area } : area)
      .filter(area => area?.name)
  : typeof spatialCoverageOverride === 'string'
    ? { '@type': 'Place', name: spatialCoverageOverride }
    : spatialCoverageOverride?.name
      ? spatialCoverageOverride
      : {
          '@type': 'Place',
          name: `${district.value.name} service area${district.value.state ? `, ${district.value.state}` : ''}`,
        }
const hasSpatialCoverage = Array.isArray(spatialCoverageValue)
  ? spatialCoverageValue.length > 0
  : Boolean(spatialCoverageValue)
const datasetTemporalCoverage = computed(() => {
  const start = (cal.value as any)?.temporalCoverageStart || cal.value!.firstDay
  const end = (cal.value as any)?.temporalCoverageEnd || cal.value!.lastDay
  return `${start}/${end}`
})
function normalizeSchemaEventName(event: any) {
  return String(event.name ?? '')
    .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}
function schemaEventEndDate(event: any) {
  if (event.endDate) return event.endDate
  if (Array.isArray(event.dates) && event.dates.length) return [...event.dates].sort().at(-1) ?? event.date
  const pairedEnd = pairedStudentEventEndDate(event, cal.value?.events ?? [])
  if (pairedEnd) return pairedEnd
  const breakEnd = pairedBreakEndDate(event, cal.value?.events ?? [])
  if (breakEnd) return breakEnd
  return event.date
}
function schemaEventSlug(event: any, index: number) {
  const name = normalizeSchemaEventName(event)
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${event.date}-${name || `event-${index + 1}`}`
}
const schemaCalendarEvents = computed(() => (cal.value?.events ?? [])
  .filter((event: any) => isStudentCalendarEvent(event, cal.value ?? undefined) && !isPairedStudentEventEnd(event, cal.value?.events ?? []) && !event.excludeFromDateSchema)
  .map((event: any, index: number) => {
    const name = normalizeSchemaEventName(event)
    const description = event.schemaDescription ?? event.description ?? `${name} on the ${district.value!.name} ${year} districtwide calendar.`
    return {
      '@type': 'Event',
      '@id': `${canonicalUrl}#event-${schemaEventSlug(event, index)}`,
      name,
      description,
      startDate: event.date,
      endDate: schemaEventEndDate(event),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: eventSchemaLocation(),
      organizer: { '@id': districtAbout['@id'] },
      url: `${canonicalUrl}#key-dates`,
      isAccessibleForFree: true,
    }
  }))
const datasetEntity = hideDatasetSchema.value ? null : {
  '@type': 'Dataset',
  '@id': `${canonicalUrl}#calendar-dataset`,
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'MySchoolDates dataset ID',
    value: `${district.value.institutionId}:${cal.value.schoolYear}`,
  },
  name: schemaDatasetName,
  description: datasetDescription,
  url: canonicalUrl,
  ...(schemaKeywords.length ? { keywords: schemaKeywords } : {}),
  ...(typeof schemaIsAccessibleForFree === 'boolean' ? { isAccessibleForFree: schemaIsAccessibleForFree } : {}),
  ...(schemaDatasetVersion ? { version: schemaDatasetVersion } : {}),
  variableMeasured: schemaVariableMeasured,
  license: schemaLicenseUrl,
  usageInfo: schemaLicenseUrl,
  inLanguage: 'en-US',
  ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
  ...(schemaDatasetDateModified ? { dateModified: schemaDatasetDateModified } : {}),
  temporalCoverage: datasetTemporalCoverage.value,
  ...(hasSpatialCoverage ? {
    spatialCoverage: spatialCoverageValue,
  } : {}),
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and Families',
  },
  creator: { '@id': 'https://myschooldates.com/#organization' },
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  ...(schemaCalendarEvents.value.length ? {
    hasPart: schemaCalendarEvents.value.map(event => ({ '@id': event['@id'] })),
  } : {}),
  ...(datasetBasedOnRefs.length ? { isBasedOn: datasetBasedOnValue } : {}),
  ...(!hideIcsFromDatasetDistribution.value || includePrintablePdfInDatasetDistribution ? {
    distribution: [
      ...calendarTrackDistributions.value,
      !hideIcsFromDatasetDistribution.value ? {
        '@type': 'DataDownload',
        name: schemaCalendarDownloadName,
        description: schemaCalendarDownloadDescription,
        encodingFormat: 'text/calendar',
        contentUrl: calendarIcsUrl,
      } : null,
      includePrintablePdfInDatasetDistribution ? {
        '@type': 'DataDownload',
        name: `${schemaCalendarName} printable PDF`,
        description: `Printable PDF generated by MySchoolDates from the reviewed ${district.value.shortName ?? district.value.name} ${year} calendar records.`,
        encodingFormat: 'application/pdf',
        contentUrl: printablePdfUrl,
      } : null,
    ].filter(Boolean),
  } : {}),
}
const schemaReviewedBySetting = (cal.value as any)?.schemaReviewedBy ?? (cal.value as any)?.meta?.schemaReviewedBy ?? (district.value as any)?.schemaReviewedBy ?? (district.value as any)?.meta?.schemaReviewedBy
const schemaReviewedById = schemaReviewedBySetting === 'author' || !schemaReviewedBySetting
  ? 'https://myschooldates.com/author#person'
  : schemaReviewedBySetting === 'team'
    ? 'https://myschooldates.com/#education-research-team'
    : String(schemaReviewedBySetting)
const siblingYearLinks = availableYears.value
  .filter(y => y !== year)
  .map(y => `${hubUrl}/${y}`)
const webPageMainEntity = datasetEntity ? { '@id': `${canonicalUrl}#calendar-dataset` } : null
const breadcrumbId = `${canonicalUrl}#breadcrumb`
const districtCalendarHubEntity = {
  '@type': 'CollectionPage',
  '@id': `${hubUrl}#webpage`,
  url: hubUrl,
  name: `${district.value.name} Calendars`,
  isPartOf: { '@id': 'https://myschooldates.com/#website' },
  about: { '@id': districtAbout['@id'] },
}
const webPageEntity = {
  '@type': 'WebPage',
  '@id': `${canonicalUrl}#webpage`,
  name: _pageTitle,
  description: _pageDesc,
  url: canonicalUrl,
  inLanguage: 'en-US',
  ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  ...(pageLastReviewed ? { lastReviewed: pageLastReviewed } : {}),
  ...(pageDatePublished ? { datePublished: pageDatePublished } : {}),
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  author: { '@id': 'https://myschooldates.com/author#person' },
  reviewedBy: { '@id': schemaReviewedById },
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and Families',
  },
  about: { '@id': districtAbout['@id'] },
  ...(webPageMainEntity ? { mainEntity: webPageMainEntity } : {}),
  hasPart: [
    ...(datasetEntity ? [{ '@id': `${canonicalUrl}#calendar-dataset` }] : []),
    ...schemaCalendarEvents.value.map(event => ({ '@id': event['@id'] })),
  ],
  breadcrumb: { '@id': breadcrumbId },
  ...(siblingYearLinks.length ? { relatedLink: siblingYearLinks } : {}),
  ...(webPageBasedOnRefs.length ? { isBasedOn: webPageBasedOnValue } : {}),
  ...(sourcePdfIsArchivedCopy ? {
    associatedMedia: {
      '@type': 'MediaObject',
      '@id': `${canonicalUrl}#official-pdf`,
      name: `Archived official ${year} calendar PDF`,
      contentUrl: sourcePdfUrl,
      encodingFormat: 'application/pdf',
    },
  } : {}),
  ...(additionalSourceCalendarEntities.length ? {
    citation: [
      ...sourceCitation,
      ...additionalSourceCalendarEntities.map(source => ({ '@id': source['@id'] })),
    ],
  } : sourceCitation.length ? { citation: sourceCitation } : {}),
  isPartOf: {
    '@id': `${hubUrl}#webpage`,
  },
}
useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        sitePublisher,
        ...(schemaReviewedById === 'https://myschooldates.com/#education-research-team' ? [reviewTeamEntity] : []),
        authorPersonEntity,
        siteEntity,
        districtAbout,
        districtCalendarHubEntity,
        ...(sourceCalendarEntity ? [sourceCalendarEntity] : []),
        ...additionalSourceCalendarEntities,
        ...(sourceCalendarPageEntity ? [sourceCalendarPageEntity] : []),
        ...(datasetEntity ? [datasetEntity] : []),
        ...schemaCalendarEvents.value,
        webPageEntity,
        {
          '@type': 'BreadcrumbList',
          '@id': breadcrumbId,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: district.value.state, item: `https://myschooldates.com/${district.value.state.toLowerCase().replace(/\s+/g, '-')}` },
            { '@type': 'ListItem', position: 3, name: `${district.value.name} Calendars`, item: hubUrl },
            { '@type': 'ListItem', position: 4, name: year, item: canonicalUrl },
          ],
        },
      ],
    }),
  }],
})
</script>

<template>
  <main class="district-calendar-page district-detail-page py-8">
    <section class="district-page-section district-hero">
      <div class="district-page-inner space-y-8">
        <Breadcrumb :items="[
          { label: 'Home', href: '/' },
          { label: district!.state, href: `/${district!.state.toLowerCase().replace(/\s+/g, '-')}` },
          { label: district!.shortName || district!.name, href: `/${slug}` },
          { label: year },
        ]" />
        <div class="district-overview-hero__grid">
          <div>
            <h1 class="district-hero__title">{{ cal!.pageHeading || `${district!.name} Calendar ${year}` }}</h1>
            <div class="district-hero__lead mt-3 space-y-2">
              <p v-for="(paragraph, index) in String(summary).split(/\n{2,}/)" :key="index">{{ paragraph }}</p>
              <p v-if="updatedDate" class="text-sm">Updated <time :datetime="updatedDate">{{ updatedDate }}</time>.</p>
            </div>
            <nav class="district-detail-years" aria-label="School year">
              <NuxtLink
                v-for="option in availableYears" :key="option" :to="`/${slug}/${option}`"
                :aria-current="option === year ? 'page' : undefined"
              >{{ option.replace(/-(\d{2})(\d{2})$/, '-$2') }}</NuxtLink>
            </nav>
          </div>
          <DistrictHeroDateCards :cal="cal!" />
        </div>
        <CalendarHeroActions :district="district!" :cal="cal!" />
      </div>
    </section>

    <div class="district-page-content">
      <DistrictKeyDatesTable :cal="cal!" :district-name="district!.name" :year="year" />
      <CalendarCorrection :district-name="district!.name" :year="year" :page-url="canonicalUrl" />
      <DistrictExtendedTimeOff :cal="cal!" :district-name="district!.name" :year="year" />
      <DistrictMonthlyCalendar :cal="cal!" :school-year="year" />

      <section class="district-detail-notes" aria-labelledby="calendar-notes-title">
        <h2 id="calendar-notes-title">{{ district!.shortName || district!.name }} Calendar Notes</h2>
        <div id="calendar-notes-content" class="district-detail-notes__content" :class="{ 'is-collapsed': !notesExpanded }">
          <p v-for="(paragraph, index) in notes" :key="index">{{ paragraph }}</p>
        </div>
        <button type="button" :aria-expanded="notesExpanded" aria-controls="calendar-notes-content" @click="notesExpanded = !notesExpanded">
          {{ notesExpanded ? 'Read less' : 'Read more' }}
        </button>
      </section>

      <section class="district-detail-related" aria-labelledby="related-calendars-title">
        <h2 id="related-calendars-title">Related Calendars</h2>
        <div class="district-detail-related__links">
          <a :href="district!.officialWebsite" target="_blank" rel="noopener">
            <strong>{{ district!.shortName || district!.name }} Official Website</strong><span>{{ officialHost }} ↗</span>
          </a>
          <NuxtLink v-for="related in relatedCalendars" :key="related.href" :to="related.href">
            <strong>{{ related.name }} Calendar {{ related.year }}</strong><span>View calendar →</span>
          </NuxtLink>
        </div>
      </section>

      <section id="sources" class="district-detail-about" aria-labelledby="about-calendar-title">
        <h2 id="about-calendar-title">About This Calendar</h2>
        <p><strong>Data source &amp; handling:</strong> Dates are collected from {{ district!.name }} calendar materials and organized into key dates, monthly calendars, PDF downloads, and calendar subscriptions.</p>
        <ul class="space-y-2">
          <li v-for="source in sourceLinks" :key="source.url"><a :href="source.url" target="_blank" rel="noopener" class="rds-link underline">{{ source.label }} ↗</a></li>
        </ul>
        <p><strong>Disclaimer:</strong> MySchoolDates is not affiliated with {{ district!.name }}. Calendars can change; always check <a :href="district!.officialWebsite" target="_blank" rel="noopener" class="rds-link underline">{{ officialHost }}</a> before making plans.</p>
        <p v-if="updatedDate">Last updated: <time :datetime="updatedDate">{{ updatedDate }}</time></p>
      </section>
    </div>
  </main>
</template>
