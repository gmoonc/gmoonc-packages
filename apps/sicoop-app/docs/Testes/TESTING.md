# 🧪 Documentação de Testes - Sicoop

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Estrutura dos Testes](#estrutura-dos-testes)
4. [Executando Testes](#executando-testes)
5. [Escrevendo Testes](#escrevendo-testes)
6. [Mocks e Utilitários](#mocks-e-utilitários)
7. [Cobertura de Código](#cobertura-de-código)
8. [Boas Práticas](#boas-práticas)
9. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O projeto Sicoop utiliza **Jest** como framework de testes principal, integrado com **Next.js** e **React Testing Library** para testes de componentes. A configuração permite testar componentes React, hooks customizados e funcionalidades da aplicação de forma isolada.

### Tecnologias Utilizadas

- **Jest**: Framework de testes JavaScript
- **React Testing Library**: Biblioteca para testes de componentes React
- **Next.js Jest**: Integração oficial do Next.js com Jest
- **TypeScript**: Suporte completo para TypeScript
- **jsdom**: Ambiente DOM simulado para testes

## ⚙️ Configuração

### Arquivos de Configuração

#### `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### `jest.setup.js`
Arquivo de configuração global que:
- Importa `@testing-library/jest-dom` para matchers customizados
- Configura polyfills para Request/Response do Node.js
- Define mocks globais para Supabase e Next.js
- Configura mocks para componentes e funcionalidades externas

### Dependências de Teste

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.8",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

## 📁 Estrutura dos Testes

### Organização de Arquivos

```
src/
├── __tests__/
│   ├── mocks/
│   │   └── supabase-mock.ts          # Mock avançado do Supabase
│   ├── utils/
│   │   └── test-utils.tsx            # Utilitários de teste
│   └── setup.ts                      # Configuração de testes
├── components/
│   └── __tests__/
│       └── SicoopDashboard.test.tsx  # Testes de componentes
├── hooks/
│   └── __tests__/
│       └── useMensagens.test.ts      # Testes de hooks
└── app/
    └── api/
        └── __tests__/                # Testes de API routes
```

### Convenções de Nomenclatura

- **Arquivos de teste**: `*.test.ts` ou `*.test.tsx`
- **Pasta de testes**: `__tests__/` dentro de cada módulo
- **Mocks**: `*-mock.ts` na pasta `__tests__/mocks/`
- **Utilitários**: `test-utils.tsx` na pasta `__tests__/utils/`

## 🚀 Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar com cobertura de código
npm run test:coverage

# Executar testes em modo CI (sem watch)
npm run test:ci
```

### Modos de Execução

#### 1. Modo Normal (`npm test`)
- Executa todos os testes uma vez
- Mostra resultados detalhados
- Útil para verificação rápida

#### 2. Modo Watch (`npm run test:watch`)
- Monitora mudanças nos arquivos
- Re-executa testes automaticamente
- Ideal para desenvolvimento

#### 3. Modo Coverage (`npm run test:coverage`)
- Gera relatório de cobertura de código
- Mostra estatísticas detalhadas
- Identifica código não testado

#### 4. Modo CI (`npm run test:ci`)
- Execução única sem watch
- Otimizado para pipelines de CI/CD
- Inclui cobertura de código

## ✍️ Escrevendo Testes

### Estrutura Básica de um Teste

```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  beforeEach(() => {
    // Configuração antes de cada teste
    jest.clearAllMocks()
  })

  it('deve renderizar corretamente', () => {
    render(<ComponentName />)
    
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })

  it('deve executar ação específica', () => {
    // Teste de funcionalidade
  })
})
```

### Testando Componentes React

```typescript
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SicoopDashboard from '../SicoopDashboard'

describe('SicoopDashboard', () => {
  it('deve renderizar o dashboard corretamente', () => {
    render(<SicoopDashboard />)
    
    expect(screen.getByText('Sistema de Controle de Operações')).toBeInTheDocument()
    expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument()
  })

  it('deve exibir informações do usuário logado', () => {
    render(<SicoopDashboard />)
    
    expect(screen.getByText(/Usuário Teste/)).toBeInTheDocument()
    expect(screen.getByText('cliente')).toBeInTheDocument()
  })
})
```

### Testando Hooks Customizados

```typescript
import { renderHook } from '@testing-library/react'
import { useMensagens } from '../useMensagens'

describe('useMensagens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve carregar mensagens inicialmente', () => {
    const { result } = renderHook(() => useMensagens())

    expect(result.current.mensagens).toBeDefined()
    expect(Array.isArray(result.current.mensagens)).toBe(true)
    expect(result.current.loading).toBeDefined()
    expect(result.current.error).toBeDefined()
  })

  it('deve ter função createMensagem', () => {
    const { result } = renderHook(() => useMensagens())

    expect(typeof result.current.createMensagem).toBe('function')
  })
})
```

## 🎭 Mocks e Utilitários

### Mock do Supabase

O projeto inclui um mock avançado do Supabase localizado em `src/__tests__/mocks/supabase-mock.ts`:

```typescript
export const createSupabaseMock = (customData = {}) => {
  // Mock configurável do Supabase
  // Inclui simulação de delays de rede
  // Suporte a diferentes cenários de teste
}
```

### Mock Global (jest.setup.js)

```javascript
// Mock do Supabase para testes
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))
```

### Utilitários de Teste

Arquivo `src/__tests__/utils/test-utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { mockAuthContext } from '../setup'

