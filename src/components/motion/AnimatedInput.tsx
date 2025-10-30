'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * AnimatedInput component
 * Input with focus animation and shake effect on error
 */
export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <motion.div
        animate={
          error
            ? {
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 },
              }
            : {}
        }
      >
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
        >
          <Input
            ref={ref}
            className={cn(
              'transition-all duration-200',
              isFocused && 'ring-2 ring-ring ring-offset-2',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            onFocus={e => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
      </motion.div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';
