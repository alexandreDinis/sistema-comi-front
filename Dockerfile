# Estágio 1: Build da Aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências (usando ci para builds limpos)
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Argumentos de build (podem ser passados via --build-arg)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Executar o build
RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos gerados no estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
