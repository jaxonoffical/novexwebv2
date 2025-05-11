const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const BotSettings = require('./models/botsettings');
const LeoRole = require('./models/leorole');
const CivRole = require('./models/civrole');
const StaffRole = require('./models/staffrole');
const AdminRole = require('./models/adminrole');
const Vehicle = require('./models/vehicle');
const Ticket = require('./models/ticket');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1500;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://novex:novex.connect@cluster0.nwjhmtl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Discord Authentication Routes
app.get('/auth', (req, res) => {
    const redirectUri = 'http://localhost:1500/callback';
    const clientId = process.env.DISCORD_CLIENT_ID;
    const scope = 'identify guilds';
    const responseType = 'code';

    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No authorization code provided');

    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Client ID or Client Secret missing');
    }

    const formData = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: 'http://localhost:1500/callback',
    });

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const guildsResponse = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = userResponse.data;
        const avatarUrl = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

        const userData = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: avatarUrl,
        };

        const guildsData = guildsResponse.data;

        res.send(`
            <script>
                localStorage.setItem('userData', ${JSON.stringify(JSON.stringify(userData))});
                localStorage.setItem('guildsData', ${JSON.stringify(JSON.stringify(guildsData))});
                window.location.href = '/dashboard';
            </script>
        `);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return res.status(500).send('Failed to authenticate user');
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/dashboard.html'));
});

// Session Embed API Routes
app.post('/api/embed/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { type, title, description, image } = req.body;

        // Validate required fields
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        // Find the bot settings for the given guildId
        let settings = await BotSettings.findOne({ guildId });

        if (!settings) {
            settings = new BotSettings({
                guildId,
                embedColor: '#000000',
            });
        }

        // Update the specific embed type
        const field = `${type}Embed`;
        settings[field] = { title, description, image };
        await settings.save();

        res.status(200).json(settings[field]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save or update the embed' });
    }
});

app.get('/api/embed/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const settings = await BotSettings.findOne({ guildId });

        if (!settings) {
            return res.status(200).json({});
        }

        // Format the response to match the expected structure
        const result = {
            startup: settings.startupEmbed,
            ea: settings.eaEmbed,
            release: settings.releaseEmbed,
            reinvites: settings.reinvitesEmbed,
            over: settings.overEmbed
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve the embed data' });
    }
});

// Add these routes to your server code (index.js)

// Get all tickets for a guild
app.get('/api/tickets/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const tickets = await Ticket.find({ guildId });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Delete a ticket
app.delete('/api/tickets/:guildId/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        await Ticket.findByIdAndDelete(ticketId);
        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// Update a ticket
app.put('/api/tickets/:guildId/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { offense, price, count } = req.body;
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { offense, price, count },
            { new: true }
        );
        
        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// Get all vehicles for a guild
app.get('/api/vehicles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const vehicles = await Vehicle.find({ guildId });
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// Delete a vehicle
app.delete('/api/vehicles/:guildId/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        await Vehicle.findByIdAndDelete(vehicleId);
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

// Update a vehicle
app.put('/api/vehicles/:guildId/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { year, make, model, color, numberPlate } = req.body;
        
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { year, make, model, color, numberPlate },
            { new: true }
        );
        
        res.status(200).json(updatedVehicle);
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'Failed to update vehicle' });
    }
});

// Role Configuration API Routes (like embed API)
app.get('/api/roles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const settings = await BotSettings.findOne({ guildId });

        if (!settings) {
            return res.status(200).json({
                leo: { id: null },
                civi: { id: null },
                staff: { id: null },
                admin: { id: null },
                vehicleCap: 0
            });
        }

        res.status(200).json({
            leo: { id: settings.leoRoleId },
            civi: { id: settings.civiRoleId },
            staff: { id: settings.staffRoleId },
            admin: { id: settings.adminRoleId },
            vehicleCap: settings.vehicleCap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve role settings' });
    }
});

app.post('/api/roles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { leo, civi, staff, admin, vehicleCap } = req.body;

        let settings = await BotSettings.findOne({ guildId });
        if (!settings) {
            settings = new BotSettings({ guildId });
        }

        if (leo && leo.id !== undefined) settings.leoRoleId = leo.id;
        if (civi && civi.id !== undefined) settings.civiRoleId = civi.id;
        if (staff && staff.id !== undefined) settings.staffRoleId = staff.id;
        if (admin && admin.id !== undefined) settings.adminRoleId = admin.id;
        if (vehicleCap !== undefined) settings.vehicleCap = vehicleCap;

        await settings.save();

        res.status(200).json({
            leo: { id: settings.leoRoleId },
            civi: { id: settings.civiRoleId },
            staff: { id: settings.staffRoleId },
            admin: { id: settings.adminRoleId },
            vehicleCap: settings.vehicleCap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save role settings' });
    }
});

// Get All Roles API Route
app.get('/api/all-roles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;

        // Find bot settings for the guild
        const settings = await BotSettings.findOne({ guildId });

        if (!settings) {
            return res.status(200).json({
                leo: null,
                civilian: null,
                staff: null,
                admin: null,
                vehicleCap: 0
            });
        }

        // Format the response
        const roles = {
            leo: settings.leoRoleId,
            civilian: settings.civiRoleId,
            staff: settings.staffRoleId,
            admin: settings.adminRoleId,
            vehicleCap: settings.vehicleCap
        };

        res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

app.get('/sign-in', (req, res) => {
    res.sendFile(path.join(__dirname, 'sign-in.html'));
});


// Serve index.html for /home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Tickets API Routes
app.get('/api/tickets/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const tickets = await Ticket.find({ guildId });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

app.delete('/api/tickets/:guildId/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        await Ticket.findByIdAndDelete(ticketId);
        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// Vehicles API Routes
app.get('/api/vehicles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const vehicles = await Vehicle.find({ guildId });
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

app.delete('/api/vehicles/:guildId/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        await Vehicle.findByIdAndDelete(vehicleId);
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Add this at the end of your routes in index.js
app.use((req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Novex | Page Not Found</title>
      <link rel="icon" type="image/png" href="images/logo.png">
      <link rel="stylesheet" href="styles.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          min-height: 100vh;
          background: var(--discord-black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          margin: 0;
        }
        .not-found-container {
          background: rgba(30, 31, 34, 0.95);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          padding: 48px 36px 36px 36px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
        }
        .not-found-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
          border-radius: 24px 24px 0 0;
        }
        .not-found-logo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin-bottom: 18px;
          box-shadow: 0 2px 12px rgba(88,101,242,0.15);
        }
        .not-found-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .not-found-desc {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 32px;
        }
        .home-btn {
          background: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
          color: white;
          border: none;
          padding: 16px 0;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
          box-shadow: 0 2px 12px rgba(88,101,242,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .home-btn:hover {
          background: var(--button-hover);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="particles-container" id="particles-js"></div>
      <div class="not-found-container">
        <img src="images/logo.png" alt="Novex Logo" class="not-found-logo">
        <div class="not-found-title">This page does not exist</div>
        <div class="not-found-desc">The page you are looking for might have been removed or is temporarily unavailable.</div>
        <button class="home-btn" onclick="window.location.href='/home'">
          <i class="fas fa-home"></i>
          Return to Home Page
        </button>
      </div>
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script>
        particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#5865F2' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#5865F2', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
          },
          interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
          },
          retina_detect: true
        });
      </script>
    </body>
    </html>
  `);
});