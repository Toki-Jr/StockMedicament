const authService = require('../services/auth.service');
const { success, created, badRequest, serverError } = require('../utils/response');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return created(res, user);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    return success(res, users);
  } catch (err) {
    return serverError(res, err);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    return success(res, user);
  } catch (err) {
    return serverError(res, err);
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await authService.updateUser(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMe = async (req, res) => {
  try {
    await authService.deleteUser(req.user.id, req.user.id);
    res.json({ message: 'Compte supprimé' });
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await authService.deleteUser(req.params.id, req.user.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: err.message });
  }
};

const approuverUser = async (req, res) => {
  try {
    const user = await authService.approuverUser(req.params.id, req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getAllUsers, getMe,updateUser, updateMe, deleteMe, deleteUser, approuverUser };