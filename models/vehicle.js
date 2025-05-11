const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  numberPlate: { type: String, required: true }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);