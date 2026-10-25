import {
  LayoutDashboard,
  Users,
  CalendarClock,
  MessageSquare,
  Palette,
  Layers,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'نوبت‌ها و زمان‌بندی',
    icon: CalendarClock,
    path: '/admin/appointments',
  },
  {
    label: 'مدیریت محتوا و رسانه',
    icon: Layers,
    path: '/admin/content',
  },
  {
    label: 'بیماران',
    icon: Users,
    path: '/admin/patients',
  },
  {
    label: 'نظرات مراجعین',
    icon: MessageSquare,
    path: '/admin/comments',
  },
  {
    label: 'آمار و گزارشات',
    icon: LayoutDashboard,
    path: '/admin/stats',
  },
  {
    label: 'تنظیمات تم سایت',
    icon: Palette,
    path: '/admin/settings',
  },
];


