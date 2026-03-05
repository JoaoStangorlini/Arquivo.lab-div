import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: 'swap',
});

const materialSymbols = localFont({
  src: '../../node_modules/material-symbols/material-symbols-outlined.woff2',
  variable: '--font-material-symbols',
  display: 'swap',
  weight: '100 700',
  style: 'normal',
});

import { LazyMotion, domAnimation } from "framer-motion";

import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ReadingExperienceProvider } from "@/components/reading/ReadingExperienceProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import { ClientPwaManager } from "@/components/pwa/ClientPwaManager";
import { SkipLink } from "@/components/ui/SkipLink";
import { AuthProvider } from "@/providers/AuthProvider";

/**
 * V4.0.0 Layout - Protocol Apocalypse Certified
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Hub de Comunicação Científica do Lab-Div",
  description: "Um projeto para melhorar a comunicação do IF-USP e reunir em um FLUXO interativo o arquivo de material de divulgação do Lab-Div e de toda a comunidade — de dentro e fora do instituto.",
  openGraph: {
    title: "Hub de Comunicação Científica do Lab-Div",
    description: "O hub oficial de comunicação científica do Instituto de Física da Universidade de São Paulo.",
    images: ['/api/og?title=Hub%20de%20Comunicação%20Científica&category=Instituto%20de%20Física%20USP'],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LabDiv",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || '';
  const htmlClass = theme === 'dark' ? 'dark' : '';

  return (
    <html lang="pt-BR" suppressHydrationWarning className={htmlClass}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://bqszadfunqgtfpaorwvx.supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const buildId = "${process.env.NEXT_PUBLIC_BUILD_ID || 'v3-golden'}";
                  navigator.serviceWorker.register('/sw.js?id=' + buildId).then(function(registration) {
                    // Registration successful
                  }, function(err) {
                    // Registration failed
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${materialSymbols.variable} font-sans selection:bg-brand-yellow selection:text-brand-blue bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        <LazyMotion features={domAnimation}>
          <AuthProvider>
            <ReadingExperienceProvider>
              <SearchProvider>
                <Toaster position="top-right" toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1E1E1E',
                    color: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                  }
                }} />
                <ClientPwaManager />
                <ReadingProgressBar />
                <SkipLink />

                {children}
              </SearchProvider>
            </ReadingExperienceProvider>
          </AuthProvider>
        </LazyMotion>
      </body>
    </html>
  );
}
