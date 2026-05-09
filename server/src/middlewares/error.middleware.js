const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  // Erreurs Prisma
  if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Doublon détecté' });
  if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Enregistrement introuvable' });
  if (err.code === 'P2003') return res.status(400).json({ success: false, message: 'Clé étrangère invalide' });

  // Objet plain { statusCode, message } ou Error classique
  const statusCode = (typeof err.statusCode === 'number' && err.statusCode > 0)
    ? err.statusCode
    : 500;

  const message = typeof err.message === 'string' && err.message
    ? err.message
    : typeof err === 'string'
      ? err
      : 'Erreur interne du serveur';

  return res.status(statusCode).json({ success: false, message });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} introuvable` });
};

module.exports = { errorHandler, notFoundHandler };
