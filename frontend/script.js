document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyzeButton');
    const taskQuestionInput = document.getElementById('taskQuestion');
    const userEssayInput = document.getElementById('userEssay');
    const resultsDiv = document.getElementById('results');
    const bandScoreSpan = document.getElementById('bandScore');
    const taskAchievementSpan = document.getElementById('taskAchievement');
    const coherenceCohesionSpan = document.getElementById('coherenceCohesion');
    const lexicalResourceSpan = document.getElementById('lexicalResource');
    const grammaticalAccuracySpan = document.getElementById('grammaticalAccuracy');
    const overallFeedbackSpan = document.getElementById('overallFeedback');

    analyzeButton.addEventListener('click', async () => {
        const taskQuestion = taskQuestionInput.value;
        const userEssay = userEssayInput.value;

        if (!taskQuestion || !userEssay) {
            alert('Please enter both the IELTS writing task question and your essay.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task_question: taskQuestion, user_essay: userEssay }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            bandScoreSpan.textContent = data.band_score;
            taskAchievementSpan.textContent = data.feedback.task_achievement;
            coherenceCohesionSpan.textContent = data.feedback.coherence_cohesion;
            lexicalResourceSpan.textContent = data.feedback.lexical_resource;
            grammaticalAccuracySpan.textContent = data.feedback.grammatical_accuracy;
            overallFeedbackSpan.textContent = data.feedback.overall_feedback;
            resultsDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
        }
    });
});