import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarClock,
  MessageSquare,
  Palette,
  Film,
  BookOpen,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'نوبت‌ها و زمان‌بندی',
    icon: Calendar,
    path: '/admin/appointments',
  },
  {
    label: 'تقویم کاری و نوبت‌های آتی',
    icon: CalendarClock,
    path: '/admin/agenda',
  },
  {
    label: 'مدیریت مقالات',
    icon: BookOpen,
    path: '/admin/articles',
  },
  {
    label: 'مدیریت ویدیوها',
    icon: Film,
    path: '/admin/videos',
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

