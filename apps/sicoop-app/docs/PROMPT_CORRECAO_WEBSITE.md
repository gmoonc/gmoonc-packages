# 🚨 CORREÇÃO URGENTE - Website Goalmoon.com

## Problema

Os formulários do website estão falhando ao inserir dados no Supabase com o erro:

```
Erro: new row violates check constraint "analises_cobertura_status_check"
Erro: new row violates check constraint "mensagens_status_check"
```

## Causa

O banco de dados foi atualizado. Os status antigos não existem mais:
- ❌ `solicitada` (não existe mais)
- ❌ `enviada` (não existe mais)
- ❌ `respondida` (não existe mais)
- ❌ `fechada` (não existe mais)

## Solução

**Substituir o valor antigo por `'pendente'`**

O campo `status` é obrigatório. Substitua os valores antigos por `'pendente'`.

---

## 📋 CORREÇÃO: Formulário de Análises (`analises_cobertura`)

**Localizar no código:**
```javascript
status: 'solicitada'
// ou
status: 'enviada'
```

**Substituir por:**
```javascript
status: 'pendente'
```

---

## 📋 CORREÇÃO: Formulário de Mensagens (`mensagens`)

**Localizar no código:**
```javascript
status: 'enviada'
// ou
status: 'respondida'
// ou
status: 'fechada'
```

**Substituir por:**
```javascript
status: 'pendente'
```

---

## 🔍 Onde Procurar

Procure no código por:
- `status: 'solicitada'` → substituir por `status: 'pendente'`
- `status: 'enviada'` → substituir por `status: 'pendente'`
- `status: 'respondida'` → substituir por `status: 'pendente'`
- `status: 'fechada'` → substituir por `status: 'pendente'`
- `status: "solicitada"` → substituir por `status: 'pendente'`
- `status: "enviada"` → substituir por `status: 'pendente'`
- `status: "respondida"` → substituir por `status: 'pendente'`
- `status: "fechada"` → substituir por `status: 'pendente'`

---

## ✅ Checklist

- [ ] Localizar onde o código insere dados em `analises_cobertura` e `mensagens`
- [ ] Procurar por `status: 'solicitada'`, `status: 'enviada'`, `status: 'respondida'` ou `status: 'fechada'`
- [ ] Substituir o valor por `status: 'pendente'`


---

## 📊 Status Válidos

✅ Aceitos: `rascunho`, `pendente`, `em_analise`, `concluida`, `cancelada`  
❌ Não existem mais: `solicitada`, `enviada`, `respondida`, `fechada`

