// Mock avançado do Supabase para testes
export const createSupabaseMock = (customData = {}) => {
  const defaultData = {
    profiles: [],
    mensagens: [],
    analises: [],
    notificacoes: [],
    permissoes: [],
  };

  const data = { ...defaultData, ...customData };

  // Função para simular delay de rede
  const simulateNetworkDelay = () => new Promise(resolve => 
    setTimeout(resolve, Math.random() * 100 + 50)
  );

  // Função para simular erro aleatório (5% de chance)
  const shouldSimulateError = () => Math.random() < 0.05;

  // Função para criar resposta de erro
  const createErrorResponse = (message = 'Erro interno do servidor') => ({
    data: null,
    error: {
      message,
      details: null,
      hint: null,
      code: 'INTERNAL_ERROR',
    },
    status: 500,
    statusText: 'Internal Server Error',
  });

  // Função para criar resposta de sucesso
  const createSuccessResponse = (data: unknown, status = 200) => ({
    data,
    error: null,
    status,
    statusText: 'OK',
  });

  // Mock do query builder
  const createQueryBuilder = (tableName: string) => {
    const query = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      csv: jest.fn(),
      geojson: jest.fn(),
      explain: jest.fn(),
      rollback: jest.fn(),
      returns: jest.fn().mockReturnThis(),
    };

    // Implementar lógica de SELECT
    query.select.mockImplementation(async () => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse();
      }

      const tableData = data[tableName] || [];
      return createSuccessResponse(tableData);
    });

    // Implementar lógica de INSERT
    query.insert.mockImplementation(async (newData) => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse();
      }

      const tableData = data[tableName] || [];
      const insertedData = Array.isArray(newData) ? newData : [newData];
      
      insertedData.forEach(item => {
        const newItem = {
          id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        };
        tableData.push(newItem);
      });

      data[tableName] = tableData;
      return createSuccessResponse(insertedData, 201);
    });

    // Implementar lógica de UPDATE
    query.update.mockImplementation(async (updateData) => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse();
      }

      const tableData = data[tableName] || [];
      const updatedItems = tableData.map(item => ({
        ...item,
        ...updateData,
        updated_at: new Date().toISOString(),
      }));

      data[tableName] = updatedItems;
      return createSuccessResponse(updatedItems);
    });

    // Implementar lógica de DELETE
    query.delete.mockImplementation(async () => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse();
      }

      // Simular deleção (em um teste real, você implementaria a lógica de filtro)
      data[tableName] = [];
      return createSuccessResponse([]);
    });

    // Implementar lógica de SINGLE
    query.single.mockImplementation(async () => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse();
      }

      const tableData = data[tableName] || [];
      const item = tableData[0] || null;
      
      if (!item) {
        throw createErrorResponse('Nenhum item encontrado');
      }

      return createSuccessResponse(item);
    });

    return query;
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: jest.fn().mockImplementation(async ({ email }) => {
        await simulateNetworkDelay();
        
        if (shouldSimulateError()) {
          throw createErrorResponse('Credenciais inválidas');
        }

        const user = data.profiles.find(p => p.email === email);
        if (!user || password !== 'password123') {
          throw createErrorResponse('Credenciais inválidas');
        }

        return createSuccessResponse({
          user: { id: user.id, email: user.email },
          session: { access_token: 'mock-token' },
        });
      }),
      signUp: jest.fn().mockImplementation(async ({ email, options }) => {
        await simulateNetworkDelay();
        
        if (shouldSimulateError()) {
          throw createErrorResponse('Erro ao criar usuário');
        }

        const newUser = {
          id: `user-${Date.now()}`,
          email,
          name: options?.data?.name || 'Usuário',
          role: options?.data?.role || 'cliente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        data.profiles.push(newUser);

        return createSuccessResponse({
          user: { id: newUser.id, email: newUser.email },
          session: null, // Usuário precisa confirmar email
        });
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn((tableName: string) => createQueryBuilder(tableName)),
    rpc: jest.fn().mockImplementation(async (functionName: string) => {
      await simulateNetworkDelay();
      
      if (shouldSimulateError()) {
        throw createErrorResponse(`Erro na função ${functionName}`);
      }

      // Implementar funções RPC específicas se necessário
      return createSuccessResponse(null);
    }),
    // Métodos para manipular dados nos testes
    _setData: (tableName: string, newData: unknown[]) => {
      data[tableName] = newData;
    },
    _getData: (tableName: string) => data[tableName] || [],
    _clearData: () => {
      Object.keys(data).forEach(key => {
        data[key] = [];
      });
    },
    _addData: (tableName: string, newItem: unknown) => {
      if (!data[tableName]) {
        data[tableName] = [];
      }
      data[tableName].push(newItem);
    },
  };
};

// Instância padrão do mock
export const mockSupabase = createSupabaseMock();
