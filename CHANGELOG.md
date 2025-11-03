# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-11-03

### Added

- **Code Quality & Architecture**
  - Logging utility (`src/lib/logger.ts`) with environment-based filtering
  - Repository pattern for database operations
  - Type-safe database type definitions
  - Error boundaries with bilingual support
  - Base repository implementation for consistent data access

- **Authentication & Security**
  - Password utilities with bcrypt hashing (12 salt rounds)
  - JWT token generation and verification
  - Rate limiting for login attempts (5 attempts per 15 minutes)
  - Login page with password visibility toggle
  - Logout functionality
  - Middleware-based route protection
  - Database password storage (passwords stored in `system_settings` table)
  - Instant password changes without redeployment

- **API Consolidation**
  - tRPC integration for type-safe API calls
  - Unified error handling with `handleTRPCError`
  - Quilts router with tRPC
  - Usage router with tRPC
  - Settings router with tRPC
  - Removed duplicate REST API endpoints

- **Enhanced Settings Page**
  - Change password dialog with validation
  - Modify application name (saved to database)
  - Language switcher component (🇨🇳 中文 / 🇺🇸 English)
  - Real-time database statistics (auto-refresh every minute)
  - System information display (version, framework, environment)
  - Browser-based system settings initialization

- **Usage Tracking Improvements**
  - Migrated usage tracking to tRPC
  - Edit usage records functionality
  - Delete usage records functionality
  - Removed usage type field (simplified UI)
  - Removed season column from usage table

- **Database**
  - `system_settings` table for application configuration
  - Password hash storage in database
  - Application name storage
  - UUID extension support

### Changed

- Replaced `console.log` with structured logging throughout codebase
- Updated all database operations to use repository pattern
- Migrated frontend API calls from REST to tRPC
- Improved error handling with consistent error messages
- Enhanced settings page UI with better organization

### Fixed

- Usage record editing now works correctly with tRPC
- Toast notifications work properly in all components
- UUID generation in system_settings table
- Timestamp handling in database inserts

### Security

- Passwords now stored securely in database with bcrypt
- JWT tokens for session management
- Rate limiting on login endpoint
- HTTP-only cookies for token storage
- Middleware protection for all routes except login and health check

### Documentation

- Added `PASSWORD-MIGRATION-GUIDE.md` for password migration instructions
- Updated README with new features and setup instructions
- Added changelog for version tracking

## [0.2.2] - 2025-01-16

### Added

- Usage tracking automation
- Bilingual support (Chinese/English)
- Data validation with Zod
- UI enhancements with animations

### Changed

- Improved quilt management interface
- Enhanced data import/export

### Fixed

- Various bug fixes and performance improvements

## [0.2.0] - 2025-01-10

### Added

- Initial release with core functionality
- Quilt management (CRUD operations)
- Basic usage tracking
- Excel import/export
- Responsive design

---

[0.3.0]: https://github.com/ohengcom/qms-app/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/ohengcom/qms-app/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/ohengcom/qms-app/releases/tag/v0.2.0
