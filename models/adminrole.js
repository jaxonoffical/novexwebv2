const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    roleId: { type: String, required: true }
});

module.exports = mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema); 