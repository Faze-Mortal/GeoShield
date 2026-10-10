'use client';

import React, { useEffect, useRef, useState, useId } from 'react';

export type RevealVariant =
  | 'fade-up'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'clip-reveal'
  | 'stagger';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number;
  rootMargin?: string;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
  id?: string;
}

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 650,
  threshold = 0.12,
  rootMargin = '-30px 0px -40px 0px',
  className = '',
  as: Component = 'div',
  style = {},
  id,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const generatedId = useId();
  const elementId = id || generatedId;

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) setIsVisible(true);
    };
    mediaQuery.addEventListener('change', handleChange);

    const el = ref.current;
    if (!el) return () => mediaQuery.removeEventListener('change', handleChange);

    // Fallback: if IntersectionObserver is unsupported, reveal immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [threshold, rootMargin]);

  // If reduced motion is preferred, render with static visible state
  if (isReducedMotion) {
    return (
      <Component
        id={elementId}
        ref={ref}
        className={className}
        style={style}
      >
        {children}
      </Component>
    );
  }

  // Base initial vs visible styling mapping
  const getVariantStyles = (): { initial: React.CSSProperties; active: React.CSSProperties } => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    switch (variant) {
      case 'fade-left':
        return {
          initial: { opacity: 0, transform: isMobile ? 'translateY(16px)' : 'translateX(24px)' },
          active: { opacity: 1, transform: isMobile ? 'translateY(0)' : 'translateX(0)' },
        };
      case 'fade-right':
        return {
          initial: { opacity: 0, transform: isMobile ? 'translateY(16px)' : 'translateX(-24px)' },
          active: { opacity: 1, transform: isMobile ? 'translateY(0)' : 'translateX(0)' },
        };
      case 'scale-in':
        return {
          initial: { opacity: 0, transform: 'scale(0.96)' },
          active: { opacity: 1, transform: 'scale(1)' },
        };
      case 'clip-reveal':
        return {
          initial: { opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
          active: { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        };
      case 'fade-up':
      case 'stagger':
      default:
        return {
          initial: { opacity: 0, transform: 'translateY(20px)' },
          active: { opacity: 1, transform: 'translateY(0)' },
        };
    }
  };

  const { initial, active } = getVariantStyles();

  const animationStyle: React.CSSProperties = {
    ...style,
    ...(isVisible ? active : initial),
    transitionProperty: variant === 'clip-reveal' ? 'opacity, clip-path' : 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: isVisible ? 'auto' : 'transform, opacity',
  };

  return (
    <Component
      id={elementId}
      ref={ref}
      className={className}
      style={animationStyle}
    >
      {children}
    </Component>
  );
}
