import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OpenShelf | Global Online Digital Library',
  description: 'Discover, read, upload, and share legally distributable knowledge with OpenShelf.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F4F7FC] text-slate-800 antialiased">
        <Navbar />
        <div className="border-b border-brand-100 bg-brand-50 px-4 py-2 text-center text-xs font-medium text-brand-900">
          Frontend preview · Sample book content only — accounts, library records, and PDF files are not connected yet.
        </div>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
