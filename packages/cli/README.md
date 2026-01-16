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
