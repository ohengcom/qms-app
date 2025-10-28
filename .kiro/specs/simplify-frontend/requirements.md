# Requirements Document

## Introduction

Simplify the QMS frontend by removing tRPC complexity and using direct Next.js API routes with React Query. The current implementation has persistent issues with tRPC causing "no quilts found" despite the database containing 16 quilts and API endpoints working correctly.

## Glossary

- **QMS**: Quilt Management System - the application for managing quilt inventory
- **API Route**: Next.js server-side endpoint that handles HTTP requests
- **React Query**: Data fetching library for managing server state in React
- **Neon Database**: PostgreSQL database containing quilt data

## Requirements

### Requirement 1: Remove tRPC Dependencies

**User Story:** As a developer, I want to remove tRPC from the application, so that we have a simpler, more maintainable codebase.

#### Acceptance Criteria

1. WHEN removing dependencies, THE System SHALL uninstall all tRPC-related packages from package.json
2. WHEN cleaning up code, THE System SHALL remove all tRPC router files from src/server/api/routers
3. WHEN cleaning up code, THE System SHALL remove the tRPC client configuration from src/lib/trpc.ts
4. WHEN cleaning up code, THE System SHALL remove tRPC provider from the root layout

### Requirement 2: Create Simple API Routes

**User Story:** As a developer, I want simple Next.js API routes, so that data fetching is straightforward and debuggable.

#### Acceptance Criteria

1. WHEN fetching quilts, THE System SHALL provide a GET endpoint at /api/quilts that returns all quilts
2. WHEN fetching dashboard stats, THE System SHALL provide a GET endpoint at /api/dashboard/stats
3. WHEN creating a quilt, THE System SHALL provide a POST endpoint at /api/quilts
4. WHEN updating a quilt, THE System SHALL provide a PUT endpoint at /api/quilts/[id]
5. WHEN deleting a quilt, THE System SHALL provide a DELETE endpoint at /api/quilts/[id]

### Requirement 3: Update React Hooks

**User Story:** As a developer, I want React hooks that use fetch directly with React Query, so that data fetching is simple and reliable.

#### Acceptance Criteria

1. WHEN fetching data, THE System SHALL use React Query with fetch API instead of tRPC
2. WHEN handling errors, THE System SHALL provide clear error messages from API responses
3. WHEN data changes, THE System SHALL invalidate queries to refetch updated data
4. WHEN loading data, THE System SHALL show loading states consistently

### Requirement 4: Maintain Existing Features

**User Story:** As a user, I want all existing features to continue working, so that I can manage my quilt inventory without disruption.

#### Acceptance Criteria

1. WHEN viewing the dashboard, THE System SHALL display quilt statistics correctly
2. WHEN viewing the quilts page, THE System SHALL display all 16 quilts from the database
3. WHEN searching quilts, THE System SHALL filter results based on search criteria
4. WHEN creating/editing quilts, THE System SHALL save changes to the database
5. WHEN viewing quilt details, THE System SHALL display complete quilt information
