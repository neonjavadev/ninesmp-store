# NineSMP Store System - Deployment Guide

This guide walks you through deploying the complete NineSMP store system including frontend, backend, MongoDB setup, and Minecraft plugin installation.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Netlify account (free tier)
- Railway/Render account for backend (free tier)
- Minecraft Paper/Spigot server (1.16+)

---

## 1. MongoDB Atlas Setup

### Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Create a database named `ninesmp`

### Configure Network Access

1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or add specific IPs)
4. Save

### Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Give "Read and write to any database" permissions

---

## 2. Backend Deployment (Railway/Render)

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and `/backend` directory
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   ADMIN_PASSWORD=ninesmp2024
   JWT_SECRET=<generate-random-secret>
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1471573794324873493/23gyWA0ytY0T1u2CjrdQCgvgx57BbJepOKT5yUvvSyT6LO-uaJC0fsoJTGdVLVNiY9wF
   PLUGIN_API_KEY=ninesmp-plugin-key-change-this
   CORS_ORIGINS=https://your-netlify-domain.netlify.app
   ```
5. Railway will automatically deploy
6. Copy the deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. Go to [Render](https://render.com/)
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the same environment variables as above
6. Deploy and copy the URL

---

## 3. Frontend Deployment (Netlify)

### Update API URL

1. Create `.env` file in `ninemc-launchpad` directory:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

### Deploy to Netlify

1. Build the frontend:
   ```bash
   cd ninemc-launchpad
   npm install
   npm run build
   ```

2. Go to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Deploy manually"
4. Drag and drop the `dist` folder
5. Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

6. Copy your Netlify URL (e.g., `https://ninesmp-store.netlify.app`)

### Update Backend CORS

1. Go back to Railway/Render
2. Update `CORS_ORIGINS` environment variable with your Netlify URL:
   ```
   CORS_ORIGINS=https://ninesmp-store.netlify.app
   ```

---

## 4. Minecraft Plugin Installation

### Build the Plugin

1. Install Maven if not installed
2. Build the plugin:
   ```bash
   cd minecraft-plugin
   mvn clean package
   ```
3. The JAR file will be in `target/RankDelivery-1.0.0.jar`

### Install on Server

1. Copy `RankDelivery-1.0.0.jar` to your Minecraft server's `plugins` folder
2. Start the server (plugin will create default config)
3. Stop the server
4. Edit `plugins/RankDelivery/config.yml`:
   ```yaml
   api:
     url: "https://your-backend-url.railway.app"
     key: "ninesmp-plugin-key-change-this"  # Must match backend PLUGIN_API_KEY
   
   polling:
     interval: 60
     enabled: true
   ```

5. Customize command mappings in config.yml based on your permission plugin
6. Restart the server

### Verify Installation

Run in server console:
```
/rd status
```

You should see the plugin status with API URL and polling settings.

---

## 5. Discord Webhook Setup

Your webhook is already configured:
```
https://discord.com/api/webhooks/1471573794324873493/23gyWA0ytY0T1u2CjrdQCgvgx57BbJepOKT5yUvvSyT6LO-uaJC0fsoJTGdVLVNiY9wF
```

Make sure this webhook exists in your Discord server. If you need to create a new one:

1. Go to your Discord server settings
2. Navigate to "Integrations" → "Webhooks"
3. Click "New Webhook"
4. Name it "NineSMP Deliveries"
5. Select the channel for notifications
6. Copy the webhook URL
7. Update the `DISCORD_WEBHOOK_URL` in backend environment variables

---

## 6. Testing the Complete System

### Test Frontend

1. Visit your Netlify URL
2. Click "Visit Store" from home page
3. Verify all ranks and keys display correctly
4. Click "Buy Now" (should redirect to Discord)

### Test Admin Panel

1. Go to `https://your-netlify-url.netlify.app/admin`
2. Login with password: `ninesmp2024`
3. Create a test delivery:
   - Username: `TestPlayer`
   - Platform: Java
   - Package: VIP
4. Submit the form

### Verify Discord Notification

Check your Discord channel - you should see a notification about the new delivery.

### Verify Plugin Execution

1. Within 60 seconds, the Minecraft plugin should poll the backend
2. Check server console for logs: `✓ Successfully delivered VIP to TestPlayer`
3. If the player is online, they'll receive an in-game message
4. Check Discord again for completion notification

### Check Admin History

1. Go back to admin panel
2. Refresh the delivery history
3. The test delivery should show status "COMPLETED"

---

## 7. Production Checklist

- [ ] Change `ADMIN_PASSWORD` to a secure password
- [ ] Change `JWT_SECRET` to a random secure string
- [ ] Change `PLUGIN_API_KEY` to a random secure string
- [ ] Update all environment variables in Railway/Render
- [ ] Update MongoDB connection string with correct credentials
- [ ] Test all rank packages work correctly
- [ ] Configure proper IP whitelist in MongoDB Atlas (optional)
- [ ] Set up custom domain for Netlify (optional)
- [ ] Back up MongoDB database regularly
- [ ] Monitor backend logs for errors

---

## 8. Updating Command Mappings

The plugin uses LuckPerms commands by default. If you use a different permission plugin:

Edit `minecraft-plugin/src/main/resources/config.yml`:

```yaml
commands:
  VIP:
    - "pex user {username} group add VIP"  # For PermissionsEx
    # or
    - "manuadd {username} vip"  # For GroupManager
  MVP:
    - "pex user {username} group add MVP"
```

Rebuild and redeploy the plugin after changes.

---

## 9. Common Issues

### Backend Can't Connect to MongoDB

- Verify MongoDB connection string is correct
- Check Network Access allows your Railway/Render IP
- Ensure database user has correct permissions

### Plugin Can't Connect to Backend

- Verify API URL in config.yml is correct (include https://)
- Check backend is running (visit `/health` endpoint)
- Ensure PLUGIN_API_KEY matches in both backend and plugin

### CORS Errors in Frontend

- Verify CORS_ORIGINS in backend includes your Netlify URL
- Ensure URL doesn't have trailing slash

### Deliveries Not Executing

- Check server console for plugin logs
- Verify player username is spelled correctly
- Test command manually in server console
- Check plugin has permission to execute commands

---

## 10. Maintenance

### View Backend Logs

**Railway**: Click on your service → "Deployments" → "View Logs"  
**Render**: Click on your service → "Logs"

### View Plugin Logs

Check `logs/latest.log` in your Minecraft server directory

### Manual Delivery Execution

Use the admin panel `/admin` to manually create deliveries if needed.

### Backup Database

MongoDB Atlas provides automatic backups. You can also export collections manually from the Atlas dashboard.

---

## Support

For issues or questions:
- Check server logs
- Check backend logs
- Check browser console (F12) for frontend errors
- Test API endpoints with `/health` and `/api/delivery/pending`

---

## URLs Quick Reference

- **Frontend**: `https://your-netlify-domain.netlify.app`
- **Store Page**: `https://your-netlify-domain.netlify.app/store`
- **Admin Panel**: `https://your-netlify-domain.netlify.app/admin`
- **Backend API**: `https://your-backend-url.railway.app`
- **API Health Check**: `https://your-backend-url.railway.app/health`

**Admin Password**: `ninesmp2024` (Change this in production!)

---

🎮 Your NineSMP store system is now fully deployed and ready to use!
