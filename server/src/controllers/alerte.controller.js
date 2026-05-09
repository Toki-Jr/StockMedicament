const svc = require('../services/alerte.service');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query);
    return success(res, data, `${data.length} alerte(s)`);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await svc.getById(req.params.id);
    return success(res, data);
  } catch (err) { next(err); }
};

const marquerLu = async (req, res, next) => {
  try {
    const data = await svc.marquerLu(req.params.id);
    return success(res, data, 'Alerte marquée comme lue');
  } catch (err) { next(err); }
};

const marquerToutesLues = async (req, res, next) => {
  try {
    const result = await svc.marquerToutesLues();
    return success(res, result, `${result.count} alerte(s) marquée(s) comme lues`);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    return success(res, null, 'Alerte supprimée');
  } catch (err) { next(err); }
};

const getNonLues = async (req, res, next) => {
  try {
    const count = await svc.getNonLues();
    return success(res, { count }, `${count} alerte(s) non lue(s)`);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, marquerLu, marquerToutesLues, remove, getNonLues };