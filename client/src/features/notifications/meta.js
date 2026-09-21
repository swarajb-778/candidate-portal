import { Calendar, FileText, Folder, MessageSquare } from 'lucide-react';
import { dayKey } from '../../lib/datetime.js';

// kind drives the icon tile — see data-models.md.
export const KIND = {
  interview:   { icon: Calendar,      tile: 'bg-accent-tint text-accent-hover', dot: 'bg-accent-hover' },
  document:    { icon: Folder,        tile: 'bg-warning-bg text-warning',       dot: 'bg-warning' },
  message:     { icon: MessageSquare, tile: 'bg-neutral-pill text-ink-secondary', dot: 'bg-ink-secondary' },
  application: { icon: FileText,      tile: 'bg-success-bg text-success',       dot: 'bg-success' }
};

export const kindOf = (kind) => KIND[kind] ?? KIND.application;

// Where the CTA goes. The client owns target → route.
export const routeFor = ({ target, targetSlug } = {}) => {
  switch (target) {
    case 'offer':             return `/applications/${targetSlug}/offer`;
    case 'interview-details': return `/interviews/${targetSlug}`;
    case 'messages':          return targetSlug ? `/messages/${targetSlug}` : '/messages';
    case 'documents':         return '/documents';
    case 'application':       return `/applications/${targetSlug}`;
    case 'applications':      return '/applications';
    case 'overview':          return '/';
    default:                  return null;
  }
};

export const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'unread',      label: 'Unread' },
  { value: 'interview',   label: 'Interviews' },
  { value: 'message',     label: 'Messages' },
  { value: 'document',    label: 'Documents' },
  { value: 'application', label: 'Applications' }
];

const GROUPS = ['Today', 'Yesterday', 'Earlier this week', 'Earlier'];

const daysBetween = (iso, tz) => {
  const a = new Date(`${dayKey(iso, tz)}T00:00:00Z`);
  const b = new Date(`${dayKey(new Date().toISOString(), tz)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
};

const groupName = (iso, tz) => {
  const days = daysBetween(iso, tz);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'Earlier this week';
  return 'Earlier';
};

// Grouped by recency, in order, with empty groups omitted.
export const groupByRecency = (items, tz) => {
  const buckets = new Map(GROUPS.map((g) => [g, []]));
  for (const item of items) buckets.get(groupName(item.createdAt, tz)).push(item);
  return GROUPS.map((label) => ({ label, items: buckets.get(label) })).filter((g) => g.items.length);
};
