'use client';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/pages/Dashboard';

export default function Home() {
  return (
    <Sidebar>
      <Dashboard />
    </Sidebar>
  );
}
