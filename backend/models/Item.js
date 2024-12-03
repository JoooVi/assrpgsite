const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: Number, required: true },
    weight: { type: Number, required: true },
    description: { type: String, required: true },
    durability: { type: Number, default: 4 },
    currentUses: { type: Number, default: 0 },
    characteristics: {
      points: { type: Number, default: 0 },
      details: [String],
    },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);