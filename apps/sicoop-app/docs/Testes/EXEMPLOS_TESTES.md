# 📝 Exemplos Práticos de Testes - Sicoop

## 📋 Índice

1. [Exemplos de Testes de Componentes](#exemplos-de-testes-de-componentes)
2. [Exemplos de Testes de Hooks](#exemplos-de-testes-de-hooks)
3. [Exemplos de Testes de Contextos](#exemplos-de-testes-de-contextos)
4. [Exemplos de Testes de Utilitários](#exemplos-de-testes-de-utilitários)
5. [Exemplos de Testes de API Routes](#exemplos-de-testes-de-api-routes)
6. [Cenários de Teste Avançados](#cenários-de-teste-avançados)

## 🧩 Exemplos de Testes de Componentes

### 1. Teste Básico de Renderização

```typescript
// src/components/__tests__/SicoopAbout.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import SicoopAbout from '../SicoopAbout'

describe('SicoopAbout', () => {
  it('deve renderizar informações sobre o sistema', () => {
    render(<SicoopAbout />)
    
    expect(screen.getByText('Sicoop')).toBeInTheDocument()
    expect(screen.getByText('Sistema de Controle de Operações')).toBeInTheDocument()
  })
})
```

### 2. Teste de Interações do Usuário

```typescript
// src/components/__tests__/MensagemForm.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MensagemForm from '../MensagemForm'

describe('MensagemForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('deve permitir preenchimento do formulário', async () => {
    const user = userEvent.setup()
    render(<MensagemForm onSubmit={mockOnSubmit} />)

    // Preencher campos
    await user.type(screen.getByLabelText(/nome/i), 'João Silva')
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com')
    await user.type(screen.getByLabelText(/mensagem/i), 'Mensagem de teste')

    // Verificar se os valores foram preenchidos
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mensagem de teste')).toBeInTheDocument()
  })

  it('deve chamar onSubmit quando formulário é enviado', async () => {
    const user = userEvent.setup()
    render(<MensagemForm onSubmit={mockOnSubmit} />)

    // Preencher e enviar formulário
    await user.type(screen.getByLabelText(/nome/i), 'João Silva')
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com')
    await user.type(screen.getByLabelText(/mensagem/i), 'Mensagem de teste')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    // Verificar se onSubmit foi chamado
    expect(mockOnSubmit).toHaveBeenCalledWith({
      nome: 'João Silva',
      email: 'joao@email.com',
      mensagem: 'Mensagem de teste'
    })
  })

  it('deve mostrar erro quando campos obrigatórios estão vazios', async () => {
    const user = userEvent.setup()
    render(<MensagemForm onSubmit={mockOnSubmit} />)

    // Tentar enviar formulário vazio
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    // Verificar mensagens de erro
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/mensagem é obrigatória/i)).toBeInTheDocument()
  })
})
```

### 3. Teste com Mocks de Contexto

```typescript
// src/components/__tests__/UserProfile.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import UserProfile from '../UserProfile'

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'usuario@teste.com',
      name: 'Usuário Teste',
      role: 'cliente'
    },
    loading: false
  })
}))

describe('UserProfile', () => {
  it('deve exibir informações do usuário logado', () => {
    render(<UserProfile />)
    
    expect(screen.getByText('Usuário Teste')).toBeInTheDocument()
    expect(screen.getByText('usuario@teste.com')).toBeInTheDocument()
    expect(screen.getByText('cliente')).toBeInTheDocument()
  })

  it('deve mostrar loading quando usuário está carregando', () => {
    // Mock com loading = true
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        loading: true
      })
    }))

    render(<UserProfile />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
```

## 🎣 Exemplos de Testes de Hooks

### 1. Teste de Hook Simples

```typescript
// src/hooks/__tests__/useAnalises.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAnalises } from '../useAnalises'

describe('useAnalises', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() => useAnalises())

    expect(result.current.analises).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deve carregar análises', async () => {
    const { result } = renderHook(() => useAnalises())

    await act(async () => {
      await result.current.fetchAnalises()
    })

    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.analises)).toBe(true)
  })

  it('deve criar nova análise', async () => {
    const { result } = renderHook(() => useAnalises())
    const novaAnalise = {
      titulo: 'Nova Análise',
      descricao: 'Descrição da análise',
      tipo: 'técnica'
    }

    await act(async () => {
      const analise = await result.current.createAnalise(novaAnalise)
      expect(analise).toBeDefined()
    })
  })
})
```

### 2. Teste de Hook com Dependências

```typescript
// src/hooks/__tests__/usePermissions.test.ts
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../usePermissions'

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      role: 'admin'
    }
  })
}))

describe('usePermissions', () => {
  it('deve retornar permissões corretas para admin', () => {
    const { result } = renderHook(() => usePermissions())

    expect(result.current.canManageUsers).toBe(true)
    expect(result.current.canViewAnalises).toBe(true)
    expect(result.current.canEditMensagens).toBe(true)
  })

  it('deve retornar permissões limitadas para cliente', () => {
    // Mock com role de cliente
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: {
          id: 'user-123',
          role: 'cliente'
        }
      })
    }))

    const { result } = renderHook(() => usePermissions())

    expect(result.current.canManageUsers).toBe(false)
    expect(result.current.canViewAnalises).toBe(true)
    expect(result.current.canEditMensagens).toBe(false)
  })
})
```

## 🏗️ Exemplos de Testes de Contextos

### 1. Teste de AuthContext

```typescript
// src/contexts/__tests__/AuthContext.test.tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Componente de teste que usa o contexto
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth()
  
  if (loading) return <div>Carregando...</div>
  if (!user) return <div>Não logado</div>
  
  return (
    <div>
      <div>Usuário: {user.name}</div>
      <button onClick={logout}>Sair</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('deve fornecer contexto de autenticação', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve permitir login de usuário', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simular login
    await act(async () => {
      // Lógica de login seria testada aqui
    })

    // Verificar se usuário foi logado
    // expect(screen.getByText(/Usuário:/)).toBeInTheDocument()
  })
})
```

## 🛠️ Exemplos de Testes de Utilitários

### 1. Teste de Função de Validação

```typescript
// src/lib/__tests__/validation-utils.test.ts
import { validateEmail, validatePhone, validateRequired } from '../validation-utils'

describe('validation-utils', () => {
  describe('validateEmail', () => {
    it('deve validar email correto', () => {
      expect(validateEmail('teste@email.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('email-invalido')).toBe(false)
      expect(validateEmail('@email.com')).toBe(false)
      expect(validateEmail('email@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('deve validar telefone brasileiro', () => {
      expect(validatePhone('11999999999')).toBe(true)
      expect(validatePhone('(11) 99999-9999')).toBe(true)
      expect(validatePhone('+55 11 99999-9999')).toBe(true)
    })

    it('deve rejeitar telefone inválido', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('deve validar campo obrigatório', () => {
      expect(validateRequired('texto')).toBe(true)
      expect(validateRequired('   texto   ')).toBe(true)
    })

    it('deve rejeitar campo vazio', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })
})
```

### 2. Teste de Função de Formatação

```typescript
// src/lib/__tests__/format-utils.test.ts
import { formatDate, formatCurrency, formatPhone } from '../format-utils'

describe('format-utils', () => {
  describe('formatDate', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2025-01-15')
      expect(formatDate(date)).toBe('15/01/2025')
    })

    it('deve lidar com diferentes formatos de entrada', () => {
      expect(formatDate('2025-01-15')).toBe('15/01/2025')
      expect(formatDate('2025-01-15T10:30:00Z')).toBe('15/01/2025')
    })
  })

  describe('formatCurrency', () => {
    it('deve formatar moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
      expect(formatCurrency(0)).toBe('R$ 0,00')
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
    })
  })

  describe('formatPhone', () => {
    it('deve formatar telefone brasileiro', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })
  })
})
```

## 🌐 Exemplos de Testes de API Routes

### 1. Teste de API Route Simples

```typescript
// src/app/api/__tests__/users.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '../users/route'

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('deve retornar lista de usuários', async () => {
      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.users)).toBe(true)
    })
  })

  describe('POST', () => {
    it('deve criar novo usuário', async () => {
      const userData = {
        name: 'Novo Usuário',
        email: 'novo@email.com',
        role: 'cliente'
      }

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toBeDefined()
      expect(data.user.name).toBe('Novo Usuário')
    })

    it('deve retornar erro para dados inválidos', async () => {
      const invalidData = {
        name: '', // Nome vazio
        email: 'email-invalido'
      }

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Nome é obrigatório')
    })
  })
})
```

## 🎯 Cenários de Teste Avançados

### 1. Teste de Integração com Múltiplos Hooks

```typescript
// src/components/__tests__/AnalisesManager.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalisesManager from '../AnalisesManager'

// Mock de múltiplos hooks
jest.mock('../../hooks/useAnalises', () => ({
  useAnalises: () => ({
    analises: [
      { id: '1', titulo: 'Análise 1', status: 'pendente' },
      { id: '2', titulo: 'Análise 2', status: 'concluida' }
    ],
    loading: false,
    createAnalise: jest.fn(),
    updateAnalise: jest.fn(),
    deleteAnalise: jest.fn()
  })
}))

jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    canCreateAnalise: true,
    canEditAnalise: true,
    canDeleteAnalise: true
  })
}))

describe('AnalisesManager', () => {
  it('deve renderizar lista de análises', () => {
    render(<AnalisesManager />)
    
    expect(screen.getByText('Análise 1')).toBeInTheDocument()
    expect(screen.getByText('Análise 2')).toBeInTheDocument()
  })

  it('deve permitir criar nova análise', async () => {
    const user = userEvent.setup()
    render(<AnalisesManager />)

    await user.click(screen.getByRole('button', { name: /nova análise/i }))
    
    expect(screen.getByText('Criar Nova Análise')).toBeInTheDocument()
  })
})
```

### 2. Teste de Error Boundary

```typescript
// src/components/__tests__/ErrorBoundary.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Componente que lança erro
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Erro de teste')
  }
  return <div>Componente funcionando</div>
}

describe('ErrorBoundary', () => {
  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Componente funcionando')).toBeInTheDocument()
  })

  it('deve renderizar fallback quando há erro', () => {
    // Suprimir console.error para este teste
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})
```

### 3. Teste de Performance

```typescript
// src/components/__tests__/Performance.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { LargeListComponent } from '../LargeListComponent'

describe('Performance Tests', () => {
  it('deve renderizar lista grande em tempo aceitável', () => {
    const startTime = performance.now()
    
    render(<LargeListComponent items={Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` })))})
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Verificar se renderizou em menos de 100ms
    expect(renderTime).toBeLessThan(100)
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText('Item 999')).toBeInTheDocument()
  })
})
```

### 4. Teste de Acessibilidade

```typescript
// src/components/__tests__/Accessibility.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import MensagemForm from '../MensagemForm'

