'use client';

import { motion } from 'framer-motion';
import { listContainerVariants, listItemVariants } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedList component
 * Container for staggered list animations
 * Respects user's prefers-reduced-motion preference
 */
export function AnimatedList({ children, className }: AnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  // If reduced motion is preferred, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={listContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedListItem component
 * Individual list item with animation
 * Respects user's prefers-reduced-motion preference
 */
export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  // If reduced motion is preferred, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={listItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
