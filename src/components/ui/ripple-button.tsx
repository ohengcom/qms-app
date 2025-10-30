'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends React.ComponentProps<typeof Button> {
  rippleColor?: string;
}

/**
 * RippleButton component
 * Button with ripple effect on click
 */
export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    { children, className, rippleColor = 'rgba(255, 255, 255, 0.6)', disabled, onClick, ...props },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = {
        x,
        y,
        id: Date.now(),
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);

      // Call original onClick if provided
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        disabled={disabled}
        {...props}
        onClick={handleClick}
      >
        {children}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </Button>
    );
  }
);

RippleButton.displayName = 'RippleButton';
