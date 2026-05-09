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

const updateUser = async (req, res) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    return success(res, user);
  } catch (err) {
    return serverError(res, err);
  }
};

const deleteUser = async (req, res) => {
  try {
    await authService.deleteUser(req.params.id);
    return success(res, { message: 'Utilisateur supprimé' });
  } catch (err) {
    return serverError(res, err);
  }
};

module.exports = { register, login, getAllUsers, updateUser, deleteUser };