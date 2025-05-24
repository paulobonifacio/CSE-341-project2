const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token = req.header('Authorization');

    // Se o header não existe, retorne erro
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Se começa com "Bearer ", remova para ficar só o token puro
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    // Valida o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
