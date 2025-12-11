import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { apiLogger } from '@/lib/logger';

// Initialize Zod with Chinese error messages for server-side validation
import '@/lib/validations/init';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: { user: { id: string; email: string } } | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req: _req, res: _res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  // const session = await getServerAuthSession({ req, res });

  // For now, we'll use a simple session mock - replace with actual auth later
  const session = null;

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Handle tRPC errors with proper logging and user-friendly messages
 * Preserves original error message for better user feedback
 */
export function handleTRPCError(
  error: unknown,
  operation: string,
  context?: Record<string, unknown>
): never {
  // If it's already a TRPCError, log and re-throw it
  if (error instanceof TRPCError) {
    apiLogger.warn(`tRPC ${operation} failed`, {
      code: error.code,
      message: error.message,
      ...context,
    });
    throw error;
  }

  // Log the original error
  apiLogger.error(`tRPC ${operation} failed`, error as Error, context);

  // Convert to user-friendly TRPCError while preserving the original message
  if (error instanceof Error) {
    const originalMessage = error.message;

    // Check for specific error types and add context
    if (originalMessage.includes('not found') || originalMessage.includes('NOT_FOUND')) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: originalMessage || 'Resource not found',
        cause: error,
      });
    }

    if (originalMessage.includes('unauthorized') || originalMessage.includes('UNAUTHORIZED')) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: originalMessage || 'Unauthorized access',
        cause: error,
      });
    }

    // For database errors, parse and extract meaningful message
    if (originalMessage.includes('null value') || originalMessage.includes('violates not-null')) {
      const fieldMatch = originalMessage.match(/column "(\w+)"/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'field';
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Missing required field: ${fieldName}`,
        cause: error,
      });
    }

    if (originalMessage.includes('validation') || originalMessage.includes('invalid')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: originalMessage || 'Invalid input data',
        cause: error,
      });
    }

    // For any other error, preserve the original message
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: originalMessage || 'An unexpected error occurred',
      cause: error,
    });
  }

  // Default to internal server error for unknown error types
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}

/**
 * Logging middleware for tRPC procedures
 */
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();

  apiLogger.debug(`tRPC ${type} ${path} started`);

  const result = await next();

  const duration = Date.now() - start;

  if (result.ok) {
    apiLogger.debug(`tRPC ${type} ${path} completed`, { duration: `${duration}ms` });
  } else {
    apiLogger.warn(`tRPC ${type} ${path} failed`, {
      duration: `${duration}ms`,
      error: result.error.message,
    });
  }

  return result;
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(loggingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(loggingMiddleware).use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
