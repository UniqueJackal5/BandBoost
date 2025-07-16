import os
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/analyze": {"origins": "*"}})

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@app.route('/')
def home():
    return "BandBoost Backend is running!"

@app.route('/analyze', methods=['POST'])
def analyze_essay():
    data = request.get_json()
    task_question = data.get('task_question')
    user_essay = data.get('user_essay')

    if not task_question or not user_essay:
        return jsonify({'error': 'Missing task question or user essay'}), 400

    word_count = len(user_essay.split())

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""You are an AI assistant specialized in evaluating IELTS Academic Writing essays. Your goal is to act as a highly experienced IELTS examiner. Provide a band score and comprehensive, constructive feedback based *strictly* on the official IELTS public band descriptors.

Task Question: {task_question}

User Essay: {user_essay}

Please provide your analysis in a JSON format. The JSON object should have the following structure:
{{
  "band_score": "string (e.g., '7.5')",
  "feedback": {{
    "task_achievement": {{
      "score": "string (e.g., '7.0')",
      "suggestions": "string"
    }},
    "coherence_cohesion": {{
      "score": "string (e.g., '8.0')",
      "suggestions": "string"
    }},
    "lexical_resource": {{
      "score": "string (e.g., '7.5')",
      "suggestions": "string"
    }},
    "grammatical_accuracy": {{
      "score": "string (e.g., '7.5')",
      "suggestions": "string"
    }},
    "overall_feedback": "string"
  }}
}}
"""

        response = model.generate_content(prompt)
        # Clean the response to extract only the JSON part
        feedback_text = response.text.strip()
        json_start = feedback_text.find('```json')
        if json_start != -1:
            json_start += 7 # Move past ```json
            json_end = feedback_text.rfind('```')
            if json_end != -1:
                feedback_text = feedback_text[json_start:json_end]

        feedback_json = json.loads(feedback_text)
        feedback_json['word_count'] = word_count

        return jsonify(feedback_json)

    except Exception as e:
        print(f"Error during Gemini API call or JSON parsing: {e}")
        return jsonify({'error': 'Failed to analyze essay', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)