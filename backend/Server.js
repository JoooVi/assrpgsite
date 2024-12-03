require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug")("app:server"); // Pacote para logs melhores

// Função para verificar variáveis de ambiente obrigatórias
const checkEnvVariables = () => {
  const requiredEnv = ["JWT_SECRET", "MONGO_URI", "PORT", "CLIENT_URL"];
  const missingEnv = requiredEnv.filter((env) => !process.env[env]);
  if (missingEnv.length) {
    console.error(
      `Erro: As seguintes variáveis de ambiente estão faltando: ${missingEnv.join(", ")}`
    );
    process.exit(1);
  }
};

checkEnvVariables();

const app = express();

// Conectar ao banco de dados
connectDB().catch((err) => {
  console.error("Erro ao conectar ao banco de dados:", err.message);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Configurar CORS usando variável de ambiente
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
};
app.use(cors(corsOptions));

// Rotas
app.use("/api", userRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro capturado:", err.stack);
  const statusCode = err.status || 500;

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Erro de validação",
      details: err.errors,
    });
  }

  res.status(statusCode).json({
    message: err.message || "Erro interno do servidor",
  });
});

// Porta e inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  debug(`Servidor rodando na porta ${PORT}`);
  console.log(`Servidor rodando na porta ${PORT}`);
});