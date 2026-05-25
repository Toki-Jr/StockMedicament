const service = require('../services/dashboard.service');

const getStats = async (req, res) => {
  try {
    res.json(await service.getStats());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommandesParJour = async (req, res) => {
  try {
    res.json(await service.getCommandesParJour());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getCommandesParJour };