const authService = require('../services/auth.service');
const { success, created, badRequest, serverError } = require('../utils/response');
const { generateOtp, saveOtp, verifyOtp: checkOtp, checkOtpOnly } = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    const otp = generateOtp();
    saveOtp(`register:${req.body.email}`, otp);        // ← préfixe
    await sendOtpEmail(req.body.email, otp);
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

const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });
  const otp = generateOtp();
  saveOtp(`register:${email}`, otp);                   // ← préfixe
  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'Code envoyé' });
  } catch (err) {
    res.status(500).json({ message: "Échec de l'envoi" });
  }
};

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const result = checkOtp(`register:${email}`, otp);   // ← préfixe
  if (!result.valid) return res.status(400).json({ message: result.reason });
  res.json({ message: 'Email vérifié avec succès' });
};

const forgotPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ message: 'Email requis' });
  try {
    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });
    const otp = generateOtp();
    saveOtp(`reset:${email}`, otp);                    // ← préfixe
    await sendOtpEmail(email, otp);
    res.json({ message: 'Code envoyé' });
  } catch (err) {
    res.status(500).json({ message: "Échec de l'envoi" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Champs manquants' });
  const result = checkOtp(`reset:${email}`, otp);      // ← préfixe
  if (!result.valid) return res.status(400).json({ message: result.reason });
  try {
    await authService.updatePassword(email, newPassword);
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { 
  register, login, getAllUsers, getMe,updateUser, 
  updateMe, deleteMe, deleteUser, approuverUser, 
  sendOtp, verifyOtp, forgotPassword, resetPassword, 
};