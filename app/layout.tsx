import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://research-archive.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'ResearchArchive — Find research that moves you forward',
    template: '%s · ResearchArchive',
  },
  description:
    'A unified, free, privacy-first search across 260M+ academic papers from arXiv, PubMed, CrossRef, and OpenAlex. Built for students and researchers.',
  keywords: ['academic search', 'research papers', 'arXiv', 'PubMed', 'CrossRef', 'OpenAlex', 'open access', 'citations'],
  authors: [{ name: 'ResearchArchive' }],
  openGraph: {
    title: 'ResearchArchive — Academic search, simplified',
    description:
      'Search 260M+ papers across arXiv, PubMed, CrossRef, and OpenAlex. Free, fast, and privacy-first.',
    type: 'website',
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResearchArchive',
    description: 'Search 260M+ academic papers across four scholarly databases.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const themeBootstrap = `
(function(){try{
  var key='theme';
  var stored=localStorage.getItem(key);
  var dark=stored==='dark'||(!stored&&matchMedia('(prefers-color-scheme: dark)').matches);
  var theme=dark?'dark':'light';
  document.documentElement.setAttribute('data-theme',theme);
  document.documentElement.style.colorScheme=theme;
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-0">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
