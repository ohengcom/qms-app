# Design Document - QMS Project Improvements 2025

## Overview

This document outlines the technical design and implementation approach for the Phase 1 improvements to the QMS (Quilt Management System) application. The focus is on enhancing user experience through complete bilingual support, visual improvements, data validation, and comprehensive settings functionality.

## Architecture Overview

### Current Architecture

- **Frontend**: Next.js 16 App Router, React 19, TypeScript
- **Backend**: tRPC 11.6, Neon Serverless PostgreSQL
- **UI Framework**: Tailwind CSS 4, Shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query), Zustand
- **Internationalization**: Custom i18n system with LanguageContext

### Design Principles

1. **User-Centric**: Prioritize personal use case with intuitive interfaces
2. **Bilingual First**: Ensure complete Chinese and English support
3. **Visual Excellence**: Modern, beautiful, and consistent design
4. **Data Integrity**: Robust validation and error handling
5. **Performance**: Fast, responsive, and smooth interactions
6. **Maintainability**: Clean code, clear patterns, good documentation

## Component Architecture

### 0. Authentication System (Simple Single-User)

#### Authentication Architecture

```
src/
├── lib/
│   ├── auth.ts                    # Authentication utilities
│   ├── password.ts                # Password hashing/validation
│   └── session.ts                 # Session management
├── middleware.ts                  # Next.js middleware for route protection
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── api/
│       └── auth/
│           ├── login/route.ts    # Login endpoint
│           ├── logout/route.ts   # Logout endpoint
│           └── session/route.ts  # Session validation
```

#### Implementation Design

**Password Storage:**

```typescript
// Environment variable approach (recommended for single-user)
// .env.local
QMS_PASSWORD_HASH=<bcrypt_hash>
QMS_JWT_SECRET=<random_secret>
QMS_SESSION_DURATION=7d  // 7 days default
```

**Authentication Flow:**

```
1. User visits app → Check session cookie
2. No valid session → Redirect to /login
3. User enters password → Hash and compare
4. Match → Generate JWT → Set HTTP-only cookie
5. Redirect to dashboard
```

**Session Management:**

```typescript
// JWT payload
interface SessionPayload {
  userId: 'owner'; // Single user
  iat: number; // Issued at
  exp: number; // Expiration
  remember: boolean; // Remember me flag
}

// Session duration
const SESSION_DURATION = {
  default: 7 * 24 * 60 * 60, // 7 days
  remember: 30 * 24 * 60 * 60, // 30 days
};
```

**Middleware Protection:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('qms-session');

  // Protected routes
  const protectedPaths = ['/quilts', '/usage', '/import', '/export', '/settings'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate JWT
  try {
    const payload = verifyJWT(session.value);
    // Session valid, continue
    return NextResponse.next();
  } catch {
    // Invalid session, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

**Login Page Component:**

```typescript
// app/login/page.tsx
export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, remember }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">QMS</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={setRemember}
              />
              <Label htmlFor="remember" className="text-sm">
                {t('auth.rememberMe')}
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              {t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**API Routes:**

```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { password, remember } = await request.json();

  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Verify password
  const passwordHash = process.env.QMS_PASSWORD_HASH!;
  const isValid = await bcrypt.compare(password, passwordHash);

  if (!isValid) {
    recordFailedAttempt(ip);
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }

  // Generate JWT
  const duration = remember ? SESSION_DURATION.remember : SESSION_DURATION.default;
  const token = generateJWT({ userId: 'owner', remember }, duration);

  // Set HTTP-only cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set('qms-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: duration,
    path: '/',
  });

  return response;
}
```

**Security Utilities:**

```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJWT(payload: any, expiresIn: number): string {
  return jwt.sign(payload, process.env.QMS_JWT_SECRET!, {
    expiresIn,
  });
}

export function verifyJWT(token: string): any {
  return jwt.verify(token, process.env.QMS_JWT_SECRET!);
}

