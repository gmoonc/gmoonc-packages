import { defineConfig } from '@gmoonc/core';
import { createDefaultMenu } from '../app/menu/defaultMenu';

/**
 * Default configuration for the gmoonc app kit.
 * Uses the default menu from the app/menu module.
 */
export const defaultConfig = defineConfig({
  appName: 'Goalmoon Ctrl',
  menu: createDefaultMenu('/app')
});
