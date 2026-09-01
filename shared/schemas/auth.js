import { z } from 'zod';

export const WORK_AUTH = ['US Citizen', 'Permanent Resident', 'Visa holder', 'Need sponsorship'];

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional().default(false)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter the email address you applied with.')
});

// Sign-up is a three-step wizard that posts once, at the end. Each step is
// validated on its own so the user can't advance past a bad step.
export const signupStep1Schema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first and last name.'),
  lastName: z.string().trim().min(1, 'Enter your first and last name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password needs at least 8 characters.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Accept the privacy notice to continue.' })
  })
});

export const signupStep2Schema = z.object({
  city: z.string().trim().min(1, 'Add a location so we can match you to roles.'),
  phone: z.string().trim().optional().default(''),
  workAuth: z.enum(WORK_AUTH).optional(),
  targetRole: z.string().trim().optional().default('')
});

// Step 3 (resume) is genuinely optional, so it adds no rules.
export const signupSchema = signupStep1Schema
  .omit({ consent: true })
  .merge(signupStep2Schema.partial({ phone: true, targetRole: true }));
