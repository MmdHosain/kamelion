import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Palette,
  Film,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'نوبت‌ها و زمان‌بندی',
    icon: Calendar,
    path: '/admin/appointments',
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

