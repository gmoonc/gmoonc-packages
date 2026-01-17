import type { MenuItem } from './types';

export interface MenuItemWithSubmenu extends MenuItem {
  submenu?: MenuItemWithSubmenu[];
}
