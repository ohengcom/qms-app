# Enhanced Quilt Management System Design

## Overview

This design document outlines a modern, high-performance QMS (Quilts Management System) using cutting-edge technologies to provide superior user experience, intelligent features, and scalable architecture. The system leverages modern full-stack technologies optimized for performance, developer experience, and maintainability.

## Architecture

### High-Level Architecture

The system uses a modern full-stack architecture with real-time capabilities:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   Next.js 14    │◄──►│   Node.js +     │◄──►│   PostgreSQL    │
│   React 18      │    │   tRPC + Prisma │    │   + Redis       │
│   TailwindCSS   │    │   TypeScript    │    │   (Cache)       │
│   Zustand       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Rationale

**Frontend: Next.js 14 + React 18**

- Server-side rendering for better SEO and performance
- App Router for modern routing and layouts
- Built-in optimization for images, fonts, and scripts
- Excellent TypeScript support and developer experience

**Backend: Node.js + tRPC + Prisma**

- End-to-end type safety with tRPC
- Prisma for type-safe database operations and migrations
- Real-time subscriptions with WebSocket support
- Excellent performance with modern JavaScript runtime

**Database: PostgreSQL + Redis**

- PostgreSQL for robust relational data with JSON support
- Redis for caching and real-time features
- Full-text search capabilities
- Excellent scalability and performance

**Styling: TailwindCSS + Shadcn/ui**

- Utility-first CSS for rapid development
- Consistent design system with Shadcn/ui components
- Excellent mobile-first responsive design
- Dark mode support out of the box

### Enhanced Components

1. **Real-time Dashboard**: Live updates with WebSocket connections
2. **Intelligent Search**: Full-text search with PostgreSQL and caching
3. **Analytics Engine**: Advanced usage patterns and predictive insights
4. **Modern UI Components**: Accessible, responsive component library
5. **Type-safe API**: End-to-end type safety from database to frontend

## Components and Interfaces

### Backend Architecture (Node.js + tRPC + Prisma)

#### 1. tRPC Router Structure

```typescript
// Main router with type-safe procedures
export const appRouter = router({
  quilts: quiltsRouter,
  dashboard: dashboardRouter,
  usage: usageRouter,
  analytics: analyticsRouter,
  import: importRouter,
});

// Quilts router with CRUD operations
const quiltsRouter = router({
  list: publicProcedure
    .input(z.object({ filters: QuiltFiltersSchema, pagination: PaginationSchema }))
    .query(({ input }) => QuiltService.searchQuilts(input)),

  create: publicProcedure
    .input(CreateQuiltSchema)
    .mutation(({ input }) => QuiltService.createQuilt(input)),

  update: publicProcedure
    .input(UpdateQuiltSchema)
    .mutation(({ input }) => QuiltService.updateQuilt(input)),
});
```

#### 2. Prisma Database Service

```typescript
class QuiltService {
  static async searchQuilts(params: SearchParams) {
    return await prisma.quilt.findMany({
      where: {
        AND: [
          params.search
            ? {
                OR: [
                  { name: { contains: params.search, mode: 'insensitive' } },
                  { brand: { contains: params.search, mode: 'insensitive' } },
                  { color: { contains: params.search, mode: 'insensitive' } },
                ],
              }
            : {},
          params.season ? { season: params.season } : {},
          params.status ? { currentStatus: params.status } : {},
        ],
      },
      include: {
        usagePeriods: true,
        currentUsage: true,
      },
      orderBy: { [params.sortBy]: params.sortOrder },
      skip: params.skip,
      take: params.limit,
    });
  }
}
```

#### 3. Real-time Analytics Service

```typescript
class AnalyticsService {
  static async getDashboardData(): Promise<DashboardData> {
    const [totalQuilts, statusCounts, seasonalDistribution] = await Promise.all([
      prisma.quilt.count(),
      prisma.quilt.groupBy({
        by: ['currentStatus'],
        _count: { id: true },
      }),
      prisma.quilt.groupBy({
        by: ['season'],
        _count: { id: true },
      }),
    ]);

    return {
      totalQuilts,
      statusCounts: Object.fromEntries(statusCounts.map(s => [s.currentStatus, s._count.id])),
      seasonalDistribution: Object.fromEntries(
        seasonalDistribution.map(s => [s.season, s._count.id])
      ),
    };
  }
}
```

#### 4. Excel Import/Export Service

```typescript
class ImportExportService {
  static async importFromExcel(file: Buffer): Promise<ImportResult> {
    const workbook = XLSX.read(file);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = await prisma.$transaction(async tx => {
      const imported = [];
      const errors = [];

      for (const row of data) {
        try {
          const quilt = await tx.quilt.create({
            data: this.mapExcelRowToQuilt(row),
          });
          imported.push(quilt);
        } catch (error) {
          errors.push({ row, error: error.message });
        }
      }

      return { imported, errors };
    });

    return results;
  }
}
```

