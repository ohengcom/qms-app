'use client';

import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { QuiltCard } from './QuiltCard';
import { LoadingCard } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface VirtualizedQuiltListProps {
  quilts: any[];
  isLoading?: boolean;
  onQuiltSelect?: (quilt: any) => void;
  onQuiltEdit?: (quilt: any) => void;
  onQuiltDelete?: (quilt: any) => void;
  onStartUsage?: (quilt: any) => void;
  onEndUsage?: (quilt: any) => void;
  className?: string;
  itemHeight?: number;
  overscan?: number;
}

export function VirtualizedQuiltList({
  quilts,
  isLoading = false,
  onQuiltSelect,
  onQuiltEdit,
  onQuiltDelete,
  onStartUsage,
  onEndUsage,
  className,
  itemHeight = 280, // Approximate height of QuiltCard
  overscan = 5,
}: VirtualizedQuiltListProps) {
  // Create a parent ref for the virtualizer
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Memoize the quilts array to prevent unnecessary re-renders
  const memoizedQuilts = useMemo(() => quilts, [quilts]);

  // Create the virtualizer
  const virtualizer = useVirtualizer({
    count: memoizedQuilts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (memoizedQuilts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quilts found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        'h-[600px] overflow-auto', // Fixed height for virtualization
        className
      )}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const quilt = memoizedQuilts[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="p-3">
                <QuiltCard
                  quilt={quilt}
                  onView={() => onQuiltSelect?.(quilt)}
                  onEdit={() => onQuiltEdit?.(quilt)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Performance-optimized grid version for better layout
export function VirtualizedQuiltGrid({
  quilts,
  isLoading = false,
  onQuiltSelect,
  onQuiltEdit,
  onQuiltDelete,
  onStartUsage,
  onEndUsage,
  className,
  columns = 3,
  itemHeight = 280,
  gap = 24,
}: VirtualizedQuiltListProps & { columns?: number; gap?: number }) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate rows needed for grid layout
  const rows = Math.ceil(quilts.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 2,
  });

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (quilts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quilts found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-[600px] overflow-auto', className)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, quilts.length);
          const rowQuilts = quilts.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div 
                className="grid gap-6 px-3"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {rowQuilts.map((quilt, index) => (
                  <QuiltCard
                    key={quilt.id || startIndex + index}
                    quilt={quilt}
                    onView={() => onQuiltSelect?.(quilt)}
                    onEdit={() => onQuiltEdit?.(quilt)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}