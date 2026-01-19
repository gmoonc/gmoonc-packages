import { type MenuItem as CoreMenuItem } from '../../core/types';
import { Users, Shield, MessageSquare, Settings, ChevronRight, ChevronDown } from 'lucide-react';
import type React from 'react';

/**
 * Extended MenuItem interface with submenu support
 */
export interface MenuItemWithSubmenu extends CoreMenuItem {
  submenu?: MenuItemWithSubmenu[];
  icon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
}

/**
 * Default menu configuration for the gmoonc app kit.
 * 
 * This is the source of truth for dashboard routes and menu items.
 * Product basic includes:
 * - Admin -> Permissions
 * - Technical -> Messages
 * - Customer -> Messages
 * 
 * Note: No "Analyses" items, and "secretariat" is replaced by "office" if needed.
 */
export function createDefaultMenu(basePath: string = '/app'): MenuItemWithSubmenu[] {
  return [
    {
      id: 'admin',
      label: 'Admin',
      path: `${basePath}/admin`,
      roles: ['admin'],
      icon: <Shield size={18} strokeWidth={2.5} />,
      expandIcon: <ChevronRight size={16} strokeWidth={2.5} />,
      collapseIcon: <ChevronDown size={16} strokeWidth={2.5} />,
      submenu: [
        {
          id: 'admin-users',
          label: 'Users',
          path: `${basePath}/admin/users`,
          roles: ['admin'],
          icon: <Users size={16} strokeWidth={2.5} />
        },
        {
          id: 'admin-permissions',
          label: 'Permissions',
          path: `${basePath}/admin/permissions`,
          roles: ['admin'],
          icon: <Shield size={16} strokeWidth={2.5} />
        },
        {
          id: 'admin-authorizations',
          label: 'Authorization Management',
          path: `${basePath}/admin/authorizations`,
          roles: ['admin'],
          icon: <Settings size={16} strokeWidth={2.5} />
        },
        {
          id: 'admin-notifications',
          label: 'Notification Management',
          path: `${basePath}/admin/notifications`,
          roles: ['admin'],
          icon: <MessageSquare size={16} strokeWidth={2.5} />
        }
      ]
    },
    {
      id: 'technical',
      label: 'Technical',
      path: `${basePath}/technical`,
      roles: [],
      icon: <Settings size={18} strokeWidth={2.5} />,
      expandIcon: <ChevronRight size={16} strokeWidth={2.5} />,
      collapseIcon: <ChevronDown size={16} strokeWidth={2.5} />,
      submenu: [
        {
          id: 'technical-messages',
          label: 'Messages',
          path: `${basePath}/technical/messages`,
          roles: [],
          icon: <MessageSquare size={16} strokeWidth={2.5} />
        }
      ]
    },
    {
      id: 'customer',
      label: 'Customer',
      path: `${basePath}/customer`,
      roles: [],
      icon: <Users size={18} strokeWidth={2.5} />,
      expandIcon: <ChevronRight size={16} strokeWidth={2.5} />,
      collapseIcon: <ChevronDown size={16} strokeWidth={2.5} />,
      submenu: [
        {
          id: 'customer-messages',
          label: 'Messages',
          path: `${basePath}/customer/messages`,
          roles: [],
          icon: <MessageSquare size={16} strokeWidth={2.5} />
        }
      ]
    }
  ];
}
