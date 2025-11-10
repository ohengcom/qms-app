# QMS - Quilt Management System 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **Production-Ready Intelligent Inventory Management for Home Bedding**

A modern Next.js application with Neon PostgreSQL that transforms simple Excel-based quilt tracking into an intelligent inventory management system.

**🌐 Live Demo**: https://qms-app-omega.vercel.app

## ✨ Key Features

### 📊 Core Functionality

- **Quilt Management**: Complete CRUD operations with auto-generated names and numbers
- **Image Management**: Upload and manage quilt photos with Cloudinary integration
- **Usage Tracking**: Automated usage record creation with smart status detection
- **Status Management**: Four states (Available, In Use, Storage, Maintenance) with intelligent transitions
- **Weather Integration**: Real-time weather-based quilt recommendations
- **Smart Notifications**: Proactive alerts for maintenance, seasonal changes, and usage patterns
- **Data Analytics**: Usage statistics, seasonal analysis, and trend visualization
- **PWA Support**: Installable app with offline capabilities and push notifications
- **Settings Management**: Centralized configuration with database storage

### 🎨 Modern UI/UX

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dual View Modes**: Grid and list views with seamless switching
- **Advanced Filtering**: Multi-criteria search with season, status, location, brand, and weight filters
- **Bilingual Support**: Full Chinese/English interface with language switcher
- **Empty States**: Friendly guidance when no data is available with contextual actions
- **Loading States**: Skeleton screens for better perceived performance
- **Real-time Stats**: Live database statistics with auto-refresh
- **Design System**: Consistent spacing, colors, and typography throughout
- **Optimistic Updates**: Instant UI feedback for better user experience
- **Dashboard**: Comprehensive overview with quick actions and statistics

### 🔐 Security & Authentication

- **Password Protection**: Secure login with JWT session management
- **Route Protection**: Middleware-based authentication
- **Session Persistence**: Remember me functionality
- **Secure Cookies**: HTTP-only cookies for token storage
- **Database Password Storage**: Passwords stored securely in database (no environment variable updates needed)
- **Instant Password Changes**: Change password without redeployment

### 🚀 Performance & Reliability

- **Fast Loading**: < 2s first load, < 500ms page transitions
- **Optimized Queries**: Indexed database operations with repository pattern
- **Efficient Rendering**: React Query with optimistic updates for instant feedback
- **Smart Caching**: Multi-layer caching with Redis-like in-memory cache
- **Code Splitting**: Automatic route-based code splitting with Next.js
- **Serverless**: Neon PostgreSQL for scalable database
- **Error Handling**: Comprehensive error boundaries with user-friendly messages
- **Monitoring**: Prometheus metrics endpoint for system monitoring

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
- **Image Storage**: Cloudinary
- **Weather API**: OpenWeatherMap
- **Caching**: In-memory cache service
- **Notifications**: Database-driven notification system

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

# Image Upload (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."

# Weather API (Optional)
OPENWEATHER_API_KEY="..."

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
- Status: current_status (AVAILABLE, IN_USE, STORAGE, MAINTENANCE)
- Images: main_image, attachment_images (Cloudinary URLs)

**usage_records** - Usage tracking

- Quilt reference
- Start/end dates
- Usage type (REGULAR, GUEST, SPECIAL_OCCASION, SEASONAL_ROTATION)
- Status (ACTIVE, COMPLETED)
- Notes

**notifications** - Smart notification system

- Type (MAINTENANCE_DUE, SEASONAL_CHANGE, USAGE_REMINDER, etc.)
- Priority (LOW, MEDIUM, HIGH, URGENT)
- Status (UNREAD, READ, DISMISSED)
- Metadata (JSON)

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
- **Usage Types**: Regular, Guest, Special Occasion, Seasonal Rotation
- **Notes Support**: Add optional notes to records

### 2. Smart Quilt Naming

Automatically generates names in format:
`Brand + Color + Weight + Season`

Example: `百思寒褐色1100克春秋被`

### 3. Weather-Based Recommendations

Real-time quilt recommendations based on:

- Current temperature and weather conditions
- Seasonal patterns
- Historical usage data
- User preferences

### 4. Smart Notification System

Proactive alerts for:

- **Maintenance Due**: Reminders for quilt care
- **Seasonal Changes**: Suggestions to rotate quilts
- **Usage Patterns**: Long-term usage alerts
- **Weather Changes**: Temperature-based recommendations
- **Storage Reminders**: Unused quilt notifications

### 5. Image Management

- Upload main quilt photo
- Add multiple attachment images
- Cloudinary integration for optimized storage
- Image preview and management

### 6. Advanced Filtering

Multi-criteria search with:

- Season (Winter, Spring/Autumn, Summer, All-Season)
- Status (Available, In Use, Storage, Maintenance)
- Location
- Brand
- Weight range
- Text search

### 7. Dual View Modes

**Grid View**:

- Beautiful card layout with images
- Season color indicators
- Status badges
- Hover effects
- Responsive columns (1-4)

**List View**:

- Detailed table format
- Sortable columns
- Batch operations
- Quick actions

### 8. PWA Features

- **Installable**: Add to home screen
- **Offline Support**: Service worker caching
- **Push Notifications**: Real-time alerts
- **App-like Experience**: Full-screen mode

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

### ✅ Completed (v0.5.0 - Nov 2025)

- **Code Quality & Architecture**
  - Logging utility with environment-based filtering
  - Repository pattern for database operations
  - Type-safe database operations
  - Error boundaries with bilingual support
  - Comprehensive error handling
  - In-memory caching service
  - Prometheus metrics endpoint
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
  - Cleaned up TODO items
- **Enhanced Settings Page**
  - Change password (instant, no redeployment)
  - Modify application name
  - Language switcher (中文/English)
  - Real-time database statistics
  - System information display

- **Usage Tracking**
  - Migrated to tRPC
  - Edit usage records
  - Usage types (Regular, Guest, Special Occasion, Seasonal Rotation)
  - Automated record creation/completion
- **Image Management**
  - Cloudinary integration
  - Main image upload
  - Multiple attachment images
  - Image migration tools
- **Weather Integration**
  - OpenWeatherMap API integration
  - Real-time weather data
  - Temperature-based recommendations
  - Historical weather data
- **Smart Notifications**
  - Database-driven notification system
  - Multiple notification types
  - Priority levels
  - Read/unread status
  - Notification checker service
- **Advanced Features**
  - Advanced filtering system
  - Dashboard with statistics
  - PWA support with service worker
  - Offline capabilities
  - Push notifications

### 📋 Planned (Future Releases)

- **Import/Export**
  - Excel/CSV import with preview
  - Data export with filters
  - Usage reports
  - Maintenance reports
- **Maintenance System**
  - Maintenance record tracking
  - Scheduled maintenance reminders
  - Care instructions
- **Analytics**
  - Usage trend analysis
  - Seasonal insights
  - Cost tracking
- **UI Enhancements**
  - Theme switching (dark mode)
  - Display preferences
  - Batch editing
  - Tag system

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

**Version**: 0.5.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-11-10

Made with ❤️ for better home organization
