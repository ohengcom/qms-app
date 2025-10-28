# Implementation Plan

- [ ] 1. Update React hooks to use fetch + React Query
  - Replace tRPC calls with direct fetch API calls
  - Use React Query for caching and state management
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 1.1 Update useQuilts hook


  - Replace tRPC query with fetch to /api/quilts
  - Implement useCreateQuilt, useUpdateQuilt, useDeleteQuilt mutations
  - _Requirements: 3.1, 3.2, 3.3_



- [ ] 1.2 Update useDashboard hook
  - Replace tRPC query with fetch to /api/dashboard/stats
  - Handle loading and error states
  - _Requirements: 3.1, 3.4_

- [ ] 1.3 Update usage tracking hooks
  - Replace tRPC mutations with fetch to /api/usage endpoints
  - Invalidate queries after mutations
  - _Requirements: 3.3_

- [ ] 2. Verify and update API routes
  - Ensure all API routes return consistent response format
  - Add proper error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.1 Verify /api/quilts route
  - Check GET endpoint returns all quilts correctly
  - Add POST endpoint for creating quilts
  - _Requirements: 2.1, 2.3_

- [ ] 2.2 Create /api/quilts/[id] route
  - Implement GET for single quilt
  - Implement PUT for updating quilt


  - Implement DELETE for removing quilt
  - _Requirements: 2.4, 2.5_

- [ ] 2.3 Create /api/dashboard/stats route
  - Implement GET endpoint for dashboard statistics
  - Calculate counts and distributions
  - _Requirements: 2.2_

- [ ] 3. Remove tRPC dependencies
  - Clean up tRPC-related code and packages
  - Remove unused files
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3.1 Remove tRPC packages
  - Uninstall @trpc/server, @trpc/client, @trpc/react-query, @trpc/next
  - Update package.json
  - _Requirements: 1.1_

- [ ] 3.2 Remove tRPC router files
  - Delete src/server/api/routers directory
  - Delete src/server/api/root.ts
  - _Requirements: 1.2_

- [ ] 3.3 Remove tRPC client configuration
  - Delete src/lib/trpc.ts
  - Remove tRPC provider from layout
  - _Requirements: 1.3, 1.4_

- [ ] 4. Test all features
  - Verify quilts display correctly
  - Test CRUD operations
  - Test dashboard statistics
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.1 Test quilts page
  - Verify all 16 quilts display
  - Test search and filtering
  - _Requirements: 4.2, 4.3_

- [ ] 4.2 Test dashboard
  - Verify statistics are accurate
  - Check all counts match database
  - _Requirements: 4.1_

- [ ] 4.3 Test CRUD operations
  - Test creating new quilt
  - Test editing existing quilt
  - Test deleting quilt
  - _Requirements: 4.4_

- [ ] 5. Deploy and verify
  - Commit changes
  - Push to GitHub
  - Verify deployment on Vercel
  - Test production site
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
