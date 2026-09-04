import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

// Every instant crosses the wire as ISO 8601 UTC. The client is the only place
// that knows the user's zone, so all formatting goes through here.
export const inZone = (iso, tz) => new TZDate(iso, tz);

export const formatIn = (iso, tz, pattern) => format(inZone(iso, tz), pattern);

// A 1:00 PM PT slot viewed in IST is 1:30 AM the *following day* — the label has
// to come from the converted instant, never from the calendar cell that was
// clicked.
export const slotLabel = (iso, tz, abbr) => {
  const d = inZone(iso, tz);
  return `${format(d, 'EEE, MMM d')} · ${format(d, 'h:mm a')} ${abbr}`;
};

export const zoneAbbr = (iso, tz) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(new Date(iso))
    .find((p) => p.type === 'timeZoneName')?.value ?? '';

// Calendar-day key in a given zone, for grouping and for slot lookups.
export const dayKey = (iso, tz) => formatIn(iso, tz, 'yyyy-MM-dd');
