const svc = require('../services/mouvement.service');
const { success, created, badRequest } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query);
    return success(res, data, `${data.length} mouvement(s)`);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await svc.getById(req.params.id);
    return success(res, data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { type_mvt, quantite_mvt, motif, id_lot } = req.body;
    if (!type_mvt || !quantite_mvt || !motif || !id_lot)
      return badRequest(res, 'Champs requis : type_mvt (entree|sortie), quantite_mvt, motif, id_lot');
    if (!['entree', 'sortie'].includes(type_mvt))
      return badRequest(res, "type_mvt doit être 'entree' ou 'sortie'");

    const data = await svc.create(req.body);
    return created(res, data, `Mouvement de ${type_mvt} enregistré`);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await svc.getStats();
    return success(res, data, 'Statistiques des mouvements');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, getStats };