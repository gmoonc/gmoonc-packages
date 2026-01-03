import '@testing-library/jest-dom'

// Polyfill simples para Request/Response do Node.js
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url
      Object.defineProperty(this, 'url', {
        value: url,
        writable: false,
        enumerable: true,
        configurable: false
      })
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this.body = init.body
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers)
    }
    
    async json() {
      return JSON.parse(this.body)
    }
  }
}

// Mock do NextResponse
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url
      Object.defineProperty(this, 'url', {
        value: url,
        writable: false,
        enumerable: true,
        configurable: false
      })
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this.body = init.body
    }
    
    async json() {
      return JSON.parse(this.body)
    }
  },
  NextResponse: {
    json: jest.fn((data, init = {}) => ({
      json: () => Promise.resolve(data),
      status: init.status || 200,
      headers: new Headers(init.headers || {})
    }))
  }
}))

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
    resend: jest.fn().mockResolvedValue({
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
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
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

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Exportar o mock para uso nos testes
global.mockSupabase = mockSupabase

// Configuração para testes de banco real
if (process.env.JEST_DB_TEST === 'true') {
  // Desabilitar mocks para testes de banco real
  jest.clearAllMocks();
}

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock do Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock das APIs que são chamadas pelos hooks
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    data: false,
    error: null
  }),
  ok: true,
  status: 200
})

// Suprimir warnings do act() durante os testes
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

afterAll(() => {
  console.error = originalError;
});

// Configuração global para testes
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
