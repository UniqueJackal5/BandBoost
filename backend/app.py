import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

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

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""You are an AI assistant specialized in evaluating IELTS Academic Writing Task 2 essays. Your goal is to provide a band score (from 0-9) and constructive feedback based on the IELTS public band descriptors.

Task Question: {task_question}

User Essay: {user_essay}

Please provide a band score and detailed feedback focusing on Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. Format your response as follows:

Band Score: [Your Band Score]/9
Feedback: [Your detailed feedback here]"""

        response = model.generate_content(prompt)
        feedback_text = response.text

        # Extract band score and feedback from the generated text
        band_score_line = next((line for line in feedback_text.split('\n') if 'Band Score:' in line), None)
        feedback_content = next((line for line in feedback_text.split('\n') if 'Feedback:' in line), None)

        band_score = band_score_line.replace('Band Score:', '').strip() if band_score_line else 'N/A'
        feedback = feedback_content.replace('Feedback:', '').strip() if feedback_content else 'No feedback generated.'

        return jsonify({
            'band_score': band_score,
            'feedback': feedback
        })
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return jsonify({'error': 'Failed to analyze essay', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)