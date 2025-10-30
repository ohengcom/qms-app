'use client';

import { motion } from 'framer-motion';
import { cardHoverVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * AnimatedCard component
 * Card with hover and tap animations
 */
export function AnimatedCard({
  children,
  className,
  onClick,
  disabled = false,
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled && onClick ? 'tap' : undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'rounded-lg border bg-card text-card-foreground',
        onClick && !disabled && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
