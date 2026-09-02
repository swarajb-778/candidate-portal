import { z } from 'zod';

const normalise = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

// The typed signature must match the user's full name exactly, trimmed and
// case-insensitively. The server enforces the same rule — see api-contract.md.
export const signatureSchema = (fullName) =>
  z.object({
    typedName: z
      .string()
      .trim()
      .refine(
        // Trimmed and case-insensitive, with runs of internal whitespace
        // collapsed — a double space is invisible to whoever typed it.
        (v) => normalise(v) === normalise(fullName),
        'Type your name exactly as it appears on your profile.'
      ),
    agreed: z.literal(true, {
      errorMap: () => ({ message: 'Tick the box to confirm your signature.' })
    })
  });

// Counter-proposed start dates are Mondays inside the allowed window.
export const startDateSchema = ({ min, max }) =>
  z.object({
    proposedByCandidate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date.')
      .refine((v) => new Date(`${v}T00:00:00Z`).getUTCDay() === 1, 'Onboarding cohorts start on Mondays.')
      .refine((v) => (!min || v >= min) && (!max || v <= max), 'Pick a date inside the allowed window.')
  });

export const declineSchema = z.object({
  reason: z.string().trim().max(2000).optional().default('')
});
