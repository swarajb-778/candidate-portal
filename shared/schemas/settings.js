import { z } from 'zod';

export const passwordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password.'),
    next: z
      .string()
      .min(8, 'New password needs at least 8 characters and a number.')
      .regex(/\d/, 'New password needs at least 8 characters and a number.'),
    confirm: z.string()
  })
  .refine((v) => v.next === v.confirm, {
    message: 'The two new passwords don’t match.',
    path: ['confirm']
  });

const channels = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  app: z.boolean().optional()
});

// Deep partial: the UI toggles one switch at a time. Interview invitations by
// email can never be turned off — the server rejects it with CHANNEL_LOCKED.
export const notificationChannelsSchema = z
  .object({
    status: channels.optional(),
    interview: channels.optional(),
    messages: channels.optional(),
    docs: channels.optional(),
    matches: channels.optional()
  })
  .refine((v) => v.interview?.email !== false, {
    message: 'Interview invitations are always sent by email.',
    path: ['interview', 'email']
  });

export const preferencesSettingsSchema = z.object({
  language: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD.MM.YYYY']).optional(),
  pauseNonUrgent: z.boolean().optional(),
  digest: z.enum(['Off', 'Daily', 'Weekly on Monday']).optional()
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Type DELETE to confirm.' })
  })
});
