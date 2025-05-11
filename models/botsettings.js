const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    leoRoleId: { type: String, default: null },
    civiRoleId: { type: String, default: null },
    staffRoleId: { type: String, default: null },
    adminRoleId: { type: String, default: null }, 
    vehicleCap: { type: Number, default: 0 },  

    startupEmbed: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
    },
    eaEmbed: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
    },
    releaseEmbed: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
    },
    reinvitesEmbed: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
    },
    overEmbed: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
    },
});

// Use overwrite-safe export
module.exports = mongoose.models.BotSettings || mongoose.model('BotSettings', botSettingsSchema);