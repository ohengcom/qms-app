import { createTRPCRouter } from '@/server/api/trpc';
import { quiltsRouter } from '@/server/api/routers/quilts';
import { usageRouter } from '@/server/api/routers/usage';
import { dashboardRouter } from '@/server/api/routers/dashboard';
import { importExportRouter } from '@/server/api/routers/import-export';
import { settingsRouter } from '@/server/api/routers/settings';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  quilts: quiltsRouter,
  usage: usageRouter,
  dashboard: dashboardRouter,
  importExport: importExportRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
