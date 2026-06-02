const service = require('../services/dashboard.service');

const getStats = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'user') {
      return res.json(await service.getStatsUser(id));
    }

    res.json(await service.getStats());
  } catch (err) {
    console.error('gets error: ', err);
    res.status(500).json({ message: err.message });
  }
};

const getCommandesParJour = async (req, res) => {
  try {
    res.json(await service.getCommandesParJour());
  } catch (err) {
    console.error('gets error: ', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getCommandesParJour };