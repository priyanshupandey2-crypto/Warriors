import { SidebarItem } from '@/components/layout';

export function getMainNavigation(currentPath: string): SidebarItem[] {
  return [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      active: currentPath === '/dashboard',
    },
    {
      href: '/my-courses',
      label: 'My Courses',
      icon: 'BookMarked',
      active: currentPath?.startsWith('/my-courses'),
    },
    {
      href: '/published-courses',
      label: 'Browse Courses',
      icon: 'BookOpen',
      active: currentPath?.startsWith('/published-courses'),
    },
    {
      href: '/create-course',
      label: 'Create Course',
      icon: 'Plus',
      active: currentPath === '/create-course',
    },
  ];
}

export function getAdminNavigation(currentPath: string): SidebarItem[] {
  return [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      active: currentPath === '/dashboard',
    },
    {
      href: '/admin/approval',
      label: 'Approvals',
      icon: 'CheckCircle2',
      active: currentPath?.startsWith('/admin/approval'),
    },
    {
      href: '/published-courses',
      label: 'Browse Courses',
      icon: 'BookOpen',
      active: currentPath?.startsWith('/published-courses'),
    },
  ];
}

export function getCourseDetailNavigation(_courseId: string, _currentPath: string): SidebarItem[] {
  return [
    {
      href: '/dashboard',
      label: 'Back to Dashboard',
      icon: 'Home',
      active: false,
    },
    {
      href: '/my-courses',
      label: 'My Courses',
      icon: 'BookMarked',
      active: false,
    },
    {
      href: '/published-courses',
      label: 'Browse Courses',
      icon: 'BookOpen',
      active: false,
    },
  ];
}
