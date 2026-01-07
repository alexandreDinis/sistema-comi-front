# Documentação DevOps - Sistema Comi Front

Este documento fornece instruções detalhadas para o build, deploy e operação do frontend do Sistema Comi.

## 📋 Visão Geral Técnica

*   **Framework**: React 19 + Vite 7
*   **Linguagem**: TypeScript
*   **Gerenciador de Pacotes**: npm
*   **Runtime de Build**: Node.js 20+
*   **Servidor Web (Produção)**: Nginx (Alpine)
*   **Porta Padrão**: 80

## 🔧 Variáveis de Ambiente

As variáveis de ambiente devem ser definidas **no momento do build** (para injeção no código via Vite) ou passadas ao container se houver suporte a runtime injection (neste projeto, a variável é injetada no build do Dockerfile).

| Variável | Descrição | Exemplo | Obrigatório? |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | URL base da API Backend | `https://api.seudominio.com/api/v1` | **Sim** |

> **Nota Crítica**: Como é uma aplicação SPA (Single Page Application) estática após o build, o valor de `VITE_API_URL` é "baked in" (embutido) nos arquivos JavaScript durante o processo de build. Se mudar a URL da API, é necessário refazer o build.

## 🐳 Docker (Recomendado)

O projeto possui um `Dockerfile` Multistage otimizado para produção.

### 1. Build da Imagem

Certifique-se de passar a variável de build `VITE_API_URL` se desejar "assar" a URL da API na imagem, ou garanta que o processo de CI/CD faça isso.

```bash
docker build \
  --build-arg VITE_API_URL=https://sistema-comissao-production.up.railway.app/api/v1 \
  -t sistema-comi-front .
```

### 2. Rodar o Container

```bash
docker run -d \
  -p 80:80 \
  --name frontend \
  sistema-comi-front
```

### Detalhes do Container
*   **Base Image**: `nginx:alpine`
*   **Configuração Nginx**: O arquivo `nginx.conf` incluído no repositório já está configurado para:
    *   Servir arquivos estáticos do diretório `/usr/share/nginx/html`.
    *   Redirecionar todas as rotas desconhecidas para `index.html` (comportamento SPA).
    *   Configurar cache agressivo (1 ano) para assets em `/assets/`.
    *   Ativar compressão Gzip.

## 🛠️ Build Manual (Sem Docker)

Se for realizar o deploy em Vercel, Netlify ou servidor estático simples (S3/CloudFront):

1.  **Instalar Dependências**:
    ```bash
    npm ci
    ```

2.  **Executar Build**:
    ```bash
    # Linux/Mac
    export VITE_API_URL=https://sistema-comissao-production.up.railway.app/api/v1
    npm run build
    
    # Windows (PowerShell)
    $env:VITE_API_URL="https://sistema-comissao-production.up.railway.app/api/v1"
    npm run build
    ```

3.  **Output**:
    Os arquivos estáticos serão gerados na pasta `dist/`. Esta pasta é o único artefato necessário para produção.

## ✅ Health Check

Para verificar se a aplicação está rodando:

*   **URL**: `/` (Raiz)
*   **Status Esperado**: `200 OK`
*   **Conteúdo**: Deve retornar o HTML contendo `<div id="root"></div>`.

## 🚨 Troubleshooting

*   **Erro 404 ao atualizar página**: Certifique-se de que o servidor web (Nginx/Apache) está configurado para redirecionar rotas não encontradas para o `index.html`. Veja o `nginx.conf` no raiz do projeto para referência.
*   **Erro de CORS ou API inalcançável**: Verifique no tab "Network" do navegador para onde as requisições estão indo. Se estiverem indo para `http://localhost...` em produção, o build foi feito sem a variável `VITE_API_URL` correta.
