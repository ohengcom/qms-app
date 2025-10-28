# QMS - Quilts Management System 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **Production-Ready Intelligent Inventory Management for Home Bedding**

A modern Next.js application with tRPC and Neon PostgreSQL that transforms simple Excel-based quilt tracking into an intelligent inventory management system. Currently deployed at **https://qms-app-omega.vercel.app**

## 🌟 Features

### 📊 **Intelligent Dashboard**

- Real-time inventory overview with status tracking
- Seasonal distribution and usage analytics
- Quick access filters and search functionality
- Storage location optimization insights
- Performance monitoring and system health metrics

### 🔍 **Advanced Search & Filtering**

- Multi-field search across name, brand, color, and notes
- Filter by season, status, location, weight range, and materials
- Smart suggestions and saved searches
- Real-time search results with virtual scrolling
- Advanced query capabilities with complex filters

### 🌱 **Seasonal Intelligence**

- Automatic seasonal classification (Winter/Spring-Autumn/Summer)
- Smart recommendations based on current season and weather
- Usage pattern analysis for optimal rotation
- Seasonal transition alerts and preparation reminders
- Weather-based suggestions and notifications

### 📈 **Usage Analytics & Reporting**

- Detailed usage history with timeline visualization
- Usage frequency and pattern analysis
- Predictive insights for next usage periods
- Maintenance scheduling based on usage patterns
- Comprehensive analytics dashboard with charts and metrics
- Export capabilities for reports and data analysis

### 🗂️ **Storage Optimization**

- Accessibility-based storage layout suggestions
- Location tracking with packaging information
- Storage efficiency analysis and optimization
- Visual storage organization tools

### 📱 **Modern UI/UX & Mobile Support**

- Responsive design optimized for desktop, tablet, and mobile
- Progressive Web App (PWA) capabilities with offline support
- Touch-friendly interface with gesture support
- Mobile-first design with bottom navigation
- Real-time updates and notifications
- Optimized performance with caching and virtual scrolling

### 🔄 **Data Management & Import/Export**

- Excel import/export with Chinese language support
- Bulk operations and batch processing
- Data validation and error handling
- Historical data migration from existing Excel files
- Automated backup and restore capabilities

## 🏗️ Application Architecture

### 🚀 **Next.js Production Application** (Current Implementation)

```
qms/                            # Production-ready Next.js application
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── api/               # API routes (health, metrics, db-test, setup)
│   │   ├── quilts/            # Quilt management pages
│   │   ├── import/            # Data import functionality
│   │   ├── export/            # Data export functionality
│   │   ├── seasonal/          # Seasonal analytics
│   │   └── usage/             # Usage tracking
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components (Radix UI)
│   │   ├── quilts/            # Quilt-specific components
│   │   └── mobile/            # Mobile PWA components
│   ├── hooks/                 # Custom React hooks (tRPC)
│   ├── lib/                   # Utilities and configurations
│   │   ├── neon.ts           # Neon Serverless Driver database operations
│   │   ├── trpc.ts           # tRPC client configuration
│   │   └── validations/       # Zod schemas for type safety
│   ├── server/                # Server-side code
│   │   ├── api/routers/       # tRPC API routes
│   │   └── services/          # Business logic services
│   └── styles/                # Global styles
├── public/                    # PWA assets (manifest, service worker)
├── .kiro/specs/              # Development specifications
└── README.md                  # Application documentation
```

### 📋 **Development Specifications**

```
.kiro/specs/enhanced-quilt-management/
├── requirements.md           # EARS-compliant requirements
├── design.md                # System architecture and design
└── tasks.md                 # Implementation task breakdown
```

### 🗂️ **Current Status**

- **Production Application**: Next.js 16 with tRPC and Neon PostgreSQL
- **Deployment**: Vercel (https://qms-app-omega.vercel.app)
- **Database**: Neon Serverless PostgreSQL with 16 quilts imported
- **Features**: Dashboard, quilt management, search/filtering, usage tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for production deployment)
- PostgreSQL (for production) or SQLite (for development)

### 🎯 **Application Setup**

#### Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Neon database URL

