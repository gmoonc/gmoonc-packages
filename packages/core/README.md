# @gmoonc/core

Core do Goalmoon Ctrl (gmoonc): tipos e helpers agnósticos para configurar menu e RBAC.

Instalação:
npm i @gmoonc/core

Exemplo:
import { defineConfig } from "@gmoonc/core";

export const config = defineConfig({
  appName: "Meu Dashboard",
  menu: [
    { id: "home", label: "Home", path: "/" },
    { id: "admin", label: "Admin", path: "/admin", roles: ["admin"] }
  ]
});

Site:
https://gmoonc.com