### Frontend Architecture (Next.js + React + TypeScript)

#### 1. Dashboard Page Component

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  const { data: dashboardData, isLoading } = trpc.dashboard.getData.useQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatisticsCards data={dashboardData?.stats} />
      <div className="col-span-full lg:col-span-2">
        <SeasonalChart data={dashboardData?.seasonalDistribution} />
      </div>
      <div className="col-span-full lg:col-span-2">
        <RecentUsageList quilts={dashboardData?.recentUsage} />
      </div>
      <QuickActions />
    </div>
  );
}
```

#### 2. Advanced Search Component

```tsx
// components/QuiltSearch.tsx
export function QuiltSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: quilts, isLoading } = trpc.quilts.list.useQuery({
    search: searchParams.get('q') || '',
    filters: {
      season: searchParams.get('season'),
      status: searchParams.get('status'),
    },
  });

  return (
    <div className="space-y-6">
      <SearchInput
        value={searchParams.get('q') || ''}
        onChange={value => setSearchParams({ ...searchParams, q: value })}
        placeholder="Search quilts by name, brand, or color..."
      />

      <FilterPanel filters={Object.fromEntries(searchParams)} onFiltersChange={setSearchParams} />

      <QuiltGrid quilts={quilts} isLoading={isLoading} />
    </div>
  );
}
```

#### 3. Quilt Management Form

```tsx
// components/QuiltForm.tsx
export function QuiltForm({ quilt }: { quilt?: Quilt }) {
  const form = useForm<CreateQuiltInput>({
    resolver: zodResolver(CreateQuiltSchema),
    defaultValues: quilt || {},
  });

  const createMutation = trpc.quilts.create.useMutation();
  const updateMutation = trpc.quilts.update.useMutation();

  const onSubmit = async (data: CreateQuiltInput) => {
    if (quilt) {
      await updateMutation.mutateAsync({ id: quilt.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quilt Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="season"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Season</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="spring_autumn">Spring/Autumn</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
          {quilt ? 'Update' : 'Create'} Quilt
        </Button>
      </form>
    </Form>
  );
}
```

#### 4. Usage Tracking Component

```tsx
// components/UsageTracker.tsx
export function UsageTracker({ quiltId }: { quiltId: number }) {
  const { data: usageHistory } = trpc.usage.getHistory.useQuery({ quiltId });
  const startUsageMutation = trpc.usage.start.useMutation();
  const endUsageMutation = trpc.usage.end.useMutation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Usage History</h3>
        <Button
          onClick={() => startUsageMutation.mutate({ quiltId })}
          disabled={startUsageMutation.isLoading}
        >
          Start Using
        </Button>
      </div>

      <UsageTimeline periods={usageHistory} />

      <UsageStatistics quiltId={quiltId} />
    </div>
  );
}
```

## Data Models

### Prisma Database Schema

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Quilt {
  id            Int      @id @default(autoincrement())
  itemNumber    Int      @unique @map("item_number")
  groupId       Int?     @map("group_id")

  // Basic information
  name          String
  season        Season

  // Physical specifications
  lengthCm      Int      @map("length_cm")
  widthCm       Int      @map("width_cm")
  weightGrams   Int      @map("weight_grams")

  // Material composition
  fillMaterial     String  @map("fill_material")
  materialDetails  String? @map("material_details")
  color           String

  // Brand and purchase info
  brand          String?
  purchaseDate   DateTime? @map("purchase_date") @db.Date

  // Storage and packaging
  location       String
  packagingInfo  String?   @map("packaging_info")

  // Status and metadata
  currentStatus  Status    @default(AVAILABLE) @map("current_status")
  notes          String?

  // Timestamps
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relationships
  usagePeriods   QuiltUsagePeriod[]
  currentUsage   CurrentUsage?

  @@map("quilts")
  @@index([season, currentStatus])
  @@index([location])
  @@index([name, brand, color])
}

model QuiltUsagePeriod {
  id         Int       @id @default(autoincrement())
  quiltId    Int       @map("quilt_id")

  startDate  DateTime  @map("start_date") @db.Date
  endDate    DateTime? @map("end_date") @db.Date
  seasonUsed String?   @map("season_used")
  notes      String?

  createdAt  DateTime  @default(now()) @map("created_at")

  quilt      Quilt     @relation(fields: [quiltId], references: [id], onDelete: Cascade)

  @@map("quilt_usage_periods")
  @@index([startDate, endDate])
}

model CurrentUsage {
  id              Int       @id @default(autoincrement())
  quiltId         Int       @unique @map("quilt_id")

  startedAt       DateTime  @map("started_at") @db.Date
  expectedEndDate DateTime? @map("expected_end_date") @db.Date
  usageType       String    @default("regular") @map("usage_type")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  quilt           Quilt     @relation(fields: [quiltId], references: [id], onDelete: Cascade)

  @@map("current_usage")
}

enum Season {
  WINTER
  SPRING_AUTUMN
  SUMMER
}

enum Status {
  AVAILABLE
  IN_USE
  MAINTENANCE
  STORAGE
}
```

### TypeScript Type Definitions

```typescript
// types/quilt.ts
import { z } from 'zod';

export const SeasonSchema = z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']);
export const StatusSchema = z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE']);

export const CreateQuiltSchema = z.object({
  itemNumber: z.number().positive(),
  groupId: z.number().optional(),
  name: z.string().min(1),
  season: SeasonSchema,
  lengthCm: z.number().positive(),
  widthCm: z.number().positive(),
  weightGrams: z.number().positive(),
  fillMaterial: z.string().min(1),
  materialDetails: z.string().optional(),
  color: z.string().min(1),
  brand: z.string().optional(),
  purchaseDate: z.date().optional(),
  location: z.string().min(1),
  packagingInfo: z.string().optional(),
  currentStatus: StatusSchema.default('AVAILABLE'),
  notes: z.string().optional(),
});

export const QuiltFiltersSchema = z.object({
  search: z.string().optional(),
  season: SeasonSchema.optional(),
  status: StatusSchema.optional(),
  location: z.string().optional(),
  minWeight: z.number().optional(),
  maxWeight: z.number().optional(),
  brand: z.string().optional(),
});

export const PaginationSchema = z.object({
  skip: z.number().default(0),
  take: z.number().default(20),
  sortBy: z.string().default('itemNumber'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateQuiltInput = z.infer<typeof CreateQuiltSchema>;
export type QuiltFilters = z.infer<typeof QuiltFiltersSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
```

### Dashboard Analytics Types

```typescript
// types/analytics.ts
export interface DashboardData {
  stats: {
    totalQuilts: number;
    availableCount: number;
    inUseCount: number;
    storageCount: number;
    maintenanceCount: number;
  };
  seasonalDistribution: Record<string, number>;
  storageDistribution: Record<string, number>;
  recentUsage: QuiltUsageSummary[];
  usageTrends: UsageTrendPoint[];
}

export interface QuiltUsageSummary {
  quilt: {
    id: number;
    name: string;
    itemNumber: number;
    season: string;
  };
  stats: {
    totalUsageDays: number;
    usageFrequency: number;
    lastUsedDate: Date | null;
    averageDuration: number;
  };
}

export interface UsageTrendPoint {
  date: Date;
  quiltsInUse: number;
  newUsageStarted: number;
}
```

## Error Handling

### tRPC Error Strategy

```typescript
// server/trpc.ts
import { TRPCError } from '@trpc/server';

export class QuiltService {
  static async createQuilt(input: CreateQuiltInput) {
    try {
      // Check for duplicate item number
      const existing = await prisma.quilt.findUnique({
        where: { itemNumber: input.itemNumber },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Quilt with item number ${input.itemNumber} already exists`,
          cause: 'DUPLICATE_ITEM_NUMBER',
        });
      }

      return await prisma.quilt.create({ data: input });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create quilt',
        cause: error,
      });
    }
  }
}
```

### Frontend Error Handling with React Query

```tsx
// hooks/useErrorHandler.ts
export function useErrorHandler() {
  const { toast } = useToast();

  return useCallback(
    (error: TRPCClientError<AppRouter>) => {
      switch (error.data?.code) {
        case 'CONFLICT':
          toast({
            title: 'Conflict',
            description: error.message,
            variant: 'destructive',
          });
          break;
        case 'NOT_FOUND':
          toast({
            title: 'Not Found',
            description: 'The requested quilt could not be found.',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
      }
    },
    [toast]
  );
}

// components/QuiltForm.tsx
export function QuiltForm() {
  const handleError = useErrorHandler();

  const createMutation = trpc.quilts.create.useMutation({
    onError: handleError,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Quilt created successfully!',
      });
    },
  });
}
```

## Testing Strategy

### Backend Testing (Vitest + Prisma)

```typescript
// tests/quilts.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '../server/routers/_app';

