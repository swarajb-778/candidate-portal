import { formatDistanceToNowStrict } from 'date-fns';
import { formatIn } from './datetime.js';

// The server never sends a pre-formatted date — everything is formatted here,
// in the user's own zone.
export const fmtDate     = (iso, tz) => (iso ? formatIn(iso, tz, 'MMM d, yyyy') : '');
export const fmtDayShort = (iso, tz) => (iso ? formatIn(iso, tz, 'MMM d') : '');
export const fmtWeekday  = (iso, tz) => (iso ? formatIn(iso, tz, 'EEEE, MMMM d, yyyy') : '');
export const fmtWeekdayShort = (iso, tz) => (iso ? formatIn(iso, tz, 'EEEE, MMM d') : '');
export const fmtTime     = (iso, tz) => (iso ? formatIn(iso, tz, 'h:mm a') : '');
export const fmtStamp    = (iso, tz) => (iso ? `${formatIn(iso, tz, 'MMM d, yyyy')} · ${formatIn(iso, tz, 'h:mm a')}` : '');

export const fmtRange = (startIso, endIso, tz) =>
  startIso && endIso ? `${fmtTime(startIso, tz)} – ${fmtTime(endIso, tz)}` : '';

// Itinerary rows drop the meridiem so the range fits the fixed 118px mono
// column without wrapping — the same form the design reference uses.
export const fmtRangeShort = (startIso, endIso, tz) =>
  startIso && endIso ? `${formatIn(startIso, tz, 'h:mm')} – ${formatIn(endIso, tz, 'h:mm')}` : '';

// The bell dropdown reads "1 hour ago" for anything recent and falls back to a
// date once that stops being useful.
export const fmtRelative = (iso, tz) => {
  if (!iso) return '';
  const age = Date.now() - new Date(iso).getTime();
  if (age < 0 || age > 24 * 3600 * 1000) return fmtDayShort(iso, tz);
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
};

// Some values are calendar DATES, not instants: a start date, a due date. They
// are stored at UTC midnight, so converting them into the user's zone rolls
// them backwards a day — Oct 5 renders as "Sunday, Oct 4" in Los Angeles.
// Format these in UTC and leave zone conversion to real timestamps.
export const fmtCalendarDate = (iso) => (iso ? formatIn(iso, 'UTC', 'EEEE, MMMM d, yyyy') : '');
export const fmtCalendarShort = (iso) => (iso ? formatIn(iso, 'UTC', 'MMM d, yyyy') : '');
export const fmtCalendarDay  = (iso) => (iso ? formatIn(iso, 'UTC', 'MMM d') : '');

export const fileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const EXT = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG'
};

export const fileMeta = (mimeType, bytes) =>
  [EXT[mimeType] ?? 'File', fileSize(bytes)].filter(Boolean).join(' · ');

// Joins the meta lines the design builds out of ' · '-separated fragments,
// dropping anything missing rather than leaving a dangling separator.
export const dotted = (...parts) => parts.filter(Boolean).join(' · ');
