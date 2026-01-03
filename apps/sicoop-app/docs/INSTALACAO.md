# Guia de Instalação - Sicoop da Goalmoon

## 🚀 Instalação Rápida

### 1. Pré-requisitos
- **Node.js** versão 18 ou superior
- **npm** ou **yarn** como gerenciador de pacotes
- **Git** para clonar o repositório

### 2. Clonar o Projeto
```bash
git clone <url-do-repositorio>
cd sicoop
```

### 3. Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 4. Executar o Projeto
```bash
npm run dev
# ou
yarn dev
```

### 5. Acessar a Aplicação
Abra seu navegador e acesse: `http://localhost:3000`

## 🔧 Configuração

### Personalizar o Sistema

1. **Editar Configurações Básicas**
   - Abra o arquivo `sicoop.config.js`
   - Modifique as configurações do sistema conforme necessário

2. **Personalizar Cores e Tema**
   - No arquivo `sicoop.config.js`, edite a seção `theme.colors`
   - As mudanças serão aplicadas automaticamente

3. **Adicionar/Remover Módulos**
   - No arquivo `sicoop.config.js`, edite a seção `modules`
   - Defina `enabled: false` para desabilitar módulos

### Estrutura de Arquivos Importantes

```
sicoop/
├── src/
│   ├── components/
│   │   ├── SicoopMenu.tsx        # Menu principal
│   │   └── SicoopDashboard.tsx   # Dashboard principal
│   └── app/
│       ├── globals.css          # Estilos globais com identidade Goalmoon
│       └── page.tsx             # Página inicial
├── public/
│   └── logo.png                 # Logo da Goalmoon
├── tailwind.config.js           # Configuração do Tailwind com cores Goalmoon
├── sicoop.config.js              # Configurações do sistema
└── README.md                    # Documentação completa
```

## 🎨 Personalização Avançada

### Modificar Estilos

1. **Editar CSS Global**
   - Abra `src/app/globals.css`
   - Modifique as classes CSS conforme necessário

2. **Adicionar Novos Estilos**
   - Crie novas classes CSS no arquivo `globals.css`
   - Use as variáveis CSS definidas para manter consistência

### Adicionar Novos Módulos

1. **Editar o Menu**
   - Abra `src/components/SicoopMenu.tsx`
   - Adicione novos itens ao array `menuData`

2. **Criar Páginas**
   - Crie novas páginas em `src/app/`
   - Configure as rotas conforme necessário

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta automaticamente a:

- **Desktop**: Menu lateral fixo
- **Tablet**: Menu colapsável
- **Mobile**: Menu em tela cheia

## 🚀 Deploy

### Deploy na Vercel (Recomendado)

1. **Conectar com GitHub**
   - Faça push do código para o GitHub
   - Conecte o repositório na Vercel

2. **Configurar Build**
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Deploy Automático**
   - A cada push para a branch principal, o deploy será automático

### Deploy Manual

1. **Build da Aplicação**
   ```bash
   npm run build
   ```

2. **Executar em Produção**
   ```bash
   npm run start
   ```

## 🔍 Solução de Problemas

### Erros Comuns

1. **Porta 3000 em uso**
   ```bash
   # Use uma porta diferente
   npm run dev -- -p 3001
   ```

2. **Dependências não instaladas**
   ```bash
   # Remova node_modules e reinstale
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Erro de TypeScript**
   ```bash
   # Verifique se todas as dependências estão instaladas
   npm install @types/node @types/react @types/react-dom
   ```

### Verificar Status

1. **Linter**
   ```bash
   npm run lint
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **TypeScript**
   ```bash
   npx tsc --noEmit
   ```

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. **Personalizar o Sistema**
   - Edite `sicoop.config.js` para suas necessidades
   - Modifique cores e temas

2. **Adicionar Funcionalidades**
   - Crie novos módulos
   - Implemente autenticação
   - Adicione banco de dados

3. **Deploy**
   - Configure CI/CD
   - Deploy em produção

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique a documentação** no `README.md`
2. **Consulte os logs** do terminal
3. **Abra uma issue** no repositório
4. **Entre em contato** com a equipe de desenvolvimento

---

**Sicoop** - Transformando sistemas legados em aplicações modernas! 🚀
