const jwt = require("jsonwebtoken");

// Chave secreta para assinar os tokens JWT (pode definir no arquivo .env se preferir)
const JWT_SECRET = process.env.JWT_SECRET || "secreta_recupera_ifrn_2026";

/**
 * Gera um token JWT para o usuário autenticado.
 */
function signUserToken(usuario) {
  return jwt.sign(
    {
      matricula: usuario.matricula,
      email: usuario.email,
      coapac: Boolean(usuario.coapac),
    },
    JWT_SECRET,
    { expiresIn: "1d" } // Token válido por 1 dia
  );
}

/**
 * Middleware para validar o token enviado no header Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Formato do token inválido." });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Anexa as informações do usuário requisição
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

/**
 * Middleware para restringir o acesso apenas a servidores/administradores da COAPAC
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.coapac) {
    return res.status(403).json({ error: "Acesso negado: requer permissão da COAPAC." });
  }
  return next();
}

module.exports = {
  signUserToken,
  authMiddleware,
  requireAdmin,
};