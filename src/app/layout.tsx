import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-rose-500/20 selection:text-red-700">
        {/* Macee Brand Top Accent Line (Matches Macee Website signature top red bar) */}
        <div className="h-[3px] w-full bg-[#E30613] fixed top-0 left-0 z-50 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
