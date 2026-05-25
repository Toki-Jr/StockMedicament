FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Simulation d'URL pour la phase de génération du code client
RUN npx prisma generate

EXPOSE 5000

# Applique les migrations Prisma à la BDD puis démarre le serveur Node
CMD npx prisma migrate deploy && node src/server.js