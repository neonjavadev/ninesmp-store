# 🎮 NineSMP Store System

A complete, production-ready Minecraft server store system with automatic rank delivery, admin panel, and Discord integration.

## 🌟 Features

### 🛍️ Store Website
- **Modern UI**: Premium design with glassmorphism and animations
- **4 Rank Packages**: VIP (₹80), MVP (₹250), STAR (₹500), GOD (₹1000)
- **11 Key Types**: Survival keys (Epic, Mythic, Amythest) and Lifesteal keys (Elite, Spawner, Amythest, Prime)
- **Responsive Design**: Works on desktop and mobile
- **Discord Integration**: Seamless purchase flow

### 🔐 Admin Panel
- **Secure Login**: JWT-based authentication
- **Manual Delivery**: Select username, platform (Java/Bedrock), and package
- **Delivery History**: Track all deliveries with status (pending/completed/failed)
- **Real-time Updates**: Instant delivery creation and status tracking

### 🚀 Backend API
- **Node.js/Express**: Fast and scalable REST API
- **MongoDB Atlas**: Cloud database for delivery records
- **Discord Webhooks**: Automatic notifications for deliveries
- **Plugin API**: Endpoints for Minecraft plugin communication

### 🎯 Minecraft Plugin
- **Auto-Polling**: Checks for pending deliveries Every 60 seconds
- **Command Execution**: Runs configured commands on server console
- **Error Handling**: Marks failed deliveries and notifies Discord
- **Configurable**: Fully customizable command mappings

## 📁 Project Structure

```
rank2/
├── ninemc-launchpad/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Store.tsx      # Store page with all products
│   │   │   ├── Admin.tsx      # Admin panel
│   │   │   └── Index.tsx      # Home page
│   │   └── components/
│   └── package.json
│
├── backend/                    # Backend API (Node.js)
│   ├── server.js              # Main server file
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── delivery.js        # Delivery management
│   │   └── plugin.js          # Minecraft plugin API
│   ├── models/
│   │   └── Delivery.js        # MongoDB schema
│   ├── services/
│   │   └── discord.js         # Discord webhook service
│   └── package.json
│
├── minecraft-plugin/           # Minecraft Plugin (Java)
│   ├── src/main/java/fun/ninemc/rankdelivery/
│   │   ├── RankDeliveryPlugin.java
│   │   ├── api/ApiClient.java
│   │   └── commands/CommandExecutor.java
│   ├── src/main/resources/
│   │   ├── plugin.yml
│   │   └── config.yml
│   └── pom.xml
│
└── DEPLOYMENT.md               # Complete deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free)
- Minecraft Paper/Spigot server (1.16+)
- Maven (for plugin compilation)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and settings
npm install
npm start
```

### 2. Frontend Setup

```bash
cd ninemc-launchpad
npm install
npm run dev
```

Visit `http://localhost:5173`

### 3. Plugin Setup

```bash
cd minecraft-plugin
mvn clean package
# Copy target/RankDelivery-1.0.0.jar to your server's plugins folder
# Edit plugins/RankDelivery/config.yml with your backend URL
# Restart server
```

## 📦 Package Details

### Ranks

| Rank | Price | Perks |
|------|-------|-------|
| **VIP** | ₹80 | 4 homes, /anvil, /craft, 1 shard/6min, Epic Keys |
| **MVP** | ₹250 | 6 homes (LS) / 4 homes (Survival), all VIP perks + more |
| **STAR** | ₹500 | 8 homes (LS) / 5 homes (Survival), 4 shards/6min |
| **GOD** | ₹1000 | All kits, unlimited homes, all perks |

### Keys

**Survival**: Epic (₹40), Mythic (₹60), Amythest (₹100)  
**Lifesteal**: Elite (₹40), Spawner (₹100), Amythest (₹100), Prime (₹150)

## 🔒 Admin Access

- **URL**: `https://your-domain.netlify.app/admin`
- **Default Password**: `ninesmp2024` (Change this in production!)

## 🎯 How It Works

