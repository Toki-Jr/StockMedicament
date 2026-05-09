const success = (res, data, message = 'Succès', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Créé avec succès') =>
  res.status(201).json({ success: true, message, data });

const error = (res, message = 'Erreur serveur', statusCode = 500, details = null) =>
  res.status(statusCode).json({ success: false, message, ...(details && { details }) });

const notFound = (res, message = 'Ressource introuvable') =>
  res.status(404).json({ success: false, message });

const badRequest = (res, message = 'Requête invalide', details = null) =>
  res.status(400).json({ success: false, message, ...(details && { details }) });

const unauthorized = (res, message = 'Non autorisé') =>
  res.status(401).json({ success: false, message });

const forbidden = (res, message = 'Accès interdit') =>
  res.status(403).json({ success: false, message });

module.exports = { success, created, error, notFound, badRequest, unauthorized, forbidden };
