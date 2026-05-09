const app = require('./app'); // On importe la configuration de app.js
const prisma = require('./config/prisma');

// Ajoute ici tes routes de santé ou de test global si besoin
app.get('/test', async (req, res) => {
  try {
    const count = await prisma.medicament.count();
    res.json({ message: "Connexion Prisma OK !", totalMedicaments: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});