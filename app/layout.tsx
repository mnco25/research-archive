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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