# Start development server
npm run dev
```

#### Current Deployment

The application is currently deployed on **Vercel** at:

- **Production URL**: https://qms-app-omega.vercel.app
- **Database**: Neon Serverless PostgreSQL
- **Features**: Real-time dashboard, quilt management, Excel import/export

#### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### 🌐 **Access Points**

#### Production (Live)

- **Application**: https://qms-app-omega.vercel.app
- **Health Check**: https://qms-app-omega.vercel.app/api/health
- **Database Test**: https://qms-app-omega.vercel.app/api/db-test

#### Development

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Database Test**: http://localhost:3000/api/db-test

## 📊 Data Management

### Excel Import/Export

The application provides comprehensive Excel import and export functionality:

#### Import Process

1. Navigate to the Import section in the web application
2. Upload your Excel file (supports Chinese headers)
3. Preview the data mapping and validation results
4. Confirm and complete the import

#### Export Features

- Export current inventory to Excel format
- Include usage history and analytics
- Support for Chinese language headers
- Customizable export options

### Excel Format Support

The system supports Excel files with these columns:

- **Basic Info**: Group, 编号, 季节, 填充物, 颜色, 长, 宽, 重量（g）
- **Storage**: 放置位置, 包, 使用时间段, 品牌, 购买日期, 备注
- **Usage History**: 上次使用, 上上次使用, etc.

### Data Validation

- Automatic data type validation
- Duplicate detection and handling
- Missing field identification
- Data quality reports

## 🎯 Data Model

### Quilt Entity (Database Schema)

```sql
CREATE TABLE quilts (
  id TEXT PRIMARY KEY,
  group_id TEXT,
  item_number TEXT UNIQUE,
  name TEXT NOT NULL,
  season TEXT CHECK (season IN ('Winter', 'Spring-Autumn', 'Summer')),
  length_cm INTEGER,
  width_cm INTEGER,
  weight_grams INTEGER,
  fill_material TEXT,
  material_details TEXT,
  color TEXT,
  brand TEXT,
  purchase_date TIMESTAMP,
  location TEXT,
  packaging_info TEXT,
  current_status TEXT CHECK (current_status IN ('available', 'in_use', 'maintenance', 'storage')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_records (
  id TEXT PRIMARY KEY,
  quilt_id TEXT REFERENCES quilts(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Usage Tracking

- **Usage Records**: Historical usage with start/end dates and notes
- **Current Usage**: Real-time active usage tracking
- **Usage Analytics**: Patterns, frequency, and predictive insights
- **Seasonal Analysis**: Season-based usage optimization and recommendations

## 📚 API Documentation

The application uses **tRPC** for type-safe API communication. All API endpoints are automatically typed and validated.

### Core tRPC Routers

#### Quilts Router (`quilts`)

- `quilts.list` - List quilts with filtering and search
- `quilts.getById` - Get detailed quilt information
- `quilts.create` - Create new quilt
- `quilts.update` - Update quilt information
- `quilts.delete` - Delete quilt
- `quilts.search` - Advanced search with filters

#### Dashboard Router (`dashboard`)

- `dashboard.getStats` - Get dashboard statistics
- `dashboard.getRecentUsage` - Get recent usage activity
- `dashboard.getSeasonalDistribution` - Get seasonal analytics
- `dashboard.getUsagePatterns` - Get usage pattern analysis

#### Import/Export Router (`importExport`)

- `importExport.analyzeExcel` - Analyze uploaded Excel file
- `importExport.importFromExcel` - Import data from Excel
- `importExport.exportToExcel` - Export data to Excel format
- `importExport.getImportHistory` - Get import history

### API Features

- **Type Safety**: Full TypeScript support with automatic type inference
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Real-time Updates**: WebSocket support for live data updates

## 🛠️ Development

### Technology Stack

#### Core Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Neon Serverless Driver, PostgreSQL
- **UI Components**: Radix UI, Lucide Icons, Custom Components
- **Database**: Neon Serverless PostgreSQL (16 quilts imported)
- **Deployment**: Vercel (Production), GitHub integration
- **Type Safety**: End-to-end TypeScript with tRPC and Zod validation

#### Development Tools

- **Code Quality**: ESLint, Prettier, TypeScript
- **Testing**: Vitest, Jest, Playwright (when implemented)
- **Database**: Neon Console, Direct SQL operations
- **Build**: Next.js build system, Docker multi-stage builds
- **CI/CD**: GitHub Actions

### Development Tools & Scripts

#### Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check            # TypeScript checking

# Database Management
npm run db:setup             # Initialize database schema
npm run db:seed              # Seed database with sample data
npm run db:test              # Test database connection

# Production & Deployment
npm run docker:build         # Build Docker image
npm run docker:compose:up    # Start production stack
npm run health:check         # Check application health
npm run backup:create        # Create database backup
npm run monitoring:up        # Start monitoring stack
```

### Environment Configuration

#### Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/qms_db"

# Authentication (if implemented)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"

# Monitoring & Observability
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Application Settings
NODE_ENV="production"
PORT=3000
```

## 📦 Deployment Options

### 🚀 **Production Deployment (Next.js)**

#### Automated Deployment

```bash
cd qms-app

# Configure environment
cp .env.production .env.local
# Edit with production values

# Deploy with monitoring
./scripts/deploy.sh
./scripts/setup-monitoring.sh
```

#### Manual Docker Deployment

```bash
# Build and start production stack
docker-compose -f docker-compose.prod.yml up -d

# Start monitoring stack
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d

# Access applications
# Main App: http://localhost:3000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

#### Production Features

- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **Logging**: Structured logging with log aggregation
- **Backup**: Automated database backups
- **Health Checks**: Application and database health monitoring
- **Performance**: Nginx reverse proxy, caching, compression

### 🔧 **Development Deployment**

```bash
# Simple development setup
cd qms-app
npm install
npm run dev

# Access the application at http://localhost:3000
```

### 🔧 **Production Checklist**

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations applied
- [ ] Monitoring dashboards configured
- [ ] Backup strategy implemented
- [ ] Health checks enabled
- [ ] Performance optimization applied
- [ ] Security headers configured

## 🧪 Testing

### Application Testing

```bash
cd qms-app

# Run type checking
npm run type-check

# Run linting
npm run lint

# Future: Unit and integration tests
# npm run test
# npm run test:e2e
```

**Note**: Comprehensive testing suite is planned for future implementation as part of the enhanced features roadmap.

## 📋 Development Roadmap

### Phase 1: Foundation ✅

- [x] Enhanced database schema with Neon PostgreSQL
- [x] Comprehensive API layer with tRPC
- [x] Excel data migration and import/export
- [x] Vue.js prototype and Next.js production app

### Phase 2: Core Features ✅

- [x] Complete dashboard UI with analytics
- [x] Quilt management with advanced forms
- [x] Search and filtering with virtual scrolling
- [x] Usage tracking with timeline visualization

### Phase 3: Advanced Features ✅

- [x] Predictive analytics and reporting
- [x] Maintenance scheduling and notifications
- [x] Storage optimization recommendations
- [x] Progressive Web App with offline support
- [x] Mobile-first responsive design

### Phase 4: Production & Monitoring ✅

- [x] Comprehensive testing suite
- [x] Performance optimization and caching
- [x] Security hardening and authentication
- [x] Production deployment with Docker
- [x] Monitoring with Prometheus and Grafana
- [x] Automated backup and restore

### Phase 5: Enhanced Features 🚧

- [ ] Advanced search with AI-powered suggestions
- [ ] Performance optimizations (virtual scrolling, caching)
- [ ] Enhanced analytics with predictive insights
- [ ] Real-time collaboration features
- [ ] Advanced mobile gestures and interactions
- [ ] Integration with external weather APIs

### Phase 6: Enterprise Features 🔮

- [ ] Multi-user support with role-based access
- [ ] API rate limiting and advanced security
- [ ] Advanced reporting and data visualization
- [ ] Integration with home automation systems
- [ ] Machine learning for usage predictions
- [ ] Advanced notification system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

## 📚 Documentation & Resources

### 📋 **Specifications & Planning**

- **Requirements**: [Enhanced Quilt Management Requirements](.kiro/specs/enhanced-quilt-management/requirements.md)
- **Design**: [System Architecture & Design](.kiro/specs/enhanced-quilt-management/design.md)
- **Tasks**: [Implementation Task Breakdown](.kiro/specs/enhanced-quilt-management/tasks.md)

### 🚀 **Next.js Application Docs**

- **Deployment Guide**: [qms-app/DEPLOYMENT.md](qms-app/DEPLOYMENT.md)
- **Monitoring Guide**: [qms-app/MONITORING.md](qms-app/MONITORING.md)
- **Cleanup Summary**: [qms-app/CLEANUP_SUMMARY.md](qms-app/CLEANUP_SUMMARY.md)
- **Application README**: [qms-app/README.md](qms-app/README.md)

### 🔧 **Development Resources**

- **API Documentation**: Available at `/api/docs` when running
- **Database Operations**: [qms-app/src/lib/neon.ts](qms-app/src/lib/neon.ts)
- **Component Library**: Radix UI + Custom components in `qms-app/src/components/ui/`

### 🏗️ **Project Structure Overview**

```
QMS Project/
├── 📱 qms-app/              # Production Next.js application (MAIN)
├── 📋 .kiro/specs/          # Development specifications & planning
├── 🔧 .vscode/              # VS Code workspace settings
├── 📊 家中被子列表.xlsx      # Sample Excel data file
├── 📄 README files          # Project documentation
└── 🗂️ Legacy prototypes/    # Reference implementations
    ├── frontend/            # Vue.js prototype (legacy)
    ├── backend/             # FastAPI prototype (legacy)
    └── workers/             # Cloudflare Workers experiment (legacy)
```

---

**QMS v2.0** - Transforming simple inventory tracking into intelligent bedding management 🛏️✨
