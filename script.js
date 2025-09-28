// 간호연구 프로젝트 - CORS 우회 버전
// Google Apps Script 연동 (iframe 방식)

const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxTrvD9BlJ_hP31yLbu6rXDezb-aWCICLqZ0vdlesREcmYB0c_QJrAJnclfuR_LR5hVww/exec';

// 전역 변수들
let currentScreen = 'startScreen';
let currentQuestion = 0;
let currentCondition = 0;
let timeLeft = 5;
let timerInterval;
let participantData = {};
let responses = [];
let questionStartTime = 0;
let memoryStartTime = 0;
let currentPracticeQuestion = null;
let experimentStartTime = null;

const conditions = [
    { name: '압박 상황', time: 5, label: 'pressure' },
    { name: '보통 상황', time: 9, label: 'normal' },
    { name: '여유 상황', time: 12, label: 'relaxed' }
];

// CORS 우회 데이터 전송 함수
function sendToGoogleSheets(data) {
    // 숨겨진 iframe을 사용하여 CORS 정책 우회
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    
    // POST 데이터를 GET 파라미터로 변환하여 전송
    const params = new URLSearchParams({
        data: JSON.stringify(data)
    });
    
    iframe.src = `${WEBAPP_URL}?${params.toString()}`;
    document.body.appendChild(iframe);
    
    // 3초 후 iframe 제거
    setTimeout(() => {
        if (iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    }, 3000);
    
    console.log('데이터 전송:', data.type || 'unknown');
}

// 기본 함수들
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    console.log(`화면 전환: ${screenId}`);
}

function showParticipantInfo() {
    showScreen('participantScreen');
}

function showInstructions() {
    participantData = {
        id: document.getElementById('participantId').value.trim(),
        experience: document.getElementById('experience').value,
        department: document.getElementById('department').value,
        startTime: new Date().toISOString()
    };
    
    if (!participantData.id || !participantData.experience || !participantData.department) {
        alert('모든 정보를 입력해주세요.');
        return;
    }
    
    // 참가자 정보 전송
    sendToGoogleSheets({
        type: 'participant',
        participantId: participantData.id,
        experience: participantData.experience,
        department: participantData.department,
        timestamp: new Date().toISOString()
    });
    
    showScreen('instructionScreen');
}

function startPractice() {
    if (typeof practiceQuestions === 'undefined' || practiceQuestions.length === 0) {
        alert('연습 문제를 불러올 수 없습니다.');
        return;
    }
    
    currentPracticeQuestion = practiceQuestions[0];
    showScreen('practiceMemoryScreen');
    displayPracticeQuestion();
    
    let countdown = 3;
    const countdownEl = document.getElementById('practiceCountdown');
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            countdownEl.textContent = `${countdown}초 후 시작됩니다...`;
            countdown--;
        } else {
            clearInterval(countdownInterval);
            countdownEl.textContent = '집중하세요!';
            startPracticeMemory();
        }
    }, 1000);
}

function displayPracticeQuestion() {
    if (!currentPracticeQuestion) return;
    
    const question = currentPracticeQuestion;
    
    const prescriptionDiv = document.querySelector('#practiceMemoryScreen .prescription-display');
    if (prescriptionDiv) {
        prescriptionDiv.innerHTML = `
            환자: ${question.prescription.patient}<br>
            진단: ${question.prescription.diagnosis}<br><br>
            처방: ${question.prescription.order}<br>
            ${question.prescription.time}<br>
            특이사항: ${question.prescription.note}
        `;
    }
    
    const alertDiv = document.querySelector('#practiceMemoryScreen .alert-display');
    if (alertDiv) {
        alertDiv.innerHTML = `<strong>Alert:</strong> ${question.alert}`;
    }
    
    updatePracticeQuestionScreen();
}

