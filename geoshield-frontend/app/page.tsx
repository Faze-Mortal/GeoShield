'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LandingHeader from '@/components/landing/LandingHeader';
import ChapterRail, { CHAPTERS } from '@/components/landing/ChapterRail';
import HeroChapter from '@/components/landing/HeroChapter';
import MechanicsChapter from '@/components/landing/MechanicsChapter';
import LandscapeChapter from '@/components/landing/LandscapeChapter';
import TemporalPivotChapter from '@/components/landing/TemporalPivotChapter';
import TwoLayerChapter from '@/components/landing/TwoLayerChapter';
import RiskMatrixChapter from '@/components/landing/RiskMatrixChapter';
import SimulationChapter from '@/components/landing/SimulationChapter';
import LimitationsChapter from '@/components/landing/LimitationsChapter';

export default function LandingPage() {
  const [activeChapterId, setActiveChapterId] = useState<string>('chapter-1');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Passive, rAF-throttled scroll progress tracking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const current = (window.scrollY / totalHeight) * 100;
            setScrollProgress(current);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to accurately track the active chapter in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible chapter with highest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveChapterId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7],
      },
    );

    CHAPTERS.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSelectChapter = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#090e17] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white overflow-x-clip">
      {/* Fixed Header Bar with Brand, Skip link, and Explore CTA */}
      <LandingHeader progress={scrollProgress} />

      {/* Floating Desktop Chapter Progression Rail */}
      <ChapterRail
        activeChapterId={activeChapterId}
        onSelectChapter={handleSelectChapter}
      />

      {/* Story Narrative: 8 Chapters */}
      <main id="main-content" className="flex-1 w-full flex flex-col overflow-x-clip">
        {/* Chapter 1: The Problem (Hero) */}
        <HeroChapter />

        {/* Chapter 2: Why Landslides Happen (Mechanics & Cross-Section) */}
        <MechanicsChapter />

        {/* Chapter 3: Understanding the Landscape (Data Architecture & 12 Model Features) */}
        <LandscapeChapter />

        {/* Chapter 4: The Assumption We Had to Question (Real GSI Year Histogram & Pivot) */}
        <TemporalPivotChapter />

        {/* Chapter 5: The Two-Layer Solution (Layer A vs Layer B Decoupled Framework) */}
        <TwoLayerChapter />

        {/* Chapter 6: How the Layers Become Current Risk (3x3 Matrix Climax) */}
        <RiskMatrixChapter />

        {/* Chapter 7: See a What-If Scenario (Rainfall Sensitivity Slider & +30% Verification) */}
        <SimulationChapter />

        {/* Chapter 8: What GeoShield Can and Cannot Tell You (System Boundaries & Attributions) */}
        <LimitationsChapter />
      </main>

      {/* Global Semantic Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d15] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GeoShield. Free Academic & Research Project (Kullu & Mandi, HP).</p>
          <div className="flex items-center gap-5 text-xs font-mono">
            <Link href="/dashboard" className="text-sky-400 hover:text-sky-300 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Operational Risk Map
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Terms & Limitations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
