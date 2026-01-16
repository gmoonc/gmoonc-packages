# @gmoonc/app

Goalmoon Ctrl (gmoonc) dashboard app package: routes, pages, and layout.

## Installation

```bash
npm install @gmoonc/app
```

## CSS Import

Import the required CSS files:

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

- **Auth Pages**: Login, Register, Forgot Password, Reset Password, Logout
- **Dashboard Pages**: Home, Permissions, Technical Messages, Customer Messages
- **Layout**: Integrated shell with menu and navigation
- **Session Management**: Mock session context (ready for real auth integration)

## Note

Auth is currently mocked for UI development. Replace the session context with your real authentication system when ready.

## License

MIT
