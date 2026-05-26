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

def analyze_with_gemini(resume_text, job_description):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and resume analyst.

Analyze the following resume against the job description and return a JSON response ONLY — no extra text, no markdown, no code fences.

Resume:
{resume_text}

Job Description:
{job_description}

Return this exact JSON structure:
{{
  "ats_score": <integer 0-100>,
  "summary": "<2-3 sentence resume summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "matched_skills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "suggestions": [
    {{"title": "<title>", "description": "<detailed suggestion>"}},
    {{"title": "<title>", "description": "<detailed suggestion>"}},
    {{"title": "<title>", "description": "<detailed suggestion>"}}
  ],
  "keyword_density": <integer 0-100>,
  "formatting_score": <integer 0-100>,
  "experience_relevance": <integer 0-100>,
  "role_match": "<Best matching job role based on resume>"
}}
"""

    response = model.generate_content(prompt)
    raw = response.text.strip()
    # Strip markdown code fences if present
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    return json.loads(raw.strip())

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

    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed. Try again."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
