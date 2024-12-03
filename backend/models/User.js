const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Definição do modelo de usuário
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      match: [/\S+@\S+\.\S+/, "E-mail inválido"],
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória"],
    },
    name: {
      type: String,
      required: [true, "O nome é obrigatório"],
    },
  },
  { timestamps: true } // Adiciona timestamps automaticamente
);

// Middleware para criptografar a senha antes de salvar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (process.env.NODE_ENV !== "production") {
      console.log("Senha criptografada com sucesso");
    }
    next();
  } catch (error) {
    console.error("Erro ao criptografar a senha:", error);
    next(error);
  }
});

// Método para comparar senhas durante o login
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    throw new Error("Erro ao verificar a senha");
  }
};

// Remover a senha ao retornar o objeto do usuário
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Criação do modelo de usuário
const User = mongoose.model("User", userSchema);

module.exports = User;