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
  Moon,
  Sun,
} from 'lucide-react';
import { useExamStore } from '@/store/examStore';

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
  const { theme, setTheme } = useExamStore();

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
          background: 'var(--bg-secondary)',
          borderRight: 'var(--glass-border)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-4 border-b"
          style={{ borderColor: 'var(--border-color)', minHeight: '72px' }}
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
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>ប្រព័ន្ធប្រឡង</p>
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
                    ? 'var(--table-header-bg)'
                    : 'transparent',
                  border: isActive ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
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
                  style={{ color: isActive ? 'var(--accent-blue)' : 'inherit' }}
                />
                {!collapsed && (
                  <div>
                    <p className="text-sm font-medium leading-tight">{item.label}</p>
                    <p className="text-xs" style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
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
                      background: 'var(--bg-card)',
                      border: 'var(--glass-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Collapse button */}
        <div className="p-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                       transition-all duration-200 text-sm"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-secondary)',
              border: 'var(--glass-border)',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span>{theme === 'dark' ? 'ពន្លឺថ្ងៃ' : 'ងងឹត'}</span>}
          </button>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hidden lg:flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                       transition-all duration-200 text-sm"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-secondary)',
              border: 'var(--glass-border)',
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
            background: 'var(--bg-primary)',
            borderBottom: 'var(--glass-border)',
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
            <GraduationCap size={18} style={{ color: 'var(--accent-blue)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>ប្រព័ន្ធប្រឡងថ្នាក់ជាតិ</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
