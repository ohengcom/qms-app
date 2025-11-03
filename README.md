# QMS - Quilt Management System 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **Production-Ready Intelligent Inventory Management for Home Bedding**

A modern Next.js application with Neon PostgreSQL that transforms simple Excel-based quilt tracking into an intelligent inventory management system.

**🌐 Live Demo**: https://qms-app-omega.vercel.app

## ✨ Key Features

### 📊 Core Functionality

- **Quilt Management**: Complete CRUD operations with auto-generated names and numbers
- **Usage Tracking**: Automated usage record creation with smart status detection
- **Status Management**: Three states (In Use, Storage, Maintenance) with intelligent transitions
- **Data Analytics**: Usage statistics, seasonal analysis, and trend visualization
- **Import/Export**: Excel support with Chinese language compatibility
- **Settings Management**: Centralized configuration with database storage

### 🎨 Modern UI/UX

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dual View Modes**: Grid and list views with seamless switching
- **Bilingual Support**: Full Chinese/English interface with language switcher
- **Empty States**: Friendly guidance when no data is available
- **Loading States**: Skeleton screens for better perceived performance
- **Real-time Stats**: Live database statistics with auto-refresh

### 🔐 Security & Authentication

- **Password Protection**: Secure login with JWT session management
- **Route Protection**: Middleware-based authentication
- **Session Persistence**: Remember me functionality
- **Secure Cookies**: HTTP-only cookies for token storage
- **Database Password Storage**: Passwords stored securely in database (no environment variable updates needed)
- **Instant Password Changes**: Change password without redeployment

### 🚀 Performance

- **Fast Loading**: < 2s first load, < 500ms page transitions
- **Optimized Queries**: Indexed database operations
- **Efficient Rendering**: React Query for data caching
- **Serverless**: Neon PostgreSQL for scalable database

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form + Zod

### Backend

- **Database**: Neon Serverless PostgreSQL
- **API**: tRPC + Next.js API Routes
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas
- **ORM**: Custom Repository Pattern

### DevOps

- **Deployment**: Vercel
- **Version Control**: Git + GitHub
- **Code Quality**: ESLint, Prettier, Husky
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ohengcom/qms-app.git
cd qms-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon database URL

# Set up admin password
npm run setup-password

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# Authentication (Required)
QMS_JWT_SECRET="..."

# Optional - Password can be managed in Settings page
QMS_PASSWORD_HASH="..."  # Only needed for initial setup
```

### Initial Setup

After deployment, initialize system settings:

```bash
# Visit this URL in your browser to set up password storage
https://your-app.vercel.app/api/admin/init-settings
```

This will:

- Create system_settings table
- Migrate password from environment variable to database
- Enable password management in Settings page

## 📊 Database Schema

### Main Tables

**quilts** - Quilt information

- Basic info: name, season, dimensions, weight, materials
- Storage: location, packaging, brand, purchase date
- Status: current_status (IN_USE, STORAGE, MAINTENANCE)

**usage_records** - Usage tracking

- Quilt reference
- Start/end dates
- Status (ACTIVE, COMPLETED)
- Notes

**system_settings** - Application configuration

- Key-value storage for settings
- Password hash (bcrypt)
- Application name
- Other configurable options

## 🎯 Core Features

### 1. Automated Usage Tracking

When you change a quilt's status:

- **To IN_USE**: Automatically creates a new usage record
- **From IN_USE**: Automatically ends the active usage record
- **Date Selection**: Choose custom start/end dates
- **Notes Support**: Add optional notes to records

### 2. Smart Quilt Naming

Automatically generates names in format:
`Brand + Color + Weight + Season`

Example: `百思寒褐色1100克春秋被`

### 3. Dual View Modes

**Grid View**:

- Beautiful card layout
- Season color indicators
- Status badges
- Hover effects
- Responsive columns (1-4)

**List View**:

- Detailed table format
- Sortable columns
- Batch operations
- Quick actions

### 4. Empty States

Friendly guidance when:

- No quilts exist
- Search returns no results
- No usage records
- With helpful action buttons

## 📚 Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check            # TypeScript checking

# Database Setup
npm run setup-usage-tracking   # Set up usage tracking schema

# Utilities
npm run setup-password         # Set admin password
npm run audit-translations     # Check translation coverage
npm run update-quilt-names     # Update quilt names
```

## 📁 Project Structure

```
qms-app/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── login/            # Login page
│   │   ├── quilts/           # Quilt management
│   │   ├── usage/            # Usage tracking
│   │   ├── analytics/        # Analytics
│   │   └── reports/          # Reports
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── motion/          # Animation components
│   │   ├── quilts/          # Quilt components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   │   ├── neon.ts         # Database operations
│   │   ├── auth.ts         # Authentication
│   │   ├── i18n.ts         # Internationalization
│   │   └── animations.ts   # Animation configs
│   └── server/             # Server code
├── scripts/                # Utility scripts
├── docs/                   # Documentation
│   ├── guides/            # Implementation guides
│   ├── archive/           # Historical docs
│   └── sessions/          # Development sessions
└── .kiro/specs/           # Feature specifications
```

## 🎨 UI Components

### Animation Components

- `PageTransition` - Page fade/slide transitions
- `AnimatedCard` - Cards with hover effects
- `AnimatedList` - Staggered list animations
- `AnimatedButton` - Button press animations
- `AnimatedInput` - Input focus animations
- `SwipeableListItem` - Swipe-to-delete

### UI Components

- `EmptyState` - Friendly empty states
- `Skeleton` - Loading placeholders
- `StatusChangeDialog` - Smart status updates
- `QuiltDialog` - Quilt add/edit forms

## 📖 Documentation

### Guides (docs/guides/)

- **Authentication**: Implementation and testing
- **Deployment**: Vercel deployment guide
- **Usage Tracking**: Automation implementation
- **Security**: Security audit summary

### Archive (docs/archive/)

- Phase 1 completion summaries
- Implementation records
- Historical fixes

### Sessions (docs/sessions/)

- Development session logs
- Feature implementation notes

## 🗺️ Roadmap

### ✅ Completed (v0.3.0 - Nov 2025)

- **Code Quality & Architecture**
  - Logging utility with environment-based filtering
  - Repository pattern for database operations
  - Type-safe database operations
  - Error boundaries with bilingual support
- **Authentication & Security**
  - Password utilities (bcrypt hashing)
  - JWT token management
  - Rate limiting for login attempts
  - Login/logout functionality
  - Middleware-based route protection
  - Database password storage (no env var updates needed)
- **API Consolidation**
  - tRPC integration
  - Unified error handling
  - Removed duplicate REST APIs
  - Type-safe API calls
- **Enhanced Settings Page**
  - Change password (instant, no redeployment)
  - Modify application name
  - Language switcher (中文/English)
  - Real-time database statistics
  - System information display

- **Usage Tracking Improvements**
  - Migrated to tRPC
  - Edit usage records
  - Simplified UI (removed unnecessary fields)

### 📋 Planned (Phase 2)

- Theme switching (dark mode)
- Display preferences
- Image upload
- Advanced search
- Batch editing
- Tag system
- Data export enhancements

## 🤝 Contributing

This is a personal project. Contributions are welcome via pull requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or issues, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Database by [Neon](https://neon.tech/)
- Deployed on [Vercel](https://vercel.com/)

---

**Version**: 0.3.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-11-03

Made with ❤️ for better home organization
