const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const prisma       = require('./config/prisma'); 

const authRoutes       = require('./routes/auth.routes');
const medicamentRoutes = require('./routes/medicament.routes');
const mouvementRoutes  = require('./routes/mouvement.routes');
const lotsRoutes       = require('./routes/lot.routes');
const commandeRoutes   = require('./routes/commande.routes');
const alerteRoutes     = require('./routes/alerte.routes');
const historiqueRoute  = require('./routes/historique.routes');
const dashboardRoute   = require('./routes/dashboard.routes');

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// 🚀 TA ROUTE DE TEST (Placée ICI, avant les middlewares de capture)
app.get('/test', async (req, res) => {
  try {
    const count = await prisma.medicament.count();
    res.json({ message: "Connexion Prisma OK !", totalMedicaments: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Les routes de l'API
app.use('/api/auth',        authRoutes);
app.use('/api/medicaments', medicamentRoutes);
app.use('/api/mouvements',  mouvementRoutes);
app.use('/api/lots',        lotsRoutes);
app.use('/api/commandes',   commandeRoutes);
app.use('/api/alertes',     alerteRoutes);
app.use('/api/historiques', historiqueRoute);
app.use('/api/dashboard',   dashboardRoute);

// ⚠️ Gestionnaires d'erreurs (TOUJOURS en dernier après toutes les routes)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;