// Rate limiting (simple in-memory store)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    return false;
  }

  return attempts.count >= 5;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + 15 * 60 * 1000, // 15 minutes
    });
  } else {
    attempts.count++;
  }
}
```

**Initial Setup Script:**

```typescript
// scripts/setup-password.ts
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function setupPassword() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npm run setup-password <your-password>');
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const jwtSecret = randomBytes(32).toString('hex');

  console.log('\nAdd these to your .env.local file:\n');
  console.log(`QMS_PASSWORD_HASH="${hash}"`);
  console.log(`QMS_JWT_SECRET="${jwtSecret}"`);
  console.log('\nKeep these values secret!');
}

setupPassword();
```

### 1. Internationalization System Enhancement

#### Current Implementation

```
src/
├── lib/
│   ├── i18n.ts                    # Translation definitions
│   └── language-provider.tsx      # Language context provider
├── contexts/
│   └── LanguageContext.tsx        # Legacy context (to be deprecated)
└── components/
    └── LanguageSwitcher.tsx       # Language toggle component
```

#### Enhanced Design

**Translation Management:**

- Centralized translation keys in `i18n.ts`
- Nested translation structure for organization
- Type-safe translation keys with TypeScript
- Fallback mechanism for missing translations

**Language Persistence:**

```typescript
// src/lib/language-storage.ts
export const LanguageStorage = {
  get: () => (localStorage.getItem('qms-language') as Language) || 'zh',
  set: (lang: Language) => localStorage.setItem('qms-language', lang),
};
```

**Translation Coverage Audit:**

- Create translation audit script to identify missing keys
- Generate translation coverage report
- Automated testing for translation completeness

### 2. Theme System Design

#### Theme Architecture

```
src/
├── lib/
│   ├── theme-provider.tsx         # Theme context and provider
│   └── theme-storage.ts           # Theme persistence
├── hooks/
│   └── useTheme.ts                # Theme hook
└── components/
    └── ThemeSwitcher.tsx          # Theme toggle component
```

#### Theme Implementation

**Theme Provider:**

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // Actual theme after system resolution
}
```

**CSS Variables Strategy:**

- Use existing OKLCH color system
- Smooth transition between themes (200ms)
- Persist theme preference in localStorage
- Respect system preference for 'system' mode

**Dark Mode Optimization:**

- Adjust colors for better dark mode readability
- Reduce contrast for less eye strain
- Optimize shadows and borders for dark backgrounds

### 3. Settings System Design

#### Settings Architecture

```
src/
├── lib/
│   ├── settings-store.ts          # Zustand store for settings
│   └── settings-storage.ts        # LocalStorage persistence
├── types/
│   └── settings.ts                # Settings type definitions
└── app/
    └── settings/
        ├── page.tsx               # Main settings page
        └── components/
            ├── LanguageSettings.tsx
            ├── ThemeSettings.tsx
            ├── DisplaySettings.tsx
            ├── NotificationSettings.tsx
            └── SystemInfo.tsx
```

#### Settings Data Model

```typescript
interface UserSettings {
  // Language & Region
  language: 'zh' | 'en';
  dateFormat: 'default' | 'iso' | 'us';
  numberFormat: 'default' | 'comma' | 'space';
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday

  // Display Preferences
  theme: 'light' | 'dark' | 'system';
  defaultView: 'list' | 'grid';
  itemsPerPage: 10 | 20 | 50 | 100;
  compactMode: boolean;

  // Data & Defaults
  defaultSortOrder: 'itemNumber' | 'name' | 'lastUsed' | 'weight';
  defaultSeasonFilter: 'all' | 'winter' | 'spring-autumn' | 'summer';
  defaultStatusFilter: 'all' | 'available' | 'in_use' | 'maintenance';
  autoSave: boolean;

  // Notifications
  enableNotifications: boolean;
  notificationDuration: 3000 | 5000 | 10000;
  soundEffects: boolean;
  notificationHistoryRetention: 7 | 30 | 90; // days
}
```

#### Settings Persistence Strategy

- Use Zustand for in-memory state management
- Persist to localStorage on every change
- Debounce writes to prevent excessive storage operations
- Validate settings on load with Zod schema
- Provide default values for missing settings

