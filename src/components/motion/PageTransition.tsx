'use client';

import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition component
 * Wraps page content with smooth fade and slide animations
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
