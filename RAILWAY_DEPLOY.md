# Deploy Backend to Railway

## Quick Steps:

### 1. Install Railway CLI (if not already installed)
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy Backend
```bash
cd backend
railway init
railway up
```

### 4. Set Environment Variables on Railway
After deployment, set these environment variables in the Railway dashboard:

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
JWT_SECRET=your-production-secret-key
SUPABASE_URL=https://qdpifbozghjgugcmzxwh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcGlmYm96Z2hqZ3VnY216eHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NjI4NTIsImV4cCI6MjA3NDUzODg1Mn0.EmyP_M6gMe3x3NrQ6sQdwpXpDTp8SaEcx-g4Bwpbggk
DEMO_MODE=true
```

### 5. Get Your Railway URL
After deployment, Railway will provide a URL like: `https://your-app.up.railway.app`

### 6. Update Frontend Environment Variables
Update `frontend/.env`:
```
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app
EXPO_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
EXPO_PUBLIC_APP_ENV=production
```

### 7. Rebuild Frontend
```bash
cd frontend
# Kill all Metro bundler processes first
npx expo start --clear
```

## Alternative: Manual Deploy via GitHub

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository and the `backend` folder
5. Set the environment variables above
6. Railway will auto-deploy!

## Troubleshooting

- **Build fails**: Make sure `npm run build` works locally first
- **Port issues**: Railway automatically sets PORT, so it will override your .env
- **CORS errors**: Make sure CORS_ORIGIN is set to `*` or your specific domain
- **Socket.IO issues**: Ensure your Railway URL uses HTTPS (it does by default)