### 4. Data Validation System

#### Validation Architecture

```
src/
├── lib/
│   └── validations/
│       ├── quilt.ts               # Enhanced quilt validation
│       ├── usage.ts               # Usage validation
│       ├── common.ts              # Shared validation rules
│       └── error-messages.ts      # Bilingual error messages
```

#### Enhanced Validation Rules

```typescript
// Quilt validation with custom rules
const quiltSchema = z
  .object({
    itemNumber: z
      .string()
      .min(1, { message: 'validation.itemNumber.required' })
      .max(50, { message: 'validation.itemNumber.maxLength' })
      .regex(/^[A-Z0-9-]+$/, { message: 'validation.itemNumber.format' }),

    name: z
      .string()
      .min(1, { message: 'validation.name.required' })
      .max(200, { message: 'validation.name.maxLength' }),

    season: z.enum(['Winter', 'Spring-Autumn', 'Summer'], {
      errorMap: () => ({ message: 'validation.season.invalid' }),
    }),

    weight: z
      .number()
      .min(100, { message: 'validation.weight.min' })
      .max(10000, { message: 'validation.weight.max' }),

    length: z.number().min(100).max(300).optional(),
    width: z.number().min(100).max(300).optional(),
  })
  .refine(
    data => {
      // Custom validation: Winter quilts should be heavier
      if (data.season === 'Winter' && data.weight < 1000) {
        return false;
      }
      return true;
    },
    {
      message: 'validation.weight.winterMinimum',
      path: ['weight'],
    }
  );
```

#### Error Message System

```typescript
// Bilingual error messages
export const validationMessages = {
  zh: {
    'validation.itemNumber.required': '编号不能为空',
    'validation.itemNumber.maxLength': '编号不能超过50个字符',
    'validation.itemNumber.format': '编号只能包含大写字母、数字和连字符',
    'validation.weight.winterMinimum': '冬被重量应至少为1000克',
    // ... more messages
  },
  en: {
    'validation.itemNumber.required': 'Item number is required',
    'validation.itemNumber.maxLength': 'Item number cannot exceed 50 characters',
    'validation.itemNumber.format':
      'Item number can only contain uppercase letters, numbers, and hyphens',
    'validation.weight.winterMinimum': 'Winter quilts should weigh at least 1000g',
    // ... more messages
  },
};
```

### 5. UI Component Enhancement Design

#### Design System Tokens

```typescript
// src/lib/design-tokens.ts
export const designTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
};
```

#### Enhanced Card Component

```typescript
// Variants for different card styles
const cardVariants = {
  default: 'bg-card border border-border shadow-sm',
  elevated: 'bg-card border-0 shadow-md hover:shadow-lg transition-shadow',
  interactive:
    'bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer',
  gradient: 'bg-gradient-to-br from-primary/5 to-accent/5 border border-border',
};
```

#### Loading Skeleton Design

```typescript
// Skeleton component for loading states
<Skeleton className="h-4 w-full" />
<Skeleton className="h-20 w-full rounded-lg" />

// Skeleton variants
- Pulse animation (default)
- Shimmer effect (premium feel)
- Wave animation (modern)
```

#### Animation System

```typescript
// Framer Motion variants for page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

// Modal animations
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

// Toast animations (using Sonner)
- Slide in from right
- Fade in/out
- Smooth exit animation
```

## Data Flow

### 1. Settings Flow

```
User Action → Settings Store → LocalStorage
                ↓
         Apply to UI Components
                ↓
         Persist on Change
```

### 2. Language Change Flow

```
User Selects Language → Update Context → Update LocalStorage
                                ↓
                         Re-render Components
                                ↓
                         Update Document Lang Attribute
```

### 3. Theme Change Flow

```
User Selects Theme → Update Theme Context → Update LocalStorage
                              ↓
                    Apply CSS Class to <html>
                              ↓
                    Trigger Transition Animation
```

### 4. Validation Flow

```
User Input → Form State → Zod Validation → Error Messages
                                ↓
                         Success → Submit to API
                                ↓
                         Error → Display Bilingual Error
```

