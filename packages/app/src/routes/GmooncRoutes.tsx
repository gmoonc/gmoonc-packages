import React from 'react';
import { Route, RouteObject } from 'react-router-dom';
import { createGmooncRoutes } from './createGmooncRoutes';

export interface GmooncRoutesProps {
  /**
   * Base path for dashboard routes (default: "/app")
   */
  basePath?: string;
  /**
   * Optional filter function to exclude routes
   * Applied recursively to all route levels
   */
  filter?: (route: RouteObject) => boolean;
  /**
   * Optional map function to customize routes
   * Applied recursively to all route levels
   */
  map?: (route: RouteObject) => RouteObject;
}

/**
 * Helper to normalize routes by applying filter and map recursively
 */
function normalizeRoutes(
  routes: RouteObject[],
  filter?: (route: RouteObject) => boolean,
  map?: (route: RouteObject) => RouteObject
): RouteObject[] {
  return routes
    .map((route) => {
      // Apply map if provided
      let normalized = map ? map(route) : route;
      
      // Recursively normalize children
      if (normalized.children && normalized.children.length > 0) {
        normalized = {
          ...normalized,
          children: normalizeRoutes(normalized.children, filter, map)
        };
      }
      
      return normalized;
    })
    .filter((route) => {
      // Apply filter if provided
      if (filter && !filter(route)) {
        return false;
      }
      return true;
    });
}

/**
 * Helper to render RouteObject[] as <Route/> recursively.
 * Returns an array of Route elements (not wrapped in Fragment).
 * This is safe to use directly inside <Routes>.
 */
function renderRoutes(routes: RouteObject[]): React.ReactElement[] {
  return routes.map((route, index) => {
    const key = route.path || route.index ? `route-${index}` : `route-${index}`;
    
    if (route.index) {
      return (
        <Route
          key={key}
          index
          element={route.element}
        />
      );
    }
    
    return (
      <Route
        key={key}
        path={route.path}
        element={route.element}
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    );
  });
}

/**
 * Generic adapter component for BrowserRouter pattern.
 * Converts gmoonc routes (RouteObject[]) into Route components
 * for use inside Routes.
 * 
 * IMPORTANT: Returns an array of Route elements directly (no Fragment).
 * This is safe to use inside <Routes> from React Router v6.
 * 
 * @example
 * ```tsx
 * <BrowserRouter>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *     <GmooncRoutes basePath="/app" />
 *     <Route path="*" element={<NotFound />} />
 *   </Routes>
 * </BrowserRouter>
 * ```
 */
export function GmooncRoutes(props: GmooncRoutesProps): React.ReactElement[] {
  const { basePath = '/app', filter, map } = props;
  
  // Get routes from createGmooncRoutes
  const routes = createGmooncRoutes({ basePath });
  
  // Normalize routes (apply filter and map recursively)
  const normalizedRoutes = normalizeRoutes(routes, filter, map);
  
  // Render as <Route/> components (returns array directly, no Fragment)
  return renderRoutes(normalizedRoutes);
}
