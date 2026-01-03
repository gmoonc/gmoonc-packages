# ⚡ Guia Rápido de Testes - Sicoop

## 🚀 Comandos Essenciais

```bash
# Executar todos os testes
npm test

# Modo desenvolvimento (watch)
npm run test:watch

# Com cobertura de código
npm run test:coverage

# Modo CI/CD
npm run test:ci
```

## 📁 Estrutura de Arquivos

```
src/
├── __tests__/
│   ├── mocks/supabase-mock.ts     # Mock do Supabase
│   └── utils/test-utils.tsx       # Utilitários de teste
├── components/__tests__/           # Testes de componentes
├── hooks/__tests__/               # Testes de hooks
└── app/api/__tests__/             # Testes de API routes
```

## 🧩 Templates de Teste

### Componente React
```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import ComponentName from '../ComponentName'

describe('ComponentName', () => {
  it('deve renderizar corretamente', () => {
    render(<ComponentName />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })
})
```

### Hook Customizado
```typescript
import { renderHook } from '@testing-library/react'
import { useHookName } from '../useHookName'

describe('useHookName', () => {
  it('deve retornar estado inicial', () => {
    const { result } = renderHook(() => useHookName())
    expect(result.current.value).toBeDefined()
  })
})
```

### API Route
```typescript
import { NextRequest } from 'next/server'
import { GET } from '../route'

describe('/api/endpoint', () => {
  it('deve retornar dados', async () => {
    const request = new NextRequest('http://localhost:3000/api/endpoint')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

## 🎭 Mocks Comuns

### Supabase
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
}))
```

### Contexto de Autenticação
```typescript
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    loading: false,
  }),
}))
```

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))
```

## 🔍 Matchers Úteis

```typescript
// Elementos
expect(screen.getByText('Texto')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeInTheDocument()
expect(screen.getByLabelText('Label')).toBeInTheDocument()

// Estados
expect(element).toHaveClass('classe-css')
expect(element).toBeDisabled()
expect(element).toBeRequired()

// Funções
expect(mockFunction).toHaveBeenCalled()
expect(mockFunction).toHaveBeenCalledWith('arg')
expect(mockFunction).toHaveBeenCalledTimes(2)
```

## ⚠️ Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| `Cannot find module '@/lib/supabase'` | Verificar `moduleNameMapper` no `jest.config.js` |
| `Warning: act(...)` | Usar `act()` para operações assíncronas |
| Timeout em testes | Simplificar teste ou aumentar timeout |
| Mock não funciona | Definir mock antes da importação |

## 📊 Cobertura Atual

- **Statements**: 5.82% (meta: 70%)
- **Branches**: 1.83% (meta: 70%)
- **Functions**: 3.18% (meta: 70%)
- **Lines**: 6.1% (meta: 70%)

## 🎯 Próximos Passos

1. **Adicionar testes** para componentes existentes
2. **Testar hooks** adicionais (`useAnalises`, `usePermissions`)
3. **Implementar testes** de integração
4. **Configurar testes** de acessibilidade

---

**Para documentação completa**: [TESTING.md](./TESTING.md)  
**Para exemplos práticos**: [EXEMPLOS_TESTES.md](./EXEMPLOS_TESTES.md)
