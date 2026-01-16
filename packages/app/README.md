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

### React Router Integration

Integrate with React Router's `createBrowserRouter`:

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

## Features

- **Auth Pages**: Login, Register, Forgot Password, Reset Password, Logout
- **Dashboard Pages**: Home, Permissions, Technical Messages, Customer Messages
- **Layout**: Integrated shell with menu and navigation
- **Session Management**: Mock session context (ready for real auth integration)

## Note

Auth is currently mocked for UI development. Replace the session context with your real authentication system when ready.

## License

MIT
