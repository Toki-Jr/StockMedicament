
const { updatePreferencesService } = require('../services/updatePreferences.service');

async function updatePreferencesController(req, res) {

  console.log('=== updatePreferences ===');
  console.log('req.user  :', req.user);
  console.log('req.body  :', req.body);

  const userId  = Number(req.user?.id);
  const { fontSize } = req.body;

  console.log('userId parsé :', userId);
  console.log('fontSize parsé :', fontSize);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'ID utilisateur invalide.' });
  }
  if (!fontSize) {
    return res.status(400).json({ message: 'fontSize requis.' });
  }

  try {
    const data = await updatePreferencesService({ userId, fontSize: Number(fontSize) });
    return res.status(200).json({ message: 'Préférences mises à jour.', ...data });
  } catch (err) {
    console.error('[updatePreferencesController] ERREUR COMPLETE :', err); // ← log complet
    const status  = err.status ?? 500;
    const message = err.status ? err.message : 'Erreur interne.';
    return res.status(status).json({ message });
  }
}

module.exports = { updatePreferencesController };