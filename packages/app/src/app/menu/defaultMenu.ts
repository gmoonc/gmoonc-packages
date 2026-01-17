import { type MenuItem as CoreMenuItem } from '@gmoonc/core';

/**
 * Extended MenuItem interface with submenu support
 */
export interface MenuItemWithSubmenu extends CoreMenuItem {
  submenu?: MenuItemWithSubmenu[];
}

/**
 * Default menu configuration for the gmoonc app kit.
 * 
 * This is the source of truth for dashboard routes and menu items.
 * Product basic includes:
 * - Home (index route)
 * - Admin -> Permissions
 * - Technical -> Messages
 * - Customer -> Messages
 * 
 * Note: No "Analyses" items, and "secretariat" is replaced by "office" if needed.
 */
export function createDefaultMenu(basePath: string = '/app'): MenuItemWithSubmenu[] {
  return [
    {
      id: 'home',
      label: 'Home',
      path: basePath,
      roles: []
    },
    {
      id: 'admin',
      label: 'Admin',
      path: `${basePath}/admin`,
      roles: ['admin'],
      submenu: [
        {
          id: 'admin-permissions',
          label: 'Permissions',
          path: `${basePath}/admin/permissions`,
          roles: ['admin']
        }
      ]
    },
    {
      id: 'technical',
      label: 'Technical',
      path: `${basePath}/technical`,
      roles: [],
      submenu: [
        {
          id: 'technical-messages',
          label: 'Messages',
          path: `${basePath}/technical/messages`,
          roles: []
        }
      ]
    },
    {
      id: 'customer',
      label: 'Customer',
      path: `${basePath}/customer`,
      roles: [],
      submenu: [
        {
          id: 'customer-messages',
          label: 'Messages',
          path: `${basePath}/customer/messages`,
          roles: []
        }
      ]
    }
  ];
}
