FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npx prisma generate

EXPOSE 5000

# Rendre le script de démarrage exécutable
RUN chmod +x start.sh

# Lancement propre via le script
CMD ["./start.sh"]