const service = require('../services/commande.service');
const { success } = require('../utils/response');

const create          = async (req, res) => {
  try { res.status(201).json(await service.create(req.user.id, req.body)); }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const envoyer         = async (req, res) => {
  try { res.json(await service.envoyer(req.params.id, req.user.id, req.user.role)); }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const removeBrouillon = async (req, res) => {
  try { res.json(await service.removeBrouillon(req.params.id, req.user.id, req.user.role)); }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const valider         = async (req, res) => {
  try { 
    const { motif } = req.body;
    res.json(await service.valider(req.params.id, motif, req.user.id));
  }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const rejeter = async (req, res) => {
  try {
    const { motif } = req.body;
    if (!motif || motif.trim() === '')
      return res.status(400).json({ message: 'Le motif de rejet est obligatoire' });

    
    res.json(await service.rejeter(req.params.id, motif.trim(), req.user.id));
  }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const getAll          = async (req, res) => {
  try { res.json(await service.getAll(req.user.role, req.user.id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const getById         = async (req, res) => {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { res.status(err.statusCode ?? 500).json({ message: err.message }); }
};

const removeCommande = async (req, res, next) => {
  try {
    await service.removeCommande(req.params.id, req.user.id);
    return success(res, null, 'Commande supprimée');
  } catch (err) { next(err); }
};


module.exports = { create, envoyer, removeBrouillon, valider, rejeter, getAll, getById, removeCommande };