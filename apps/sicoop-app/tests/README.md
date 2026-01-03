# 🧪 Testes Semi-Automatizados

📚 **Para documentação completa, veja:** [`tests/docs/README.md`](./docs/README.md)

## 📋 Início Rápido

### 1. Configuração

```bash
cp tests/config.test.example tests/config.test
# Edite tests/config.test com suas credenciais
```

### 2. Executar Testes

```bash
# Criação de usuário (visual)
npm run test:auth:create:headed

# Confirmação de usuário (visual)
npm run test:auth:confirm:headed

# Login e logout (visual)
npm run test:auth:login:headed

# Reset de senha - solicitar link (visual)
npm run test:auth:reset:request:headed

# Reset de senha - confirmar e trocar senha (visual)
npm run test:auth:reset:confirm:headed
```

## ⚠️ Importante

- ✅ Testes executam em **PRODUÇÃO** (`https://sicoop.goalmoon.com`)
- ✅ Nenhum dado sensível é versionado
- ✅ Cada teste é **independente** e **semi-automatizado**
- ✅ Usuários de teste **NÃO** são removidos automaticamente

---

📖 **Documentação completa:** [`tests/docs/README.md`](./docs/README.md)
