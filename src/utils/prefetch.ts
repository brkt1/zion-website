/**
 * Prefetch utility for route-based code splitting
 * Preloads route chunks when user hovers over links for faster navigation
 */

// Cache of prefetched routes to avoid duplicate prefetches
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route component
 * @param routePath - The path to prefetch (e.g., '/events', '/about')
 */
export const prefetchRoute = (routePath: string) => {
  // Normalize the path
  const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  
  // Skip if already prefetched
  if (prefetchedRoutes.has(normalizedPath)) {
    return;
  }

  // Map routes to their lazy-loaded components
  const routeMap: { [key: string]: () => Promise<any> } = {
    '/': () => import('../pages/Home'),
    '/events': () => import('../pages/Events'),
    '/about': () => import('../pages/About'),
    '/contact': () => import('../pages/Contact'),
    '/payment/success': () => import('../pages/PaymentSuccess'),
    '/payment/callback': () => import('../pages/PaymentCallback'),
    '/payment/failed': () => import('../pages/PaymentFailed'),
    '/admin/login': () => import('../pages/admin/Login'),
    '/admin/dashboard': () => import('../pages/admin/Dashboard'),
    '/admin/events': () => import('../pages/admin/Events'),
    '/admin/categories': () => import('../pages/admin/Categories'),
    '/admin/destinations': () => import('../pages/admin/Destinations'),
    '/admin/gallery': () => import('../pages/admin/Gallery'),
    '/admin/about': () => import('../pages/admin/About'),
    '/admin/home': () => import('../pages/admin/Home'),
    '/admin/contact': () => import('../pages/admin/Contact'),
    '/admin/settings': () => import('../pages/admin/Settings'),
    '/admin/verify': () => import('../pages/admin/VerifyTicket'),
    '/admin/commission-sellers': () => import('../pages/admin/CommissionSellers'),
  };

  // Check if route exists in map
  const prefetchFn = routeMap[normalizedPath];
  if (prefetchFn) {
    // Prefetch the route
    prefetchFn()
      .then(() => {
        prefetchedRoutes.add(normalizedPath);
      })
      .catch((error) => {
        // Silently fail - prefetching is optional
        console.debug('Prefetch failed for', normalizedPath, error);
      });
  }
};

/**
 * Prefetch a route on mouse enter (for hover prefetching)
 * @param routePath - The path to prefetch
 */
export const handleLinkHover = (routePath: string) => {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => prefetchRoute(routePath), { timeout: 2000 });
  } else {
    setTimeout(() => prefetchRoute(routePath), 100);
  }
};

/**
 * Prefetch multiple routes at once (useful for critical paths)
 * @param routes - Array of route paths to prefetch
 */
export const prefetchRoutes = (routes: string[]) => {
  routes.forEach((route) => prefetchRoute(route));
};