// Wrapper customizado para testes
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider value={mockAuthContext}>
      {children}
    </AuthProvider>
  )
}

// Função de render customizada
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: MockAuthProvider, ...options })

export { customRender as render }
```

## 📊 Cobertura de Código

### Configuração de Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 70,    // 70% de cobertura de branches
    functions: 70,   // 70% de cobertura de funções
    lines: 70,       // 70% de cobertura de linhas
    statements: 70,  // 70% de cobertura de statements
  },
}
```

### Arquivos Incluídos na Cobertura

```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',           // Todos os arquivos fonte
  '!src/**/*.d.ts',                     // Excluir arquivos de tipos
  '!src/**/*.stories.{js,jsx,ts,tsx}',  // Excluir Storybook
  '!src/**/*.index.{js,jsx,ts,tsx}',    // Excluir arquivos index
]
```

### Interpretando o Relatório

```
File                                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------------------|---------|----------|---------|---------|-----------------------------------
src/components/SicoopDashboard.tsx     |   31.57 |     8.82 |   18.18 |   31.57 | 38-106,120,124-156,161,219-236
src/hooks/useMensagens.ts              |   29.26 |    11.53 |   27.27 |   32.43 | 41,46-48,55-91,96-134,139-165,174
```

- **% Stmts**: Porcentagem de statements cobertos
- **% Branch**: Porcentagem de branches cobertos
- **% Funcs**: Porcentagem de funções cobertas
- **% Lines**: Porcentagem de linhas cobertas
- **Uncovered Line #s**: Números das linhas não cobertas

## ✅ Boas Práticas

### 1. Estrutura de Testes

```typescript
describe('NomeDoComponente', () => {
  // Configuração global
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Agrupar testes relacionados
  describe('renderização', () => {
    it('deve renderizar corretamente', () => {
      // Teste de renderização
    })
  })

  describe('interações', () => {
    it('deve responder a cliques', () => {
      // Teste de interação
    })
  })
})
```

### 2. Nomenclatura Descritiva

```typescript
// ✅ Bom
it('deve exibir mensagem de erro quando dados são inválidos', () => {
  // Teste específico e descritivo
})

// ❌ Ruim
it('deve funcionar', () => {
  // Muito genérico
})
```

### 3. Isolamento de Testes

```typescript
beforeEach(() => {
  // Limpar mocks antes de cada teste
  jest.clearAllMocks()
  
  // Resetar estado se necessário
  // Configurar dados de teste
})
```

### 4. Testes de Integração vs Unitários

```typescript
// Teste unitário - testa uma função isolada
it('deve calcular total corretamente', () => {
  const result = calculateTotal([1, 2, 3])
  expect(result).toBe(6)
})

// Teste de integração - testa interação entre componentes
it('deve enviar formulário quando botão é clicado', () => {
  render(<FormComponent />)
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(mockSubmit).toHaveBeenCalled()
})
```

### 5. Mocks Apropriados

```typescript
// Mock apenas o necessário
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
}))

// Evitar mocks excessivos
// Mock apenas dependências externas
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro "Cannot find module '@/lib/supabase'"

**Causa**: Configuração incorreta do `moduleNameMapper`

**Solução**: Verificar se `jest.config.js` tem:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. Warning "An update to Component inside a test was not wrapped in act(...)"

**Causa**: Atualizações de estado assíncronas não envolvidas em `act()`

**Solução**: Usar `act()` para operações assíncronas:
```typescript
import { act } from '@testing-library/react'

await act(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
})
```

#### 3. Timeout em testes

**Causa**: Testes assíncronos sem timeout adequado

**Solução**: Aumentar timeout ou simplificar teste:
```typescript
it('deve carregar dados', async () => {
  // Teste simplificado sem operações assíncronas complexas
}, 10000) // Timeout de 10 segundos
```

#### 4. Mock não funcionando

**Causa**: Mock definido após importação

**Solução**: Definir mock antes da importação:
```typescript
// Mock deve vir antes da importação
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

import { ComponentName } from '../ComponentName'
```

### Debugging de Testes

#### 1. Usar `screen.debug()`

```typescript
it('deve renderizar elemento', () => {
  render(<Component />)
  screen.debug() // Mostra HTML renderizado
  expect(screen.getByText('Texto')).toBeInTheDocument()
})
```

#### 2. Usar `--verbose` para mais detalhes

```bash
npm test -- --verbose
```

#### 3. Executar teste específico

```bash
npm test -- --testNamePattern="deve renderizar"
```

## 📚 Recursos Adicionais

### Documentação Oficial

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

### Comandos Úteis

```bash
# Executar apenas testes que falharam
npm test -- --onlyFailures

# Executar testes em arquivo específico
npm test -- src/components/__tests__/Component.test.tsx

# Executar com relatório detalhado
npm test -- --verbose --coverage

# Limpar cache do Jest
npm test -- --clearCache
```

### Scripts de Package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

---

## 🎯 Conclusão

Esta documentação fornece um guia completo para trabalhar com testes no projeto Sicoop. A configuração atual está otimizada para Next.js + React + TypeScript, com suporte completo para testes de componentes, hooks e integração com Supabase.

Para dúvidas ou melhorias na configuração de testes, consulte a equipe de desenvolvimento ou abra uma issue no repositório do projeto.

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0