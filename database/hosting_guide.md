# 🌐 Monorepo Production Deployment Guide (Render + Vercel + Railway)

This comprehensive guide shows you how to host the **BloodTrack** platform in production using **Railway** (for MySQL), **Render** (for the Node.js backend), and **Vercel** (for the React frontend).

---

## 💾 1. Database Setup: Railway (Active Cloud MySQL)

Based on your active Railway service variables, your cloud database coordinates are:
*   **Database Name**: `railway`
*   **Username**: `root`
*   **Public Connection String (`MYSQL_URL`)**:
    ```text
    mysql://root:AJgOlhOngRRUqmajBWTTCggrXccjYReL@zephyr.proxy.rlwy.net:47269/railway
    ```

> [!NOTE]  
> Thanks to the **Auto-Installer Engine** built into the backend, you do not need to upload any `.sql` schema files manually. The moment your Render backend connects, it will compile all tables, seeds, triggers, procedures, and views dynamically in your Railway cloud instance!

---

## 🚀 2. Backend Deployment: Render

Render is excellent for hosting your Node.js Express API.

### Steps to Deploy:
1.  Sign in to [Render](https://render.com/).
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your Git repository (GitHub/GitLab).
4.  Configure the service details:
    *   **Name**: `bloodtrack-backend`
    *   **Root Directory**: `backend` (Crucial!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Click **"Advanced"** to add **Environment Variables**:
    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `MYSQL_URL` | `mysql://root:AJgOlhOngRRUqmajBWTTCggrXccjYReL@zephyr.proxy.rlwy.net:47269/railway` | Your live Railway database connection string |
    | `JWT_SECRET` | `supersecretbloodbankjwttokenkey1234!` | Secure key to sign user login tokens |
    | `PORT` | `10000` | The port Render exposes for your app |
6.  Click **"Create Web Service"**. Render will download, build, connect to Railway, seed the database, and spin up your backend API!

---

## 🎨 3. Frontend Deployment: Vercel

Vercel is the premier platform for deploying React/Vite applications.

### Steps to Deploy:
1.  Sign in to [Vercel](https://vercel.com/).
2.  Click **"Add New"** -> **"Project"**.
3.  Import your Git repository.
4.  Configure the build settings:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend` (Crucial!)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Add the **Environment Variable** to connect the React app to your Render API:
    *   **Key**: `VITE_API_URL`
    *   **Value**: `<your-render-backend-url>/api` (Example: `https://bloodtrack-backend.onrender.com/api`)
6.  Click **"Deploy"**. Vercel will bundle your React app and publish it on a premium, fast global CDN!

---

## ⚡ 4. Local Testing with Railway MySQL

If you want to run your local laptop backend server but have it point to the live cloud database on Railway, edit your [backend/.env](file:///C:/Users/User/OneDrive/Desktop/likit_DBMS/backend/.env) file:

```env
JWT_SECRET=supersecretbloodbankjwttokenkey1234!
MYSQL_URL=mysql://root:AJgOlhOngRRUqmajBWTTCggrXccjYReL@zephyr.proxy.rlwy.net:47269/railway
```

Save and run `npm start` in your backend folder. The system will connect securely to Railway!