## Database Schema Changes

### Settings Table (Optional - for multi-device sync)

```sql
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- For future multi-user support
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Note**: For Phase 1 (personal use), we'll use localStorage. Database storage is optional for future multi-device sync.

### Enhanced Quilts Table Constraints

```sql
-- Add unique constraint for item_number
ALTER TABLE quilts ADD CONSTRAINT unique_item_number UNIQUE (item_number);

-- Add check constraints for data integrity
ALTER TABLE quilts ADD CONSTRAINT check_weight_range
  CHECK (weight_grams >= 100 AND weight_grams <= 10000);

ALTER TABLE quilts ADD CONSTRAINT check_dimensions
  CHECK (length_cm >= 100 AND length_cm <= 300 AND width_cm >= 100 AND width_cm <= 300);

-- Add check for winter quilt weight
ALTER TABLE quilts ADD CONSTRAINT check_winter_weight
  CHECK (season != 'Winter' OR weight_grams >= 1000);
```

## API Design

### Settings API (Future Enhancement)

```typescript
// tRPC router for settings
export const settingsRouter = router({
  get: publicProcedure.query(async () => {
    // Get settings from localStorage or database
  }),

  update: publicProcedure.input(settingsSchema).mutation(async ({ input }) => {
    // Validate and save settings
  }),

  reset: publicProcedure.mutation(async () => {
    // Reset to default settings
  }),
});
```

### Enhanced Validation API

```typescript
// Validation endpoint for real-time feedback
export const validationRouter = router({
  checkItemNumber: publicProcedure
    .input(z.object({ itemNumber: z.string() }))
    .query(async ({ input }) => {
      // Check if item number already exists
      const exists = await db.query.quilts.findFirst({
        where: eq(quilts.itemNumber, input.itemNumber),
      });
      return { available: !exists };
    }),
});
```

## UI/UX Design Specifications

### Color Palette Enhancement

#### Light Mode

```css
/* Primary - Modern Indigo */
--primary: oklch(0.55 0.22 264); /* #4F46E5 */
--primary-hover: oklch(0.5 0.22 264); /* Darker on hover */

/* Success - Fresh Green */
--success: oklch(0.65 0.2 145); /* #10B981 */

/* Warning - Warm Orange */
--warning: oklch(0.75 0.18 65); /* #F59E0B */

/* Error - Modern Red */
--destructive: oklch(0.6 0.24 25); /* #EF4444 */

/* Neutral Grays */
--gray-50: oklch(0.99 0 0);
--gray-100: oklch(0.96 0 0);
--gray-200: oklch(0.92 0 0);
--gray-300: oklch(0.88 0 0);
--gray-400: oklch(0.7 0 0);
--gray-500: oklch(0.5 0 0);
--gray-600: oklch(0.4 0 0);
--gray-700: oklch(0.3 0 0);
--gray-800: oklch(0.2 0 0);
--gray-900: oklch(0.15 0 0);
```

#### Dark Mode

```css
/* Adjusted for better readability */
--background: oklch(0.145 0 0); /* #1A1A1A */
--card: oklch(0.205 0 0); /* #2A2A2A */
--border: oklch(1 0 0 / 10%); /* Subtle borders */

/* Reduced contrast for comfort */
--foreground: oklch(0.95 0 0); /* Slightly dimmed white */
--muted-foreground: oklch(0.65 0 0); /* Softer muted text */
```

### Typography System

#### Font Hierarchy

```css
/* Headings */
.text-h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}
.text-h2 {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
}
.text-h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}
.text-h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Body */
.text-body {
  font-size: 1rem;
  line-height: 1.6;
}
.text-body-sm {
  font-size: 0.875rem;
  line-height: 1.5;
}
.text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Chinese font optimization */
body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}
```

### Component Visual Specifications

#### Enhanced Card Design

```tsx
// Default card with subtle elevation
<Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Interactive card with hover effect
<Card className="border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer">
  {/* Content */}
</Card>

