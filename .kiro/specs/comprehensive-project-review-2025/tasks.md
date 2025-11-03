# Implementation Plan - 2 Day Intensive Sprint

## Day 1 (Nov 3): Foundation & Security

### Session 1: Code Quality & Database (3 hours)

- [x] 1. Create Logging Utility


  - Create `src/lib/logger.ts` with LogLevel enum and Logger class
  - Implement debug, info, warn, error methods
  - Add environment-based filtering
  - Add error serialization support
  - _Requirements: 1_

- [x] 2. Replace console.log with logger



  - Search for all console.log statements in src/
  - Replace with appropriate logger calls
  - Remove console.error, console.warn as well
  - Test logging output in development
  - _Requirements: 1_

- [x] 3. Create Database Type Definitions



  - Create `src/lib/database/types.ts`
  - Define QuiltRow interface (snake_case)
  - Define Quilt interface (camelCase)
  - Define UsageRecordRow and UsageRecord interfaces
  - Create rowToQuilt and quiltToRow transformer functions
  - _Requirements: 1, 2_

- [x] 4. Implement Repository Pattern


  - Create `src/lib/repositories/base.repository.ts`
  - Create `src/lib/repositories/quilt.repository.ts`
  - Implement findAll, findById, create, update, delete methods
  - Add proper TypeScript types (remove `any`)
  - Add error handling with logger
  - Export singleton instance
  - _Requirements: 2_

- [x] 5. Create Usage Repository


  - Create `src/lib/repositories/usage.repository.ts`
  - Implement createUsageRecord, endUsageRecord methods
  - Implement getActiveUsageRecord, getUsageRecordsByQuiltId
  - Add proper error handling
  - _Requirements: 2_

- [x] 6. Add Error Boundaries



  - Create `src/components/ErrorBoundary.tsx`
  - Add error boundary to app layout
  - Add bilingual error messages
  - _Requirements: 1_

### Session 2: Authentication & Security (3 hours)

- [x] 7. Create Password Utilities


  - Create `src/lib/auth/password.ts`
  - Implement hashPassword function with bcrypt
  - Implement verifyPassword function
  - Set SALT_ROUNDS to 12
  - _Requirements: 6_

- [x] 8. Create JWT Utilities

  - Create `src/lib/auth/jwt.ts`
  - Implement signToken function
  - Implement verifyToken function
  - Add support for rememberMe (7d vs 30d expiration)
  - _Requirements: 6_

- [x] 9. Create Rate Limiting

  - Create `src/lib/auth/rate-limit.ts`
  - Implement checkRateLimit function (5 attempts per 15 min)
  - Implement resetRateLimit function
  - Use in-memory Map for storage
  - _Requirements: 6_

- [x] 10. Create Login Page

  - Create `src/app/login/page.tsx`
  - Add password input with show/hide toggle
  - Add "Remember Me" checkbox
  - Add bilingual labels (中文/English)
  - Add error message display
  - Add loading state
  - _Requirements: 6, 7_

- [x] 11. Create Login API

  - Create `src/app/api/auth/login/route.ts`
  - Implement POST handler
  - Add rate limiting check
  - Verify password against QMS_PASSWORD_HASH
  - Generate JWT token
  - Set HTTP-only cookie
  - Add logging for login attempts
  - _Requirements: 6_

- [x] 12. Create Logout API


  - Create `src/app/api/auth/logout/route.ts`
  - Clear auth-token cookie
  - Add logging
  - _Requirements: 6_

- [x] 13. Update Middleware for Authentication


  - Update `src/middleware.ts`
  - Add authentication check
  - Define public paths (login, health check)
  - Redirect to /login if not authenticated
  - Return 401 for API routes
  - _Requirements: 6_

- [x] 14. Add Logout Button to Header


  - Update `src/components/layout/AppLayout.tsx`
  - Add logout button to header
  - Call logout API on click
  - Redirect to /login after logout
  - _Requirements: 6_

- [x] 15. Setup Password Script


  - Update `scripts/setup-password.ts` if needed
  - Ensure it generates proper bcrypt hash
  - Test password setup flow
  - _Requirements: 6_

