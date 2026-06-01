const service = require('../services/alerte.service');

const getAll = async (req, res) => {
  try {
    const alertes = await service.getAll(req.query, req.user.role, req.user.id);
    res.json(alertes);
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const marquerLu = async (req, res) => {
  try {
    res.json(await service.marquerLu(req.params.id, req.user.role, req.user.id));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const marquerToutesLues = async (req, res) => {
  try {
    await service.marquerToutesLues(req.user.role, req.user.id);
    res.json({ message: 'Toutes les alertes marquées comme lues' });
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ message: 'Alerte supprimée' });
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const getNonLues = async (req, res) => {
  try {
    const count = await service.getNonLues(req.user.role, req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, marquerLu, marquerToutesLues, remove, getNonLues };