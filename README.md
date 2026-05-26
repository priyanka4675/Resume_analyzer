# 🤖 ResumeAI — ATS Resume Analyzer

An AI-powered resume analyzer that scores your resume against job descriptions, identifies missing keywords, and gives actionable suggestions using **Gemini AI**.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask) ![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## ✨ Features

- 📄 **PDF Resume Parsing** — Extracts text from any text-based PDF
- 🎯 **ATS Score** — Rates compatibility 0–100
- 🔍 **Missing Keywords** — Shows what the job needs that your resume lacks
- ✅ **Matched Skills** — Highlights what you already have
- 💡 **AI Suggestions** — Actionable improvements from Gemini AI
- 📊 **Sub-Scores** — Keyword density, formatting, experience relevance
- 💾 **Download Report** — Export full analysis as .txt
- 🌑 **Dark Mode UI** — Beautiful dark terminal aesthetic

---

## 🏗️ Project Structure

```
resume-analyzer/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── ScoreRing.jsx
│   │   │   ├── MiniBar.jsx
│   │   │   └── LoadingScreen.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── backend/           # Python Flask + Gemini AI
    ├── app.py
    ├── requirements.txt
    └── render.yaml
```

---

## 🚀 Local Setup (Step by Step)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/resume-analyzer.git
cd resume-analyzer
```

### 2. Set up the Backend

```bash
cd backend
pip install -r requirements.txt
```

Get a **free** Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

```bash
# Mac/Linux
export GEMINI_API_KEY=your_api_key_here

# Windows CMD
set GEMINI_API_KEY=your_api_key_here

# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"
```

Start backend:

```bash
python app.py
# Running on http://localhost:5000
```

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local and set VITE_BACKEND_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
# Running on http://localhost:5173
```

### 4. Open in browser

Go to `http://localhost:5173` 🎉

---

## ☁️ Deployment

### Backend → Render (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add environment variable: `GEMINI_API_KEY = your_key`
6. Deploy → Copy the URL (e.g. `https://resume-analyzer-abc.onrender.com`)

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
4. Add environment variable:
   - `VITE_BACKEND_URL` = your Render backend URL
5. Deploy → Done! 🚀

---

## 🔧 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, Flask, Flask-CORS |
| AI | Google Gemini 1.5 Flash |
| PDF Parsing | PyMuPDF (fitz) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📱 What You Learn Building This

- React hooks, state management, file uploads
- REST API design with Flask
- AI prompt engineering with Gemini
- PDF text extraction
- Deployment with Vercel + Render
- Professional UI design with Tailwind

---

## 🎓 Built By

A 2nd year CSE student as a portfolio project. Combine AI + web dev + real-world impact!

---

## 📄 License

MIT — free to use, modify, and deploy.
