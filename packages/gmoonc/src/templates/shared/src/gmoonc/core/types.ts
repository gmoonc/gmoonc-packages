export type Role = string;

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  roles?: Role[];
};

export type GmooncConfig = {
  appName: string;
  menu: MenuItem[];
};

export function defineConfig(config: GmooncConfig): GmooncConfig {
  return config;
}