// Gradient accent card
<Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-0 shadow-sm">
  {/* Content */}
</Card>
```

#### Button Variants

```tsx
// Primary button with gradient hover
<Button className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all">
  Primary Action
</Button>

// Secondary button with subtle hover
<Button variant="secondary" className="hover:bg-secondary/80 transition-colors">
  Secondary Action
</Button>

// Ghost button with icon
<Button variant="ghost" className="hover:bg-accent transition-colors">
  <Icon className="w-4 h-4 mr-2" />
  Action
</Button>
```

#### Form Input Enhancement

```tsx
// Input with focus ring
<Input className="focus:ring-2 focus:ring-primary/20 transition-all" />

// Input with validation state
<Input className={cn(
  "transition-all",
  error && "border-destructive focus:ring-destructive/20",
  success && "border-success focus:ring-success/20"
)} />

// Input with icon
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <Input className="pl-10" />
</div>
```

#### Table Enhancement

```tsx
// Modern table with hover effects
<Table>
  <TableHeader>
    <TableRow className="border-b border-border">
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-b border-border hover:bg-accent/50 transition-colors">
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Zebra striping for better readability
<TableRow className={cn(
  "border-b border-border transition-colors",
  index % 2 === 0 ? "bg-muted/30" : "bg-background",
  "hover:bg-accent/50"
)}>
```

### Loading States Design

#### Skeleton Screens

```tsx
// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>

// Table skeleton
<Table>
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Shimmer Effect

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--muted) 0%,
    var(--muted-foreground) 50%,
    var(--muted) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### Animation Specifications

#### Page Transitions

```tsx
// Using Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
>
  {/* Page content */}
</motion.div>
```

#### Modal Animations

```tsx
<Dialog>
  <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-200">
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

#### Micro-interactions

```css
/* Button press effect */
.button-press {
  @apply active:scale-95 transition-transform;
}

/* Checkbox check animation */
.checkbox-check {
  @apply transition-all duration-200 ease-out;
}

/* Toggle switch animation */
.toggle-switch {
  @apply transition-all duration-200 ease-in-out;
}
```

## Page-Specific Designs

### Dashboard Enhancements

#### Statistics Cards

```tsx
<Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {t('dashboard.stats.totalQuilts')}
        </p>
        <p className="text-3xl font-bold mt-2">16</p>
        <p className="text-xs text-success mt-1 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          +2 this month
        </p>
      </div>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Package className="w-6 h-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

#### Chart Styling

```tsx
// Using Recharts with custom styling
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
    <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
    <Tooltip
      contentStyle={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    />
    <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Quilt List Enhancements

#### Grid View

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {quilts.map(quilt => (
    <Card key={quilt.id} className="group hover:shadow-lg transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{quilt.name}</CardTitle>
            <CardDescription>{quilt.itemNumber}</CardDescription>
          </div>
          <Badge variant={getSeasonVariant(quilt.season)}>{t(`season.${quilt.season}`)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium">{quilt.weight}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={getStatusVariant(quilt.status)}>{t(`status.${quilt.status}`)}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

#### List View with Actions

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{t('quilts.table.itemNumber')}</TableHead>
      <TableHead>{t('quilts.table.name')}</TableHead>
      <TableHead>{t('quilts.table.season')}</TableHead>
      <TableHead>{t('quilts.table.status')}</TableHead>
      <TableHead className="text-right">{t('quilts.views.actions')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {quilts.map((quilt, index) => (
      <TableRow
        key={quilt.id}
        className={cn('transition-colors', index % 2 === 0 && 'bg-muted/30', 'hover:bg-accent/50')}
      >
        <TableCell className="font-mono text-sm">{quilt.itemNumber}</TableCell>
        <TableCell className="font-medium">{quilt.name}</TableCell>
        <TableCell>
          <Badge variant={getSeasonVariant(quilt.season)}>{t(`season.${quilt.season}`)}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(quilt.status)}>{t(`status.${quilt.status}`)}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Settings Page Redesign

#### Section Layout

```tsx
<div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
  {/* Header */}
  <div>
    <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
    <p className="text-muted-foreground mt-2">{t('settings.subtitle')}</p>
  </div>

  {/* Settings Sections */}
  <Tabs defaultValue="general" className="space-y-6">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="display">Display</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="advanced">Advanced</TabsTrigger>
    </TabsList>

    <TabsContent value="general" className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{/* Settings content */}</CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>
