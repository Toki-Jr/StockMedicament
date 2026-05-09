const svc = require('../services/medicament.service');
const { success, created, notFound, badRequest } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query.search);
    return success(res, data, `${data.length} médicament(s) trouvé(s)`);
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
    const { code_cip, nom, forme, dosage, prix_unitaire, seuil_alerte_qte, seuil_alerte_peremption } = req.body;
    if (!code_cip || !nom || !forme || dosage == null || prix_unitaire == null)
      return badRequest(res, 'Champs requis : code_cip, nom, forme, dosage, prix_unitaire, seuil_alerte_qte, seuil_alerte_peremption');

    const data = await svc.create(req.body);
    return created(res, data, 'Médicament ajouté');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await svc.update(req.params.id, req.body);
    return success(res, data, 'Médicament mis à jour');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    return success(res, null, 'Médicament supprimé');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };