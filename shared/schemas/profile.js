import { z } from 'zod';
import { WORK_AUTH } from './auth.js';

// The profile is edited one section at a time, so each section is its own
// schema and each PATCH carries only that section's fields.
export const personalSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  pronouns: z.string().trim().optional().default(''),
  workAuth: z.enum(WORK_AUTH).optional()
});

export const linksSchema = z.object({
  links: z.object({
    linkedin: z.string().trim().optional().default(''),
    github: z.string().trim().optional().default(''),
    site: z.string().trim().optional().default('')
  })
});

export const preferencesSchema = z.object({
  preferences: z.object({
    targetRole: z.string().trim().optional().default(''),
    locations: z.string().trim().optional().default(''),
    earliestStart: z.string().trim().optional().default(''),
    workSetup: z.string().trim().optional().default(''),
    compensation: z.string().trim().optional().default('')
  })
});

const EEO_DEFAULT = 'Prefer not to say';
export const eeoSchema = z.object({
  gender: z.string().trim().default(EEO_DEFAULT),
  veteran: z.string().trim().default(EEO_DEFAULT),
  disability: z.string().trim().default(EEO_DEFAULT)
});

export const experienceSchema = z.object({
  title: z.string().trim().min(1, 'Add a job title.'),
  org: z.string().trim().min(1, 'Add the organisation.'),
  period: z.string().trim().optional().default(''),
  loc: z.string().trim().optional().default(''),
  desc: z.string().trim().optional().default('')
});

export const educationSchema = z.object({
  school: z.string().trim().min(1, 'Add a school.'),
  degree: z.string().trim().optional().default(''),
  period: z.string().trim().optional().default(''),
  extra: z.string().trim().optional().default('')
});

export const skillsSchema = z.object({
  skills: z.array(z.string().trim().min(1)).max(60)
});

export const visibilitySchema = z.object({
  openToOtherRoles: z.boolean()
});
