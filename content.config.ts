import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const eventSchema = z.object({
  date: z.string(),
  name: z.string(),
  type: z.enum([
    'school_start', 'school_end', 'school_resume', 'school_reopen',
    'holiday', 'no_school', 'student_holiday',
    'break_start', 'break_end',
    'early_release', 'early_dismissal',
    'academic', 'observance', 'teacher_workday',
    'makeup_day', 'quarter_end', 'semester_end', 'graduation',
  ]),
  description: z.string().optional(),
})

const relatedDistrictSchema = z.object({
  name: z.string(),
  slug: z.string(),
  state: z.string(),
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
const customSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string(),
  position: z.string().optional(), // 'afterAbout' | 'afterFaq' | 'afterPlanningTips' | 'beforeSources'
  groups: z.array(customSectionGroupSchema).optional(),
})
const gradingPeriodSchema = z.object({
  label: z.string(),
  start: z.string(),
  end: z.string(),
})

const livingHereHighlightSchema = z.object({ label: z.string(), detail: z.string() })
const livingHereSchema = z.object({
  intro: z.string().optional(),
  highlights: z.array(livingHereHighlightSchema),
})

const stateQuickFactSchema = z.object({ label: z.string(), value: z.string() })
const stateFaqSchema = z.object({ q: z.string(), a: z.string() })
const relatedStateSchema = z.object({ name: z.string(), slug: z.string() })
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
        schoolCount: z.number().optional(),
        founded: z.number().optional(),
        calendarType: z.string().optional(),
        districtFact: z.string().optional(),
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
        compareIntro: z.string().optional(),  // sentence(s) shown above the calendar comparison table
        sources: z.array(districtSourceSchema).optional(),
        // Section customization
        hiddenSections: z.array(z.string()).optional(),
        faqLimit: z.number().optional(),
        faqSchemaLimit: z.number().optional(),
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
        about: z.string(),
        quickFacts: z.array(stateQuickFactSchema),
        planningTips: z.array(z.string()),
        commonHolidays: z.array(z.string()),
        districtClusters: z.array(stateDistrictClusterSchema).optional(),
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
        totalSchoolDays: z.number().optional(),
        teacherWorkDays: z.number().optional(),
        semesters: z.number().optional(),
        sourceUrl: z.string().optional(),      // alias: sourcePageUrl (stable hub, district-level)
        sourcePdfUrl: z.string().optional(),   // direct PDF for this school year (changes annually)
        lastVerifiedAt: z.string().optional(), // ISO date: when data was last verified against official source
        dateCreated: z.string().optional(),
        datePublished: z.string().optional(),
        dateModified: z.string().optional(),
        sourceVersion: z.string().optional(),
        hideSemesterCount: z.boolean().optional(),
        yearNumbersMode: z.enum(['compact']).optional(),
        instructionalDaysLabel: z.string().optional(),
        instructionalDaysDescription: z.string().optional(),
        pageHeading: z.string().optional(),
        faqLimit: z.number().optional(),
        faqSchemaLimit: z.number().optional(),
        hiddenSections: z.array(z.string()).optional(),
        hideDatasetSchema: z.boolean().optional(),
        itemListMode: z.enum(['keyDates', 'allImportantDates']).optional(),
        gradingPeriods: z.array(gradingPeriodSchema).optional(),
        calendarNotes: z.string().optional(),  // year-specific narrative (moved from districts/)
        calendarType: z.enum(['traditional', 'year-round', 'magnet', 'international', 'early-college', 'alternative']).optional(),
        alternateCalendars: z.array(z.object({
          type: z.string(),
          label: z.string(),
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
