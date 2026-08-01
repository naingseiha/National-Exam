'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/examStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useExamStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
