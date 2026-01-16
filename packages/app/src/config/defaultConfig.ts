import { defineConfig, type MenuItem as CoreMenuItem } from '@gmoonc/core';

interface MenuItemWithSubmenu extends CoreMenuItem {
  submenu?: MenuItemWithSubmenu[];
}

export const defaultGmooncConfig = defineConfig({
  appName: 'Goalmoon Ctrl',
  menu: [
    {
      id: 'admin',
      label: 'Admin',
      path: '/app/admin',
      roles: ['admin'],
      submenu: [
        { id: 'admin-permissions', label: 'Permissions', path: '/app/admin/permissions' }
      ]
    },
    {
      id: 'technical',
      label: 'Technical',
      path: '/app/technical',
      submenu: [
        { id: 'technical-messages', label: 'Messages', path: '/app/technical/messages' }
      ]
    },
    {
      id: 'customer',
      label: 'Customer',
      path: '/app/customer',
      submenu: [
        { id: 'customer-messages', label: 'Messages', path: '/app/customer/messages' }
      ]
    }
  ] as MenuItemWithSubmenu[]
});