### Session 3: API Consolidation (1-2 hours)

- [ ] 16. Create tRPC Error Handler


  - Update `src/server/api/trpc.ts`
  - Add handleTRPCError utility function
  - Add logging for all errors
  - Ensure consistent error responses
  - _Requirements: 5_

- [ ] 17. Update Quilts Router
  - Update `src/server/api/routers/quilts.ts`
  - Replace db.* calls with quiltRepository.*
  - Add proper error handling with handleTRPCError
  - Add logging for all operations
  - Remove any `any` types
  - _Requirements: 1, 2, 5_

- [ ] 18. Update Usage Router
  - Update `src/server/api/routers/usage.ts` (if exists)
  - Replace db.* calls with usageRepository.*
  - Add proper error handling
  - Add logging
  - _Requirements: 2, 5_

- [ ] 19. Remove Duplicate REST APIs
  - Audit all files in `src/app/api/`
  - Identify routes covered by tRPC
  - Remove duplicate routes (keep only auth, health, db-test)
  - Update any frontend code using removed routes
  - _Requirements: 5_

- [ ] 20. Test API Consolidation
  - Test all tRPC procedures work correctly
  - Verify authentication is enforced
  - Check error handling works
  - Verify logging is working
  - _Requirements: 5_

## Day 2 (Nov 4): UX & Performance

### Session 1: Bilingual & UI/UX (3-4 hours)

- [ ] 21. Create Translation Files
  - Create `src/lib/i18n/translations/zh.ts`
  - Create `src/lib/i18n/translations/en.ts`
  - Add all common translations (save, cancel, delete, etc.)
  - Add auth translations
  - Add quilts translations
  - Add usage translations
  - Add error messages
  - _Requirements: 7_

- [ ] 22. Audit Missing Translations
  - Run `npm run audit-translations`
  - Identify all untranslated strings
  - Add missing translations to translation files
  - _Requirements: 7_

- [ ] 23. Update useTranslation Hook
  - Update `src/lib/i18n/hooks.ts`
  - Ensure it uses new translation structure
  - Add type safety for translation keys
  - _Requirements: 7_

- [ ] 24. Create Language Switcher
  - Create `src/components/LanguageSwitcher.tsx`
  - Add to app header
  - Show current language (🇨🇳 中文 / 🇺🇸 English)
  - Persist selection to localStorage
  - _Requirements: 7_

- [ ] 25. Update Date/Number Formatters
  - Update `src/lib/formatters.ts`
  - Ensure proper Chinese date formatting (2024年10月29日)
  - Ensure proper English date formatting (October 29, 2024)
  - Add number formatting with proper separators
  - _Requirements: 7_

- [ ] 26. Create Design Tokens
  - Create `src/lib/design-system/tokens.ts`
  - Define color palette (primary, gray, success, warning, error)
  - Define spacing scale (xs, sm, md, lg, xl, 2xl)
  - Define border radius values
  - Define typography settings
  - _Requirements: 8_

- [ ] 27. Create Loading Skeletons
  - Create `src/components/ui/skeleton.tsx`
  - Create QuiltListSkeleton component
  - Create QuiltDetailSkeleton component
  - Create DashboardSkeleton component
  - Add to all data-fetching pages
  - _Requirements: 8_

- [ ] 28. Improve Empty States
  - Update `src/components/ui/empty-state.tsx`
  - Add icons to empty states
  - Add helpful messages
  - Add action buttons
  - Apply to quilts list, usage list, analytics
  - _Requirements: 8_

- [ ] 29. Add Consistent Spacing
  - Audit all pages for spacing inconsistencies
  - Apply design tokens for spacing
  - Use Tailwind utilities consistently
  - Ensure proper padding and margins
  - _Requirements: 8_

- [ ] 30. Fix Mobile Responsiveness
  - Test all pages on mobile viewport
  - Fix any layout issues
  - Ensure touch targets are ≥44px
  - Test navigation on mobile
  - _Requirements: 8_

- [ ]* 31. Add Dark Mode Support (Optional)
  - Add theme toggle to header
  - Implement dark mode color scheme
  - Persist theme preference
  - Test all pages in dark mode
  - _Requirements: 8_