```

## Mobile Optimization

### Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px', // Mobile landscape
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
  '2xl': '1536px', // Extra large
};
```

### Mobile-Specific Components

#### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
  <div className="flex justify-around items-center h-16">
    <NavItem icon={Home} label="Dashboard" />
    <NavItem icon={Package} label="Quilts" />
    <NavItem icon={Activity} label="Usage" />
    <NavItem icon={Settings} label="Settings" />
  </div>
</nav>
```

#### Touch-Optimized Buttons

```tsx
// Minimum 44x44px touch target
<Button className="min-h-[44px] min-w-[44px] touch-manipulation">Action</Button>
```

#### Swipe Gestures

```tsx
// Using react-swipeable
<Swipeable onSwipedLeft={() => handleDelete()} onSwipedRight={() => handleEdit()}>
  <QuiltCard />
</Swipeable>
```

## Performance Considerations

### Code Splitting Strategy

```typescript
// Lazy load heavy components
const Analytics = lazy(() => import('@/app/analytics/page'));
const Reports = lazy(() => import('@/app/reports/page'));

// Preload on hover
<Link
  href="/analytics"
  onMouseEnter={() => import('@/app/analytics/page')}
>
  Analytics
</Link>
```

### Image Optimization

```tsx
// Use Next.js Image component
<Image
  src={quiltImage}
  alt={quilt.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  className="rounded-lg"
/>
```

### Bundle Size Optimization

- Tree-shake unused Radix UI components
- Use dynamic imports for large libraries
- Optimize Tailwind CSS with purge
- Minimize third-party dependencies

## Testing Strategy

### Component Testing

```typescript
// Test language switching
describe('LanguageSwitcher', () => {
  it('should toggle between Chinese and English', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('中文');
    fireEvent.click(button);
    expect(button).toHaveTextContent('EN');
  });
});

// Test theme switching
describe('ThemeSwitcher', () => {
  it('should apply dark mode class', () => {
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('dark');
  });
});
```

### Validation Testing

```typescript
describe('Quilt Validation', () => {
  it('should reject invalid item numbers', () => {
    const result = quiltSchema.safeParse({
      itemNumber: 'invalid-123',
      // ... other fields
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('format');
  });

  it('should enforce winter quilt weight minimum', () => {
    const result = quiltSchema.safeParse({
      season: 'Winter',
      weight: 800,
      // ... other fields
    });

    expect(result.success).toBe(false);
  });
});
```

### Visual Regression Testing

```typescript
// Using Playwright for visual testing
test('dashboard should match snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('dashboard.png');
});

test('dark mode should match snapshot', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="theme-switcher"]');
  await expect(page).toHaveScreenshot('dashboard-dark.png');
});
```

## Accessibility Compliance

### WCAG 2.1 AA Requirements

#### Color Contrast

- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

#### Keyboard Navigation

```tsx
// Ensure all interactive elements are keyboard accessible
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Action
</Button>

// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

#### ARIA Labels

```tsx
// Proper labeling for screen readers
<button aria-label={t('common.delete')}>
  <Trash2 className="w-4 h-4" />
</button>

<input
  type="text"
  aria-label={t('quilts.form.name')}
  aria-describedby="name-help"
/>
<span id="name-help" className="text-sm text-muted-foreground">
  {t('quilts.form.nameHelp')}
</span>
```

## Implementation Phases

### Phase 1A: Foundation (Week 1)

**Goal**: Establish core infrastructure and security

1. **Simple Authentication System** 🔒
   - Create login page
   - Implement password hashing and verification
   - Set up JWT session management
   - Add middleware for route protection
   - Implement rate limiting
   - Create password setup script
   - Add logout functionality

