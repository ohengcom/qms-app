'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Touch-friendly button with larger tap targets and haptic feedback
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  hapticFeedback?: boolean;
}

export function TouchButton({ 
  variant = 'default', 
  size = 'md', 
  className, 
  children,
  hapticFeedback = true,
  onClick,
  ...props 
}: TouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95 touch-manipulation';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm hover:shadow-md',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground active:bg-accent/80 shadow-sm hover:shadow-md',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm hover:shadow-md',
  };
  
  const sizes = {
    sm: 'h-12 px-4 text-sm min-w-[48px]', // Minimum 48px for touch targets
    md: 'h-14 px-6 text-base min-w-[56px]', // Minimum 56px for comfortable touch
    lg: 'h-16 px-8 text-lg min-w-[64px]', // Minimum 64px for large touch targets
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Provide haptic feedback on mobile
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.(e);
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className,
  swipeThreshold = 100 
}: SwipeableCardProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!startX || !currentX || !isDragging) {
      setStartX(null);
      setCurrentX(null);
      setIsDragging(false);
      return;
    }

    const diffX = currentX - startX;
    
    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setStartX(null);
    setCurrentX(null);
    setIsDragging(false);
  };

  const translateX = isDragging && startX && currentX ? currentX - startX : 0;

  return (
    <div
      ref={cardRef}
      className={cn('transition-transform duration-200 ease-out', className)}
      style={{ transform: `translateX(${translateX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  refreshThreshold = 80,
  className 
}: PullToRefreshProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY || containerRef.current?.scrollTop !== 0) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    
    if (diffY > 0) {
      setCurrentY(currentY);
      setIsPulling(diffY > refreshThreshold);
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!startY || !currentY) return;
    
    const diffY = currentY - startY;
    
    if (diffY > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setStartY(null);
    setCurrentY(null);
    setIsPulling(false);
  };

  const pullDistance = startY && currentY ? Math.max(0, currentY - startY) : 0;
  const pullProgress = Math.min(pullDistance / refreshThreshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 border-b border-blue-200 transition-all duration-200"
          style={{ height: `${Math.min(pullDistance, 60)}px` }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-4 h-4 border-2 border-blue-600 rounded-full transition-transform"
                  style={{ transform: `rotate(${pullProgress * 180}deg)` }}
                />
                <span className="text-sm">
                  {isPulling ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}>
        {children}
      </div>
    </div>
  );
}

// Touch-friendly input with larger tap targets
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TouchInput({ label, error, className, ...props }: TouchInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
      )}
      <input
        className={cn(
          'flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Floating Action Button for mobile
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label,
  position = 'bottom-right',
  className 
}: FloatingActionButtonProps) {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95',
        positions[position],
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );
}