### Session 2: Performance Optimization (2 hours)

- [ ] 32. Configure React Query
  - Update `src/lib/query-client.ts`
  - Set staleTime to 5 minutes
  - Set cacheTime to 10 minutes
  - Disable refetchOnWindowFocus
  - _Requirements: 4_

- [ ] 33. Implement Optimistic Updates
  - Update `src/hooks/useQuilts.ts`
  - Add optimistic update for create mutation
  - Add optimistic update for update mutation
  - Add optimistic update for delete mutation
  - Add rollback on error
  - _Requirements: 4_

- [ ] 34. Optimize Component Imports
  - Audit all imports in src/
  - Replace wildcard imports with specific imports
  - Optimize Radix UI imports
  - Optimize Lucide icon imports
  - _Requirements: 4_

- [ ] 35. Add Lazy Loading
  - Identify heavy components (dialogs, charts)
  - Use dynamic imports for heavy components
  - Add loading fallbacks
  - Test lazy loading works correctly
  - _Requirements: 4_

- [ ] 36. Analyze Bundle Size
  - Run `npm run analyze`
  - Identify large dependencies
  - Look for optimization opportunities
  - Document bundle size improvements
  - _Requirements: 4_

- [ ]* 37. Implement Virtual Scrolling (Optional)
  - Add virtual scrolling to quilt list if >50 items
  - Use @tanstack/react-virtual
  - Test performance improvement
  - _Requirements: 4_

### Session 3: Documentation & Testing (1-2 hours)

- [ ] 38. Update README
  - Update feature list with authentication
  - Update quick start guide
  - Add authentication setup instructions
  - Update tech stack section
  - Add troubleshooting section
  - _Requirements: 9_

- [ ] 39. Create API Documentation
  - Document all tRPC procedures
  - Add JSDoc comments to repository methods
  - Document authentication flow
  - Document error handling patterns
  - _Requirements: 9_

- [ ] 40. Update PROJECT_STATUS
  - Update completed features
  - Update version to 0.3.0
  - Add authentication to feature list
  - Update roadmap
  - _Requirements: 9_

- [ ]* 41. Setup Vitest (Optional)
  - Install Vitest and testing dependencies
  - Create `vitest.config.ts`
  - Create test utilities in `src/test/`
  - Add test scripts to package.json
  - _Requirements: 3_

- [ ]* 42. Write Critical Tests (Optional)
  - Test logger utility
  - Test password hashing/verification
  - Test JWT sign/verify
  - Test data transformers
  - Test repository methods
  - _Requirements: 3_

## Optional: Production Monitoring (If Time Permits)

- [ ]* 43. Setup Sentry (Optional)
  - Install @sentry/nextjs
  - Configure Sentry in next.config.js
  - Add Sentry.init() to app
  - Test error tracking
  - _Requirements: 10_

- [ ]* 44. Add Structured Logging (Optional)
  - Update logger to output JSON in production
  - Add request ID tracking
  - Add user context to logs
  - _Requirements: 10_

## Testing Checklist

After completing all tasks, verify:

- [ ] Authentication works (login/logout)
- [ ] Protected routes redirect to login
- [ ] Rate limiting works on login
- [ ] All pages load without errors
- [ ] All CRUD operations work
- [ ] Translations are complete
- [ ] Loading skeletons appear
- [ ] Empty states show correctly
- [ ] Mobile layout works
- [ ] No console.log in code
- [ ] No TypeScript errors
- [ ] Bundle size is reasonable
- [ ] Performance is improved

## Deployment Checklist

- [ ] Create database backup
- [ ] Set QMS_PASSWORD_HASH in environment
- [ ] Set QMS_JWT_SECRET in environment
- [ ] Deploy to staging
- [ ] Test all critical flows
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Verify authentication works
- [ ] Test on mobile devices

## Notes

- Tasks marked with `*` are optional and can be skipped if time is limited
- Focus on completing core tasks first
- Test each change immediately after implementation
- Keep commits small and focused
- Can rollback any change if issues arise
- Deploy to staging before production
