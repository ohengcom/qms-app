# Design Document - Comprehensive QMS Project Review & Improvements 2025

## Overview

This design document outlines the technical approach for implementing comprehensive improvements to the QMS application over a 2-day intensive sprint (November 3-4, 2025). The design focuses on practical, high-impact improvements that can be completed efficiently while maintaining system stability.

## Architecture Overview

### Current State

- Manual SQL queries with string interpolation
- Mixed REST API and tRPC endpoints
- No authentication system
- Console.log for debugging
- Inconsistent error handling
- TypeScript `any` types in critical paths

### Target State

- Type-safe database operations with repository pattern
- Consolidated tRPC API layer
- Secure authentication with JWT
- Structured logging utility
- Consistent error handling patterns
- Full TypeScript type safety

## Day 1: Foundation & Security

### Session 1: Code Quality & Database (3 hours)

#### 1.1 Logging Utility

**File**: `src/lib/logger.ts`

**Design**:

```typescript
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

export const logger = new Logger();
```

**Usage**:

```typescript
// Replace: console.log('Creating quilt:', data);
// With:
logger.info('Creating quilt', { data });

// Replace: console.error('Error:', error);
// With:
logger.error('Failed to create quilt', error, { quiltId });
```

#### 1.2 Database Type Definitions

**File**: `src/lib/database/types.ts`

**Design**:

```typescript
// Database row types (snake_case from DB)
export interface QuiltRow {
  id: string;
  item_number: number;
  name: string;
  season: string;
  length_cm: number | null;
  width_cm: number | null;
  weight_grams: number | null;
  fill_material: string;
  material_details: string | null;
  color: string;
  brand: string | null;
  purchase_date: string | null;
  location: string;
  packaging_info: string | null;
  current_status: string;
  notes: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

// Application types (camelCase for app)
export interface Quilt {
  id: string;
  itemNumber: number;
  name: string;
  season: Season;
  lengthCm: number | null;
  widthCm: number | null;
  weightGrams: number | null;
  fillMaterial: string;
  materialDetails: string | null;
  color: string;
  brand: string | null;
  purchaseDate: Date | null;
  location: string;
  packagingInfo: string | null;
  currentStatus: QuiltStatus;
  notes: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Transformer functions
export function rowToQuilt(row: QuiltRow): Quilt;
export function quiltToRow(quilt: Partial<Quilt>): Partial<QuiltRow>;
```

#### 1.3 Repository Pattern

**File**: `src/lib/repositories/quilt.repository.ts`

**Design**:

```typescript
export class QuiltRepository {
  async findAll(filters?: QuiltFilters): Promise<Quilt[]> {
    const rows = await sql<QuiltRow[]>`
      SELECT * FROM quilts 
      WHERE 1=1
      ${filters?.season ? sql`AND season = ${filters.season}` : sql``}
      ${filters?.status ? sql`AND current_status = ${filters.status}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${filters?.limit || 20}
    `;
    return rows.map(rowToQuilt);
  }

  async findById(id: string): Promise<Quilt | null> {
    const rows = await sql<QuiltRow[]>`
      SELECT * FROM quilts WHERE id = ${id}
    `;
    return rows[0] ? rowToQuilt(rows[0]) : null;
  }

  async create(data: CreateQuiltInput): Promise<Quilt> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const itemNumber = await this.getNextItemNumber();

    const rows = await sql<QuiltRow[]>`
      INSERT INTO quilts (
        id, item_number, name, season, length_cm, width_cm, 
        weight_grams, fill_material, color, location, 
        current_status, created_at, updated_at
      ) VALUES (
        ${id}, ${itemNumber}, ${data.name}, ${data.season},
        ${data.lengthCm}, ${data.widthCm}, ${data.weightGrams},
        ${data.fillMaterial}, ${data.color}, ${data.location},
        ${data.currentStatus || 'STORAGE'}, ${now}, ${now}
      ) RETURNING *
    `;

    return rowToQuilt(rows[0]);
  }

  async update(id: string, data: UpdateQuiltInput): Promise<Quilt | null> {
    const now = new Date().toISOString();
    const updates = quiltToRow(data);

    const rows = await sql<QuiltRow[]>`
      UPDATE quilts SET
        ${sql(updates)},
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    return rows[0] ? rowToQuilt(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM quilts WHERE id = ${id}
    `;
    return result.count > 0;
  }

  private async getNextItemNumber(): Promise<number> {
    const result = await sql<[{ next_number: number }]>`
      SELECT COALESCE(MAX(item_number), 0) + 1 as next_number
      FROM quilts
    `;
    return result[0].next_number;
  }
}

