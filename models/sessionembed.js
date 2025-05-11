
const mongoose = require('mongoose');

const sessionEmbedSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, default: null },
  description: { type: String, required: true },
  image: { type: String, default: null },
});

module.exports = mongoose.model('SessionEmbed', sessionEmbedSchema);
  
