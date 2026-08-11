import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const eventSchema = z.object({
  date: z.string(),
  endDate: z.string().optional(),
  dates: z.array(z.string()).optional(),
  displayDate: z.string().optional(),
  name: z.string(),
  type: z.enum([
    'school_start', 'school_end', 'school_resume', 'school_reopen',
    'holiday', 'no_school', 'student_holiday',
    'break_start', 'break_end',
    'early_release', 'early_dismissal',
    'academic', 'observance', 'teacher_workday',
    'makeup_day', 'quarter_start', 'quarter_end', 'semester_end', 'graduation',
  ]),
  description: z.string().optional(),
  schemaDescription: z.string().optional(),
  calendarExportDescription: z.string().optional(),
  exportDatesIndividually: z.boolean().optional(),
  showDuringBreak: z.boolean().optional(),
  badgeLabel: z.string().optional(),
  isDerivedPlanningDate: z.boolean().optional(),
  preserveOfficialName: z.boolean().optional(),
})

const relatedDistrictSchema = z.object({
  name: z.string(),
  slug: z.string(),
  state: z.string(),
  linkLabel: z.string().optional(),
  comparisonNote: z.string().optional(),
})

const districtAboutCardSchema = z.object({
  title: z.string(),
  content: z.string(),
})

const districtSourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
})

const districtFaqSchema = z.object({ q: z.string(), a: z.string() })
const customSectionGroupSchema = z.object({
  label: z.string(),
  items: z.array(z.string()),
})
const customSectionLinkSchema = z.object({
  label: z.string(),
  to: z.string(),
  description: z.string().optional(),
})
const customSectionTableSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
})
const customSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string(),
  position: z.string().optional(), // 'afterAbout' | 'afterFaq' | 'afterPlanningTips' | 'beforeSources'
  groups: z.array(customSectionGroupSchema).optional(),
  links: z.array(customSectionLinkSchema).optional(),
  table: customSectionTableSchema.optional(),
})
const gradingPeriodSchema = z.object({
  label: z.string(),
  start: z.string(),
  end: z.string(),
  studentDays: z.number().optional(),
})

const livingHereHighlightSchema = z.object({ label: z.string(), detail: z.string() })
const livingHereSchema = z.object({
  intro: z.string().optional(),
  highlights: z.array(livingHereHighlightSchema),
})

const stateQuickFactSchema = z.object({ label: z.string(), value: z.string() })
const stateFaqSchema = z.object({ q: z.string(), a: z.string() })
const relatedStateSchema = z.object({ name: z.string(), slug: z.string() })
const stateCalendarRuleSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
})
const statePopularDistrictSchema = z.object({
  label: z.string(),
  slug: z.string().optional(),
  area: z.string().optional(),
  note: z.string().optional(),
})
const stateDistrictClusterSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  districts: z.array(z.object({
    label: z.string(),
    slug: z.string(),
    note: z.string().optional(),
  })),
})

