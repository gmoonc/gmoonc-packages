# @gmoonc/ui

Pluggable UI components for Goalmoon Ctrl (gmoonc): shell and menu for dashboards (pure React, SSR-safe).

## Installation

```bash
npm install @gmoonc/ui
```

## CSS Import

Import the required CSS file:

```tsx
import "@gmoonc/ui/styles.css";
```

## Basic Usage

```tsx
import { defineConfig } from '@gmoonc/core';
import { GmooncShell } from '@gmoonc/ui';
import '@gmoonc/ui/styles.css';

const config = defineConfig({
  appName: 'My Dashboard',
  menu: [
    { id: 'home', label: 'Home', path: '/app' },
    { 
      id: 'admin', 
      label: 'Admin', 
      path: '/app/admin', 
      roles: ['admin'],
      submenu: [
        { id: 'admin-permissions', label: 'Permissions', path: '/app/admin/permissions' }
      ]
    }
  ]
});

function App() {
  return (
    <GmooncShell
      config={config}
      roles={['admin']}
      activePath="/app/admin/permissions"
      onNavigate={(path) => {
        // Your navigation logic here
        console.log('Navigate to:', path);
      }}
    >
      <div>Dashboard content</div>
    </GmooncShell>
  );
}
```

## Navigation Integration

`@gmoonc/ui` is framework-agnostic and doesn't depend on any specific routing system. You can integrate it with any framework using the `onNavigate` and/or `renderLink` props.

### Using `onNavigate`

```tsx
<GmooncShell
  config={config}
  onNavigate={(path) => {
    // React Router
    navigate(path);
    
    // Next.js
    router.push(path);
    
    // Other system
    window.location.href = path;
  }}
/>
```

### Using `renderLink`

For full control over how links are rendered (e.g., React Router `Link`, Next.js `Link`):

```tsx
import { Link } from 'react-router-dom';

<GmooncShell
  config={config}
  activePath={location.pathname}
  renderLink={({ path, label, isActive, onClick }) => (
    <Link 
      to={path} 
      onClick={onClick}
      className={isActive ? 'active' : ''}
    >
      {label}
    </Link>
  )}
/>
```

## Menu Items with Icons

Menu items support optional icons (ReactNode). No default unicode icons are used:

```tsx
import { Home, Settings } from 'lucide-react';

const config = defineConfig({
  appName: 'My App',
  menu: [
    { 
      id: 'home', 
      label: 'Home', 
      path: '/app',
      icon: <Home size={16} />
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      path: '/app/settings',
      icon: <Settings size={16} />,
      submenu: [
        { 
          id: 'settings-profile', 
          label: 'Profile', 
          path: '/app/settings/profile',
          icon: <User size={16} />
        }
      ]
    }
  ]
});
```

## Active State

The menu automatically highlights active items based on `activePath`:

- **Exact match**: `activePath === item.path`
- **Child route**: `activePath` starts with `item.path + "/"`

This ensures parent menu items are highlighted when viewing child pages.

## Components

### GmooncShell

Main component that combines header, sidebar, and menu.

**Props:**
- `config: GmooncConfig` - App configuration (from `@gmoonc/core`)
- `roles?: string[]` - Current user roles for filtering menu
- `activePath?: string` - Active path for highlighting menu item
- `onNavigate?: (path: string) => void` - Callback when user clicks menu item
- `renderLink?: (args) => React.ReactNode` - Function to render custom links
- `children?: React.ReactNode` - Main content
- `headerRight?: React.ReactNode` - Content for right side of header
- `logoUrl?: string` - Logo image URL
- `logoAlt?: string` - Logo alt text
- `titleMobile?: string` - Title for mobile view

### GmooncMenu

Standalone menu component.

**Props:**
- `items: GmooncMenuItem[]` - Array of menu items
- `roles?: string[]` - User roles for filtering
- `activePath?: string` - Active path for highlighting
- `onNavigate?: (path: string) => void` - Navigation callback
- `renderLink?: (args) => React.ReactNode` - Custom link renderer
- `isOpen?: boolean` - Whether menu is open (mobile/tablet)
- `onToggle?: () => void` - Toggle menu callback
- `onLogoClick?: () => void` - Logo click callback
- `logoUrl?: string` - Logo image URL
- `logoAlt?: string` - Logo alt text

### GmooncMenuItem Type

```tsx
interface GmooncMenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;        // Optional icon (no default unicode icons)
  roles?: string[];              // Roles required to see this item
  submenu?: GmooncMenuItem[];   // Nested submenu
  expandIcon?: React.ReactNode;  // Optional icon for submenu expansion
  collapseIcon?: React.ReactNode; // Optional icon for submenu collapse
}
```

### GmooncHeader

Standalone header component.

### GmooncSidebar

Standalone sidebar component.

## Role-Based Filtering

Menu items are automatically filtered based on user roles:

- Items without `roles` are visible to everyone
- Items with `roles` are visible only if user has at least one matching role
- Filtering is applied recursively to submenus
- Parent items without paths but with visible children appear as collapsible

## SSR Safety

All components are SSR-safe and don't access browser APIs at the top level. Any access to `window` or `document` is done inside `useEffect` with appropriate checks.

## Framework Agnostic

This package doesn't depend on:
- Next.js
- React Router
- Expo
- Any other specific framework

It's pure React and works in any React environment (including SSR).

## License

MIT
