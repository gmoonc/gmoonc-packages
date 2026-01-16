import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GMooncUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface GMooncSession {
  isAuthenticated: boolean;
  roles: string[];
  user: GMooncUser | null;
}

interface GMooncSessionContextType extends GMooncSession {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const GMooncSessionContext = createContext<GMooncSessionContextType | undefined>(undefined);

export function GMooncSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GMooncSession>({
    isAuthenticated: true,
    roles: ['admin'],
    user: {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@gmoonc.com',
      role: 'admin'
    }
  });

  const login = async (email: string, password: string) => {
    // Mock login - no-op for now
    setSession({
      isAuthenticated: true,
      roles: ['admin'],
      user: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: email,
        role: 'admin'
      }
    });
  };

  const logout = () => {
    setSession({
      isAuthenticated: false,
      roles: [],
      user: null
    });
  };

  return (
    <GMooncSessionContext.Provider value={{ ...session, login, logout }}>
      {children}
    </GMooncSessionContext.Provider>
  );
}

export function useGMooncSession(): GMooncSessionContextType {
  const context = useContext(GMooncSessionContext);
  if (!context) {
    throw new Error('useGMooncSession must be used within GMooncSessionProvider');
  }
  return context;
}
