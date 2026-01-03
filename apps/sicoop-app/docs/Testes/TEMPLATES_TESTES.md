# 🧪 Templates de Testes - Sicoop

## 📋 Visão Geral

Este documento contém templates reutilizáveis para criar testes no projeto Sicoop, baseados nos padrões que já funcionaram na Fase 1. Use estes templates para acelerar o desenvolvimento de novos testes.

## 🎯 Templates Disponíveis

### 1. Template para Hooks Customizados

**Arquivo**: `src/hooks/__tests__/[HookName].test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { [HookName] } from '../[HookName]';

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    loading: false,
  }),
}));

// Mock de outros hooks se necessário
jest.mock('../../hooks/[OtherHook]', () => ({
  [OtherHook]: () => ({
    // Propriedades mockadas
  }),
}));

describe('[HookName]', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do Supabase para retornar dados válidos
    if (global.mockSupabase) {
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: '1', nome: 'Teste', email: 'test@test.com' },
          error: null
        }),
      });
    }
  });

  it('deve carregar dados inicialmente', () => {
    const { result } = renderHook(() => [HookName]());

    // Verificar se o hook retorna as propriedades esperadas
    expect(result.current.[property1]).toBeDefined();
    expect(result.current.[property2]).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it('deve ter função [function1]', () => {
    const { result } = renderHook(() => [HookName]());

    expect(typeof result.current.[function1]).toBe('function');
  });

  it('deve ter função [function2]', () => {
    const { result } = renderHook(() => [HookName]());

    expect(typeof result.current.[function2]).toBe('function');
  });

  // Adicionar mais testes conforme necessário
});
```

### 2. Template para Componentes React

**Arquivo**: `src/components/__tests__/[ComponentName].test.tsx`

```typescript
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import [ComponentName] from '../[ComponentName]';

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    loading: false,
    logout: jest.fn(),
  }),
}));

// Mock de hooks customizados se necessário
jest.mock('../../hooks/[HookName]', () => ({
  [HookName]: () => ({
    hasPermission: jest.fn(() => true),
    checkPermission: jest.fn(),
    userPermissions: [],
    loading: false,
  }),
}));

describe('[ComponentName]', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do Supabase para retornar dados válidos
    if (global.mockSupabase) {
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
      });
    }
  });

  it('deve renderizar o componente corretamente', async () => {
    await act(async () => {
      render(<[ComponentName] />);
    });
    
    expect(screen.getByText('[Expected Text]')).toBeInTheDocument();
  });

  it('deve exibir informações do usuário logado', async () => {
    await act(async () => {
      render(<[ComponentName] />);
    });
    
    expect(screen.getByText(/Usuário Teste/)).toBeInTheDocument();
    expect(screen.getByText('cliente')).toBeInTheDocument();
  });

  it('deve responder a interações do usuário', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<[ComponentName] />);
    });
    
    const button = screen.getByText('[Button Text]');
    await user.click(button);
    
    // Verificar comportamento esperado
    expect(screen.getByText('[Expected Result]')).toBeInTheDocument();
  });
});
```

### 3. Template para Contextos

**Arquivo**: `src/contexts/__tests__/[ContextName].test.tsx`

