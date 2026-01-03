# Exemplos de Uso - Sicoop da Goalmoon

## 🎯 Casos de Uso Comuns

### 1. Sistema de Gestão Escolar

```javascript
// sicoop.config.js
module.exports = {
  system: {
    name: "EduGestão",
    title: "Sistema de Gestão Escolar",
    subtitle: "Controle completo da instituição"
  },
  modules: {
    alunos: {
      enabled: true,
      icon: "👨‍🎓",
      items: [
        { id: "cadastro", label: "Cadastro de Alunos", href: "/alunos/cadastro" },
        { id: "matriculas", label: "Matrículas", href: "/alunos/matriculas" },
        { id: "notas", label: "Notas e Avaliações", href: "/alunos/notas" }
      ]
    },
    professores: {
      enabled: true,
      icon: "👨‍🏫",
      items: [
        { id: "cadastro", label: "Cadastro de Professores", href: "/professores/cadastro" },
        { id: "disciplinas", label: "Disciplinas", href: "/professores/disciplinas" }
      ]
    },
    financeiro: {
      enabled: true,
      icon: "💰",
      items: [
        { id: "mensalidades", label: "Mensalidades", href: "/financeiro/mensalidades" },
        { id: "bolsas", label: "Bolsas e Descontos", href: "/financeiro/bolsas" }
      ]
    }
  }
};
```

### 2. Sistema de Gestão Hospitalar

```javascript
// sicoop.config.js
module.exports = {
  system: {
    name: "MedSys",
    title: "Sistema de Gestão Hospitalar",
    subtitle: "Controle médico e administrativo"
  },
  modules: {
    pacientes: {
      enabled: true,
      icon: "🏥",
      items: [
        { id: "cadastro", label: "Cadastro de Pacientes", href: "/pacientes/cadastro" },
        { id: "prontuarios", label: "Prontuários", href: "/pacientes/prontuarios" },
        { id: "consultas", label: "Consultas", href: "/pacientes/consultas" }
      ]
    },
    medicos: {
      enabled: true,
      icon: "👨‍⚕️",
      items: [
        { id: "cadastro", label: "Cadastro de Médicos", href: "/medicos/cadastro" },
        { id: "especialidades", label: "Especialidades", href: "/medicos/especialidades" }
      ]
    },
    farmacia: {
      enabled: true,
      icon: "💊",
      items: [
        { id: "medicamentos", label: "Medicamentos", href: "/farmacia/medicamentos" },
        { id: "estoque", label: "Controle de Estoque", href: "/farmacia/estoque" }
      ]
    }
  }
};
```

### 3. Sistema de Gestão Comercial

```javascript
// sicoop.config.js
module.exports = {
  system: {
    name: "ComercioPro",
    title: "Sistema de Gestão Comercial",
    subtitle: "Controle de vendas e estoque"
  },
  modules: {
    produtos: {
      enabled: true,
      icon: "📦",
      items: [
        { id: "cadastro", label: "Cadastro de Produtos", href: "/produtos/cadastro" },
        { id: "categorias", label: "Categorias", href: "/produtos/categorias" },
        { id: "estoque", label: "Controle de Estoque", href: "/produtos/estoque" }
      ]
    },
    vendas: {
      enabled: true,
      icon: "🛒",
      items: [
        { id: "pedidos", label: "Pedidos", href: "/vendas/pedidos" },
        { id: "orcamentos", label: "Orçamentos", href: "/vendas/orcamentos" },
        { id: "relatorios", label: "Relatórios", href: "/vendas/relatorios" }
      ]
    },
    clientes: {
      enabled: true,
      icon: "👥",
      items: [
        { id: "cadastro", label: "Cadastro de Clientes", href: "/clientes/cadastro" },
        { id: "historico", label: "Histórico de Compras", href: "/clientes/historico" }
      ]
    }
  }
};
```

## 🎨 Personalização de Temas

### Tema Escuro

