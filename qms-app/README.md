# Enhanced Quilt Management System (QMS)

A modern, intelligent quilt inventory management system built with Next.js 14, tRPC, and Neon Serverless Driver.

## Features

- 🏠 **Intelligent Dashboard** - Real-time analytics and insights
- 🛏️ **Enhanced Quilt Management** - Comprehensive tracking with rich metadata
- 🌡️ **Seasonal Intelligence** - Smart recommendations based on weather and usage patterns
- 📊 **Usage Analytics** - Track usage patterns and optimize your collection
- 🔍 **Advanced Search** - Powerful filtering and search capabilities
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 📥 **Import/Export** - Excel integration for data migration

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Neon Serverless Driver
- **UI Components**: Shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod schemas
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the database URL and other configuration.

4. Set up the database:
   ```bash
   npm run db:setup
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run db:setup` - Initialize database schema
- `npm run db:seed` - Seed database with sample data
- `npm run db:test` - Test database connection

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/             # Shadcn/ui components
├── lib/                # Utility libraries
│   └── validations/    # Zod validation schemas
├── server/             # Backend logic
│   ├── api/            # tRPC routers
│   └── db/             # Database configuration
├── stores/             # Client-side state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## License

MIT License - see LICENSE file for details.