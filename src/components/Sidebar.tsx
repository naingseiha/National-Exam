'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  {
    href: '/',
    label: 'ផ្ទាំងគ្រប់គ្រង',
    labelEn: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/students',
    label: 'គ្រប់គ្រងសិស្ស',
    labelEn: 'Students',
    icon: Users,
  },
  {
    href: '/scores',
    label: 'បញ្ចូលពិន្ទុ',
    labelEn: 'Score Entry',
    icon: ClipboardList,
  },
  {
    href: '/results',
    label: 'បញ្ជីលទ្ធផល',
    labelEn: 'Results',
    icon: FileText,
  },
  {
    href: '/export',
    label: 'នាំចេញ',
    labelEn: 'Export',
    icon: Download,
  },
  {
    href: '/settings',
    label: 'ការកំណត់',
    labelEn: 'Settings',
    icon: Settings,
  },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f1729 0%, #162040 50%, #0f1729 100%)',
          borderRight: '1px solid rgba(42, 63, 111, 0.5)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-4 border-b"
          style={{ borderColor: 'rgba(42, 63, 111, 0.5)', minHeight: '72px' }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight">ប្រព័ន្ធប្រឡង</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>ថ្នាក់ជាតិ ២០២៦</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 mx-2 mb-1 px-3 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'text-white'
                    : 'hover:text-white'
                  }
                `}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(79,70,229,0.3))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
                  />
                )}
                <Icon
                  size={18}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: isActive ? '#60a5fa' : 'inherit' }}
                />
                {!collapsed && (
                  <div>
                    <p className="text-sm font-medium leading-tight">{item.label}</p>
                    <p className="text-xs" style={{ color: isActive ? 'rgba(148,163,184,0.8)' : 'var(--text-muted)' }}>
                      {item.labelEn}
                    </p>
                  </div>
                )}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium
                                invisible opacity-0 group-hover:visible group-hover:opacity-100
                                transition-all duration-200 whitespace-nowrap z-50"
                    style={{
                      background: 'rgba(22, 32, 64, 0.95)',
                      border: '1px solid rgba(42, 63, 111, 0.5)',
                      color: 'white',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-3 border-t hidden lg:block" style={{ borderColor: 'rgba(42, 63, 111, 0.5)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                       transition-all duration-200 hover:text-white text-sm"
            style={{
              background: 'rgba(42, 63, 111, 0.3)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(42, 63, 111, 0.3)',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>បិទ</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{
            background: 'rgba(15, 23, 41, 0.95)',
            borderBottom: '1px solid rgba(42, 63, 111, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap size={18} style={{ color: '#60a5fa' }} />
            <span className="font-bold text-white text-sm">ប្រព័ន្ធប្រឡងថ្នាក់ជាតិ</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
