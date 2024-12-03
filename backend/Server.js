require("dotenv").config(); // Carrega as variáveis de ambiente
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const morgan = require("morgan");

// Função para verificar variáveis de ambiente obrigatórias
const checkEnvVariables = () => {
  const requiredEnv = ["JWT_SECRET", "MONGO_URI", "PORT"];
  const missingEnv = requiredEnv.filter((env) => !process.env[env]);
  if (missingEnv.length) {
    console.error(
      `Erro: As seguintes variáveis de ambiente estão faltando: ${missingEnv.join(", ")}`
    );
    process.exit(1); // Encerra a execução
  }
};

checkEnvVariables();

// Inicializa a aplicação Express
const app = express();

// Conecta ao banco de dados
connectDB().catch((err) => {
  console.error("Erro ao conectar ao banco de dados:", err);
  process.exit(1); // Encerra a execução se falhar ao conectar
});

// Middlewares globais
app.use(express.json()); // Suporte a JSON
app.use(morgan("dev")); // Logs de requisição
app.use(cors({
  origin: 'https:/jooovi.github.io', // Substitua pelo domínio do seu GitHub Pages
})); // Habilitar CORS

// Rotas
app.use("/api", userRoutes);

// Middleware para capturar erros
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

// Porta para o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});