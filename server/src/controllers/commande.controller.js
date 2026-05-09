const svc = require('../services/commande.service');
const { success, created, badRequest } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query.statut);
    return success(res, data, `${data.length} commande(s)`);
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
    const { quantite, id_medoc } = req.body;
    if (!quantite || !id_medoc)
      return badRequest(res, 'Champs requis : quantite, id_medoc');
    const data = await svc.create(req.body);
    return created(res, data, 'Commande créée');
  } catch (err) { next(err); }
};

const updateStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!statut) return badRequest(res, 'Champ requis : statut');
    const data = await svc.updateStatut(req.params.id, statut);
    return success(res, data, `Commande passée à "${statut}"`);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    return success(res, null, 'Commande supprimée');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStatut, remove };