# 🚀 EduPulse - Production Deployment Guide

This guide details step-by-step instructions for deploying the **EduPulse Student Dropout Prediction and Counselling System** to production using **Vercel** (Frontend & Express Backend API), **MongoDB Atlas** (Database), and **Render / Railway** (FastAPI ML Service).

---

## 🏗️ Production Architecture Overview

```mermaid
graph TD
    User([User Browser]) -->|HTTPS| Frontend[Vercel Frontend - React/Vite]
    Frontend -->|API Requests| Backend[Vercel Serverless API - Express.js]
    Backend -->|Mongoose ODM| MongoAtlas[(MongoDB Atlas Cloud Database)]
    Backend -->|HTTP /predict| MLService[Render / Railway - FastAPI ML Service]
    Backend -->|Gemini API| Gemini[Google Gemini AI Service]
```

---

## 1. 🍃 MongoDB Atlas Setup

1. **Create Account & Cluster**:
   - Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a new free or dedicated cluster (e.g. `edupulse-cluster`).

2. **Create Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Select **Password Authentication**. Set username (e.g., `edupulse_user`) and a strong password.
   - Assign role **Read and write to any database**.

3. **Configure Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Add `0.0.0.0/0` (Allows access from Vercel Serverless Function dynamic IP ranges).

4. **Obtain Connection String**:
   - Go to **Database > Connect**.
   - Select **Drivers** (Node.js).
   - Copy connection URI. Example:
     `mongodb+srv://edupulse_user:<PASSWORD>@cluster.mongodb.net/edupulse?retryWrites=true&w=majority`

---

## 2. ⚡ Vercel Frontend Deployment

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset: **Vite**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://your-backend-api.vercel.app` | Deployed URL of your backend API |
9. Click **Deploy**.

---

## 3. ⚙️ Express Backend API Deployment (Vercel)

1. In Vercel dashboard, click **Add New > Project**.
2. Select the same GitHub repository.
3. Set **Root Directory** to `backend`.
4. Framework Preset: **Other** (Vercel automatically detects `api/index.js` and `vercel.json`).
5. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/edupulse` | MongoDB Atlas Connection String |
   | `JWT_SECRET` | `a_very_secret_production_key_32_chars` | Production secret key for JWT signing |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Production URL of your React frontend |
   | `ML_SERVICE_URL` | `https://your-ml-service.onrender.com` | Deployed URL of your FastAPI ML service |
   | `GEMINI_API_KEY` | `AIzaSy...` | (Optional) Google Gemini API Key for AI advice |
6. Click **Deploy**.

---

## 4. 🤖 ML Service Deployment (Render / Railway / Standalone)

Because Python ML dependencies (`scikit-learn`, `pandas`, `shap`, `joblib`) exceed Vercel's 250MB serverless limit, the ML service should be deployed on a Python-native container platform such as **Render**, **Railway**, or **Fly.io**.

### Deploying on Render:
1. Log in to [Render](https://render.com/).
2. Create a **New Web Service** connected to your repository.
3. Root Directory: `ml-service`
4. Environment: `Python 3`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
7. Copy the deployed Render URL (e.g. `https://edupulse-ml.onrender.com`) and paste it into the `ML_SERVICE_URL` environment variable of your Vercel Backend API.

> 💡 **Resilience Note**: If `ML_SERVICE_URL` is unavailable or experiencing cold-start latency, the backend API automatically falls back to an internal ML rules engine matching trained model weights, ensuring zero application downtime.

---

## 🔑 Complete Environment Variables Reference

| Variable | Target Service | Purpose | Example Value |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Frontend (Vercel) | Backend API endpoint | `https://edupulse-api.vercel.app` |
| `MONGODB_URI` | Backend (Vercel) | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/edupulse` |
| `JWT_SECRET` | Backend (Vercel) | Secret for signing auth tokens | `super_secure_random_key_2026` |
| `FRONTEND_URL` | Backend (Vercel) | Allowed CORS origin for frontend | `https://edupulse.vercel.app` |
| `ML_SERVICE_URL`| Backend (Vercel) | Endpoint for Python ML prediction | `https://edupulse-ml.onrender.com` |
| `GEMINI_API_KEY`| Backend (Vercel) | AI Recommendation & Chatbot key | `AIzaSy...` |
| `PORT` | Backend / ML | Server port (local dev) | `5000` / `8000` |

---

## 🧪 Local Verification Commands

```bash
# 1. Test Backend API locally
cd backend
npm install
npm start

# 2. Test ML Service locally
cd ml-service
pip install -r requirements.txt
python main.py

# 3. Test Frontend build locally
cd frontend
npm install
npm run build
npm run preview
```
