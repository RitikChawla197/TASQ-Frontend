# TASQ Frontend

## Local setup

1. Install dependencies:
```bash
npm install
```

2. Create local env:
```bash
cp .env.example .env.local
```

3. Start dev server:
```bash
npm run dev
```

## Required environment variables

- `NEXT_PUBLIC_API_BASE_URL`
  Example:
  `https://tasq-backend-2y6g.onrender.com`

## Deploy on Vercel

1. Import this repository in Vercel.
2. Set environment variable in Vercel project settings:
   - `NEXT_PUBLIC_API_BASE_URL` = your backend URL
3. Deploy.

## Backend CORS requirement

Your backend must allow your frontend origins, including:
- `http://localhost:3000`
- your Vercel production domain (for example `https://your-app.vercel.app`)

If CORS is not configured for the Vercel domain, browser API calls will fail even when the backend is live.
