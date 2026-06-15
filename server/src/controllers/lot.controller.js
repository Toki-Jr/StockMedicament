const svc = require('../services/lot.service');
const { success, created, badRequest } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query.id_medoc);
    return success(res, data, `${data.length} lot(s) trouvé(s)`);
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
    const { numero_lot, date_fabrication, date_expiration, medicaments } = req.body;

    if (!numero_lot || !date_fabrication || !date_expiration)
      return badRequest(res, 'Champs requis : numero_lot, date_fabrication, date_expiration');

    if (!medicaments?.length)
      return badRequest(res, 'Au moins un médicament requis (medicaments: [...])');

    // Valider chaque ligne médicament
    for (const m of medicaments) {
      if (!m.id_medoc || !m.quantite_entre)
        return badRequest(res, 'Chaque médicament doit avoir id_medoc et quantite_entre');
    }

    const data = await svc.create(req.body, req.user.id);
    return created(res, data, 'Lot créé');
  } catch (err) { next(err); }
};
const update = async (req, res, next) => {
  try {
    const data = await svc.update(req.params.id, req.body, req.user.id);
    return success(res, data, 'Lot mis à jour');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    return success(res, null, 'Lot supprimé');
  } catch (err) { next(err); }
};

const lotsExpirantBientot = async (req, res, next) => {
  try {
    const data = await svc.lotsExpirantBientot(req.query.jours);
    return success(res, data, `${data.length} lot(s) expirant dans ${req.query.jours || 30} jours`);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, lotsExpirantBientot };