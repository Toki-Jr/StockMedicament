const { verifyToken } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return unauthorized(res, 'Token manquant ou invalide');
  try {
    req.user = verifyToken(authHeader.split(' ')[1]);
    next();
  } catch (err) {
    return unauthorized(res, 'Token expiré ou invalide');
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return forbidden(res, `Accès réservé aux rôles : ${roles.join(', ')}`);
  next();
};

module.exports = { authenticate, authorize };
