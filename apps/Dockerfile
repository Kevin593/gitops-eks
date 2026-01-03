# Imagen base oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json
COPY package.json .

# Instalamos dependencias
RUN npm install

# Copiamos el código fuente
COPY src ./src

# Exponemos el puerto de la app
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