export const quiltRepository = new QuiltRepository();
```

**Benefits**:

- Type-safe database operations
- Centralized data access logic
- Easier to test and mock
- Consistent error handling
- Clear separation of concerns

### Session 2: Authentication & Security (3 hours)

#### 2.1 Password Utilities

**File**: `src/lib/auth/password.ts`

**Design**:

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### 2.2 JWT Utilities

**File**: `src/lib/auth/jwt.ts`

**Design**:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.QMS_JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';
const JWT_REMEMBER_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

export function signToken(userId: string, rememberMe: boolean = false): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
```

#### 2.3 Authentication Middleware

**File**: `src/middleware.ts`

**Design**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];
const API_PUBLIC_PATHS = ['/api/health', '/api/db-test'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (API_PUBLIC_PATHS.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### 2.4 Rate Limiting

**File**: `src/lib/auth/rate-limit.ts`

**Design**:

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetAt: entry.resetAt,
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}
```

#### 2.5 Login Page

**File**: `src/app/login/page.tsx`

**Design**:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🛏️ QMS</h1>
          <p className="text-lg text-gray-600 mt-2">Quilt Management System</p>
          <p className="text-lg text-gray-600">被子管理系统</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password / 密码</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={checked => setRememberMe(checked as boolean)}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
              Remember Me / 记住我
            </label>
          </div>

          {error && <div className="text-sm text-red-600 text-center">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login / 登录'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

#### 2.6 Login API

**File**: `src/app/api/auth/login/route.ts`

**Design**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { logger } from '@/lib/logger';

const PASSWORD_HASH = process.env.QMS_PASSWORD_HASH!;

export async function POST(request: NextRequest) {
  try {
    const { password, rememberMe } = await request.json();

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { ip });
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, PASSWORD_HASH);

    if (!isValid) {
      logger.warn('Invalid login attempt', { ip });
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Reset rate limit on successful login
    resetRateLimit(ip);

    // Generate token
    const token = signToken('admin', rememberMe);

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    });

    logger.info('Successful login', { ip });
    return response;
  } catch (error) {
    logger.error('Login error', error as Error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
```

### Session 3: API Consolidation (1-2 hours)

#### 3.1 tRPC Error Handling

**File**: `src/server/api/trpc.ts`

**Design**:

```typescript
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';

export function handleTRPCError(error: unknown, operation: string): never {
  if (error instanceof TRPCError) {
    throw error;
  }

  logger.error(`tRPC ${operation} failed`, error as Error);

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}
```

#### 3.2 Updated Quilts Router

**File**: `src/server/api/routers/quilts.ts`

**Design**:

```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { handleTRPCError } from '@/server/api/trpc';
import { logger } from '@/lib/logger';

export const quiltsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        season: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        logger.debug('Fetching quilts', { filters: input });
        const quilts = await quiltRepository.findAll(input);
        const total = await quiltRepository.count(input);
        return { quilts, total };
      } catch (error) {
        handleTRPCError(error, 'getAll');
      }
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const quilt = await quiltRepository.findById(input.id);
      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'getById');
    }
  }),

  create: publicProcedure.input(createQuiltSchema).mutation(async ({ input }) => {
    try {
      logger.info('Creating quilt', { data: input });
      const quilt = await quiltRepository.create(input);
      logger.info('Quilt created', { id: quilt.id });
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'create');
    }
  }),

  update: publicProcedure.input(updateQuiltSchema).mutation(async ({ input }) => {
    try {
      logger.info('Updating quilt', { id: input.id });
      const quilt = await quiltRepository.update(input.id, input);
      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      logger.info('Quilt updated', { id: quilt.id });
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'update');
    }
  }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      logger.info('Deleting quilt', { id: input.id });
      const success = await quiltRepository.delete(input.id);
      if (!success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      logger.info('Quilt deleted', { id: input.id });
      return { success: true };
    } catch (error) {
      handleTRPCError(error, 'delete');
    }
  }),
});
```

## Day 2: UX & Performance

### Session 1: Bilingual & UI/UX (3-4 hours)

#### 1.1 Translation System

**File**: `src/lib/i18n/translations.ts`

**Design**:

```typescript
export const translations = {
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      filter: '筛选',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
    auth: {
      login: '登录',
      logout: '登出',
      password: '密码',
      rememberMe: '记住我',
      invalidPassword: '密码错误',
      rateLimitExceeded: '登录尝试次数过多，请稍后再试',
    },
    quilts: {
      title: '被子管理',
      addNew: '添加新被子',
      editQuilt: '编辑被子',
      deleteQuilt: '删除被子',
      noQuilts: '暂无被子',
      noQuiltsDescription: '点击上方按钮添加您的第一条被子记录',
    },
    // ... more translations
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      password: 'Password',
      rememberMe: 'Remember Me',
      invalidPassword: 'Invalid password',
      rateLimitExceeded: 'Too many login attempts. Please try again later.',
    },
    quilts: {
      title: 'Quilt Management',
      addNew: 'Add New Quilt',
      editQuilt: 'Edit Quilt',
      deleteQuilt: 'Delete Quilt',
      noQuilts: 'No quilts yet',
      noQuiltsDescription: 'Click the button above to add your first quilt',
    },
    // ... more translations
  },
};
```

#### 1.2 Design Tokens

**File**: `src/lib/design-system/tokens.ts`

**Design**:

```typescript
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      700: '#374151',
      900: '#111827',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};
```

#### 1.3 Loading Skeleton

**File**: `src/components/ui/skeleton.tsx`

**Design**:

```tsx
export function QuiltListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Session 2: Performance (2 hours)

#### 2.1 React Query Configuration

**File**: `src/lib/query-client.ts`

**Design**:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

#### 2.2 Optimistic Updates

**File**: `src/hooks/useQuilts.ts`

**Design**:

```typescript
export function useUpdateQuilt() {
  const queryClient = useQueryClient();

  return trpc.quilts.update.useMutation({
    onMutate: async newQuilt => {
      await queryClient.cancelQueries(['quilts']);
      const previous = queryClient.getQueryData(['quilts']);

      queryClient.setQueryData(['quilts'], (old: any) => ({
        ...old,
        quilts: old.quilts.map((q: Quilt) => (q.id === newQuilt.id ? { ...q, ...newQuilt } : q)),
      }));

      return { previous };
    },
    onError: (err, newQuilt, context) => {
      queryClient.setQueryData(['quilts'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['quilts']);
    },
  });
}
```

## Testing Strategy

### Unit Tests

- Logger utility
- Password hashing/verification
- JWT sign/verify
- Repository methods
- Data transformers

### Integration Tests

- tRPC procedures
- Authentication flow
- Database operations

### E2E Tests (Optional)

- Login flow
- Create/edit/delete quilt
- Status changes

## Deployment Strategy

1. **Backup**: Create database backup before deployment
2. **Staging**: Deploy to staging environment first
3. **Testing**: Test all critical flows
4. **Production**: Deploy to production
5. **Monitoring**: Monitor for errors and performance issues

## Success Criteria

- ✅ No console.log statements in production code
- ✅ All TypeScript `any` types replaced with proper types
- ✅ Authentication system working
- ✅ All API routes consolidated to tRPC
- ✅ 100% translation coverage
- ✅ Loading skeletons on all pages
- ✅ Optimistic updates for mutations
- ✅ No breaking changes to existing functionality

## Risk Mitigation

- Keep small, focused commits
- Test each change immediately
- Use feature flags for risky changes
- Maintain rollback capability
- Deploy to staging first
