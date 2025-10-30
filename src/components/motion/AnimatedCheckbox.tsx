'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AnimatedCheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label?: string;
}

/**
 * AnimatedCheckbox component
 * Checkbox with check animation
 */
export const AnimatedCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  AnimatedCheckboxProps
>(({ className, label, ...props }, ref) => {
  return (
    <motion.div
      className="flex items-center space-x-2"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Checkbox ref={ref} className={cn(className)} {...props} />
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
        </label>
      )}
    </motion.div>
  );
});

AnimatedCheckbox.displayName = 'AnimatedCheckbox';
