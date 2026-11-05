import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { env } from "@/lib/env";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const inter = localFont({ src: "./fonts/Inter.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "OpenShelf — Global Online Digital Library", template: "%s | OpenShelf" },
  description: "Discover, read, and share legally distributable books with a global community of readers.",
  openGraph: { type: "website", siteName: "OpenShelf", title: "OpenShelf — Every Book Opens a New World", description: "Discover, read, and share knowledge with a global community of readers." },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
