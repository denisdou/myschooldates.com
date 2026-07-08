import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const eventSchema = z.object({
  date: z.string(),
  name: z.string(),
  type: z.enum(['school_start', 'school_end', 'holiday', 'break_start', 'break_end', 'no_school', 'early_dismissal']),
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

const livingHereHighlightSchema = z.object({ label: z.string(), detail: z.string() })
const livingHereSchema = z.object({
  intro: z.string().optional(),
  highlights: z.array(livingHereHighlightSchema),
})

const stateQuickFactSchema = z.object({ label: z.string(), value: z.string() })
const stateFaqSchema = z.object({ q: z.string(), a: z.string() })
const relatedStateSchema = z.object({ name: z.string(), slug: z.string() })

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
        districtFaqs: z.array(districtFaqSchema).optional(),
        planningTips: z.array(z.string()).optional(),
        livingHere: livingHereSchema.optional(),
        relatedDistricts: z.array(relatedDistrictSchema).optional(),
        sources: z.array(districtSourceSchema).optional(),
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
        calendarNotes: z.string().optional(),  // year-specific narrative (moved from districts/)
        events: z.array(eventSchema),
      }),
    }),
  },
})
