# @gmoonc/ui

UI do Goalmoon Ctrl (gmoonc): shell e menu plugáveis para dashboards (React puro, SSR-safe).

## Instalação

```bash
npm i @gmoonc/ui
```

## Uso Básico

```tsx
import { defineConfig } from '@gmoonc/core';
import { GmooncShell } from '@gmoonc/ui';
import '@gmoonc/ui/styles.css';

const config = defineConfig({
  appName: 'Meu Dashboard',
  menu: [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'admin', label: 'Admin', path: '/admin', roles: ['admin'] }
  ]
});

function App() {
  return (
    <GmooncShell
      config={config}
      roles={['admin']}
      activePath="/"
      onNavigate={(path) => {
        // Sua lógica de navegação aqui
        console.log('Navegar para:', path);
      }}
    >
      <div>Conteúdo do dashboard</div>
    </GmooncShell>
  );
}
```

## Integração com Navegação

O `@gmoonc/ui` é framework-agnostic e não depende de nenhum sistema de roteamento específico. Você pode integrá-lo com qualquer framework usando as props `onNavigate` e/ou `renderLink`.

### Usando `onNavigate`

```tsx
<GmooncShell
  config={config}
  onNavigate={(path) => {
    // Next.js
    router.push(path);
    
    // React Router
    navigate(path);
    
    // Outro sistema
    window.location.href = path;
  }}
/>
```

### Usando `renderLink`

Para controle total sobre como os links são renderizados:

```tsx
<GmooncShell
  config={config}
  renderLink={({ path, label, isActive, onClick }) => {
    // Next.js
    return (
      <Link href={path} onClick={onClick} className={isActive ? 'active' : ''}>
        {label}
      </Link>
    );
    
    // React Router
    return (
      <NavLink to={path} onClick={onClick} className={isActive ? 'active' : ''}>
        {label}
      </NavLink>
    );
  }}
/>
```

## CSS

Importe o CSS do pacote:

```tsx
import "@gmoonc/ui/styles.css";
```

## Componentes

### GmooncShell

Componente principal que combina header, sidebar e menu.

**Props:**
- `config: GmooncConfig` - Configuração do app (de `@gmoonc/core`)
- `roles?: string[]` - Roles do usuário atual para filtrar menu
- `activePath?: string` - Caminho ativo para destacar item do menu
- `onNavigate?: (path: string) => void` - Callback quando usuário clica em item
- `renderLink?: (args) => React.ReactNode` - Função para renderizar links customizados
- `children?: React.ReactNode` - Conteúdo principal
- `headerRight?: React.ReactNode` - Conteúdo do lado direito do header
- `logoUrl?: string` - URL da logo
- `logoAlt?: string` - Texto alternativo da logo
- `titleMobile?: string` - Título para mobile

### GmooncMenu

Componente de menu standalone.

### GmooncHeader

Componente de header standalone.

### GmooncSidebar

Componente de sidebar standalone.

## SSR Safety

Todos os componentes são SSR-safe e não acessam APIs do browser no top-level. Qualquer acesso a `window` ou `document` é feito dentro de `useEffect` com checagens apropriadas.

## Framework Agnostic

O pacote não depende de:
- Next.js
- React Router
- Expo
- Qualquer outro framework específico

É React puro e funciona em qualquer ambiente React (incluindo SSR).

## Site

https://gmoonc.com