// Extender expect com matchers de acessibilidade
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('deve não ter violações de acessibilidade', async () => {
    const { container } = render(<MensagemForm onSubmit={jest.fn()} />)
    const results = await axe(container)
    
    expect(results).toHaveNoViolations()
  })

  it('deve ter labels apropriados para campos de formulário', () => {
    render(<MensagemForm onSubmit={jest.fn()} />)
    
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument()
  })

  it('deve ter roles apropriados para elementos interativos', () => {
    render(<MensagemForm onSubmit={jest.fn()} />)
    
    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })
})
```

## 📚 Comandos Úteis para Desenvolvimento

### Executar Testes Específicos

```bash
# Executar apenas um arquivo de teste
npm test -- src/components/__tests__/SicoopDashboard.test.tsx

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="deve renderizar"

# Executar testes em modo watch para um arquivo específico
npm test -- --watch src/hooks/__tests__/useMensagens.test.ts

# Executar testes com cobertura para um arquivo específico
npm test -- --coverage --collectCoverageFrom="src/hooks/useMensagens.ts"
```

### Debug de Testes

```bash
# Executar com output detalhado
npm test -- --verbose

# Executar apenas testes que falharam na última execução
npm test -- --onlyFailures

# Executar com relatório de cobertura detalhado
npm test -- --coverage --coverageReporters=text-lcov
```

---

## 🎯 Conclusão

Estes exemplos cobrem os cenários mais comuns de testes no projeto Sicoop. Use-os como referência para escrever seus próprios testes, adaptando conforme necessário para suas necessidades específicas.

**Lembre-se**: Testes devem ser simples, rápidos e confiáveis. Foque em testar o comportamento, não a implementação.

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
