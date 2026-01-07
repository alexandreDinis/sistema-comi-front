# Guia de Deploy - Sistema Comi (Frontend)

Este guia cobre o processo de publicação do Frontend do Sistema Comi.
**Recomendação Oficial:** Usar **Vercel** pela simplicidade, SSL gratuito e integração contínua.

---

## 🚀 Opção 1: Deploy com Vercel (Recomendado)

A Vercel foi desenhada para projetos Vite/React e resolve automaticamente configurações de rotas, cache e HTTPS.

### Passo 1: Preparar o Repositório
Certifique-se de que seu código está no GitHub. O projeto deve conter na raiz:
- `package.json`
- `vite.config.ts`
- Pasta `src`

### Passo 2: Criar Projeto na Vercel
1.  Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Selecione o repositório `sistema-comi-front` e clique em **Import**.

### Passo 3: Configurar Variáveis de Ambiente
Antes de clicar em "Deploy", abra a seção **"Environment Variables"** e adicione:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://sistema-comissao-production.up.railway.app/api/v1` |

> **⚠️ Importante**: Sem essa variável, o frontend não conseguirá se comunicar com o backend na Railway.

### Passo 4: Deploy
1.  Mantenha as configurações de "Build and Output Settings" no padrão (Build: `npm run build`, Output: `dist`).
2.  Clique em **Deploy**.
3.  Aguarde ~1 minuto. Seu site estará online em `https://sistema-comi-front.vercel.app` (ou similar).

---

## 🛠️ Opção 2: Docker Container (Avançado)

Use esta opção apenas se precisar rodar em infraestrutura própria ou em orquestradores como Kubernetes.

### Arquivos de Configuração
O projeto já inclui:
- `Dockerfile` (Multi-stage build)
- `nginx.conf` (Configurado para SPA)

### Comandos para Build e Run
```bash
# 1. Construir a imagem
docker build -t sistema-comi-front .

# 2. Rodar o container
docker run -d -p 80:80 \
  -e VITE_API_URL=https://sistema-comissao-production.up.railway.app/api/v1 \
  sistema-comi-front
```

### Notas Técnicas
- O `Dockerfile` usa Nginx Alpine para servir os arquivos estáticos.
- O `nginx.conf` trata o roteamento SPA (`try_files $uri /index.html`) para evitar erros 404 ao recarregar páginas.
