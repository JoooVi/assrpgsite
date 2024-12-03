const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  createCharacter,
  getCharacters,
  getCharacterById,
  applyDamage,
  deleteCharacter,
  updateCharacterInventory,
} = require("../controllers/userController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Item = require("../models/Item");
const Assimilation = require("../models/Assimilation");
const CharacterTrait = require("../models/CharacterTrait");

// Middleware para obter item por ID
async function getItem(req, res, next) {
  let item;
  try {
    item = await Item.findById(req.params.id);
    if (item == null) {
      return res
        .status(404)
        .json({ message: "Não foi possível encontrar o item" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.item = item;
  next();
}

// Middleware para obter assimilação por ID
async function getAssimilation(req, res, next) {
  let assimilation;
  try {
    assimilation = await Assimilation.findById(req.params.id);
    if (assimilation == null) {
      return res
        .status(404)
        .json({ message: "Não foi possível encontrar a assimilação" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.assimilation = assimilation;
  next();
}

// Middleware para obter característica por ID
async function getCharacterTrait(req, res, next) {
  let characterTrait;
  try {
    characterTrait = await CharacterTrait.findById(req.params.id);
    if (characterTrait == null) {
      return res
        .status(404)
        .json({ message: "Não foi possível encontrar a característica" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.characterTrait = characterTrait;
  next();
}

// Rotas de usuário
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

// Rotas de personagem
router.post("/characters", protect, createCharacter);
router.get("/characters", protect, getCharacters);
router.get("/characters/:id", protect, getCharacterById);
router.post("/characters/:id/damage", protect, applyDamage);
router.delete("/characters/:id", protect, deleteCharacter);

// Rota para atualizar o inventário, características e assimilações do personagem
router.put("/characters/:id/inventory", protect, updateCharacterInventory);

// Rotas de itens
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/items/custom", protect, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/items/:id", getItem, (req, res) => {
  res.json(res.item);
});

router.post("/items", protect, async (req, res) => {
  const item = new Item({
    name: req.body.name,
    type: req.body.type,
    category: req.body.category,
    weight: req.body.weight,
    description: req.body.description,
    durability: req.body.durability,
    currentUses: req.body.currentUses,
    characteristics: {
      points: req.body.characteristics.points,
      details: req.body.characteristics.details,
    },
    isCustom: req.body.isCustom,
    createdBy: req.user._id,
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/items/:id", protect, getItem, async (req, res) => {
  if (req.body.name != null) {
    res.item.name = req.body.name;
  }
  if (req.body.type != null) {
    res.item.type = req.body.type;
  }
  if (req.body.category != null) {
    res.item.category = req.body.category;
  }
  if (req.body.weight != null) {
    res.item.weight = req.body.weight;
  }
  if (req.body.description != null) {
    res.item.description = req.body.description;
  }
  if (req.body.durability != null) {
    res.item.durability = req.body.durability;
  }
  if (req.body.currentUses != null) {
    res.item.currentUses = req.body.currentUses;
  }
  if (req.body.characteristics != null) {
    res.item.characteristics = req.body.characteristics;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/items/:id", protect, getItem, async (req, res) => {
  try {
    await res.item.remove();
    res.json({ message: "Item deletado" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rotas de assimilações
router.get("/assimilations", async (req, res) => {
  try {
    const assimilations = await Assimilation.find();
    res.json(assimilations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/assimilations/custom", protect, async (req, res) => {
  try {
    const assimilations = await Assimilation.find({ createdBy: req.user._id });
    res.json(assimilations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/assimilations/:id", getAssimilation, (req, res) => {
  res.json(res.assimilation);
});

router.post("/assimilations", protect, async (req, res) => {
  const assimilation = new Assimilation({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    successCost: req.body.successCost,
    adaptationCost: req.body.adaptationCost,
    pressureCost: req.body.pressureCost,
    evolutionType: req.body.evolutionType,
    isCustom: req.body.isCustom,
    createdBy: req.user._id,
  });
  try {
    const newAssimilation = await assimilation.save();
    res.status(201).json(newAssimilation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch(
  "/assimilations/:id",
  protect,
  getAssimilation,
  async (req, res) => {
    if (req.body.name != null) {
      res.assimilation.name = req.body.name;
    }
    if (req.body.description != null) {
      res.assimilation.description = req.body.description;
    }
    if (req.body.category != null) {
      res.assimilation.category = req.body.category;
    }
    if (req.body.successCost != null) {
      res.assimilation.successCost = req.body.successCost;
    }
    if (req.body.adaptationCost != null) {
      res.assimilation.adaptationCost = req.body.adaptationCost;
    }
    if (req.body.pressureCost != null) {
      res.assimilation.pressureCost = req.body.pressureCost;
    }
    if (req.body.evolutionType != null) {
      res.assimilation.evolutionType = req.body.evolutionType;
    }
    try {
      const updatedAssimilation = await res.assimilation.save();
      res.json(updatedAssimilation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete(
  "/assimilations/:id",
  protect,
  getAssimilation,
  async (req, res) => {
    try {
      await res.assimilation.remove();
      res.json({ message: "Assimilação deletada" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Rotas de características
router.get("/charactertraits", async (req, res) => {
  try {
    const characterTraits = await CharacterTrait.find();
    res.json(characterTraits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/charactertraits/custom", protect, async (req, res) => {
  try {
    const characterTraits = await CharacterTrait.find({
      createdBy: req.user._id,
    });
    res.json(characterTraits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/charactertraits/:id", getCharacterTrait, (req, res) => {
  res.json(res.characterTrait);
});

router.post("/charactertraits", protect, async (req, res) => {
  const characterTrait = new CharacterTrait({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    pointsCost: req.body.pointsCost,
    isCustom: req.body.isCustom,
    createdBy: req.user._id,
  });
  try {
    const newCharacterTrait = await characterTrait.save();
    res.status(201).json(newCharacterTrait);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch(
  "/charactertraits/:id",
  protect,
  getCharacterTrait,
  async (req, res) => {
    if (req.body.name != null) {
      res.characterTrait.name = req.body.name;
    }
    if (req.body.description != null) {
      res.characterTrait.description = req.body.description;
    }
    if (req.body.category != null) {
      res.characterTrait.category = req.body.category;
    }
    if (req.body.pointsCost != null) {
      res.characterTrait.pointsCost = req.body.pointsCost;
    }
    try {
      const updatedCharacterTrait = await res.characterTrait.save();
      res.json(updatedCharacterTrait);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete(
  "/charactertraits/:id",
  protect,
  getCharacterTrait,
  async (req, res) => {
    try {
      await res.characterTrait.remove();
      res.json({ message: "Característica deletada" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;