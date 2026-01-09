# Relatório de Estado do Frontend (Para Backend Devs)

**Data:** 09/01/2026
**Projeto:** Sistema Comi Front
**Versão:** 0.0.0 (Em Desenvolvimento)

## 1. Visão Geral da Tecnologia

O frontend é construído utilizando uma stack moderna e performática, focada em produtividade e experiência do usuário.

*   **Framework:** React 19 + Vite 7
*   **Linguagem:** TypeScript (~5.9.3)
*   **Estilização:** TailwindCSS 4 (Tema "Cyber" customizado com HUD overlays)
*   **Gerenciamento de Estado/Cache:** TanStack Query (React Query) v5
*   **Roteamento:** React Router v7
*   **Cliente HTTP:** Axios v1.13.2

## 2. Estrutura de Rotas e Segurança

O sistema implementa controle de acesso baseado em roles (RBAC).

**Rotas Públicas:**
*   `/login`: Tela de Login.
*   `/register`: Tela de Registro.

**Rotas Protegidas (Requer Autenticação):**
*   `/`: Home Page (Dashboard Geral).

**Rotas Administrativas (Requer Role `ADMIN`):**
*   `/admin`: Painel de Administração de Usuários.
*   `/faturamento`: Gestão de Faturamentos.
*   `/adiantamento`: Gestão de Adiantamentos.
*   `/despesa`: Gestão de Despesas.
*   `/relatorio`: Relatórios Financeiros Consolidados.

## 3. Contrato de Integração API (BFF / Backend Requirements)

O frontend espera que o backend (exposta em `VITE_API_URL` ou `http://localhost:8080/api/v1/`) responda aos seguintes endpoints conforme definido nos serviços.

### 3.1 Autenticação (`/auth`)
*   **Login**
    *   `POST /auth/login`
    *   **Payload:** `{ email, password }`
    *   **Response Esperado:** `{ token, email, role, expiresIn }`
*   **Register**
    *   `POST /auth/register`
    *   **Payload:** `{ email, password }`

### 3.2 Usuários (`/users`)
*   **Perfil Atual**
    *   `GET /users/me`
    *   **Response:** Objeto `User` completo.
*   **Listar Usuários** (Admin)
    *   `GET /users`
*   **Criar Usuário** (Admin)
    *   `POST /users` (Payload: `{ email, password, role }`)
*   **Aprovar Usuário**
    *   `PATCH /users/{id}/approve`
*   **Alterar Role**
    *   `PATCH /users/{id}/role`
    *   **Payload:** String crua (ex: `"ADMIN"`) com Content-Type application/json.
*   **Deletar Usuário**
    *   `DELETE /users/{id}`

### 3.3 Faturamento (`/faturamento`)
*   **Registrar**
    *   `POST /faturamento`
    *   **Payload:** `{ dataFaturamento: string, valor: number }`
*   **Listar**
    *   `GET /faturamento`
    *   **Response:** Array de objetos `Faturamento`.

### 3.4 Adiantamento (`/adiantamento`)
*   **Registrar**
    *   `POST /adiantamento`
    *   **Payload:** `{ dataPagamento: string, valor: number, descricao?: string }`
*   **Listar**
    *   `GET /adiantamento`
    *   **Response:** Array de objetos `PagamentoAdiantado`.

### 3.5 Despesas (`/despesas`)
*   **Criar**
    *   `POST /despesas`
    *   **Payload:** `{ dataDespesa: string, valor: number, categoria: string, descricao?: string }`
    *   **Categorias Válidas:** `ALIMENTACAO`, `COMBUSTIVEL`, `FERRAMENTAS`, `MARKETING`, `INFRAESTRUTURA`, `PROLABORE`, `DIVERSOS`, `OUTROS`.

### 3.6 Comissão (`/comissao`)
*   **Obter Mensal**
    *   `GET /comissao/{ano}/{mes}`
    *   **Response:** Objeto `ComissaoCalculada` (inclui faixa, porcentagem, bruto, adiantado, saldo).

### 3.7 Relatórios (`/relatorios`)
*   **Consolidado**
    *   `GET /relatorios/{ano}/{mes}`
    *   **Response:** Objeto `RelatorioFinanceiro` (inclui totais de despesas por categoria, lucro líquido, impostos, etc).

## 4. Observações de Implementação

1.  **Tratamento de Erros:** O cliente HTTP possui interceptors para tratar automaticamente erros `401` (Logout/Reload), `429` (Rate Limit) e `403` (Acesso Negado), mas espera mensagens de erro padronizadas do backend (`ErrorResponse`).
2.  **Datas:** O frontend envia datas tipicamente como strings (ISO ou formato simples, verificar consistência com DTOs do backend).
3.  **Roles:** O sistema trabalha com roles `USER` e `ADMIN`. O frontend espera que o JWT contenha ou que o endpoint `/users/me` retorne essa informação inequivocamente para montar a UI condicional.