describe('Quilt Management', () => {
  beforeEach(async () => {
    // Reset database state
    await prisma.quilt.deleteMany();
  });

  it('should create a new quilt', async () => {
    const input = {
      itemNumber: 1,
      name: 'Test Winter Quilt',
      season: 'WINTER' as const,
      lengthCm: 200,
      widthCm: 150,
      weightGrams: 2500,
      fillMaterial: 'Down',
      color: 'White',
      location: 'Bedroom Closet',
    };

    const result = await caller.quilts.create(input);

    expect(result.itemNumber).toBe(1);
    expect(result.name).toBe('Test Winter Quilt');
  });

  it('should search quilts with filters', async () => {
    // Create test data
    await createTestQuilts();

    const results = await caller.quilts.list({
      filters: { season: 'WINTER', search: 'down' },
      pagination: { skip: 0, take: 10 },
    });

    expect(results.quilts).toHaveLength(2);
    expect(results.quilts.every(q => q.season === 'WINTER')).toBe(true);
  });
});
```

### Frontend Testing (Jest + React Testing Library)

```tsx
// components/__tests__/QuiltForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuiltForm } from '../QuiltForm';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('QuiltForm', () => {
  it('should validate required fields', async () => {
    render(<QuiltForm />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /create quilt/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/item number is required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 1 });

    render(<QuiltForm />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/quilt name/i), {
      target: { value: 'Test Quilt' },
    });
    fireEvent.change(screen.getByLabelText(/item number/i), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create quilt/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Quilt',
        itemNumber: 1,
        // ... other fields
      });
    });
  });
});
```

### E2E Testing (Playwright)

```typescript
// e2e/quilt-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quilt Management Flow', () => {
  test('should create, edit, and delete a quilt', async ({ page }) => {
    await page.goto('/');

    // Navigate to create quilt
    await page.click('text=Add New Quilt');

    // Fill form
    await page.fill('[data-testid=quilt-name]', 'E2E Test Quilt');
    await page.fill('[data-testid=item-number]', '999');
    await page.selectOption('[data-testid=season]', 'WINTER');

    // Submit form
    await page.click('button[type=submit]');

    // Verify creation
    await expect(page.locator('text=Quilt created successfully')).toBeVisible();

    // Search for created quilt
    await page.fill('[data-testid=search-input]', 'E2E Test Quilt');
    await expect(page.locator('text=E2E Test Quilt')).toBeVisible();
  });
});
```

## Performance Considerations

### Database Optimizations (PostgreSQL + Prisma)

```typescript
// Optimized queries with Prisma
class QuiltService {
  // Use database indexes and efficient queries
  static async searchQuilts(params: SearchParams) {
    return await prisma.quilt.findMany({
      where: {
        AND: [
          // Full-text search using PostgreSQL
          params.search
            ? {
                OR: [
                  { name: { search: params.search } },
                  { brand: { search: params.search } },
                  { color: { search: params.search } },
                ],
              }
            : {},
          params.season ? { season: params.season } : {},
        ],
      },
      // Only select needed fields for list view
      select: {
        id: true,
        itemNumber: true,
        name: true,
        season: true,
        currentStatus: true,
        color: true,
        location: true,
        _count: {
          select: { usagePeriods: true },
        },
      },
      orderBy: { [params.sortBy]: params.sortOrder },
      skip: params.skip,
      take: Math.min(params.take, 100), // Limit max results
    });
  }
}
```

### Caching Strategy (Redis)

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  static async getDashboardData(): Promise<DashboardData | null> {
    const cached = await redis.get('dashboard:data');
    return cached ? JSON.parse(cached) : null;
  }

  static async setDashboardData(data: DashboardData): Promise<void> {
    await redis.setex('dashboard:data', 300, JSON.stringify(data)); // 5 min cache
  }

  static async invalidateQuiltCache(quiltId: number): Promise<void> {
    await redis.del(`quilt:${quiltId}`, 'dashboard:data');
  }
}
```

