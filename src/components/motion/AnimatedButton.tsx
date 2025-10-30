'use client';

import { motion } from 'framer-motion';
import { buttonPressVariants } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { forwardRef } from 'react';
import * as React from 'react';

/**
 * AnimatedButton component
 * Button with press and hover animations
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ children, disabled, ...props }, ref) => {
    return (
      <motion.div
        variants={buttonPressVariants}
        initial="initial"
        whileHover={!disabled ? 'hover' : undefined}
        whileTap={!disabled ? 'tap' : undefined}
        className="inline-block"
      >
        <Button ref={ref} disabled={disabled} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
