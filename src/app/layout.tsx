/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import SeedLoader from '@/components/SeedLoader';
import FirebaseSync from '@/components/FirebaseSync';

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធគ្រប់គ្រងការប្រឡងថ្នាក់ជាតិ',
  description: 'National Exam Management System for Grade 9 and Grade 12 - Ministry of Education, Youth and Sport Cambodia',
  keywords: 'national exam, Cambodia, grade 9, grade 12, BEPC, BEFE, ប្រឡងថ្នាក់ជាតិ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-primary)', fontFamily: "'Noto Sans Khmer', 'Inter', sans-serif" }}>
        <SeedLoader />
        <FirebaseSync />
        {children}
      </body>
    </html>
  );
}

