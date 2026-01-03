# Goalmoon Ctrl (gmoonc)

Goalmoon Ctrl é um kit plugável para construir dashboards com autenticação e RBAC, compatível com Next e Vite.

## Links
- Site: https://gmoonc.com
- GitHub: https://github.com/gmoonc/gmoonc-packages
- NPM: https://www.npmjs.com/package/gmoonc

## Pacotes
- **@gmoonc/core**: tipos e helpers agnósticos (configuração de menu e RBAC)
- **gmoonc**: meta package (aponta para os pacotes @gmoonc/*)

## Instalação
```bash
npm i @gmoonc/core
```

## Exemplo mínimo
```typescript
import { defineConfig } from "@gmoonc/core";

export const config = defineConfig({
  appName: "Meu Dashboard",
  menu: [
    { id: "home", label: "Home", path: "/" },
    { id: "admin", label: "Admin", path: "/admin", roles: ["admin"] }
  ]
});
```

## Desenvolvimento (monorepo)
- Apps ficam em `apps/`
- Pacotes NPM ficam em `packages/`
- Rodar o app legado (workspace):
  ```bash
  npm run dev
  ```

## Licença
MIT

