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

Please provide a band score and detailed feedback based on the IELTS public band descriptors. Structure your response as follows:

Band Score: [Your Band Score]/9

Feedback:
Task Achievement: [Feedback on Task Achievement]
Coherence and Cohesion: [Feedback on Coherence and Cohesion]
Lexical Resource: [Feedback on Lexical Resource]
Grammatical Range and Accuracy: [Feedback on Grammatical Range and Accuracy]

Overall Feedback: [Overall summary feedback]"""

        response = model.generate_content(prompt)
        feedback_text = response.text

        # Extract band score and feedback from the generated text
        band_score_line = next((line for line in feedback_text.split('\n') if 'Band Score:' in line), None)
        band_score = band_score_line.replace('Band Score:', '').strip() if band_score_line else 'N/A'

        feedback_lines = feedback_text.split('\n')
        feedback_start_index = -1
        for i, line in enumerate(feedback_lines):
            if 'Feedback:' in line:
                feedback_start_index = i
                break

        task_achievement = 'N/A'
        coherence_cohesion = 'N/A'
        lexical_resource = 'N/A'
        grammatical_accuracy = 'N/A'
        overall_feedback = 'N/A'

        if feedback_start_index != -1:
            for i in range(feedback_start_index + 1, len(feedback_lines)):
                line = feedback_lines[i].strip()
                if line.startswith('Task Achievement:'):
                    task_achievement = line.replace('Task Achievement:', '').strip()
                elif line.startswith('Coherence and Cohesion:'):
                    coherence_cohesion = line.replace('Coherence and Cohesion:', '').strip()
                elif line.startswith('Lexical Resource:'):
                    lexical_resource = line.replace('Lexical Resource:', '').strip()
                elif line.startswith('Grammatical Range and Accuracy:'):
                    grammatical_accuracy = line.replace('Grammatical Range and Accuracy:', '').strip()
                elif line.startswith('Overall Feedback:'):
                    overall_feedback = line.replace('Overall Feedback:', '').strip()

        return jsonify({
            'band_score': band_score,
            'feedback': {
                'task_achievement': task_achievement,
                'coherence_cohesion': coherence_cohesion,
                'lexical_resource': lexical_resource,
                'grammatical_accuracy': grammatical_accuracy,
                'overall_feedback': overall_feedback
            }
        })
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return jsonify({'error': 'Failed to analyze essay', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)