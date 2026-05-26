import os
import json
import re
import fitz  # PyMuPDF
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB max

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()

def repair_json(raw):
    """Try multiple strategies to parse Gemini's JSON output."""
    # Strategy 1: direct parse
    try:
        return json.loads(raw)
    except Exception:
        pass
    # Strategy 2: strip markdown fences
    cleaned = re.sub(r"^```[a-z]*\n?", "", raw.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    # Strategy 3: extract first { ... } block
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if match:
        try:
            return json.loads(match.group())
        except Exception:
            pass
    raise ValueError("Could not parse AI response as JSON")

def analyze_with_gemini(resume_text, job_description):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and resume analyst with 10+ years experience.

Analyze the following resume against the job description carefully and return ONLY a valid JSON object.
No markdown, no code fences, no extra text — just raw JSON.

Resume:
{resume_text}

Job Description:
{job_description}

Return this EXACT JSON structure (all fields required):
{{
  "ats_score": <integer 0-100>,
  "job_match_percent": <integer 0-100>,
  "summary": "<2-3 sentence professional resume summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "matched_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
  "suggestions": [
    {{"title": "<short title>", "description": "<detailed actionable suggestion>"}},
    {{"title": "<short title>", "description": "<detailed actionable suggestion>"}},
    {{"title": "<short title>", "description": "<detailed actionable suggestion>"}},
    {{"title": "<short title>", "description": "<detailed actionable suggestion>"}}
  ],
  "keyword_density": <integer 0-100>,
  "formatting_score": <integer 0-100>,
  "experience_relevance": <integer 0-100>,
  "role_match": "<Best matching job role based on resume>",
  "multi_role_recommendations": [
    {{"role": "<role name>", "match": <integer 0-100>, "reason": "<one sentence why>"}},
    {{"role": "<role name>", "match": <integer 0-100>, "reason": "<one sentence why>"}},
    {{"role": "<role name>", "match": <integer 0-100>, "reason": "<one sentence why>"}}
  ],
  "skill_gap_analysis": [
    {{"skill": "<skill name>", "importance": "<High|Medium|Low>", "how_to_learn": "<resource or tip>"}},
    {{"skill": "<skill name>", "importance": "<High|Medium|Low>", "how_to_learn": "<resource or tip>"}},
    {{"skill": "<skill name>", "importance": "<High|Medium|Low>", "how_to_learn": "<resource or tip>"}}
  ],
  "rewritten_summary": "<AI-rewritten professional summary optimized for ATS — 3-4 sentences>",
  "experience_years": <estimated integer years of experience>,
  "education_score": <integer 0-100>
}}
"""

    response = model.generate_content(prompt)
    raw = response.text.strip()
    return repair_json(raw)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "ResumeAI Backend is running 🚀", "status": "ok"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze():
    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY not configured on server."}), 500

    if "resume" not in request.files:
        return jsonify({"error": "No resume file uploaded."}), 400

    file = request.files["resume"]
    job_description = request.form.get("job_description", "").strip()

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    if not job_description:
        return jsonify({"error": "Job description is required."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        resume_text = extract_text_from_pdf(filepath)
        if not resume_text:
            return jsonify({"error": "Could not extract text from PDF. Ensure it is not scanned/image-based."}), 400

        result = analyze_with_gemini(resume_text, job_description)
        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": "AI response parsing failed. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
