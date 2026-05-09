FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Simulation d'URL pour la phase de génération du code client
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/server.js"]
