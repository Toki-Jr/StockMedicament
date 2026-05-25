#!/bin/sh

echo "⏳ Attente de la disponibilité de la base de données..."
# On attend 5 secondes pour laisser le temps au réseau interne de s'activer
sleep 5

echo "🚀 Application des migrations Prisma..."
npx prisma migrate deploy

echo "🟢 Démarrage du serveur Node.js..."
exec node src/server.js