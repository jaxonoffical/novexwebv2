const mongoose = require('mongoose');

const civRoleSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    roleId: { type: String, required: true }
});

module.exports = mongoose.models.CivRole || mongoose.model('CivRole', civRoleSchema); 