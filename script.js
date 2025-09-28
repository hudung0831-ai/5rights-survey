
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

// 실험 조건들 (기억 시간)
const conditions = [
    { name: '압박 상황', time: 5, label: 'pressure' },
    { name: '보통 상황', time: 9, label: 'normal' },
    { name: '여유 상황', time: 12, label: 'relaxed' }
];

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function showParticipantInfo() {
    showScreen('participantScreen');
}

function showInstructions() {
    // 참가자 정보 저장
    participantData = {
        id: document.getElementById('participantId').value,
        experience: document.getElementById('experience').value,
        department: document.getElementById('department').value,
        startTime: new Date().toISOString()
    };
    
    if (!participantData.id || !participantData.experience) {
        alert('모든 정보를 입력해주세요.');
        return;
    }
    
    showScreen('instructionScreen');
}

function startPractice() {
    showScreen('practiceMemoryScreen');
    
    // 카운트다운 시작
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

function startPracticeMemory() {
    startMemoryTimer(5, () => {
        showScreen('practiceQuestionScreen');
    });
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

function checkPractice() {
    const selected = document.querySelector('input[name="practice"]:checked');
    const resultDiv = document.getElementById('practiceResult');
    
    if (!selected) {
        alert('답을 선택해주세요.');
        return;
    }

    if (selected.value === '1') {
        resultDiv.innerHTML = `
            <div style="color: green; font-weight: bold; font-size: 18px;">정답입니다! ✓</div>
            <p>Amlodipine 5mg가 정답입니다. 기억 기반 테스트의 원리를 잘 이해하셨습니다.</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="color: red; font-weight: bold; font-size: 18px;">아쉽습니다. ✗</div>
            <p>정답은 ① Amlodipine 5mg입니다. 실제 실험에서는 더 집중해서 기억해보세요.</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    }
    
    resultDiv.style.display = 'block';
}

function startExperiment() {
    // questions 배열이 없으면 경고
    if (typeof questions === 'undefined' || questions.length === 0) {
        alert('문제 데이터를 불러올 수 없습니다. questions.js 파일을 확인해주세요.');
        return;
    }
    
    document.getElementById('conditionIndicator').classList.add('show');
    currentQuestion = 0;
    currentCondition = Math.floor(Math.random() * 3);
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
    
    // 조건 표시기 업데이트
    document.getElementById('conditionIndicator').textContent = `조건: ${condition.name}`;
    
    // 처방오더 내용 표시
    displayPrescription(question);
    
    // 기억 시간 시작
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
    
    // UI 업데이트
    document.getElementById('conditionTitle').textContent = 
        `조건 ${currentCondition + 1}: ${condition.name} (${condition.time}초 기억)`;
    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    
    // 진행률 업데이트
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // 문제 내용 표시
    document.getElementById('questionContent').innerHTML = `
        <div class="question-container">
            <div class="question-title">${question.question}</div>
        </div>
    `;
    
    // 답변 영역 표시
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
                          placeholder="기억한 내용을 최대한 정확히 작성해주세요..."></textarea>
            </div>
        `;
        
    } else if (question.type === 'calculation') {
        answerArea.innerHTML = `
            <div class="form-group">
                <label for="calculation${question.id}">계산 결과 (숫자만 입력):</label>
                <input type="number" id="calculation${question.id}" class="subjective-input" 
                       style="height: 50px;" placeholder="예: 187.5" step="0.1">
                <small style="color: #666;">소수점이 있는 경우 소수점까지 입력해주세요</small>
            </div>
        `;
    }
}

function nextQuestion() {
    const question = questions[currentQuestion];
    let answer = null;
    let isValid = false;
    
    // 답변 수집
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
            alert('계산 결과를 숫자로 입력해주세요.');
            return;
        }
    }
    
    if (isValid) {
        recordResponse(answer);
        currentQuestion++;
        
        // 조건 변경 (10문항마다)
        if (currentQuestion % 10 === 0 && currentQuestion < questions.length) {
            let newCondition;
            do {
                newCondition = Math.floor(Math.random() * conditions.length);
            } while (newCondition === currentCondition && conditions.length > 1);
            currentCondition = newCondition;
        }
        
        // 다음 문제로 이동
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
    
    responses.push({
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
    });
}

function endExperiment() {
    showScreen('completeScreen');
    document.getElementById('conditionIndicator').classList.remove('show');
    
    // 완료 정보 표시
    document.getElementById('finalParticipantId').textContent = participantData.id;
    document.getElementById('completionTime').textContent = new Date().toLocaleString();
    document.getElementById('finalQuestionCount').textContent = responses.length;
}

function showResults() {
    const resultsDiv = document.getElementById('resultsDisplay');
    
    // 기본 통계
    const totalQuestions = responses.length;
    const multipleChoiceResponses = responses.filter(r => r.type === 'multiple_choice');
    const correctMC = multipleChoiceResponses.filter(r => r.isCorrect).length;
    const mcAccuracy = multipleChoiceResponses.length > 0 ? 
        ((correctMC / multipleChoiceResponses.length) * 100).toFixed(1) : 0;
    
    let resultsHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h3>실험 결과 요약</h3>
            <p><strong>총 문항 수:</strong> ${totalQuestions}</p>
            <p><strong>객관식 정확도:</strong> ${mcAccuracy}% (${correctMC}/${multipleChoiceResponses.length})</p>
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
    jsonLink.download = `nursing_research_${participantData.id}_${new Date().getTime()}.json`;
    jsonLink.click();
    
    alert('결과가 JSON 파일로 다운로드됩니다.');
}

// 페이지 로드 시 초기화
window.addEventListener('load', function() {
    console.log('간호연구 프로젝트 로드 완료');
    if (typeof questions !== 'undefined') {
        console.log('총 문항 수:', questions.length);
    } else {
        console.warn('questions.js 파일이 로딩되지 않았습니다.');
    }
});
