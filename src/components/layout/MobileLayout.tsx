'use client';

import { useEffect, useState } from 'react';
import { MobileNavigation, MobileBottomNavigation, MobileHeader } from './MobileNavigation';
import { FloatingActionButton } from '@/components/ui/touch-friendly';
import { cn } from '@/lib/utils';
import { Plus, ArrowUp } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showFAB?: boolean;
  fabAction?: () => void;
  fabIcon?: React.ReactNode;
  showBackToTop?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  title,
  subtitle,
  showFAB = false,
  fabAction,
  fabIcon = <Plus className="h-6 w-6" />,
  showBackToTop = true,
  className,
}: MobileLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle scroll events for back-to-top button
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);
      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {title && (
        <MobileHeader
          title={title}
          subtitle={subtitle}
          actions={<MobileNavigation />}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        'pb-20', // Space for bottom navigation
        title && 'pt-0', // No top padding if header is present
        className
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />

      {/* Floating Action Button */}
      {showFAB && fabAction && (
        <FloatingActionButton
          onClick={fabAction}
          icon={fabIcon}
          position="bottom-right"
          className={cn(
            'mb-24 transition-all duration-300', // Space above bottom nav
            isScrolling && 'scale-90 opacity-80'
          )}
        />
      )}

      {/* Back to Top Button */}
      {showBackToTop && showScrollTop && (
        <FloatingActionButton
          onClick={scrollToTop}
          icon={<ArrowUp className="h-5 w-5" />}
          position="bottom-left"
          className={cn(
            'mb-24 bg-gray-800 hover:bg-gray-700 transition-all duration-300',
            isScrolling && 'scale-90 opacity-80'
          )}
          label="Back to top"
        />
      )}
    </div>
  );
}

// Mobile-optimized card layout
interface MobileCardLayoutProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function MobileCardLayout({ 
  children, 
  spacing = 'normal',
  className 
}: MobileCardLayoutProps) {
  const spacingClasses = {
    tight: 'space-y-2 p-3',
    normal: 'space-y-4 p-4',
    loose: 'space-y-6 p-6',
  };

  return (
    <div className={cn(
      'lg:hidden',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized grid
interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileGrid({ 
  children, 
  columns = 1, 
  gap = 'md',
  className 
}: MobileGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn(
      'lg:hidden grid',
      gridClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized list
interface MobileListProps {
  children: React.ReactNode;
  dividers?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileList({ 
  children, 
  dividers = true, 
  padding = 'md',
  className 
}: MobileListProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(
      'lg:hidden',
      dividers && 'divide-y divide-gray-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized section
interface MobileSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function MobileSection({ 
  title, 
  subtitle, 
  children, 
  className,
  headerActions 
}: MobileSectionProps) {
  return (
    <section className={cn('lg:hidden', className)}>
      {(title || subtitle || headerActions) && (
        <div className="flex items-center justify-between mb-4 px-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}