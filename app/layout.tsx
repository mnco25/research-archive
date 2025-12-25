import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ResearchArchive - Find Academic Papers Faster',
  description: 'Search across arXiv, PubMed, CrossRef, and OpenAlex. Find research papers, generate citations, and accelerate your literature review.',
  keywords: ['academic search', 'research papers', 'arXiv', 'PubMed', 'literature review', 'citations'],
  authors: [{ name: 'ResearchArchive' }],
  openGraph: {
    title: 'ResearchArchive - Find Academic Papers Faster',
    description: 'Unified search across 250M+ academic papers from arXiv, PubMed, CrossRef, and OpenAlex.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResearchArchive',
    description: 'Find academic papers faster with unified search across multiple sources.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