export default defineContentConfig({
  collections: {
    // Stable institution identity — one file per institution
    districts: defineCollection({
      type: 'data',
      source: 'districts/*.json',
      schema: z.object({
        institutionId: z.string(),
        name: z.string(),
        shortName: z.string().optional(),
        slug: z.string(),
        state: z.string(),
        stateCode: z.string(),
        city: z.string().optional(),
        country: z.string().optional(),
        type: z.enum(['public_district', 'charter', 'private', 'university', 'preschool']).optional(),
        grades: z.array(z.string()).optional(),
        officialWebsite: z.string(),
        calendarPage: z.string().optional(),
        logo: z.string().optional(),
        timezone: z.string().optional(),
        currentSchoolYear: z.string(),
        allDatesMode: z.enum(['all', 'keyDates']).optional(),
        studentCount: z.number().optional(),
        studentCountAsOf: z.string().optional(),
        studentCountSourceLabel: z.string().optional(),
        studentCountSourceUrl: z.string().optional(),
        profileStudentCountApproximate: z.boolean().optional(),
        schoolCount: z.number().optional(),
        profileSchoolCountExact: z.boolean().optional(),
        founded: z.number().optional(),
        calendarType: z.string().optional(),
        hideProfileCalendarType: z.boolean().optional(),
        districtFact: z.string().optional(),
        profileDisclaimer: z.string().optional(),
        about: z.array(districtAboutCardSchema).optional(),
        calendarNotes: z.string().optional(),
        county: z.string().optional(),
        region: z.string().optional(),
        metro: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        districtFaqs: z.array(districtFaqSchema).optional(),
        planningTips: z.object({
          title: z.string().optional(),
          content: z.array(z.string()),
        }).optional(),
        livingHere: livingHereSchema.optional(),
        relatedDistricts: z.array(relatedDistrictSchema).optional(),
        relatedDistrictsTitle: z.string().optional(),
        relatedDistrictsDescription: z.string().optional(),
        compareIntro: z.string().optional(),  // sentence(s) shown above the calendar comparison table
        sources: z.array(districtSourceSchema).optional(),
        // Section customization
        hiddenSections: z.array(z.string()).optional(),
        includeComparisonSchema: z.boolean().optional(),
        faqLimit: z.number().optional(),
        faqSchemaLimit: z.number().optional(),
        faqSchemaExclude: z.array(z.string()).optional(),
        customSections: z.array(customSectionSchema).optional(),
      }),
    }),

    // State-level topic pages — one file per state
    states: defineCollection({
      type: 'data',
      source: 'states/*.json',
      schema: z.object({
        stateSlug: z.string(),
        stateName: z.string(),
        stateCode: z.string(),
        lastVerifiedAt: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        heroDescription: z.string().optional(),
        browseLabel: z.string().optional(),
        officialSourceLabel: z.string().optional(),
        quickAnswerTitle: z.string().optional(),
        quickAnswer: z.string().optional(),
        quickAnswerItems: z.array(stateQuickFactSchema).optional(),
        about: z.string(),
        calendarRulesDescription: z.string().optional(),
        calendarRules: z.array(stateCalendarRuleSchema).optional(),
        quickFacts: z.array(stateQuickFactSchema),
        stateSections: z.array(customSectionSchema).optional(),
        collectionNavLabel: z.string().optional(),
        collectionHeading: z.string().optional(),
        collectionDescription: z.string().optional(),
        planningTips: z.array(z.string()),
        commonHolidays: z.array(z.string()),
        commonHolidaysDescription: z.string().optional(),
        popularDistrictsHeading: z.string().optional(),
        popularDistrictsDescription: z.string().optional(),
        popularDistricts: z.array(statePopularDistrictSchema).optional(),
        clustersHeading: z.string().optional(),
        clustersDescription: z.string().optional(),
        districtClusters: z.array(stateDistrictClusterSchema).optional(),
        verificationMethodology: z.array(z.string()).optional(),
        faqs: z.array(stateFaqSchema),
        relatedStates: z.array(relatedStateSchema),
      }),
    }),

    // Per-year calendar data — one file per institution per year
    calendars: defineCollection({
      type: 'data',
      source: 'calendars/*/*.json',
      schema: z.object({
        institutionId: z.string(),
        schoolYear: z.string(),
        firstDay: z.string(),
        lastDay: z.string(),
        temporalCoverageStart: z.string().optional(),
        temporalCoverageEnd: z.string().optional(),
        totalSchoolDays: z.number().optional(),
        teacherWorkDays: z.number().optional(),
        semesters: z.number().optional(),
        sourceUrl: z.string().optional(),      // alias: sourcePageUrl (stable hub, district-level)
        sourceDocumentPage: z.string().optional(), // stable official record for the current source document
        sourcePdfUrl: z.string().optional(),   // direct official PDF for this school year (changes annually)
        lastCheckedPdfUrl: z.string().optional(), // direct PDF resolved from the official document record at last check
        sourceCheckedAt: z.string().optional(),
        sourceChecksumSha256: z.string().optional(),
        sourceResourceMonitor: z.object({
          type: z.enum(['resource-uuid', 'document-pdf']).optional(),
          checkUrl: z.string(),
          linkText: z.string(),
          expectedResourceUuid: z.string().optional(),
          expectedPdfUrl: z.string().optional(),
          expectedChecksumSha256: z.string().optional(),
        }).optional(),
        printablePdfUrl: z.string().optional(), // MySchoolDates-generated printable PDF for this school year
        lastVerifiedAt: z.string().optional(), // ISO date: when data was last verified against official source
        dateCreated: z.string().optional(),
        datePublished: z.string().optional(),
        dateModified: z.string().optional(),
        contentStatus: z.enum(['draft', 'in_review', 'production_ready', 'needs_update']).optional(),
        contentReviewTriggers: z.array(z.enum([
          'official_calendar_revision',
          'makeup_day_activation',
          'confirmed_data_error',
        ])).optional(),
        sourceVersion: z.string().optional(),
        hideSemesterCount: z.boolean().optional(),
        quickFacts: z.array(z.object({
          label: z.string(),
          value: z.string(),
        })).optional(),
        yearNumbersMode: z.enum(['compact']).optional(),
        instructionalDaysLabel: z.string().optional(),
        instructionalDaysDescription: z.string().optional(),
        pageHeading: z.string().optional(),
        faqLimit: z.number().optional(),
        faqSchemaLimit: z.number().optional(),
        faqSchemaExclude: z.array(z.string()).optional(),
        hiddenSections: z.array(z.string()).optional(),
        hideInstructionalDaysSummary: z.boolean().optional(),
        hideCoveredBreakDatesNote: z.boolean().optional(),
        keyDateCardsVariant: z.enum(['compact']).optional(),
        keyDateCardsFirstLabel: z.string().optional(),
        keyDateCardsThirdLabel: z.string().optional(),
        keyDateCardsThirdValue: z.string().optional(),
        includeComparisonSchema: z.boolean().optional(),
        hideDatasetSchema: z.boolean().optional(),
        itemListMode: z.enum(['keyDates', 'allImportantDates']).optional(),
        gradingPeriods: z.array(gradingPeriodSchema).optional(),
        heroSummary: z.string().optional(),
        calendarNotes: z.string().optional(),  // year-specific narrative (moved from districts/)
        calendarType: z.enum(['traditional', 'balanced', 'modified-start', 'year-round', 'magnet', 'international', 'early-college', 'alternative']).optional(),
        alternateCalendars: z.array(z.object({
          type: z.string(),
          label: z.string(),
          group: z.string().optional(),
          pdfUrl: z.string().optional(),
          firstDay: z.string().optional(),
        })).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        calendarFaqs: z.array(districtFaqSchema).optional(),
        customSections: z.array(customSectionSchema).optional(),
        yearNumbers: z.array(z.object({
          label: z.string(),
          value: z.string(),
          detail: z.string(),
        })).optional(),
        whatsNew: z.object({
          title: z.string().optional(),
          content: z.array(z.string()),
        }).optional(),
        events: z.array(eventSchema),
      }),
    }),
  },
})
