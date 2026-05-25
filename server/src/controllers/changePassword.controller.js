const { changePasswordService } = require('../services/changePassword.service');

async function changePasswordController(req, res) {
  const userId = Number(req.params.id); // ← String "1" → Number 1

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'ID utilisateur invalide.' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
  }

  try {
    await changePasswordService({ userId, currentPassword, newPassword });
    return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });

  } catch (err) {
    console.error('[changePasswordController]', err); // ← lis ce log pour confirmer
    const status  = err.status ?? 500;
    const message = err.status ? err.message : 'Erreur interne du serveur.';
    return res.status(status).json({ message });
  }
}

module.exports = { changePasswordController };