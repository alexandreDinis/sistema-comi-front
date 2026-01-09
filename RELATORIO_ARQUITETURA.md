# Relatório de Arquitetura do Frontend (`sistema-comi-front`)

Este documento fornece uma visão geral técnica e arquitetural do projeto frontend, detalhando a stack tecnológica, padrões de design, estrutura de arquivos e integrações.

## 1. Visão Geral da Tecnologia

O projeto é uma **Single Page Application (SPA)** moderna construída com o ecossistema React.

-   **Runtime/Build**: Vite (v6) para desenvolvimento rápido e build otimizado.
-   **Framework**: React (v19) com TypeScript (v5.6).
-   **Roteamento**: React Router DOM (v7) para gerenciamento de rotas do lado do cliente.
-   **Gerenciamento de Estado de Servidor**: @tanstack/react-query (v5) para cache, refetching e sincronização de dados assíncronos.
-   **Cliente HTTP**: Axios para comunicação com a API Backend.
-   **Estilização**: TailwindCSS (v4) integrado nativamente.

## 2. Estrutura de Diretórios (Source)

A estrutura do código segue um padrão de organização por tipo de recurso, com subdivisões por domínio onde necessário.

```
src/
├── assets/          # Recursos estáticos (imagens, ícones)
├── components/      # Componentes UI reutilizáveis
│   ├── auth/        # Componentes específicos de autenticação
│   ├── common/      # Header, Footer, ProtectedRoute, etc.
│   ├── dashboard/   # Widgets e elementos do painel
│   ├── forms/       # Componentes de formulário genéricos/reutilizáveis
│   └── reports/     # Componentes para visualização de relatórios
├── context/         # React Context API (Provider global de estado)
├── hooks/           # Custom React Hooks
├── pages/           # Visualizações de página (mapeadas para rotas)
│   ├── os/          # Páginas do módulo de Ordem de Serviço (Clientes, Catálogo, OS)
│   ├── AdminPanel   # Painel Administrativo
│   ├── LoginPage    # etc.
│   └── ...
├── services/        # Camada de comunicação com a API (Service Pattern)
├── types/           # Definições de tipos TypeScript (Interfaces, Types, Enums)
├── utils/           # Funções utilitárias e helpers
├── App.tsx          # Configuração principal de Rotas e Providers
└── index.css        # Configuração global de estilos e Tema Cyberpunk
```

## 3. Padrões de Arquitetura

### 3.1. Camada de Serviço (Service Layer)
Toda a comunicação com o backend é abstraída em serviços localizados em `src/services/`. Os componentes não chamam o `axios` diretamente; eles invocam métodos dos serviços (ex: `osService.createOS`, `authService.login`).
Isso desacopla a lógica de UI da lógica de obtenção de dados e facilita a manutenção se a API mudar.

Exemplo de estrutura de serviço:
-   `api.ts`: Instância base do Axios com interceptors (para injetar tokens JWT).
-   `osService.ts`: Lógica específica para Ordens de Serviço, Clientes e Veículos.
-   `authService.ts`: Login, Registro e gestão de tokens.

### 3.2. Gerenciamento de Estado
-   **Dados da API**: O TanStack Query é utilizado para gerenciar o estado assíncrono (loading, error, data success) e cache global da aplicação. Foi configurado globalmente em `App.tsx` com estratégias de invalidação (`staleTime: 0`) para garantir frescor dos dados operacionais.
-   **Estado Local**: `useState` e `useReducer` gerenciam interações de formulários e estados efêmeros de UI.
-   **Contexto**: Utilizado para estados globais leves, como Sessão de Usuário Autenticado.

### 3.3. Segurança e Controle de Acesso
-   **Rotas Protegidas**: O componente `ProtectedRoute` (em `src/components/common/`) envolve rotas sensíveis em `App.tsx`. Ele verifica a presença de token JWT e, opcionalmente, roles específicas (ex: `ADMIN`) antes de renderizar o conteúdo.

## 4. Design System & UX (Tema "Cyberpunk")

A aplicação implementa uma estética visual distinta e imersiva ("High Tech, Low Life"), definida principalmente em `src/index.css` e classes utilitárias do Tailwind.

### 4.1. Tokens de Design
O tema é controlado via CSS Custom Properties (`index.css`):
-   **Cores Primárias**: `--color-cyber-bg` (Fundo Preto Profundo), `--color-cyber-gold` (Dourado Neon).
-   **Sombras e Glows**: Efeitos de neon definidos em `--shadow-neon-gold`.
-   **Tipografia**: Fontes monoespaçadas ('JetBrains Mono') para dados técnicos e 'Inter' para UI geral.

### 4.2. Elementos Globais
-   **HUD Overlay**: Um overlay fixo (`fixed inset-0`) que simula a interface de um monitor futurista ou capacete tático, com bordas angulares e grids de fundo.
-   **Animações**:
    -   `scanline`: Efeito de varredura CRT.
    -   `staticFade`: Ruído digital sutil.
    -   `charging`: Efeito de pulso em botões.

### 4.3. Componentes HUD
Classes utilitárias como `.hud-card` e `.hud-button` encapsulam a complexidade visual (bordas duplas, backdrop-blur, gradientes) para facilitar o uso nos componentes React.

## 5. Módulos Funcionais e Rotas

A aplicação é segmentada em domínios de negócio claros:

1.  **Core / Autenticação**:
    -   Rotas: `/login`, `/register`, `/` (Home).
2.  **Financeiro**:
    -   Rotas: `/faturamento`, `/adiantamento`, `/despesa`.
    -   Funcionalidade: Gestão de fluxo de caixa e registro de despesas operacionais.
3.  **Gestão de Serviços (OS)**:
    -   Rotas: `/os` (Listagem), `/os/:id` (Detalhes), `/clientes`, `/catalogo` (Peças/Serviços).
    -   Funcionalidade: Criação e acompanhamento de ordens de serviço, cadastro de frota e estoque.
4.  **Relatórios**:
    -   Rotas: `/relatorio`.
    -   Funcionalidade: Auditoria financeira e exportação de dados (PDF).
5.  **Administração**:
    -   Rotas: `/admin`.
    -   Funcionalidade: Painel de visão geral para gestores.

## 6. Infraestrutura e Build

-   **Dockerização**: `Dockerfile` multis-stage configurado para buildar a aplicação (Node.js) e servir os estáticos com Nginx.
-   **Servidor Web**: `nginx.conf` customizado para lidar com SPA (redirecionamento de rotas para `index.html`).
-   **Linting**: ESLint configurado com regras estritas para React e TypeScript garantindo qualidade de código.