2. **Translation System Enhancement**
   - Audit existing translations
   - Add missing translation keys (including auth)
   - Implement translation coverage testing
   - Add language persistence

3. **Theme System Implementation**
   - Create ThemeProvider component
   - Implement theme switching logic
   - Add theme persistence
   - Test dark mode colors

4. **Settings Store Setup**
   - Create Zustand settings store
   - Implement localStorage persistence
   - Define settings schema with Zod
   - Create settings hooks

**Deliverables**:

- Working authentication system
- Complete translation coverage
- Working theme switcher
- Settings infrastructure ready

### Phase 1B: Data Validation (Week 2)

**Goal**: Implement robust validation

1. **Enhanced Validation Schemas**
   - Update quilt validation with custom rules
   - Add bilingual error messages
   - Implement real-time validation
   - Add duplicate checking

2. **Form Enhancement**
   - Update all forms with new validation
   - Add inline error messages
   - Implement field-level validation
   - Add success feedback

**Deliverables**:

- Comprehensive validation system
- Bilingual error messages
- Improved form UX

### Phase 1C: UI Enhancement (Week 3)

**Goal**: Improve visual design

1. **Component Updates**
   - Enhance card designs
   - Update button styles
   - Improve form inputs
   - Optimize table styling

2. **Loading States**
   - Implement skeleton screens
   - Add shimmer effects
   - Create loading components
   - Update all loading states

3. **Animations**
   - Add page transitions
   - Implement micro-interactions
   - Enhance modal animations
   - Optimize toast animations

**Deliverables**:

- Modern, polished UI
- Smooth animations
- Better loading states

### Phase 1D: Settings Page (Week 4)

**Goal**: Complete settings functionality

1. **Settings Page Redesign**
   - Create tabbed layout
   - Implement all setting categories
   - Add language switcher integration
   - Add theme switcher integration

2. **Settings Features**
   - Display preferences
   - Notification settings
   - System information
   - Reset functionality

3. **Mobile Optimization**
   - Responsive settings layout
   - Touch-friendly controls
   - Mobile navigation
   - Gesture support

**Deliverables**:

- Complete settings page
- All preferences working
- Mobile-optimized

## Success Metrics

### Technical Metrics

- Translation coverage: 100%
- Theme switching: < 100ms
- Settings persistence: < 50ms
- Form validation: < 100ms response
- Page load: < 2s
- Lighthouse score: > 90

### User Experience Metrics

- Language switching: Seamless, no page reload
- Theme transition: Smooth, no flash
- Form errors: Clear, helpful, bilingual
- Loading states: Informative, not jarring
- Mobile usability: Touch-friendly, responsive

### Code Quality Metrics

- TypeScript strict mode: 100% compliance
- Component reusability: High
- Code duplication: Minimal
- Documentation: Complete for public APIs

## Risk Mitigation

### Potential Risks

1. **Translation Completeness**
   - Risk: Missing translations causing fallback to keys
   - Mitigation: Automated translation coverage testing
   - Fallback: Display English if Chinese missing, vice versa

2. **Theme Switching Performance**
   - Risk: Flash of unstyled content (FOUC)
   - Mitigation: Load theme preference before render
   - Solution: Inline script in HTML head

3. **Settings Persistence**
   - Risk: LocalStorage quota exceeded
   - Mitigation: Compress settings data
   - Fallback: Use default settings if load fails

4. **Validation Performance**
   - Risk: Slow validation on large forms
   - Mitigation: Debounce validation
   - Optimization: Validate only changed fields

5. **Mobile Performance**
   - Risk: Animations causing jank on low-end devices
   - Mitigation: Use CSS transforms, reduce-motion media query
   - Fallback: Disable animations on slow devices

## Conclusion

This design provides a comprehensive blueprint for implementing Phase 1 improvements to the QMS application. The focus on bilingual support, visual excellence, data validation, and user preferences will significantly enhance the user experience while maintaining code quality and performance.

The phased approach ensures manageable implementation with clear deliverables at each stage. The design is flexible enough to accommodate changes while providing sufficient detail for implementation.
