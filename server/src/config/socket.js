const { Server } = require('socket.io'); // Communication en temps réel entre le client et le serveur
const jwt = require('jsonwebtoken'); // Vérification et décodage des tokens JWT

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173', // Application React (Vite)
                'http://localhost:3000', // Application React (CRA)
            ],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }); // Création et configuration du serveur Socket.IO

    // Middleware d'authentification
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; // Récupération du JWT envoyé par le client

        if (!token)
            return next(new Error('Non authentifié'));

        try {
            socket.user = jwt.verify(
                token,
                process.env.JWT_SECRET
            ); // Vérification et décodage du token

            console.log('Info user connecte:', socket.user);

            next(); // Autorise la connexion
        }
        catch {
            next(new Error('Token invalide'));
        }
    });

    // Gestion des connexions des utilisateurs
    io.on('connection', (socket) => {

        console.log(`🔌 Socket connecté : user ${socket.user?.id}`);

        // Ajout de l'utilisateur dans sa room personnelle
        socket.join(`user:${socket.user.id}`);

        // Ajout dans une room correspondant à son rôle
        if (socket.user.role) {
            socket.join(`role:${socket.user.role}`);
        }

        // Gestion de la déconnexion
        socket.on('disconnect', () => {
            console.log(`❌ Socket déconnecté : user ${socket.user?.id}`);
        });
    });

    return io;
}

// Retourne l'instance Socket.IO créée par initSocket()
function getIo() {
    if (!io)
        throw new Error('Socket.io non initialisé');

    return io;
}

module.exports = { initSocket, getIo };


// Explication du socket: Exemple :

// Facebook reçoit une notification immédiatement.
// WhatsApp reçoit un message instantanément.
// Un administrateur voit une nouvelle commande sans recharger la page.

// Tout cela est possible grâce à Socket.IO.

// | Méthode        | Fonction                                                          |
// | -------------- | ----------------------------------------------------------------- |
// | `initSocket()` | Initialise et configure Socket.IO au démarrage du serveur         |
// | `getIo()`      | Retourne l'instance Socket.IO déjà créée pour l'utiliser ailleurs |
