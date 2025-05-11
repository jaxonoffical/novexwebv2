const mongoose = require('mongoose');

const leoRoleSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    roleId: { type: String, required: true }
});

module.exports = mongoose.models.LeoRole || mongoose.model('LeoRole', leoRoleSchema); 