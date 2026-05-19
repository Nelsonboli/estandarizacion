# Etapa 1: Compilación de la aplicación
FROM node:20-bookworm-slim AS builder

WORKDIR /usr/src/app

# Copiar archivos de definición de dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar NestJS
COPY . .
RUN npm run build

# Etapa 2: Entorno de ejecución de producción
FROM node:20-bookworm-slim

WORKDIR /usr/src/app

# Instalar Java JRE para ejecutar el motor JasperReports (Java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias e instalar solo las de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código compilado de NestJS
COPY --from=builder /usr/src/app/dist ./dist

# Copiar la carpeta jasper (plantillas .jasper, librerías .jar y la clase compiled JasperRenderer)
COPY --from=builder /usr/src/app/jasper ./jasper

# Exponer el puerto por defecto de la aplicación
EXPOSE 3000

ENV NODE_ENV=production

# Comando para iniciar la aplicación NestJS
CMD ["node", "dist/main.js"]
