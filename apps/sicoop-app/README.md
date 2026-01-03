# Sicoop - Sistema de Controle de Operações da Goalmoon

## Descrição

Sicoop é o sistema de controle de operações da Goalmoon, desenvolvido com tecnologias modernas para oferecer uma interface elegante e funcional. O sistema mantém a estrutura modular original com uma identidade visual sofisticada e profissional.

## Características

- **Menu Lateral Moderno**: Menu responsivo com submenus expansíveis
- **Dashboard Responsivo**: Layout adaptável para diferentes tamanhos de tela
- **Design Atualizado**: Interface moderna com a identidade visual da Goalmoon
- **Componentes Reutilizáveis**: Estrutura modular para fácil manutenção
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Tailwind CSS**: Framework CSS utilitário para estilos consistentes
- **Identidade Visual Goalmoon**: Cores e tipografia da marca aplicadas consistentemente

## Identidade Visual

O sistema utiliza a identidade visual da Goalmoon com:

- **Cores Primárias**: Tons de azul profundo (#374161, #293047, #6374AD, #879FED, #3F4A6E)
- **Cores Secundárias**: Verde menta (#71b399) e tons neutros (#dbe2ea, #eaf0f5)
- **Tipografia**: Montserrat Bold para títulos e Montserrat Regular para corpo do texto
- **Estilo**: Visual sofisticado, moderno e profissional

## Estrutura do Sistema

### Módulos Principais

1. **Administrativo**
   - Usuários
   - Permissões
   - Autorizações

2. **Financeiro**
   - Câmbios
   - Clientes
   - Contas
   - Localidades
   - Moedas
   - Pessoas
   - Telefones

3. **Help-Desk**
   - Ocorrências
   - Problemas

4. **Secretaria**
   - Localidades
   - Pessoas
   - Telefones
   - E-mails
   - Clientes
   - Contas
   - Notificações

5. **Técnico**
   - Projetos
   - Manutenções
   - Equipamentos

6. **Vendas**
   - Propostas
   - Contratos
   - Clientes

7. **Cliente**
   - Análises
   - Mensagens

## Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca para interfaces de usuário
- **TypeScript**: Superset JavaScript com tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Supabase**: Backend-as-a-Service para banco de dados e autenticação
- **Jest**: Framework de testes unitários
- **Testing Library**: Utilitários para testes de componentes React
- **ESLint**: Linter para qualidade de código

## Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd sicoop
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto em desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp env.example .env
   
   # Edite o arquivo .env com suas configurações
   # Especialmente as configurações do banco de dados para backup
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

### Scripts Disponíveis

#### **Desenvolvimento**
- `npm run dev`: Executa o servidor de desenvolvimento
- `npm run build`: Constrói a aplicação para produção
- `npm run start`: Executa a aplicação em produção
- `npm run lint`: Executa o linter ESLint

#### **Testes**
- `npm test`: Executa todos os testes
- `npm run test:watch`: Executa testes em modo watch
- `npm run test:coverage`: Executa testes com cobertura
- `npm run test:ci`: Executa testes para CI/CD

#### **Banco de Dados**

**Backup:**
- `npm run db:backup-schema`: Backup da estrutura do banco (Supabase CLI)
- `npm run db:backup-data`: Backup com dados públicos (Supabase CLI)
- `npm run db:backup-full`: Backup completo (Supabase CLI)
- `npm run db:backup-pg-schema`: Backup da estrutura (PostgreSQL direto)
- `npm run db:backup-pg-data`: Backup com dados (PostgreSQL direto)
- `npm run db:backup-pg-full`: Backup completo (PostgreSQL direto)

**Restauração:**
- `npm run db:restore`: Restaurar backup (foto completa do banco)
- `npm run db:list-backups`: Listar todos os backups

**Gerenciamento:**
- `npm run db:list-backups`: Listar todos os backups (checkpoints + automáticos + full)
- `npm run db:create-checkpoint`: Criar checkpoint manual
- `npm run db:test-connection`: Testar conexão com banco
- `npm run db:analyze-backup`: Analisar conteúdo de um backup
- `npm run db:cleanup`: Limpar backups antigos
- `npm run db:stats`: Ver estatísticas dos backups

## Estrutura de Arquivos

```
sicoop/
├── src/
│   ├── app/                     # Páginas Next.js
│   │   ├── globals.css          # Estilos globais
│   │   ├── layout.tsx           # Layout principal
│   │   └── page.tsx             # Página inicial
│   ├── components/              # Componentes React
│   ├── contexts/                # Contextos React
│   ├── hooks/                   # Hooks customizados
│   ├── lib/                     # Utilitários e configurações
│   ├── types/                   # Definições TypeScript
│   └── __tests__/               # Testes unitários
├── supabase/                    # Configuração do Supabase
│   ├── migrations/              # Migrações do banco
│   └── config.toml              # Configuração local
├── database-backups/            # Sistema de backup portável
│   ├── scripts/                # Scripts de backup e restauração
│   ├── docs/                   # Documentação do sistema
│   ├── checkpoints/            # Checkpoints nomeados
│   ├── schemas/                # Backups automáticos de schema
│   └── full/                   # Backups completos
├── public/                      # Arquivos estáticos
├── tailwind.config.js           # Configuração do Tailwind
├── jest.config.js               # Configuração do Jest
├── package.json                 # Dependências e scripts
├── TESTING.md                   # Guia de testes
└── README.md                    # Este arquivo
```

## Personalização

### Adicionando Novos Módulos

Para adicionar novos módulos ao sistema:

1. Edite o arquivo `src/components/SicoopMenu.tsx`
2. Adicione o novo módulo ao array `menuData`
3. Crie as páginas correspondentes em `src/app/`
4. Atualize os estilos se necessário

### Modificando Estilos

Os estilos estão centralizados em `src/app/globals.css` e seguem a estrutura:

- `.sicoop-menu`: Estilos do menu lateral
- `.sicoop-dashboard`: Estilos do dashboard principal
- Classes responsivas para diferentes tamanhos de tela

## Funcionalidades do Dashboard

- **Menu Lateral**: Menu colapsável com submenus
- **Painel Principal**: Área de conteúdo dinâmica
- **Navegação**: Sistema de roteamento entre módulos
- **Responsividade**: Adaptação automática para dispositivos móveis

## Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet e mobile
- **Resoluções**: Responsivo para todas as resoluções comuns

## Documentação

- **[Sistema de Backup](database-backups/docs/BACKUP_SYSTEM.md)**: Guia completo do sistema de backup local
- **[Guia de Instalação](database-backups/docs/install.md)**: Como instalar o sistema de backup em novos projetos
- **[Guia de Testes](TESTING.md)**: Como executar e escrever testes unitários
- **[Sistema Portável](database-backups/README.md)**: Como usar o sistema de backup em outros projetos

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Execute os testes: `npm test`
5. Execute o linting: `npm run lint`
6. Crie backup antes de mudanças no banco: `npm run db:create-checkpoint`
7. Faça um pull request

## Licença

Este projeto é o sistema Sicoop da Goalmoon e pode ser usado livremente para fins de aprendizado e desenvolvimento.

## Histórico

- **Versão 1.0**: Sistema inicial baseado no sistema SICOP original
- **Baseado em**: Sistema Java com applets convertido para JavaScript moderno
- **Objetivo**: Criar um sistema reutilizável para sistemas similares

## Suporte

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
