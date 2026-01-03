import {
  convertSupabaseCategory,
  convertSupabaseSetting,
  convertRawSupabaseSetting,
  SupabaseNotificationCategory,
  SupabaseNotificationSetting,
  RawSupabaseSetting
} from '../notifications';

describe('Funções de Conversão de Tipos', () => {
  describe('convertSupabaseCategory', () => {
    it('deve converter categoria completa com todos os campos', () => {
      const supabaseCategory: SupabaseNotificationCategory = {
        id: 'cat-1',
        name: 'nova_mensagem',
        display_name: 'Nova Mensagem',
        description: 'Descrição da categoria',
        is_active: true,
        email_template_subject: 'Assunto do Email',
        email_template_body: 'Corpo do email',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      const result = convertSupabaseCategory(supabaseCategory);

      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('nova_mensagem');
      expect(result.display_name).toBe('Nova Mensagem');
      expect(result.description).toBe('Descrição da categoria');
      expect(result.is_active).toBe(true);
      expect(result.email_template_subject).toBe('Assunto do Email');
      expect(result.email_template_body).toBe('Corpo do email');
      expect(result.created_at).toBe('2024-01-01T00:00:00Z');
      expect(result.updated_at).toBe('2024-01-02T00:00:00Z');
    });

    it('deve tratar is_active null (deve defaultar para true)', () => {
      const supabaseCategory: SupabaseNotificationCategory = {
        id: 'cat-1',
        name: 'nova_mensagem',
        display_name: 'Nova Mensagem',
        description: null,
        is_active: null,
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        created_at: null,
        updated_at: null
      };

      const result = convertSupabaseCategory(supabaseCategory);

      expect(result.is_active).toBe(true);
    });

    it('deve tratar created_at null (deve gerar timestamp)', () => {
      const supabaseCategory: SupabaseNotificationCategory = {
        id: 'cat-1',
        name: 'nova_mensagem',
        display_name: 'Nova Mensagem',
        description: null,
        is_active: true,
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        created_at: null,
        updated_at: null
      };

      const result = convertSupabaseCategory(supabaseCategory);

      expect(result.created_at).toBeDefined();
      expect(typeof result.created_at).toBe('string');
      expect(new Date(result.created_at).getTime()).toBeGreaterThan(0);
    });

    it('deve tratar updated_at null (deve gerar timestamp)', () => {
      const supabaseCategory: SupabaseNotificationCategory = {
        id: 'cat-1',
        name: 'nova_mensagem',
        display_name: 'Nova Mensagem',
        description: null,
        is_active: true,
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      };

      const result = convertSupabaseCategory(supabaseCategory);

      expect(result.updated_at).toBeDefined();
      expect(typeof result.updated_at).toBe('string');
      expect(new Date(result.updated_at).getTime()).toBeGreaterThan(0);
    });

    it('deve tratar description null', () => {
      const supabaseCategory: SupabaseNotificationCategory = {
        id: 'cat-1',
        name: 'nova_mensagem',
        display_name: 'Nova Mensagem',
        description: null,
        is_active: true,
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = convertSupabaseCategory(supabaseCategory);

      expect(result.description).toBeNull();
    });
  });

  describe('convertSupabaseSetting', () => {
    it('deve converter configuração completa com relacionamentos', () => {
      const supabaseSetting: SupabaseNotificationSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'administrador'
        },
        category: {
          id: 'cat-1',
          name: 'nova_mensagem',
          display_name: 'Nova Mensagem',
          description: 'Descrição',
          is_active: true,
          email_template_subject: 'Assunto',
          email_template_body: 'Corpo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      const result = convertSupabaseSetting(supabaseSetting);

      expect(result.id).toBe('set-1');
      expect(result.user_id).toBe('user-1');
      expect(result.category_id).toBe('cat-1');
      expect(result.is_enabled).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe('Admin User');
      expect(result.category).toBeDefined();
      expect(result.category?.display_name).toBe('Nova Mensagem');
    });

    it('deve tratar quando user é null', () => {
      const supabaseSetting: SupabaseNotificationSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: null,
        category: {
          id: 'cat-1',
          name: 'nova_mensagem',
          display_name: 'Nova Mensagem',
          description: null,
          is_active: true,
          email_template_subject: 'Assunto',
          email_template_body: 'Corpo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      const result = convertSupabaseSetting(supabaseSetting);

      expect(result.user).toBeUndefined();
      expect(result.category).toBeDefined();
    });

    it('deve tratar quando category é null', () => {
      const supabaseSetting: SupabaseNotificationSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'administrador'
        },
        category: null
      };

      const result = convertSupabaseSetting(supabaseSetting);

      expect(result.user).toBeDefined();
      expect(result.category).toBeUndefined();
    });

    it('deve tratar quando user.role é null (deve defaultar para user)', () => {
      const supabaseSetting: SupabaseNotificationSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: null
        },
        category: null
      };

      const result = convertSupabaseSetting(supabaseSetting);

      expect(result.user?.role).toBe('user');
    });

    it('deve tratar is_enabled null (deve defaultar para true)', () => {
      const supabaseSetting: SupabaseNotificationSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: null,
        created_at: null,
        updated_at: null,
        user: null,
        category: null
      };

      const result = convertSupabaseSetting(supabaseSetting);

      expect(result.is_enabled).toBe(true);
    });
  });

  describe('convertRawSupabaseSetting', () => {
    it('deve converter dados brutos válidos', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'administrador'
        },
        category: {
          id: 'cat-1',
          name: 'nova_mensagem',
          display_name: 'Nova Mensagem',
          description: null,
          is_active: true,
          email_template_subject: 'Assunto',
          email_template_body: 'Corpo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.id).toBe('set-1');
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe('Admin User');
      expect(result.category).toBeDefined();
      expect(result.category?.display_name).toBe('Nova Mensagem');
    });

    it('deve tratar erros de relacionamento (objeto com message)', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          message: 'Erro de relacionamento'
        },
        category: {
          message: 'Erro de relacionamento'
        }
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user).toBeUndefined();
      expect(result.category).toBeUndefined();
    });

    it('deve tratar quando relacionamentos são inválidos (não são objetos)', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: 'string-invalida',
        category: 123
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user).toBeUndefined();
      expect(result.category).toBeUndefined();
    });

    it('deve tratar quando relacionamentos são arrays vazios', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: [],
        category: []
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user).toBeUndefined();
      expect(result.category).toBeUndefined();
    });

    it('deve tratar quando user é null', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: null,
        category: {
          id: 'cat-1',
          name: 'nova_mensagem',
          display_name: 'Nova Mensagem',
          description: null,
          is_active: true,
          email_template_subject: 'Assunto',
          email_template_body: 'Corpo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user).toBeUndefined();
      expect(result.category).toBeDefined();
    });

    it('deve tratar quando category é null', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'administrador'
        },
        category: null
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user).toBeDefined();
      expect(result.category).toBeUndefined();
    });

    it('deve tratar is_enabled null (deve defaultar para true)', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: null,
        created_at: null,
        updated_at: null,
        user: null,
        category: null
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.is_enabled).toBe(true);
    });

    it('deve tratar created_at e updated_at null (deve gerar timestamps)', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: null,
        updated_at: null,
        user: null,
        category: null
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.created_at).toBeDefined();
      expect(typeof result.created_at).toBe('string');
      expect(new Date(result.created_at).getTime()).toBeGreaterThan(0);
      expect(result.updated_at).toBeDefined();
      expect(typeof result.updated_at).toBe('string');
      expect(new Date(result.updated_at).getTime()).toBeGreaterThan(0);
    });

    it('deve tratar user.role null (deve defaultar para user)', () => {
      const rawSetting: RawSupabaseSetting = {
        id: 'set-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: undefined
        },
        category: null
      };

      const result = convertRawSupabaseSetting(rawSetting);

      expect(result.user?.role).toBe('user');
    });
  });
});

