import { createTRPCRouter } from '@/server/api/trpc';
import { quiltsRouter } from '@/server/api/routers/quilts';
import { dashboardRouter } from '@/server/api/routers/dashboard';
import { importExportRouter } from '@/server/api/routers/import-export';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  quilts: quiltsRouter,
  dashboard: dashboardRouter,
  importExport: importExportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;