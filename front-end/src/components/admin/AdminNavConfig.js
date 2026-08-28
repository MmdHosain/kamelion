import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Palette,
  Clock,
  UserCheck
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'نوبت‌ها و زمان‌بندی',
    icon: Calendar,
    path: '/admin/appointments'
  },
  {
    label: 'بیماران',
    icon: Users,
    path: '/admin/patients'
  },
  {
    label: 'نظرات مراجعین',
    icon: MessageSquare,
    path: '/admin/comments'
  },
  {
    label: 'آمار و گزارشات',
    icon: LayoutDashboard,
    path: '/admin/stats'
  },
  {
    label: 'تنظیمات تم سایت',
    icon: Palette,
    path: '/admin/settings'
  }
];
