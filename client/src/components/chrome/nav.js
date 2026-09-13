import { Calendar, FileText, Folder, Home, MessageSquare, Settings, User } from 'lucide-react';

// Sidebar order. `end` keeps Overview from matching every nested route.
export const NAV = [
  { to: '/',             label: 'Overview',        icon: Home,           end: true },
  { to: '/applications', label: 'My Applications', icon: FileText },
  { to: '/interviews',   label: 'Interviews',      icon: Calendar },
  { to: '/messages',     label: 'Messages',        icon: MessageSquare, badge: 'messages' },
  { to: '/documents',    label: 'Documents',       icon: Folder },
  { to: '/profile',      label: 'Profile',         icon: User },
  { to: '/settings',     label: 'Settings',        icon: Settings }
];
