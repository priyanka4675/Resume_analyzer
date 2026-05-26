# Resume Analyzer — Backend

Flask + Gemini AI backend for the Resume Analyzer.

## Local Setup

```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY=your_key_here
python app.py
```

## Deploy on Render

1. Push to GitHub
2. Connect repo to [render.com](https://render.com)
3. Set `GEMINI_API_KEY` environment variable in Render dashboard
4. Deploy

## Endpoints

- `GET /health` — Health check
- `POST /analyze` — Analyze resume
  - Form field: `resume` (PDF file)
  - Form field: `job_description` (text)
