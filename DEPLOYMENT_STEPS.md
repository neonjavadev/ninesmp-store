# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend to Railway

### A. Prepare Repository

1. **Initialize Git** (if not already done):
   ```bash
   cd /home/neonjavadev/projects/ninesmp/rank2
   git init
   git add .
   git commit -m "Initial commit: NineSMP store system"
   ```

2. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/ninesmp-store.git
   git branch -M main
   git push -u origin main
   ```

### B. Deploy on Railway

1. Go to [Railway.app](https://railway.app/) and sign in with GitHub

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your `ninesmp-store` repository

4. Click **"Add variables"** and add these environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://ninesmp:hemanthsp132@ninesmp.c6wco7a.mongodb.net/ninesmp?retryWrites=true&w=majority
   ADMIN_PASSWORD=ninesmp2024
   JWT_SECRET=ninesmp_super_secret_jwt_key_12345
   PLUGIN_API_KEY=ninesmp-plugin-key-2024
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1471573794324873493/23gyWA0ytY0T1u2CjrdQCgvgx57BbJepOKT5yUvvSyT6LO-uaJC0fsoJTGdVLVNiY9wF
   CORS_ORIGINS=http://localhost:5173
   ```

5. Click **"Settings"** → **"Service"** → Set **Root Directory** to `backend`

6. Railway will automatically detect `package.json` and deploy

7. **Copy your Railway URL** (something like `https://ninesmp-backend-production.up.railway.app`)

8. **Update CORS_ORIGINS**: Add your Railway URL + your Netlify URL (we'll get that next):
   ```
   CORS_ORIGINS=http://localhost:5173,https://your-app.netlify.app,https://ninesmp-backend-production.up.railway.app
   ```

9. Test backend: Visit `https://your-railway-url.railway.app/health`

---

## Step 2: Deploy Frontend to Netlify

### A. Build Frontend

1. **Update API URL** in frontend:
   ```bash
   cd /home/neonjavadev/projects/ninesmp/rank2/ninemc-launchpad
   ```

2. **Create `.env` file**:
   ```bash
   echo "VITE_API_URL=https://your-railway-url.railway.app" > .env
   ```
   Replace `your-railway-url.railway.app` with your actual Railway URL from Step 1.7

3. **Install dependencies and build**:
   ```bash
   npm install
   npm run build
   ```

### B. Deploy to Netlify

**Option 1: Drag & Drop (Easiest)**

1. Go to [Netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the `dist` folder from `ninemc-launchpad/dist`
4. Wait for deployment (1-2 minutes)
5. Netlify will give you a URL like `https://random-name-12345.netlify.app`

**Option 2: GitHub Auto-Deploy**

1. Push your code to GitHub (if not done already)
2. On Netlify, click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure:
   - **Base directory**: `ninemc-launchpad`
   - **Build command**: `npm run build`
   - **Publish directory**: `ninemc-launchpad/dist`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-railway-url.railway.app`
6. Click **"Deploy site"**

### C. Update Backend CORS

1. Go back to **Railway** → Your project → **Variables**
2. Update `CORS_ORIGINS` to include your Netlify URL:
   ```
   CORS_ORIGINS=http://localhost:5173,https://your-app.netlify.app
   ```
3. Railway will automatically redeploy

---

## Step 3: Update Frontend to Use Backend API

If you used Option 1 (Drag & Drop), you need to update the frontend to connect to your backend:

1. **Edit Admin.tsx** to use backend API instead of localStorage:

   Open `/home/neonjavadev/projects/ninesmp/rank2/ninemc-launchpad/src/pages/Admin.tsx`

   At the top, add:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   ```

2. **Rebuild and redeploy**:
   ```bash
   cd /home/neonjavadev/projects/ninesmp/rank2/ninemc-launchpad
   npm run build
   ```
   Then drag & drop the new `dist` folder to Netlify

---

## Step 4: Test Everything

### Test Backend
Visit: `https://your-railway-url.railway.app/health`

Should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

### Test Frontend
Visit: `https://your-app.netlify.app`

1. Click **"Visit Store"** - Should see all ranks and keys
2. Go to `/admin` - Login with password: `ninesmp2024`
3. Create a test delivery
4. Check Discord for webhook notification

---

## Step 5: Install Minecraft Plugin

1. **Build the plugin**:
   ```bash
   cd /home/neonjavadev/projects/ninesmp/rank2/minecraft-plugin
   mvn clean package
   ```

2. **Copy JAR to server**:
   ```bash
   cp target/RankDelivery-1.0.0.jar /path/to/your/minecraft/server/plugins/
   ```

3. **Start server** (plugin creates default config)

4. **Stop server** and edit `plugins/RankDelivery/config.yml`:
   ```yaml
   api:
     url: "https://your-railway-url.railway.app"
     key: "ninesmp-plugin-key-2024"  # Must match PLUGIN_API_KEY in Railway
   ```

5. **Restart server**

6. **Test**: Run `/rd status` in server console

---

## 🎉 Your URLs

| Service | URL |
|---------|-----|
| Store | `https://your-app.netlify.app/store` |
| Admin | `https://your-app.netlify.app/admin` |
| Backend API | `https://your-railway-url.railway.app` |

**Admin Password**: `ninesmp2024`

---

## 🔍 Troubleshooting

### Backend won't start on Railway
- Check **Logs** in Railway dashboard
- Verify MongoDB URI is correct
- Check all environment variables are set

### Frontend can't connect to backend
- Check `CORS_ORIGINS` includes your Netlify URL
- Verify `VITE_API_URL` is set correctly
- Check browser console (F12) for errors

### Plugin can't connect
- Verify backend URL in `config.yml` includes `https://`
- Check API key matches
- Test backend `/health` endpoint

---

## 📝 Important Notes

- Railway free tier gives you 500 hours/month (enough for 24/7)
- Netlify free tier is unlimited for static sites
- MongoDB Atlas free tier is 512MB storage
- Change `JWT_SECRET` and `PLUGIN_API_KEY` to secure random strings in production
