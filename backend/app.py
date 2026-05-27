import os
import json
import re
import fitz
import google.generativeai as genai

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# -----------------------------------
# Config
# -----------------------------------

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB

MODEL_NAME = "gemini-2.0-flash"


# -----------------------------------
# Extract Text from PDF
# -----------------------------------

def extract_text_from_pdf(pdf_path):

    text = ""

    try:
        doc = fitz.open(pdf_path)

        for page in doc:
            text += page.get_text()

        doc.close()

    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")

    return text.strip()


# -----------------------------------
# Repair Gemini JSON
# -----------------------------------

def repair_json(raw):

    try:
        return json.loads(raw)

    except Exception:
        pass

    cleaned = raw.strip()

    cleaned = re.sub(r"^```json", "", cleaned)
    cleaned = re.sub(r"^```", "", cleaned)
    cleaned = re.sub(r"```$", "", cleaned)

    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)

    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)

    if match:
        try:
            return json.loads(match.group())

        except Exception:
            pass

    raise ValueError("Gemini returned invalid JSON")


# -----------------------------------
# Gemini Analysis
# -----------------------------------

def analyze_with_gemini(resume_text, job_description):

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise Exception("GEMINI_API_KEY missing")

    genai.configure(api_key=api_key)

    prompt = f"""
You are an expert ATS resume analyzer.

Analyze the resume against the job description.

Return ONLY valid JSON.

Resume:
{resume_text[:2500]}

Job Description:
{job_description[:1000]}

Return JSON in this exact format:

{{
  "ats_score": 0,
  "job_match_percent": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "matched_skills": [],
  "suggestions": []
}}
"""

    try:

        model = genai.GenerativeModel(MODEL_NAME)

        response = model.generate_content(prompt)

        raw = response.text.strip()

        return repair_json(raw)

    except Exception as e:

        raise Exception(str(e))


# -----------------------------------
# Home Route
# -----------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "ok",
        "message": "Resume Analyzer Backend Running 🚀"
    })


# -----------------------------------
# Health Route
# -----------------------------------

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "model": MODEL_NAME,
        "gemini_key_exists": bool(os.getenv("GEMINI_API_KEY"))
    })


# -----------------------------------
# Analyze Route
# -----------------------------------

@app.route("/analyze", methods=["POST"])
def analyze():

    if not os.getenv("GEMINI_API_KEY"):

        return jsonify({
            "error": "GEMINI_API_KEY not configured"
        }), 500

    if "resume" not in request.files:

        return jsonify({
            "error": "Resume file missing"
        }), 400

    file = request.files["resume"]

    if file.filename == "":

        return jsonify({
            "error": "No file selected"
        }), 400

    if not file.filename.lower().endswith(".pdf"):

        return jsonify({
            "error": "Only PDF files are supported"
        }), 400

    job_description = request.form.get("job_description", "").strip()

    if not job_description:

        return jsonify({
            "error": "Job description is required"
        }), 400

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(filepath)

    try:

        resume_text = extract_text_from_pdf(filepath)

        if not resume_text:

            return jsonify({
                "error": "Could not extract text from PDF"
            }), 400

        result = analyze_with_gemini(
            resume_text,
            job_description
        )

        return jsonify(result)

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 500

    except Exception as e:

        error_text = str(e)

        if "429" in error_text or "quota" in error_text.lower():

            return jsonify({
                "error": "Gemini API quota exceeded. Please use another API key."
            }), 429

        return jsonify({
            "error": error_text
        }), 500

    finally:

        if os.path.exists(filepath):
            os.remove(filepath)


# -----------------------------------
# Run App
# -----------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
