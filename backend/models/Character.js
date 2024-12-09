const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  currentUses: { type: Number, default: 0 },
  characteristics: {
    points: { type: Number, default: 0 },
    details: [
      {
        name: String,
        description: String,
        cost: Number
      }
    ],
  },
});


const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    generation: {
      type: String,
      required: true,
      enum: ["preCollapse", "collapse", "postCollapse", "current"],
    },
    event: { type: String, default: "" },
    occupation: { type: String, default: "" },
    purpose1: String,
    purpose2: String,
    relationalPurpose1: String,
    relationalPurpose2: String,
    instincts: {
      reaction: { type: Number, default: 0 },
      perception: { type: Number, default: 0 },
      sagacity: { type: Number, default: 0 },
      potency: { type: Number, default: 0 },
      influence: { type: Number, default: 0 },
      resolution: { type: Number, default: 0 },
    },
    knowledge: {
      agrarian: { type: Number, default: 0 },
      biological: { type: Number, default: 0 },
      exact: { type: Number, default: 0 },
      medicine: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      artistic: { type: Number, default: 0 },
    },
    practices: {
      sports: { type: Number, default: 0 },
      tools: { type: Number, default: 0 },
      crafts: { type: Number, default: 0 },
      weapons: { type: Number, default: 0 },
      vehicles: { type: Number, default: 0 },
      infiltration: { type: Number, default: 0 },
    },
    
    assimilation: { type: Number, default: 0 },
    determination: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    healthLevels: {
      type: [Number],
      default: function () {
        const baseHealth =
          Math.max(this.instincts.potency, this.instincts.resolution) + 2;
        return Array(5).fill(baseHealth);
      },
    },
    currentHealthLevel: { type: Number, default: 5 },
    inventory: [inventoryItemSchema], // Inventário com esquema embutido
    characteristics: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CharacterTrait" },
    ], // Características
    assimilations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Assimilation" },
    ], // Assimilações
    notes: { type: String, default: "" }, // Campo para anotações
  },
  { timestamps: true }
);

module.exports = mongoose.model("Character", characterSchema);