### Frontend Performance (Next.js + React)

```tsx
// Optimized components with React best practices
import { memo, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Memoized quilt card component
const QuiltCard = memo(({ quilt }: { quilt: QuiltSummary }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent>
        <h3 className="font-semibold">{quilt.name}</h3>
        <p className="text-sm text-muted-foreground">#{quilt.itemNumber}</p>
      </CardContent>
    </Card>
  );
});

// Virtualized list for large datasets
export function QuiltList({ quilts }: { quilts: QuiltSummary[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: quilts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <QuiltCard quilt={quilts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Real-time Updates (WebSocket + tRPC Subscriptions)

```typescript
// Real-time dashboard updates
export function useDashboardSubscription() {
  const utils = trpc.useContext();

  trpc.dashboard.onUpdate.useSubscription(undefined, {
    onData: data => {
      // Update cache with new data
      utils.dashboard.getData.setData(undefined, data);
    },
  });
}

// Server-side subscription
export const dashboardRouter = router({
  onUpdate: publicProcedure.subscription(() => {
    return observable<DashboardData>(emit => {
      // Listen for database changes
      const interval = setInterval(async () => {
        const data = await getDashboardData();
        emit.next(data);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    });
  }),
});
```

### Build Optimizations

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
```

### Deployment Architecture

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/qms
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: qms
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```
