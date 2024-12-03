const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Character = require("../models/Character");

// Registrar Usuário
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "Usuário já existe" });
    return;
  }

  const user = await User.create({ name, email, password });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(201).json({
    message: "Usuário registrado com sucesso",
    user: { id: user._id, email: user.email, name: user.name },
    token,
  });
});

// Login do Usuário
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401).json({ message: "Credenciais inválidas" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    message: "Login bem-sucedido",
    user: { id: user._id, email: user.email, name: user.name },
    token,
  });
});

// Obter Perfil do Usuário
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  res.json({ id: user._id, email: user.email, name: user.name });
});

// Função para calcular os pontos de saúde
const calculateHealthPoints = (character) => {
  const baseHealth =
    Math.max(character.instincts.potency, character.instincts.resolution) + 2;
  character.healthLevels = Array(5).fill(baseHealth);
};

// Criar Personagem
const createCharacter = asyncHandler(async (req, res) => {
  const {
    name,
    generation,
    event,
    occupation,
    purpose1,
    purpose2,
    relationalPurpose1,
    relationalPurpose2,
    instincts,
    knowledge,
    practices,
    assimilation,
    determination,
  } = req.body;

  const newCharacter = new Character({
    name,
    generation,
    event,
    occupation,
    purpose1,
    purpose2,
    relationalPurpose1,
    relationalPurpose2,
    instincts,
    knowledge,
    practices,
    assimilation,
    determination,
    userId: req.userId,
  });

  calculateHealthPoints(newCharacter);

  const savedCharacter = await newCharacter.save();
  res
    .status(201)
    .json({
      message: "Personagem criado com sucesso",
      character: savedCharacter,
    });
});

// Obter Personagens do Usuário
const getCharacters = asyncHandler(async (req, res) => {
  const characters = await Character.find({ userId: req.userId });

  if (!characters || characters.length === 0) {
    res.status(404).json({ message: "Nenhum personagem encontrado" });
    return;
  }

  res.status(200).json(characters);
});

// Função para aplicar dano
const applyDamage = asyncHandler(async (req, res) => {
  const { id, damage } = req.body;
  const character = await Character.findById(id);

  if (!character) {
    res.status(404).json({ message: "Personagem não encontrado" });
    return;
  }

  let remainingDamage = damage;
  for (let i = character.currentHealthLevel - 1; i >= 0; i--) {
    if (remainingDamage <= character.healthLevels[i]) {
      character.healthLevels[i] -= remainingDamage;
      break;
    } else {
      remainingDamage -= character.healthLevels[i];
      character.healthLevels[i] = 0;
      character.currentHealthLevel--;
    }
  }

  await character.save();
  res.status(200).json({ message: "Dano aplicado com sucesso", character });
});

// Excluir Personagem
const deleteCharacter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Busca o personagem pelo ID
  const character = await Character.findById(id);
  if (!character) {
    res.status(404).json({ message: "Personagem não encontrado" });
    return;
  }

  // Verifica se o personagem pertence ao usuário autenticado
  if (character.userId.toString() !== req.userId) {
    res
      .status(403)
      .json({ message: "Você não tem permissão para excluir este personagem" });
    return;
  }

  // Exclui o personagem usando findByIdAndDelete
  await Character.findByIdAndDelete(id); // Usando findByIdAndDelete no lugar de remove()
  res.status(200).json({ message: "Personagem excluído com sucesso" });
});

// Middleware de Autenticação
const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(401).json({ message: "Autenticação falhou" });
  }
});

// Função para obter um personagem pelo ID
const getCharacterById = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id)
    .populate("inventory.item")
    .populate("characteristics")
    .populate("assimilations");
  if (!character) {
    res.status(404).json({ message: "Personagem não encontrado" });
    return;
  }
  res.json(character);
});

const updateCharacterInventory = async (req, res) => {
  const { id } = req.params;
  const { inventory, characteristics, assimilations, notes } = req.body;

  try {
    const character = await Character.findById(id);

    if (!character) {
      return res.status(404).json({ message: "Personagem não encontrado" });
    }

    console.log("Dados recebidos do frontend:", req.body);

    // Atualizando o inventário e as características
    character.inventory = inventory.map(invItem => ({
      item: invItem.item,
      currentUses: invItem.currentUses,
      characteristics: invItem.characteristics || { points: 0, details: [] },
    }));

    character.characteristics = characteristics || character.characteristics;
    character.assimilations = assimilations || character.assimilations;
    character.notes = notes || character.notes;

    await character.save();

    res.status(200).json(character);
  } catch (error) {
    console.error("Erro ao atualizar o personagem:", error);
    res.status(500).json({ message: "Erro ao atualizar o personagem", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  createCharacter,
  getCharacters,
  getCharacterById,
  applyDamage,
  deleteCharacter,
  updateCharacterInventory,
};