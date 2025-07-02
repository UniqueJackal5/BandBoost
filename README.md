# BandBoost

BandBoost is a simple AI-powered web app that analyzes IELTS Writing responses using Google Gemini 2.0. It provides estimated band scores and detailed feedback based on the IELTS Writing scoring criteria. The tool is designed to help users evaluate and improve their writing, especially while preparing for the IELTS exam.

## Project Goal (MVP)

Build a functional MVP that:

- Accepts an IELTS writing task question and a user's essay
- Sends the input to the Google Gemini 2.0 API for analysis
- Returns a band score and feedback
- Displays the results on the page
- Requires no login or account
- Runs locally with a Flask backend and simple HTML/JS frontend

## Current Status

All core functionalities for the MVP are implemented:

- **Frontend**: HTML form with input fields, a submit button, and result display. JavaScript handles form submission and displays feedback.
- **Backend**: Flask server with `/analyze` endpoint that calls Gemini 2.0 API and returns structured feedback.
- **CORS**: Enabled to allow frontend-backend communication.
- **AI Model**: Configured to use gemini-1.5-flash model from Google Generative AI.

## Technologies Used

- Frontend: HTML, Tailwind CSS, JavaScript
- Backend: Python (Flask, Flask-CORS)
- AI: Google Gemini 2.0 (via google-generativeai)

## Project Structure

BandBoost/
├── .gitignore
├── backend/
│   ├── .env
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── input.css
│   ├── output.css
│   └── script.js
├── package.json
├── package-lock.json
├── postcss.config.js
└── tailwind.config.js

## Setup Instructions

### 1. Clone the Repository

```
git clone <your-repo-url>
cd BandBoost
```

### 2. Backend Setup (Flask + Gemini)

```
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the backend folder with your Gemini API key:

```
GEMINI_API_KEY='your_google_gemini_api_key'
```

Start the Flask server:

```
python app.py
```

The server will run at: http://127.0.0.1:5000

### 3. Frontend Setup

Navigate back to the root project directory:

```
cd ..
npm install
```

Build Tailwind CSS:

```
npm run build:css
# or for development:
npm run watch:css
```

### 4. Run the App

Open the file `frontend/index.html` in your browser. Fill in your IELTS writing task and essay. Click the "Analyze Essay" button to receive AI-generated feedback and a band score.

## Example Use

Question:
Some people believe the government should pay for healthcare. Others think individuals should cover their own costs. Discuss both views and give your opinion.

Essay:
[User essay here]

Output:
- Overall Band: 6.5
- Task Response: 6
- Coherence and Cohesion: 6.5
- Lexical Resource: 7
- Grammatical Range and Accuracy: 6.5
- Feedback: Add stronger linking phrases, clarify your opinion in the conclusion, and reduce repetition in paragraph two.

