'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import type { Paper } from '@/lib/types';

function CursorFollower() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999] transition-transform duration-500 ease-out hidden md:block"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: `translate3d(-50%, -50%, 0) scale(${isPointer ? 1.5 : 1})`,
      }}
    >
      <div className={`w-3 h-3 bg-[hsl(var(--accent))] rounded-full blur-[2px] opacity-40 shadow-[0_0_15px_hsl(var(--accent))] transition-all duration-500 ${isPointer ? 'opacity-80 scale-125' : ''}`}></div>
    </div>
  );
}

function AmbientParticles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const newParticles = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.1,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `-${Math.random() * 20}s`,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-float-slow"
          style={{
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        ></div>
      ))}
    </div>
  );
}

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/search?q=machine+learning&limit=4&sort=citations');
        if (res.ok) {
          const data = await res.json();
          setPapers(data.papers || []);
        }
      } catch (err) {
        console.error('Failed to load papers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <CursorFollower />
      {/* ======== HERO ======== */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-40 md:pt-48 md:pb-52 overflow-hidden min-h-[92vh]">
        {/* Cinematic Background Layer */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Deep Fading Grid with Slow Pan */}
          <div className="absolute inset-[-100%] bg-[linear-gradient(to_right,rgba(150,150,150,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(150,150,150,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          
          <AmbientParticles />

          {/* Majestic Glow Orbs - Rotating and Floating */}
          <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-[hsl(var(--accent)/0.15)] blur-[140px] rounded-full mix-blend-screen animate-float-slow"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[hsl(280,80%,65%/0.12)] blur-[120px] rounded-full mix-blend-screen animate-float-slow" style={{ animationDelay: '-5s' }}></div>
        </div>

        <div className="container-app relative z-10 w-full">
          <div className="max-w-[950px] mx-auto text-center flex flex-col items-center">
            {/* Premium Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[var(--border-primary)] shadow-[0_0_15px_rgba(255,255,255,0.03)] bg-[var(--bg-elevated)]/40 backdrop-blur-xl text-[13px] font-semibold tracking-wide text-[var(--text-secondary)] mb-14 animate-in hover:scale-105 hover:bg-[var(--bg-elevated)]/60 hover:text-[var(--text-primary)] transition-all duration-300 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 animate-ping" style={{ animationDuration: '3s' }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
              </span>
              Processing 250M+ Papers Globally
            </div>

            {/* Headline - Cinematic scale and tracking */}
            <h1 className="text-display px-2 md:px-0 text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02] tracking-tighter mb-6 animate-in" style={{ animationDelay: '150ms' }}>
              <span className="text-[var(--text-primary)]">The ultimate layer for</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--text-primary)] via-[hsl(var(--accent))] to-[hsl(280,80%,75%)] bg-clip-text text-transparent drop-shadow-sm animate-gradient-x">
                scientific discovery
              </span>
            </h1>

            <p className="text-[var(--text-secondary)] text-[16px] md:text-[21px] leading-relaxed max-w-2xl mx-auto mb-14 animate-in font-medium tracking-tight" style={{ animationDelay: '300ms' }}>
              Uncover the world&apos;s academic knowledge with unparalleled speed.
              <br className="hidden md:block"/> No paywalls. No barriers. Built for researchers everywhere.
            </p>

            {/* Premium Glassmorphic Search Container */}
            <div className="w-full max-w-3xl mx-auto animate-in group relative" style={{ animationDelay: '450ms' }}>
              {/* Outer Glow Halo effect - Expanding gracefully */}
              <div className="absolute -inset-1 rounded-[1.8rem] bg-gradient-to-r from-[hsl(var(--accent)/0.3)] via-[hsl(280,80%,65%/0.2)] to-[hsl(var(--accent)/0.3)] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000 animate-gradient-x"></div>
              
              <div className="relative rounded-[1.4rem] p-2 bg-[var(--bg-primary)]/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[var(--border-primary)]/80 transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
                <div className="relative bg-[var(--bg-elevated)] rounded-[1rem] shadow-sm transform-gpu transition-all">
                  <SearchBar large autoFocus placeholder="Search massive datasets natively..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="relative py-32 md:py-48 border-t border-[var(--border-secondary)] overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[hsl(var(--accent)/0.03)] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container-app relative z-10">
          <div className="mb-20 md:mb-28 max-w-3xl">
            <h2 className="text-display text-[40px] md:text-[64px] tracking-tighter leading-[1.05] mb-6">
              Built for researchers.
              <br />
              <span className="text-[var(--text-tertiary)]">Designed for velocity.</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-[18px] md:text-[22px] leading-relaxed max-w-xl font-medium tracking-tight">
              Everything you need to discover, save, and cite academic literature. Lightning fast and perfectly frictionless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                ),
                title: 'Unified Search Engine',
                desc: 'Query arXiv, PubMed, CrossRef, and OpenAlex simultaneously. One beautiful interface with automatic deduplication.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                ),
                title: 'Private Local Library',
                desc: 'Save papers instantly to your browser edge. No databases, no accounts. Your research stays completely private.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                ),
                title: 'Instant Citations',
                desc: 'Generate flawless BibTeX, APA, or MLA citations instantly. Copy straight to your clipboard in one fluid tap.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 md:p-10 rounded-[2rem] bg-[var(--bg-elevated)] border border-[var(--border-primary)]/80 hover:border-[var(--border-primary)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--accent)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-[var(--bg-secondary)] border border-[var(--border-secondary)] flex items-center justify-center text-[var(--text-primary)] mb-8 group-hover:scale-110 group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-all duration-500 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-title text-[22px] mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== POPULAR AREAS ======== */}
      <section className="py-24 bg-[var(--bg-inset)]/50">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <h3 className="text-display text-[28px] md:text-[36px] tracking-tight mb-4">
                Explore the frontier.
              </h3>
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                Dive deep into the most active research clusters globally, from Artificial Intelligence to Tropical Medicine.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end max-w-2xl">
              {[
                'Quantum Computing', 'Neural Networks', 'Sustainable Energy', 
                'Genomics', 'Climate Science', 'Tropical Medicine', 
                'Space Exploration', 'Marine Biology', 'Public Health'
              ].map((area, i) => (
                <Link 
                  key={area} 
                  href={`/search?q=${encodeURIComponent(area.toLowerCase())}`}
                  className="px-6 py-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== TRENDING ======== */}
      <section className="relative py-32 border-y border-[var(--border-secondary)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] overflow-hidden">
        <div className="container-app relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-display text-[36px] md:text-[48px] tracking-tighter leading-[1.1] mb-3">
                Trending research.
              </h2>
              <p className="text-[var(--text-secondary)] text-[18px] font-medium tracking-tight">
                The most referenced papers right now in machine learning.
              </p>
            </div>
            <Link
              href="/search?q=machine+learning"
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-[1.2rem] bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[14px] font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 group"
            >
              Explore all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {Array.from({ length: 4 }).map((_, i) => <PaperCardSkeleton key={i} />)}
              </div>
            ) : papers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {papers.map((paper, i) => (
                  <div key={paper.id} className="animate-in block w-full min-w-0 h-full" style={{ animationDelay: `${i * 100}ms` }}>
                    <PaperCard paper={paper} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ======== GLOBAL ACCESS ======== */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent)/0.02)] via-transparent to-[hsl(280,80%,65%/0.02)] pointer-events-none"></div>
        
        <div className="container-app relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 space-y-8 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em]">
                Global Connectivity
              </div>
              <h2 className="text-display text-[36px] md:text-[56px] leading-[1.1] tracking-tighter">
                Bridging the gap for <br className="hidden md:block"/> 
                <span className="text-[hsl(var(--accent))]">researchers everywhere.</span>
              </h2>
              <p className="text-[17px] md:text-[20px] text-[var(--text-secondary)] leading-relaxed font-medium">
                ResearchArchive is meticulously optimized for high performance across all demographics. From modern labs in Silicon Valley to emerging research hubs in the <span className="text-[var(--text-primary)] font-bold">Philippines</span> and Southeast Asia, we ensure scientific knowledge remains a universal right.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex flex-col">
                  <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tighter">99.9%</span>
                  <span className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Uptime</span>
                </div>
                <div className="w-px h-12 bg-[var(--border-secondary)] hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tighter">&lt;200ms</span>
                  <span className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Latency</span>
                </div>
                <div className="w-px h-12 bg-[var(--border-secondary)] hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tighter">Zero</span>
                  <span className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Cost Barrier</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-xl group relative">
               {/* Visual representation of a globe or data network */}
               <div className="relative aspect-square rounded-[3rem] bg-[var(--bg-elevated)] border border-[var(--border-primary)]/80 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]"></div>
                  {/* Subtle Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                  
                  {/* Animated 'Data nodes' circulating */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-[var(--border-primary)]/40 rounded-full animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[hsl(var(--accent))] rounded-full shadow-[0_0_15px_hsl(var(--accent))]"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-[var(--border-primary)]/40 rounded-full animate-spin-slow-reverse" style={{ animationDuration: '30s' }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[hsl(280,80%,65%)] rounded-full shadow-[0_0_15px_hsl(280,80%,65%)]"></div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                    <div className="animate-float">
                       <div className="text-[14px] font-bold text-[var(--text-primary)] tracking-[0.3em] uppercase mb-4">Unified Network</div>
                       <div className="text-[48px] md:text-[64px] font-bold text-[var(--text-primary)] tracking-tight leading-none bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">250M+</div>
                       <div className="text-[14px] font-medium text-[var(--text-tertiary)] mt-2 italic">Connecting Global Minds</div>
                    </div>
                  </div>
               </div>
               {/* Outer glow aura */}
               <div className="absolute -inset-10 bg-[hsl(var(--accent)/0.05)] blur-[100px] rounded-full -z-10 group-hover:bg-[hsl(var(--accent)/0.08)] transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="relative py-40 md:py-64 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Majestic Glow Orb */}
          <div className="w-[1000px] h-[600px] bg-[hsl(var(--accent)/0.08)] blur-[150px] rounded-[100%] opacity-80 mix-blend-normal"></div>
        </div>

        <div className="container-app relative z-10">
          <h2 className="text-display text-[48px] md:text-[80px] tracking-tighter leading-[1] mb-10 max-w-3xl mx-auto">
            Ready to accelerate <br/> your research?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/search" className="btn btn-lg bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-500 border-none font-semibold px-10 py-5 rounded-[1.5rem] text-[16px]">
              Start searching globally
            </Link>
            <Link href="/saved" className="btn btn-lg bg-[var(--bg-elevated)] border border-[var(--border-primary)]/80 hover:border-[var(--text-primary)] text-[var(--text-primary)] transition-all duration-300 font-semibold px-10 py-5 rounded-[1.5rem] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-[16px]">
              View your library
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
