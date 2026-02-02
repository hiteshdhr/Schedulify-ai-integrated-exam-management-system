import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Settings,
  Users,
  Clock,
  BarChart3,
  User,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  LucideIcon, // Import LucideIcon type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- FIX: Define a type for navigation items ---
type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string; // Make description optional
};
// --- END OF FIX ---

// --- Navigation Items for Each Role ---
// Use the 'NavItem' type
const studentNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    // --- FIX: Changed title from "My Scheduler" to "Master Scheduler" ---
    title: 'Master Scheduler',
    href: '/app/scheduler',
    icon: Calendar,
  },
  {
    title: 'My Exams',
    href: '/app/exams',
    icon: BookOpen,
  },
  {
    title: 'My Tasks',
    href: '/app/tasks',
    icon: Clock,
  },
];

const instructorNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    description: 'View your assigned duties',
  },
  {
    title: 'My Schedule',
    href: '/app/scheduler',
    icon: Calendar,
    description: 'Manage your personal schedule',
  },
];

const adminNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    description: 'Overall system status',
  },
  // --- FIX: Removed "Master Scheduler" from adminNav ---
  {
    title: 'Admin Panel',
    href: '/app/admin',
    icon: ShieldCheck,
    description: 'Manage users and exams',
  },
  {
    title: 'Analytics',
    href: '/app/analytics',
    icon: BarChart3,
    description: 'View system analytics',
  },
];

const commonNav: NavItem[] = [
  {
    title: 'Profile',
    href: '/app/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];

// ... (getRoleIcon function)
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <ShieldCheck className="h-4 w-4" />;
    case 'instructor':
      return <Briefcase className="h-4 w-4" />;
    case 'student':
      return <GraduationCap className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};


const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth(); 

  // Specify the type for mainNav
  let mainNav: NavItem[] = studentNav; // Default to student
  if (user?.role === 'admin') {
    mainNav = adminNav;
  } else if (user?.role === 'instructor') {
    mainNav = instructorNav;
  }

  return (
    <motion.aside
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background"
    >
      <div className="flex h-full flex-col p-4 space-y-4">
        
        {/* User Info Card */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              {/* --- FIX: Use dynamic avatar --- */}
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} />
              <AvatarFallback>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-sm truncate">{user?.name}</span>
              <div className="flex items-center space-x-1">
                {user?.role && getRoleIcon(user.role)}
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-2">
          <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </h2>
          {/* This part will now be type-safe */}
          {mainNav.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {/* This check is now safe and correct */}
                    {item.description && (
                       <span className={cn(
                         "text-xs mt-0.5",
                         isActive ? "text-primary-foreground/80" : "text-muted-foreground/80"
                       )}>
                         {item.description}
                       </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>
        
        <Separator />

        {/* Common Navigation (Settings, etc.) */}
        <nav className="space-y-2">
          {commonNav.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.title}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;