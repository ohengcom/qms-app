/**
 * Zod Validation Initialization
 * This module initializes Zod with Chinese error messages.
 * Import this module at the application entry point to enable Chinese error messages globally.
 */

import { initZodChineseErrors } from './error-messages';

// Initialize Zod with Chinese error messages immediately when this module is imported
initZodChineseErrors();

// Re-export for explicit initialization if needed
export { initZodChineseErrors };
