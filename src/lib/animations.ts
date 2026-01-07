/**
 * Animation Variants for Framer Motion
 * Centralized animation configurations for consistent motion design
 *
 * All animations respect the user's prefers-reduced-motion preference.
 * When reduced motion is preferred, animations are minimized or disabled.
 */

import { Variants } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 * This should be called at runtime in components
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation variants that respect reduced motion preference
 * Returns minimal/no animation variants when reduced motion is preferred
 */
export const getReducedMotionVariants = <T extends Variants>(
  fullVariants: T,
  reducedVariants?: Partial<T>
): T => {
  if (prefersReducedMotion()) {
    return {
      ...fullVariants,
      ...reducedVariants,
    } as T;
  }
  return fullVariants;
};

/**
 * Reduced motion variants - instant transitions with no movement
 */
export const reducedMotionVariants: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

/**
 * Page transition animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade in animation
 */
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Slide in from bottom animation
 */
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Slide in from right animation
 */
export const slideInRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Modal backdrop animation
 */
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * List item stagger animation
 */
export const listContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Card hover animation
 * Uses shadow and opacity changes instead of scale to avoid visual overlap
 * Per UI/UX Pro Max guidelines: hover effects should not change dimensions
 */
export const cardHoverVariants: Variants = {
  initial: {
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  hover: {
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Button press animation
 * Uses opacity changes for hover, scale only for tap (active state)
 * Per UI/UX Pro Max guidelines: hover effects should use color/opacity changes
 */
export const buttonPressVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  hover: {
    opacity: 0.9,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Notification/Toast animation
 */
export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Accordion/Collapse animation
 */
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/**
 * Skeleton loading animation
 */
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Scale in animation
 */
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Rotate in animation
 */
export const rotateInVariants: Variants = {
  initial: {
    opacity: 0,
    rotate: -10,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    rotate: 10,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Spring animation config
 */
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Smooth spring animation config
 */
export const smoothSpringConfig = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

/**
 * Bouncy spring animation config
 */
export const bouncySpringConfig = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
};
