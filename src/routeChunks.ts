// Route chunk map for prefetching on hover.
// Each key maps a route path → the dynamic import function that loads its chunk.
// PrefetchLink uses this to preload chunks before the user clicks.
export const routeChunkMap: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('./app/(dashboard)/dashboard/page.tsx'),
  '/tryout': () => import('./app/(dashboard)/tryout/page.tsx'),
  '/practice': () => import('./app/(dashboard)/practice/page.tsx'),
  '/analytics': () => import('./app/(dashboard)/analytics/page.tsx'),
  '/leaderboard': () => import('./app/(dashboard)/leaderboard/page.tsx'),
  '/profile': () => import('./app/(dashboard)/profile/page.tsx'),
  '/subscription': () => import('./app/(dashboard)/subscription/page.tsx'),
  '/admin': () => import('./app/(admin)/page.tsx'),
  '/admin/tryouts': () => import('./app/(admin)/tryouts/page.tsx'),
  '/admin/questions': () => import('./app/(admin)/questions/page.tsx'),
  '/admin/subjects': () => import('./app/(admin)/subjects/page.tsx'),
  '/admin/users': () => import('./app/(admin)/users/page.tsx'),
  '/login': () => import('./app/(auth)/login/page.tsx'),
  '/register': () => import('./app/(auth)/register/page.tsx'),
};
