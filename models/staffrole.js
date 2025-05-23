const mongoose = require('mongoose');

const staffRoleSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    roleId: { type: String, required: true }
});

module.exports = mongoose.models.StaffRole || mongoose.model('StaffRole', staffRoleSchema); 