```css
/* src/app/globals.css */
:root {
  --primary: #1a1a1a;
  --secondary: #2d2d2d;
  --accent: #4a9eff;
  --background: #121212;
  --text: #ffffff;
  --text-secondary: #b0b0b0;
}

.sicoop-menu {
  background-color: var(--secondary);
  color: var(--text);
}

.menu-link {
  background-color: var(--primary);
  color: var(--text);
}

.menu-link:hover {
  background-color: var(--accent);
}
```

### Tema Corporativo

```css
/* src/app/globals.css */
:root {
  --primary: #2c3e50;
  --secondary: #34495e;
  --accent: #3498db;
  --background: #ecf0f1;
  --text: #2c3e50;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
}

.sicoop-menu {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.dashboard-header {
  background: linear-gradient(135deg, var(--primary), var(--accent));
}
```

## 🔧 Modificações Avançadas

### Adicionar Notificações

```typescript
// src/components/NotificationSystem.tsx
'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

### Adicionar Sistema de Busca

```typescript
// src/components/SearchBar.tsx
'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (term: string) => {
    if (term.length < 3) return;
    
    // Implementar lógica de busca
    const results = await searchInSystem(term);
    setSearchResults(results);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Buscar no sistema..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        className="search-input"
      />
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div key={index} className="search-result-item">
              {result.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 📱 Responsividade Avançada

### Menu Colapsável

```typescript
// src/components/CollapsibleMenu.tsx
'use client';

import { useState } from 'react';
import SicoopMenu from './SicoopMenu';

export default function CollapsibleMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '▶' : '◀'}
      </button>
      
      <div className={`menu-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <SicoopMenu />
      </div>
    </div>
  );
}
```

### CSS para Menu Colapsável

```css
/* src/app/globals.css */
.sidebar {
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

.menu-wrapper.collapsed {
  opacity: 0;
  pointer-events: none;
}

.collapse-button {
  position: absolute;
  top: 20px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 1000;
}
```

## 🚀 Integração com APIs

### Exemplo de API para Usuários

```typescript
// src/services/userService.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export class UserService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
    });
  }
}
```

## 📊 Dashboard com Gráficos

### Exemplo com Chart.js

```typescript
// src/components/DashboardCharts.tsx
'use client';

import { Line, Bar, Pie } from 'react-chartjs-2';

export default function DashboardCharts() {
  const lineData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Vendas',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#006a9d',
      backgroundColor: 'rgba(0, 106, 157, 0.1)',
    }]
  };

  const barData = {
    labels: ['Produto A', 'Produto B', 'Produto C', 'Produto D'],
    datasets: [{
      label: 'Quantidade Vendida',
      data: [65, 59, 80, 81],
      backgroundColor: ['#006a9d', '#00abfd', '#d7f0ff', '#0080c0'],
    }]
  };

  return (
    <div className="charts-container">
      <div className="chart-item">
        <h3>Evolução das Vendas</h3>
        <Line data={lineData} />
      </div>
      
      <div className="chart-item">
        <h3>Produtos Mais Vendidos</h3>
        <Bar data={barData} />
      </div>
    </div>
  );
}
```

## 🔐 Sistema de Autenticação

### Componente de Login

```typescript
// src/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        router.push('/dashboard');
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Login - Sicoop</h2>
      
      <div className="form-group">
        <label htmlFor="username">Usuário:</label>
        <input
          type="text"
          id="username"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

Estes exemplos demonstram a flexibilidade do sistema Sicoop da Goalmoon. Use-os como base para criar sistemas específicos para suas necessidades!

### Exemplo de Módulo Cliente (Ator do Sistema)

```javascript
// sicoop.config.js
module.exports = {
  system: {
    name: "ClientePortal",
    title: "Portal do Cliente",
    subtitle: "Acesso às análises e mensagens"
  },
  modules: {
    cliente: {
      enabled: true,
      icon: "👤",
      items: [
        { id: "analises", label: "Análises", href: "/cliente/analises" },
        { id: "mensagens", label: "Mensagens", href: "/cliente/mensagens" }
      ]
    }
  }
};
```

🚀