1. **Customer Purchase**: Customer clicks "Buy Now" and contacts via Discord
2. **Admin Creates Delivery**: Admin logs in and creates delivery via panel
3. **Discord Notification**: Webhook sends notification to Discord channel
4. **Plugin Polls**: Minecraft plugin checks backend every 60 seconds
5. **Command Execution**: Plugin executes rank/key delivery commands
6. **Completion**: Backend marks delivery as complete, Discord notified

## 🛠️ Configuration

### Backend Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
DISCORD_WEBHOOK_URL=your_discord_webhook_url
PLUGIN_API_KEY=your_plugin_api_key
CORS_ORIGINS=https://your-frontend-url.netlify.app
```

### Plugin Configuration

Edit `plugins/RankDelivery/config.yml`:

```yaml
api:
  url: "https://your-backend-url.railway.app"
  key: "your-plugin-api-key"

polling:
  interval: 60  # seconds
  enabled: true

commands:
  VIP:
    - "lp user {username} parent add vip"
    - "give {username} diamond 64"
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### Delivery Management
- `POST /api/delivery/create` - Create delivery (Admin)
- `GET /api/delivery/history` - Get delivery history (Admin)
- `GET /api/delivery/pending` - Get pending count (Admin)

### Plugin API
- `GET /api/plugin/pending` - Fetch pending deliveries
- `POST /api/plugin/complete` - Mark delivery complete
- `POST /api/plugin/failed` - Mark delivery failed

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions covering:

- MongoDB Atlas setup
- Backend deployment (Railway/Render)
- Frontend deployment (Netlify)
- Minecraft plugin installation
- Discord webhook configuration

## 🐛 Troubleshooting

### Plugin Not Connecting to Backend

1. Check `config.yml` has correct API URL (with https://)
2. Verify backend is running: Visit `/health` endpoint
3. Check API key matches in both backend and plugin

### Deliveries Not Executing

1. Check server console for plugin logs
2. Verify command mappings in `config.yml`
3. Test commands manually in server console
4. Ensure plugin has operator permissions

### Discord Webhooks Not Sending

1. Verify webhook URL is correct and webhook exists
2. Check backend logs for webhook errors
3. Test webhook with a manual POST request

## 📝 Admin Commands

In Minecraft server console:

```
/rd status    - View plugin status
/rd reload    - Reload configuration
/rd poll      - Manually check for deliveries
```

## 🔐 Security Notes

- Change `ADMIN_PASSWORD` before production use
- Use strong, random `JWT_SECRET`
- Use strong, random `PLUGIN_API_KEY`
- Configure MongoDB IP whitelist (optional)
- Enable HTTPS for all deployments
- Regularly backup MongoDB database

## 📊 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- shadcn/ui components
- Lucide icons

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- Axios

### Minecraft Plugin
- Paper API 1.20.1
- Java 17
- Gson for JSON
- Maven build system

## 🎉 Features in Detail

### Store Page
- Beautiful product cards with hover effects
- Detailed perk listings for each rank
- Separate sections for Survival and Lifesteal keys
- Special offers and promotions
- Mobile-responsive design

### Admin Panel
- Secure password-based login
- Clean dashboard interface
- Quick delivery creation form
- Real-time delivery history
- Status indicators (pending/completed/failed)
- Automatic Discord notifications

### Backend API
- RESTful API design
- JWT authentication
- MongoDB integration
- Error handling and logging
- CORS configuration
- Health check endpoint

### Minecraft Plugin
- Automatic polling system
- Configurable poll interval
- Command placeholder support ({username}, {platform})
- Error recovery and retry logic
- In-game player notifications
- Console command execution
- Detailed logging

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review backend logs (Railway/Render dashboard)
3. Check Minecraft server logs
4. Test API endpoints manually

## 📄 License

MIT License - Free to use and modify

---

Made with ❤️ for NineSMP

**Discord Webhook**: Configured for instant notifications  
**Free Hosting**: Works with free tiers of Netlify, Railway, and MongoDB Atlas
