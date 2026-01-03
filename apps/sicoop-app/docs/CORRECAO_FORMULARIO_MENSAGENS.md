# 🔧 Correção - Formulário de Mensagens

## Problema

Erro ao inserir dados:
```
Erro: new row violates check constraint "mensagens_status_check"
```

## Causa

O código está tentando inserir com status antigo que não existe mais:
- ❌ `enviada` (não existe mais)
- ❌ `respondida` (não existe mais)
- ❌ `fechada` (não existe mais)

## Solução

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

## Onde Procurar

Procure por:
- `status: 'enviada'`
- `status: 'respondida'`
- `status: 'fechada'`
- `status: "enviada"`
- `status: "respondida"`
- `status: "fechada"`

## Status Válidos

✅ Aceitos: `rascunho`, `pendente`, `em_analise`, `concluida`, `cancelada`  
❌ Não existem mais: `enviada`, `respondida`, `fechada`
