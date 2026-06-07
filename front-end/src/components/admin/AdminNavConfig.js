import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'Appointments',
    icon: Calendar,
    path: '/admin/appointments'
  },
  {
    label: 'Patients',
    icon: Users,
    path: '/admin/patients'
  },
  {
    label: 'Stats',
    icon: LayoutDashboard,
    path: '/admin/stats'
  },
  {
    label: 'Reports',
    icon: FileText,
    path: '/admin/reports'
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings'
  }
];
