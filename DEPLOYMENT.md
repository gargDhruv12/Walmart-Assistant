# Deployment Guide for Walmart Assistant

This guide will help you deploy your Walmart Assistant application on Render.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to Git repository**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your Git account
   - Click "New +" and select "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**
   - Render will create two services:
     - `walmart-assistant-api` (Backend API)
     - `walmart-assistant-frontend` (Frontend Static Site)
   - The deployment will start automatically

### Option 2: Manual Deployment

#### Deploy Backend API

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `walmart-assistant-api`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Environment Variables**
   - Add environment variable:
     - Key: `NODE_ENV`
     - Value: `production`
     - Key: `PORT`
     - Value: `10000`

#### Deploy Frontend

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: `walmart-assistant-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Environment Variables**
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: `https://your-backend-service-name.onrender.com` (replace with your actual backend URL)

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-service-name.onrender.com
```

## Local Development

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=18.0.0)

2. **API Connection Issues**
   - Verify the `VITE_API_URL` environment variable is set correctly
   - Check that the backend service is running and accessible

3. **CORS Issues**
   - The backend is configured with CORS enabled
   - If issues persist, check the CORS configuration in `backend/server.js`

### Logs and Debugging

- Check Render logs in the service dashboard
- Use `console.log` statements for debugging
- Monitor the service health in Render dashboard

## Security Notes

- The current implementation stores user data in JSON files
- For production, consider using a proper database
- Implement proper authentication and authorization
- Use HTTPS in production (Render provides this automatically)

## Cost Optimization

- Both services use Render's free tier
- Free tier includes:
  - 750 hours/month for web services
  - Static sites are always free
  - Automatic sleep after 15 minutes of inactivity

## Support

If you encounter issues:
1. Check Render's documentation
2. Review the service logs
3. Verify environment variables are set correctly
4. Ensure all dependencies are properly installed 