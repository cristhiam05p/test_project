# -------- DEV (Vite) --------
FROM node:20-alpine AS dev
WORKDIR /app

# Copiamos manifests primero para cache
COPY package*.json ./

# npm ci si hay lockfile, si no npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copiamos el resto del proyecto
COPY . .

EXPOSE 5173
# Vite dentro de contenedor debe escuchar en 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


# -------- BUILD --------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build


# -------- PROD (Nginx) --------
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
