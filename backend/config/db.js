const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Banco de dados conectado com sucesso");
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1);
  }
};

module.exports = connectDB;