function updatePracticeQuestionScreen() {
    if (!currentPracticeQuestion) return;
    
    const question = currentPracticeQuestion;
    
    const questionTitleDiv = document.querySelector('#practiceQuestionScreen .question-title');
    if (questionTitleDiv) {
        questionTitleDiv.textContent = question.question;
    }
    
    const optionsDiv = document.querySelector('#practiceQuestionScreen .options');
    if (optionsDiv) {
        let optionsHTML = '';
        question.options.forEach((option, index) => {
            optionsHTML += `
                <label class="option">
                    <input type="radio" name="practice" value="${index}">
                    ${String.fromCharCode(65 + index)}. ${option}
                </label>
            `;
        });
        optionsDiv.innerHTML = optionsHTML;
    }
}

function startPracticeMemory() {
    startMemoryTimer(5, () => {
        showScreen('practiceQuestionScreen');
    });
}

function checkPractice() {
    if (!currentPracticeQuestion) return;
    
    const selected = document.querySelector('input[name="practice"]:checked');
    const resultDiv = document.getElementById('practiceResult');
    
    if (!selected) {
        alert('답을 선택해주세요.');
        return;
    }

    const selectedValue = parseInt(selected.value);
    const isCorrect = selectedValue === currentPracticeQuestion.correct;
    
    // 연습문제 결과 전송
    sendToGoogleSheets({
        type: 'practice',
        participantId: participantData.id,
        selectedOption: selectedValue,
        correctOption: currentPracticeQuestion.correct,
        isCorrect: isCorrect,
        timestamp: new Date().toISOString()
    });
    
    if (isCorrect) {
        resultDiv.innerHTML = `
            <div style="color: green; font-weight: bold; font-size: 18px;">정답입니다! ✓</div>
            <p>${currentPracticeQuestion.options[currentPracticeQuestion.correct]}이 정답입니다.</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="color: red; font-weight: bold; font-size: 18px;">아쉽습니다. ✗</div>
            <p>정답은 ${String.fromCharCode(65 + currentPracticeQuestion.correct)}. ${currentPracticeQuestion.options[currentPracticeQuestion.correct]}입니다.</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    }
    
    resultDiv.style.display = 'block';
}

function startMemoryTimer(seconds, callback) {
    timeLeft = seconds;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('timer').classList.add('show');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').classList.remove('show');
            callback();
        }
    }, 1000);
}

function startExperiment() {
    if (typeof questions === 'undefined' || questions.length === 0) {
        alert('문제 데이터를 불러올 수 없습니다.');
        return;
    }
    
    experimentStartTime = new Date().toISOString();
    document.getElementById('conditionIndicator').classList.add('show');
    currentQuestion = 0;
    currentCondition = Math.floor(Math.random() * 3);
    responses = [];
    
    // 실험 시작 기록
    sendToGoogleSheets({
        type: 'experiment_start',
        participantId: participantData.id,
        totalQuestions: questions.length,
        startTime: experimentStartTime,
        timestamp: new Date().toISOString()
    });
    
    startMemoryPhase();
}

function startMemoryPhase() {
    if (currentQuestion >= questions.length) {
        endExperiment();
        return;
    }

    showScreen('memoryScreen');
    
    const question = questions[currentQuestion];
    const condition = conditions[currentCondition];
    
    document.getElementById('conditionIndicator').textContent = `조건: ${condition.name}`;
    displayPrescription(question);
    
    memoryStartTime = Date.now();
    startMemoryTimer(condition.time, () => {
        showQuestionPhase();
    });
}

function displayPrescription(question) {
    const prescriptionHTML = `
        <div class="prescription-display">
            환자: ${question.prescription.patient || 'N/A'}<br>
            진단: ${question.prescription.diagnosis || 'N/A'}<br><br>
            처방: ${question.prescription.order || 'N/A'}<br>
            ${question.prescription.time || ''}<br>
            특이사항: ${question.prescription.note || ''}
        </div>
    `;
    
    document.getElementById('prescriptionContent').innerHTML = prescriptionHTML;
    
    if (question.alert) {
        document.getElementById('alertContent').innerHTML = `
            <div class="alert-display">
                <strong>Alert:</strong> ${question.alert}
            </div>
        `;
    } else {
        document.getElementById('alertContent').innerHTML = '';
    }
}

function showQuestionPhase() {
    showScreen('questionScreen');
    
    const question = questions[currentQuestion];
    const condition = conditions[currentCondition];
    
    document.getElementById('conditionTitle').textContent = 
        `조건 ${currentCondition + 1}: ${condition.name} (${condition.time}초 기억)`;
    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    document.getElementById('questionContent').innerHTML = `
        <div class="question-container">
            <div class="question-title">${question.question}</div>
        </div>
    `;
    
    displayAnswerArea(question);
    questionStartTime = Date.now();
}

function displayAnswerArea(question) {
    const answerArea = document.getElementById('answerArea');
    
    if (question.type === 'multiple_choice') {
        let optionsHTML = '<div class="options">';
        question.options.forEach((option, index) => {
            optionsHTML += `
                <label class="option">
                    <input type="radio" name="q${question.id}" value="${index}">
                    ${String.fromCharCode(65 + index)}. ${option}
                </label>
            `;
        });
        optionsHTML += '</div>';
        answerArea.innerHTML = optionsHTML;
        
    } else if (question.type === 'subjective') {
        answerArea.innerHTML = `
            <div class="form-group">
                <label for="subjective${question.id}">답안을 작성하세요:</label>
                <textarea id="subjective${question.id}" class="subjective-input" 
                          placeholder="기억한 내용을 정확히 작성해주세요..."></textarea>
            </div>
        `;
        
    } else if (question.type === 'calculation') {
        answerArea.innerHTML = `
            <div class="form-group">
                <label for="calculation${question.id}">계산 결과:</label>
                <input type="number" id="calculation${question.id}" class="subjective-input" 
                       placeholder="예: 187.5" step="0.1">
            </div>
        `;
    }
}

function nextQuestion() {
    const question = questions[currentQuestion];
    let answer = null;
    let isValid = false;
    
    if (question.type === 'multiple_choice') {
        const selected = document.querySelector(`input[name="q${question.id}"]:checked`);
        if (selected) {
            answer = parseInt(selected.value);
            isValid = true;
        } else {
            alert('답을 선택해주세요.');
            return;
        }
        
    } else if (question.type === 'subjective') {
        const textAnswer = document.getElementById(`subjective${question.id}`).value.trim();
        if (textAnswer) {
            answer = textAnswer;
            isValid = true;
        } else {
            alert('답안을 작성해주세요.');
            return;
        }
        
    } else if (question.type === 'calculation') {
        const numAnswer = document.getElementById(`calculation${question.id}`).value;
        if (numAnswer && !isNaN(numAnswer)) {
            answer = parseFloat(numAnswer);
            isValid = true;
        } else {
            alert('숫자를 입력해주세요.');
            return;
        }
    }
    
    if (isValid) {
        recordResponse(answer);
        currentQuestion++;
        
        if (currentQuestion % 10 === 0 && currentQuestion < questions.length) {
            let newCondition;
            do {
                newCondition = Math.floor(Math.random() * conditions.length);
            } while (newCondition === currentCondition && conditions.length > 1);
            currentCondition = newCondition;
        }
        
        setTimeout(() => {
            startMemoryPhase();
        }, 1000);
    }
}

function recordResponse(answer) {
    const question = questions[currentQuestion];
    const responseTime = Date.now() - questionStartTime;
    const condition = conditions[currentCondition];
    
    let isCorrect = false;
    if (question.type === 'multiple_choice') {
        isCorrect = answer === question.correct;
    } else if (question.type === 'calculation') {
        isCorrect = Math.abs(answer - question.correct_answer) < 0.1;
    }
    
    const responseData = {
        questionId: question.id,
        category: question.category,
        type: question.type,
        condition: condition.label,
        conditionName: condition.name,
        memoryTime: condition.time,
        answer: answer,
        correct: question.correct || question.correct_answer || question.answer_key,
        isCorrect: isCorrect,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
    };
    
    responses.push(responseData);
    
    // 각 응답을 즉시 Google Sheets에 전송
    sendToGoogleSheets({
        type: 'response',
        participantId: participantData.id,
        questionId: responseData.questionId,
        category: responseData.category,
        questionType: responseData.type,
        condition: responseData.conditionName,
        memoryTime: responseData.memoryTime,
        answer: responseData.answer,
        correctAnswer: responseData.correct,
        isCorrect: responseData.isCorrect,
        responseTime: responseData.responseTime,
        timestamp: responseData.timestamp
    });
}

function endExperiment() {
    showScreen('completeScreen');
    document.getElementById('conditionIndicator').classList.remove('show');
    
    document.getElementById('finalParticipantId').textContent = participantData.id;
    document.getElementById('completionTime').textContent = new Date().toLocaleString();
    document.getElementById('finalQuestionCount').textContent = responses.length;
    
    // 실험 완료 기록
    const totalCorrect = responses.filter(r => r.isCorrect).length;
    const accuracy = responses.length > 0 ? (totalCorrect / responses.length * 100).toFixed(1) : 0;
    
    sendToGoogleSheets({
        type: 'experiment_complete',
        participantId: participantData.id,
        totalQuestions: responses.length,
        totalCorrect: totalCorrect,
        accuracy: accuracy,
        experimentDuration: experimentStartTime ? 
            (new Date() - new Date(experimentStartTime)) / 1000 / 60 : 0,
        timestamp: new Date().toISOString()
    });
}

function showResults() {
    const resultsDiv = document.getElementById('resultsDisplay');
    
    const totalQuestions = responses.length;
    const multipleChoiceResponses = responses.filter(r => r.type === 'multiple_choice');
    const correctMC = multipleChoiceResponses.filter(r => r.isCorrect).length;
    const mcAccuracy = multipleChoiceResponses.length > 0 ? 
        ((correctMC / multipleChoiceResponses.length) * 100).toFixed(1) : 0;
    
    let resultsHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h3>실험 결과</h3>
            <p><strong>참가자:</strong> ${participantData.id}</p>
            <p><strong>정확도:</strong> ${mcAccuracy}%</p>
            <p><em>모든 데이터가 Google Sheets에 저장되었습니다.</em></p>
        </div>
    `;
    
    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.style.display = 'block';
}

function exportResults() {
    const exportData = {
        participant: participantData,
        responses: responses,
        completedAt: new Date().toISOString()
    };
    
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `nursing_research_${participantData.id}_${Date.now()}.json`;
    jsonLink.click();
    
    alert('로컬 백업 파일이 다운로드되었습니다. 메인 데이터는 Google Sheets에 저장됩니다.');
}

// 초기화
window.addEventListener('load', function() {
    console.log('간호연구 프로젝트 로드 완료');
    
    if (typeof questions !== 'undefined') {
        console.log('총 문항 수:', questions.length);
    } else {
        console.warn('questions.js 파일이 로딩되지 않았습니다.');
    }
    
    if (typeof practiceQuestions !== 'undefined') {
        console.log('연습 문항 로드됨');
    } else {
        console.warn('practiceQuestions가 정의되지 않았습니다.');
    }
    
    // 연결 테스트
    console.log('Google Sheets 연결 테스트 중...');
    sendToGoogleSheets({
        type: 'connection_test',
        timestamp: new Date().toISOString(),
        message: 'Connection test from website'
    });
});

window.addEventListener('beforeunload', function(e) {
    if (responses.length > 0 && currentScreen !== 'completeScreen') {
        e.preventDefault();
        e.returnValue = '실험이 진행 중입니다.';
    }
});
