const jwt = require("jsonwebtoken");

// Middleware para proteger rotas que exigem autenticação
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o cabeçalho de autorização foi fornecido
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Token não fornecido ou mal formatado");
    return res
      .status(401)
      .json({
        message: "Autorização inválida: Token ausente ou mal formatado",
      });
  }

  const token = authHeader.split(" ")[1]; // Remove "Bearer " do token

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona o ID do usuário ao objeto req para uso nas rotas
    req.userId = decoded.userId;

    // Prossegue para a próxima função do middleware
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("Token expirado:", error);
      return res
        .status(401)
        .json({ message: "Sessão expirada. Faça login novamente." });
    }

    console.error("Erro ao verificar o token:", error);
    res.status(401).json({ message: "Token inválido. Autenticação falhou." });
  }
};

module.exports = { protect };