```typescript
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [ContextProvider], [useContext] } from '../[ContextName]';

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Componente de teste para usar o contexto
const TestComponent = () => {
  const context = [useContext]();
  return (
    <div>
      <div data-testid="property1">{context.[property1] ? context.[property1] : 'null'}</div>
      <div data-testid="property2">{context.[property2] ? 'true' : 'false'}</div>
      <div data-testid="property3">{context.[property3] || 'null'}</div>
      <button onClick={() => context.[function1]('[param1]', '[param2]')}>[Function1]</button>
      <button onClick={() => context.[function2]()}>[Function2]</button>
    </div>
  );
};

// Componente que testa o erro quando usado fora do provider
const TestComponentWithoutProvider = () => {
  [useContext]();
  return <div>Should not render</div>;
};

describe('[ContextName]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do Supabase
    if (global.mockSupabase) {
      global.mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      global.mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });
      
      global.mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });
      
      global.mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });
      
      global.mockSupabase.auth.resend.mockResolvedValue({
        error: null
      });
      
      global.mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });
      
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
      });
    }
  });

  describe('Provider e Hook', () => {
    it('deve renderizar o provider sem erros', () => {
      render(
        <[ContextProvider]>
          <TestComponent />
        </[ContextProvider]>
      );
      
      expect(screen.getByTestId('property1')).toBeInTheDocument();
      expect(screen.getByTestId('property2')).toBeInTheDocument();
      expect(screen.getByTestId('property3')).toBeInTheDocument();
    });

    it('deve lançar erro quando [useContext] é usado fora do provider', () => {
      // Suprimir console.error para este teste específico
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('[useContext] must be used within an [ContextProvider]');
      
      console.error = originalError;
    });
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      render(
        <[ContextProvider]>
          <TestComponent />
        </[ContextProvider]>
      );
      
      expect(screen.getByTestId('property1')).toHaveTextContent('null');
      expect(screen.getByTestId('property2')).toHaveTextContent('false');
      expect(screen.getByTestId('property3')).toHaveTextContent('null');
    });
  });

  describe('Funções do Contexto', () => {
    it('deve ter função [function1] disponível', () => {
      render(
        <[ContextProvider]>
          <TestComponent />
        </[ContextProvider]>
      );
      
      expect(screen.getByText('[Function1]')).toBeInTheDocument();
    });

    it('deve chamar [function1] quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <[ContextProvider]>
          <TestComponent />
        </[ContextProvider]>
      );
      
      const button = screen.getByText('[Function1]');
      await user.click(button);
      
      expect(global.mockSupabase.auth.[expectedMethod]).toHaveBeenCalledWith({
        // Parâmetros esperados
      });
    });
  });
});
```

### 4. Template para API Routes

**Arquivo**: `src/app/api/[route]/__tests__/route.test.ts`

```typescript
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../route';

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

describe('/api/[route]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar dados válidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/[route]');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      // Mock para usuário não autenticado
      global.mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/[route]');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('deve criar novo item', async () => {
      const request = new NextRequest('http://localhost:3000/api/[route]', {
        method: 'POST',
        body: JSON.stringify({
          // Dados de teste
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(201);
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/[route]', {
        method: 'POST',
        body: JSON.stringify({
          // Dados inválidos
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });
});
```

## 🔧 Configurações Padrão

### Mocks Globais (jest.setup.js)

```javascript
// Mock do Supabase para testes
const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: null,
      error: null
    }),
  })),
  rpc: jest.fn().mockResolvedValue({
    data: null,
    error: null
  }),
}

// Mock das APIs
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    data: [],
    error: null
  }),
  ok: true,
  status: 200
})

// Suprimir warnings do act()
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
```

## 📝 Checklist de Implementação

### Antes de Criar um Novo Teste

- [ ] Escolher o template apropriado
- [ ] Substituir placeholders `[Nome]` pelos valores reais
- [ ] Verificar dependências (hooks, contextos, APIs)
- [ ] Configurar mocks específicos se necessário
- [ ] Definir dados de teste realistas

### Durante a Implementação

- [ ] Seguir padrão de nomenclatura: `[ComponentName].test.tsx`
- [ ] Usar `beforeEach` para limpar mocks
- [ ] Envolver renderizações em `act()` quando necessário
- [ ] Testar cenários de sucesso e erro
- [ ] Verificar interações do usuário

### Após Implementação

- [ ] Executar `npm test` para verificar
- [ ] Verificar cobertura com `npm run test:coverage`
- [ ] Atualizar mapeamento de testes
- [ ] Documentar no README se necessário

## 🎯 Padrões de Nomenclatura

### Arquivos de Teste
- **Hooks**: `use[Name].test.ts`
- **Componentes**: `[ComponentName].test.tsx`
- **Contextos**: `[ContextName].test.tsx`
- **APIs**: `route.test.ts`

### Estrutura de Testes
- **describe**: Nome do componente/hook/contexto
- **it**: Descrição do comportamento testado
- **beforeEach**: Configuração comum
- **afterEach**: Limpeza se necessário

### Dados de Teste
- **Usuário padrão**: `test-user-1`, `test@example.com`, `Usuário Teste`, `cliente`
- **IDs de teste**: `test-id-1`, `test-id-2`, etc.
- **Dados mock**: Sempre incluir `id`, `email`, `name` quando relevante

## 🚀 Exemplo de Uso

Para criar um teste para o hook `useAnalises`:

1. Copie o template de hooks
2. Substitua `[HookName]` por `useAnalises`
3. Substitua `[property1]` por `analises`
4. Substitua `[function1]` por `createAnalise`
5. Ajuste os mocks específicos se necessário
6. Execute `npm test` para verificar

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Baseado em**: Testes funcionais da Fase 1
