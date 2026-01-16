# @gmoonc/cli

CLI do Goalmoon Ctrl (gmoonc): instalador e configurador.

## Instalação

```bash
npm install -g @gmoonc/cli
```

Ou use via npx (recomendado):

```bash
npx @gmoonc/cli add
```

## Uso

### Comando `add`

Instala e configura `@gmoonc/core` e `@gmoonc/ui` no projeto atual:

```bash
npx @gmoonc/cli add
```

Ou com confirmação automática:

```bash
npx @gmoonc/cli add --yes
```

O comando `add` faz:

1. **Detecta o projeto**: Verifica se existe `package.json` e identifica o gerenciador de pacotes (npm/pnpm/yarn)
2. **Instala dependências**: Adiciona `@gmoonc/core@^0.0.1` e `@gmoonc/ui@^0.0.1`
3. **Encontra o entrypoint**: Procura por `src/main.tsx`, `src/main.jsx`, `src/main.ts` ou `src/main.js`
4. **Adiciona CSS**: Insere `import "@gmoonc/ui/styles.css";` no entrypoint
5. **Cria arquivos padrão**:
   - `src/gmoonc/config.ts` - Configuração do gmoonc
   - `src/gmoonc/AdminShell.tsx` - Componente AdminShell pronto para uso

### Comando `scaffold`

Scaffold completo com rotas, páginas e integração automática no router:

```bash
npx @gmoonc/cli scaffold
```

Ou com opções:

```bash
npx @gmoonc/cli scaffold --yes --base /app
```

O comando `scaffold` faz:

1. **Executa `add` internamente**: Instala dependências e configuração básica
2. **Instala react-router-dom**: Adiciona se não existir
3. **Cria estrutura completa**:
   - `src/gmoonc/config.ts` - Configuração completa com menu
   - `src/gmoonc/GMooncAppLayout.tsx` - Layout principal com shell
   - `src/gmoonc/routes.tsx` - Função `createGmooncRoutes()` para integração
   - `src/gmoonc/pages/auth/*` - Páginas de autenticação (stubs)
   - `src/gmoonc/pages/app/*` - Páginas do dashboard (stubs)
4. **Integra automaticamente no router**: Detecta `createBrowserRouter` e integra as rotas
5. **Pronto para uso**: Após o scaffold, abra `/app` e `/login` no navegador

**Nota**: O scaffold funciona melhor com projetos React Router based. Se usar outro padrão, o CLI criará todos os arquivos e fornecerá instruções para integração manual.

**⚠️ Transitional/Experimental**: O comando `scaffold` atual cria rotas e estrutura diretamente no projeto consumidor. Esta é uma versão transitional/experimental. A versão recomendada com "dashboard completo com páginas reais" será entregue via `@gmoonc/app`, e o scaffold migrará para usar esse pacote no futuro.

### Segurança

- Arquivos existentes são automaticamente copiados para backup antes de serem modificados
- O formato do backup é: `arquivo.gmoonc.bak-YYYYMMDDTHHMMSS.ext`
- Se o import do CSS já existir, não será duplicado

## Requisitos

- Node.js 18+
- Projeto React existente com `package.json`
- Entrypoint em `src/main.*` (tsx, jsx, ts ou js)

## Site

https://gmoonc.com
