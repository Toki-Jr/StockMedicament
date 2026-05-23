const service = require('../services/historique.service');

const getAll = async (req, res) => {
  try { res.json(await service.getAll(req.query)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try { res.json(await service.remove(req.params.id)); }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const removeAll = async (req, res) => {
  try { res.json(await service.removeAll()); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, remove, removeAll };