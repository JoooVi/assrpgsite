const mongoose = require('mongoose');

const AssimilationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Exemplo: Sensorial, Adaptativa, etc.
  successCost: { type: Number, required: true }, // Custo em sucessos (joaninhas)
  adaptationCost: { type: Number, required: true }, // Custo em adaptações (cervo)
  pressureCost: { type: Number, required: true }, // Custo em pressões (coruja)
  evolutionType: { type: String, enum: ['copas', 'ouros', 'espadas'], required: true }, // Tipo de evolução para as cartas
  isCustom: { type: Boolean, default: false }, // Indica se a assimilação é personalizada
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência ao usuário que criou a assimilação
}, { timestamps: true });

module.exports = mongoose.model('Assimilation', AssimilationSchema);