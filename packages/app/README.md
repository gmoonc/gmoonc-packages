# @gmoonc/app

Complete pluggable dashboard app kit for React Router v6. Provides a full-featured dashboard with authentication pages, management interfaces, and a responsive layout.

## Installation

```bash
npm install @gmoonc/app
```

## CSS Import

Import the required CSS files in your entry point:

```javascript
import "@gmoonc/ui/styles.css";
import "@gmoonc/app/styles.css";
```

## Usage

There are two ways to integrate gmoonc routes into your React Router setup:

### A) Data Router (createBrowserRouter)

Use `createGmooncRoutes` to get `RouteObject[]` and spread into your router:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createGmooncRoutes } from '@gmoonc/app';

const router = createBrowserRouter([
  ...createGmooncRoutes({ basePath: "/app" }),
  // ... your other routes
]);

function App() {
  return <RouterProvider router={router} />;
}
```

### B) BrowserRouter (Routes/Route)

Use the `GmooncRoutes` component inside your `<Routes>`:

```tsx
import { BrowserRouter, Routes } from 'react-router-dom';
import { GmooncRoutes } from '@gmoonc/app';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <GmooncRoutes basePath="/app" />
        {/* Your other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Important: No Root Path Conflicts

**The gmoonc app kit never creates a route with `path="/"`.** The dashboard is always nested under `basePath` (default: `/app`). This ensures your app's root route remains available for your own pages.

- Dashboard routes are always under `basePath` (e.g., `/app`, `/dashboard`)
- Home page uses an index route (no explicit path)
- Auth routes are separate and don't interfere with your root path

### Customization

You can customize routes with `filter` and `map` props if needed:

```tsx
<GmooncRoutes
  basePath="/app"
  filter={(route) => route.path !== '/login'} // Exclude login route
  map={(route) => ({
    ...route,
    path: route.path?.replace('/app', '/dashboard') // Customize paths
  })}
/>
```

## Features

- **Complete App Kit**: Full dashboard with all pages and components
- **Auth Pages**: Login, Register, Forgot Password, Reset Password, Logout
- **Dashboard Pages**: 
  - Home (index route)
  - Admin → Permissions
  - Technical → Messages
  - Customer → Messages
- **Components**: Permissions Manager, Messages Manager, User Profile
- **Layout**: Integrated shell with menu and navigation
- **Session Management**: Mock session context (ready for real auth integration)
- **Responsive**: Mobile-first design with full responsiveness

## Note

Auth is currently mocked for UI development. Replace the session context with your real authentication system when ready.

## License

MIT
