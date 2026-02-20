# Fitness Coaching System

A MERN stack application for tracking workouts, monitoring progress, and managing fitness goals.

## Structure

- `client/`: React + Vite frontend
- `server/`: Node.js + Express backend

## Prerequisites

- Node.js
- MongoDB (Atlas recommended for production)
- Cloudinary Account (for image uploads)

## Setup

1.  **Install Dependencies**

    From the root directory:
    ```bash
    npm run install-all
    ```

2.  **Environment Variables**

    Create `.env` in `server/`:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    CLIENT_URL=http://localhost:5173
    ```

    Create `.env` in `client/` (optional for local dev if using defaults, required for production):
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```

3.  **Run Development**

    From the root directory:
    ```bash
    npm run dev
    ```

    - Frontend: http://localhost:5173
    - Backend: http://localhost:5000

## Deployment

### Render

1.  **Backend Service**:
    - Root Directory: `server`
    - Build Command: `npm install && npm run build` (if using TS) or just `npm install`
    - Start Command: `npm start`
    - Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_...`, `NODE_ENV=production`

2.  **Static Site (Frontend)**:
    - Root Directory: `client`
    - Build Command: `npm install && npm run build`
    - Publish Directory: `dist`
    - Environment Variables: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
