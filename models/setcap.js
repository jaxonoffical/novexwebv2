const mongoose = require('mongoose');

const setCapSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    vehicleCap: { type: Number, required: true }
});

module.exports = mongoose.models.SetCap || mongoose.model('SetCap', setCapSchema); 