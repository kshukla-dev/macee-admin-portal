import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Macee Portal | External Workforce Solutions & Content Management',
  description: 'Macee BV Management Portal for Website Content, Team Profiles, Inquiries, Blogs, and FAQs. SNA NEN 4400-1 certified.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className={`${dmSans.className} bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-rose-500/20 selection:text-red-700`}>
        {/* Macee Brand Top Accent Line (Matches Macee Website signature top red bar) */}
        <div className="h-[3px] w-full bg-[#E30613] fixed top-0 left-0 z-50 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
