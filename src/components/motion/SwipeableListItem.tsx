'use client';

import * as React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  className?: string;
  deleteThreshold?: number;
}

/**
 * SwipeableListItem component
 * List item with swipe-to-delete functionality
 */
export function SwipeableListItem({
  children,
  onDelete,
  className,
  deleteThreshold = 100,
}: SwipeableListItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-deleteThreshold, 0], [0, 1]);
  const deleteOpacity = useTransform(x, [-deleteThreshold * 2, -deleteThreshold, 0], [1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -deleteThreshold && onDelete) {
      // Animate out and delete
      onDelete();
    } else {
      // Snap back
      x.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 bg-destructive flex items-center justify-end px-6"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -deleteThreshold * 2, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className={cn('bg-background cursor-grab active:cursor-grabbing', className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
