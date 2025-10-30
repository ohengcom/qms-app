'use client';

import { motion } from 'framer-motion';
import { listContainerVariants, listItemVariants } from '@/lib/animations';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedList component
 * Container for staggered list animations
 */
export function AnimatedList({ children, className }: AnimatedListProps) {
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
 */
export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div variants={listItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
