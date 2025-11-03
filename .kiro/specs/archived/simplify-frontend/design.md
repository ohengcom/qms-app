# Design Document

## Overview

This design simplifies the QMS frontend by removing tRPC complexity and implementing direct Next.js API routes with React Query for data fetching. The goal is to create a more maintainable, debuggable solution that reliably displays the 16 quilts in the database.

## Architecture

### Current Architecture (Problem)

```
Frontend (React) → tRPC Client → tRPC Router → Database Operations
```

**Issues:**

- tRPC adds complexity and debugging difficulty
- Static generation conflicts with dynamic data
- "No quilts found" despite working API endpoints

### New Architecture (Solution)

```
Frontend (React) → React Query → Next.js API Routes → Database Operations
```

**Benefits:**

- Simple, standard Next.js patterns
- Easy to debug with browser DevTools
- Direct HTTP requests with clear error messages
- No static generation issues

## Components and Interfaces

### API Routes Structure

```
src/app/api/
├── quilts/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET (by id), PUT (update), DELETE
├── dashboard/
│   └── stats/
│       └── route.ts          # GET dashboard statistics
└── usage/
    ├── start/
    │   └── route.ts          # POST start usage
    └── end/
        └── route.ts          # POST end usage
```

### React Hooks Structure

```
src/hooks/
├── useQuilts.ts              # Quilt data fetching hooks
├── useDashboard.ts           # Dashboard data hooks
└── useUsage.ts               # Usage tracking hooks
```

## Data Models

### API Response Format

All API routes will return consistent JSON responses:

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}

// List Response
{
  success: true,
  data: T[],
  total: number,
  page?: number,
  limit?: number
}
```

### Quilt API Endpoints

#### GET /api/quilts

```typescript
Response: {
  quilts: Quilt[],
  total: number
}
```

#### GET /api/quilts/[id]

```typescript
Response: {
  quilt: Quilt;
}
```

#### POST /api/quilts

```typescript
Request: CreateQuiltInput;
Response: {
  quilt: Quilt;
}
```

#### PUT /api/quilts/[id]

```typescript
Request: UpdateQuiltInput;
Response: {
  quilt: Quilt;
}
```

#### DELETE /api/quilts/[id]

```typescript
Response: {
  success: true;
}
```

### Dashboard API Endpoints

#### GET /api/dashboard/stats

```typescript
Response: {
  overview: {
    totalQuilts: number,
    inUseCount: number,
    availableCount: number,
    storageCount: number,
    maintenanceCount: number
  },
  seasonalDistribution: {
    winter: number,
    springAutumn: number,
    summer: number
  }
}
```

## Implementation Details

### React Query Configuration

```typescript
// src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Custom Hooks Pattern

```typescript
// src/hooks/useQuilts.ts
export function useQuilts() {
  return useQuery({
    queryKey: ['quilts'],
    queryFn: async () => {
      const res = await fetch('/api/quilts');
      if (!res.ok) throw new Error('Failed to fetch quilts');
      return res.json();
    },
  });
}

export function useCreateQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuiltInput) => {
      const res = await fetch('/api/quilts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create quilt');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
    },
  });
}
```

### API Route Pattern

```typescript
// src/app/api/quilts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const quilts = await db.getQuilts({ limit: 100 });
    const total = await db.countQuilts();

    return NextResponse.json({
      quilts,
      total,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quilts' }, { status: 500 });
  }
}
```

## Error Handling

### Client-Side Error Handling

```typescript
const { data, error, isLoading } = useQuilts();

if (error) {
  return <ErrorMessage message={error.message} />;
}
```

### Server-Side Error Handling

All API routes will:

1. Wrap operations in try-catch blocks
2. Return appropriate HTTP status codes
3. Provide clear error messages
4. Log errors for debugging

## Testing Strategy

### Manual Testing

1. Verify all 16 quilts display on quilts page
2. Test dashboard statistics accuracy
3. Test CRUD operations (create, read, update, delete)
4. Test search and filtering
5. Verify error states display correctly

### API Testing

1. Test each endpoint with curl or Postman
2. Verify response formats match design
3. Test error scenarios (invalid data, missing fields)
4. Verify database operations complete successfully

## Migration Steps

1. **Keep existing API routes** - The /api/quilts route already exists and works
2. **Update React hooks** - Replace tRPC calls with fetch + React Query
3. **Remove tRPC dependencies** - Uninstall packages and remove unused code
4. **Test thoroughly** - Verify all features work correctly
5. **Deploy** - Push changes and verify in production

## Performance Considerations

- React Query handles caching automatically
- API routes are server-side and have direct database access
- No additional network hops compared to tRPC
- Simpler code = faster builds and better performance
