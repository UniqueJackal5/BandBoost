document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyzeButton');
    const startButton = document.getElementById('startButton');
    const getQuestionButton = document.getElementById('getQuestionButton');
    const taskTypeSelect = document.getElementById('taskType');
    const timerDiv = document.getElementById('timer');
    const taskQuestionInput = document.getElementById('taskQuestion');
    const userEssayInput = document.getElementById('userEssay');
    const resultsDiv = document.getElementById('results');
    const bandScoreSpan = document.getElementById('bandScore');
    const wordCountSpan = document.getElementById('wordCount');
    const taskAchievementScoreSpan = document.getElementById('taskAchievementScore');
    const taskAchievementSuggestionsSpan = document.getElementById('taskAchievementSuggestions');
    const coherenceCohesionScoreSpan = document.getElementById('coherenceCohesionScore');
    const coherenceCohesionSuggestionsSpan = document.getElementById('coherenceCohesionSuggestions');
    const lexicalResourceScoreSpan = document.getElementById('lexicalResourceScore');
    const lexicalResourceSuggestionsSpan = document.getElementById('lexicalResourceSuggestions');
    const grammaticalAccuracyScoreSpan = document.getElementById('grammaticalAccuracyScore');
    const grammaticalAccuracySuggestionsSpan = document.getElementById('grammaticalAccuracySuggestions');
    const overallFeedbackSpan = document.getElementById('overallFeedback');
    const historyDiv = document.getElementById('history');
    const historyContainer = document.getElementById('historyContainer');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const viewHistoryButton = document.getElementById('viewHistoryButton');
    const stopButton = document.getElementById('stopButton');

    let timerInterval;
    let timeRemaining = 2400; // 40 minutes in seconds
    let questions = {};
    let essayHistory = [];

    // Fetch questions from the JSON file
    fetch('./questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
        })
        .catch(error => console.error('Error fetching questions:', error));

    const updateTimerDisplay = () => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDiv.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const countWords = () => {
        const text = userEssayInput.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        wordCountSpan.textContent = words.length;
    };

    userEssayInput.addEventListener('input', countWords);

    startButton.addEventListener('click', () => {
        userEssayInput.disabled = false;
        userEssayInput.focus();
        startButton.classList.add('hidden');
        stopButton.classList.remove('hidden');

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                userEssayInput.disabled = true;
                alert("Time's up! Your essay has been locked.");
            }
        }, 1000);
    });

    getQuestionButton.addEventListener('click', () => {
        const taskType = taskTypeSelect.value;
        const taskQuestions = questions[taskType];
        if (taskQuestions && taskQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * taskQuestions.length);
            taskQuestionInput.value = taskQuestions[randomIndex].question;
        } else {
            alert(`No questions found for ${taskType}.`);
        }
    });

    analyzeButton.addEventListener('click', async () => {
        const taskQuestion = taskQuestionInput.value;
        const userEssay = userEssayInput.value;

        if (!taskQuestion || !userEssay) {
            alert('Please enter both the IELTS writing task question and your essay.');
            return;
        }

        // Stop the timer if it's running
        if (timerInterval) {
            clearInterval(timerInterval);
            stopButton.classList.add('hidden');
            startButton.classList.remove('hidden');
            timeRemaining = 2400; // Reset timer
            updateTimerDisplay();
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
            wordCountSpan.textContent = data.word_count;
            taskAchievementScoreSpan.textContent = data.feedback.task_achievement.score;
            taskAchievementSuggestionsSpan.textContent = data.feedback.task_achievement.suggestions;
            coherenceCohesionScoreSpan.textContent = data.feedback.coherence_cohesion.score;
            coherenceCohesionSuggestionsSpan.textContent = data.feedback.coherence_cohesion.suggestions;
            lexicalResourceScoreSpan.textContent = data.feedback.lexical_resource.score;
            lexicalResourceSuggestionsSpan.textContent = data.feedback.lexical_resource.suggestions;
            grammaticalAccuracyScoreSpan.textContent = data.feedback.grammatical_accuracy.score;
            grammaticalAccuracySuggestionsSpan.textContent = data.feedback.grammatical_accuracy.suggestions;
            overallFeedbackSpan.textContent = data.feedback.overall_feedback;
            resultsDiv.classList.remove('hidden');

            saveToHistory(data);
            displayHistory();

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
        }
    });

    const saveToHistory = (data) => {
        const historyItem = {
            date: new Date().toLocaleString(),
            question: taskQuestionInput.value,
            essay: userEssayInput.value,
            results: data
        };
        essayHistory.push(historyItem);
        localStorage.setItem('essayHistory', JSON.stringify(essayHistory));
    };

    const displayHistory = () => {
        historyContainer.innerHTML = '';
        if (essayHistory.length > 0) {
            historyDiv.classList.remove('hidden');
            essayHistory.forEach((item, index) => {
                const historyItemDiv = document.createElement('div');
                historyItemDiv.classList.add('p-4', 'mb-4', 'bg-white', 'rounded-lg', 'shadow');
                historyItemDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-semibold">${item.question.substring(0, 50)}...</p>
                        <p class="text-sm text-gray-500">${item.date}</p>
                    </div>
                    <p class="text-lg font-bold text-blue-700">Band Score: ${item.results.band_score}</p>
                `;
                historyContainer.appendChild(historyItemDiv);
            });
        }
    };

    const loadHistory = () => {
        const storedHistory = localStorage.getItem('essayHistory');
        if (storedHistory) {
            essayHistory = JSON.parse(storedHistory);
            displayHistory();
        }
    };

    clearHistoryButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your essay history? This action cannot be undone.')) {
            essayHistory = [];
            localStorage.removeItem('essayHistory');
            historyDiv.classList.add('hidden');
        }
    });

    viewHistoryButton.addEventListener('click', () => {
        if (essayHistory.length > 0) {
            historyDiv.classList.toggle('hidden');
        } else {
            alert('You have no essay history yet. Analyze an essay to create history.');
        }
    });

    stopButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        timeRemaining = 2400; // Reset timer
        updateTimerDisplay();
        userEssayInput.disabled = true;
        startButton.classList.remove('hidden');
        stopButton.classList.add('hidden');
    });

    // Initialize
    updateTimerDisplay();
    loadHistory();
});