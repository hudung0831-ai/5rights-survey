// ====================================
// 간호연구 프로젝트 - 완전한 script.js
// Google Sheets 자동 데이터 수집 포함
// ====================================

// Google Sheets 설정 (연구자가 설정해야 함)
const GOOGLE_SHEETS_CONFIG = {
    // Google Apps Script Web App URL (연구자가 생성 후 여기에 입력)
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxgiuxDdKSjQuMgf3r-HajqY3-9w1fQ241E2NunfIg7EoWIsLYCBT86xH_WyyAO4UxVUg/exec',
    
    // 스프레드시트 정보
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    sheetName: '간호연구데이터'
};

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

// 실험 조건들 (기억 시간)
const conditions = [
    { name: '압박 상황', time: 5, label: 'pressure' },
    { name: '보통 상황', time: 9, label: 'normal' },
    { name: '여유 상황', time: 12, label: 'relaxed' }
];

// ====================================
// 핵심 함수들
// ====================================

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    // 화면 전환 로그
    console.log(`화면 전환: ${screenId}`);
}

// 참가자 정보 화면으로 이동
function showParticipantInfo() {
    showScreen('participantScreen');
}

// 실험 안내 화면으로 이동
function showInstructions() {
    // 참가자 정보 저장
    participantData = {
        id: document.getElementById('participantId').value.trim(),
        experience: document.getElementById('experience').value,
        department: document.getElementById('department').value,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`
    };
    
    // 입력 검증
    if (!participantData.id || !participantData.experience || !participantData.department) {
        alert('모든 정보를 입력해주세요.');
        return;
    }
    
    // 참가자 정보를 Google Sheets에 저장
    saveParticipantInfo();
    
    showScreen('instructionScreen');
}

// ====================================
// 연습문제 관련 함수들
// ====================================

function startPractice() {
    // practiceQuestions 배열 확인
    if (typeof practiceQuestions === 'undefined' || practiceQuestions.length === 0) {
        alert('연습 문제를 불러올 수 없습니다. questions.js 파일을 확인해주세요.');
        return;
    }
    
    // 첫 번째 연습문제 설정
    currentPracticeQuestion = practiceQuestions[0];
    
    showScreen('practiceMemoryScreen');
    
    // 연습문제 처방오더 표시
    displayPracticeQuestion();
    
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

function displayPracticeQuestion() {
    if (!currentPracticeQuestion) return;
    
    const question = currentPracticeQuestion;
    
    // 기존 HTML의 연습문제 처방오더 부분을 동적으로 업데이트
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
    
    // Alert 메시지 업데이트
    const alertDiv = document.querySelector('#practiceMemoryScreen .alert-display');
    if (alertDiv) {
        alertDiv.innerHTML = `<strong>Alert:</strong> ${question.alert}`;
    }
    
    // 연습문제 질문과 선택지 업데이트
    updatePracticeQuestionScreen();
}

function updatePracticeQuestionScreen() {
    if (!currentPracticeQuestion) return;
    
    const question = currentPracticeQuestion;
    
    // 질문 업데이트
    const questionTitleDiv = document.querySelector('#practiceQuestionScreen .question-title');
    if (questionTitleDiv) {
        questionTitleDiv.textContent = question.question;
    }
    
    // 선택지 업데이트
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
    if (!currentPracticeQuestion) {
        alert('연습 문제가 로드되지 않았습니다.');
        return;
    }
    
    const selected = document.querySelector('input[name="practice"]:checked');
    const resultDiv = document.getElementById('practiceResult');
    
    if (!selected) {
        alert('답을 선택해주세요.');
        return;
    }

    const selectedValue = parseInt(selected.value);
    const isCorrect = selectedValue === currentPracticeQuestion.correct;
    
    // 연습문제 결과를 Google Sheets에 저장
    savePracticeResult(selectedValue, isCorrect);
    
    if (isCorrect) {
        resultDiv.innerHTML = `
            <div style="color: green; font-weight: bold; font-size: 18px;">정답입니다! ✓</div>
            <p>${currentPracticeQuestion.options[currentPracticeQuestion.correct]}이 정답입니다.</p>
            <p>${currentPracticeQuestion.explanation || '기억 기반 테스트의 원리를 잘 이해하셨습니다.'}</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="color: red; font-weight: bold; font-size: 18px;">아쉽습니다. ✗</div>
            <p>정답은 ${String.fromCharCode(65 + currentPracticeQuestion.correct)}. ${currentPracticeQuestion.options[currentPracticeQuestion.correct]}입니다.</p>
            <p>${currentPracticeQuestion.explanation || '실제 실험에서는 더 집중해서 기억해보세요.'}</p>
            <button class="btn btn-success" onclick="startExperiment()">실제 실험 시작</button>
        `;
    }
    
    resultDiv.style.display = 'block';
}

// ====================================
// 타이머 관련 함수들
// ====================================

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

// ====================================
// 실제 실험 관련 함수들
// ====================================

function startExperiment() {
    // questions 배열이 없으면 경고
    if (typeof questions === 'undefined' || questions.length === 0) {
        alert('문제 데이터를 불러올 수 없습니다. questions.js 파일을 확인해주세요.');
        return;
    }
    
    // 실험 시작 시간 기록
    experimentStartTime = new Date().toISOString();
    
    document.getElementById('conditionIndicator').classList.add('show');
    currentQuestion = 0;
    currentCondition = Math.floor(Math.random() * 3);
    responses = []; // 응답 배열 초기화
    
    // 실험 시작을 Google Sheets에 기록
    logExperimentStart();
    
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
    
    // 각 응답을 즉시 Google Sheets에 저장
    saveResponseToSheets(responseData);
}

// ====================================
// 실험 완료 관련 함수들
// ====================================

function endExperiment() {
    showScreen('completeScreen');
    document.getElementById('conditionIndicator').classList.remove('show');
    
    // 완료 정보 표시
    document.getElementById('finalParticipantId').textContent = participantData.id;
    document.getElementById('completionTime').textContent = new Date().toLocaleString();
    document.getElementById('finalQuestionCount').textContent = responses.length;
    
    // 실험 완료를 Google Sheets에 기록
    logExperimentCompletion();
}

function showResults() {
    const resultsDiv = document.getElementById('resultsDisplay');
    
    // 기본 통계
    const totalQuestions = responses.length;
    const multipleChoiceResponses = responses.filter(r => r.type === 'multiple_choice');
    const correctMC = multipleChoiceResponses.filter(r => r.isCorrect).length;
    const mcAccuracy = multipleChoiceResponses.length > 0 ? 
        ((correctMC / multipleChoiceResponses.length) * 100).toFixed(1) : 0;
    
    // 조건별 통계
    const conditionStats = {};
    conditions.forEach(condition => {
        const conditionMC = multipleChoiceResponses.filter(r => r.condition === condition.label);
        const conditionCorrect = conditionMC.filter(r => r.isCorrect).length;
        const conditionAccuracy = conditionMC.length > 0 ? 
            ((conditionCorrect / conditionMC.length) * 100).toFixed(1) : 0;
        conditionStats[condition.name] = {
            accuracy: conditionAccuracy,
            count: conditionMC.length,
            correct: conditionCorrect
        };
    });
    
    let resultsHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h3>실험 결과 요약</h3>
            <p><strong>참가자 ID:</strong> ${participantData.id}</p>
            <p><strong>총 문항 수:</strong> ${totalQuestions}</p>
            <p><strong>객관식 정확도:</strong> ${mcAccuracy}% (${correctMC}/${multipleChoiceResponses.length})</p>
            
            <h4>조건별 정확도</h4>
            <ul>
    `;
    
    Object.entries(conditionStats).forEach(([conditionName, stats]) => {
        resultsHTML += `<li><strong>${conditionName}:</strong> ${stats.accuracy}% (${stats.correct}/${stats.count})</li>`;
    });
    
    resultsHTML += `
            </ul>
            <p><em>모든 데이터는 Google Sheets에 자동 저장되었습니다.</em></p>
        </div>
    `;
    
    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.style.display = 'block';
}

function exportResults() {
    // 로컬 다운로드용 데이터 생성
    const exportData = {
        participant: participantData,
        responses: responses,
        summary: {
            totalQuestions: responses.length,
            completedAt: new Date().toISOString(),
            experimentDuration: experimentStartTime ? 
                (new Date() - new Date(experimentStartTime)) / 1000 / 60 : 0
        }
    };
    
    // JSON 파일 다운로드
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `nursing_research_${participantData.id}_${new Date().getTime()}.json`;
    jsonLink.click();
    
    alert('결과가 JSON 파일로 다운로드되며, Google Sheets에도 저장되었습니다.');
}

// ====================================
// Google Sheets 연동 함수들
// ====================================

async function saveParticipantInfo() {
    const data = {
        type: 'participant',
        timestamp: new Date().toISOString(),
        participantId: participantData.id,
        experience: participantData.experience,
        department: participantData.department,
        userAgent: participantData.userAgent,
        screenResolution: participantData.screenResolution
    };
    
    await sendToGoogleSheets(data);
}

async function savePracticeResult(selectedValue, isCorrect) {
    const data = {
        type: 'practice',
        timestamp: new Date().toISOString(),
        participantId: participantData.id,
        selectedOption: selectedValue,
        correctOption: currentPracticeQuestion.correct,
        isCorrect: isCorrect,
        question: currentPracticeQuestion.question
    };
    
    await sendToGoogleSheets(data);
}

async function logExperimentStart() {
    const data = {
        type: 'experiment_start',
        timestamp: experimentStartTime,
        participantId: participantData.id,
        totalQuestions: questions.length,
        conditions: conditions.map(c => c.name).join(', ')
    };
    
    await sendToGoogleSheets(data);
}

async function saveResponseToSheets(responseData) {
    const data = {
        type: 'response',
        timestamp: responseData.timestamp,
        participantId: participantData.id,
        questionId: responseData.questionId,
        category: responseData.category,
        questionType: responseData.type,
        condition: responseData.conditionName,
        memoryTime: responseData.memoryTime,
        answer: responseData.answer,
        correctAnswer: responseData.correct,
        isCorrect: responseData.isCorrect,
        responseTime: responseData.responseTime
    };
    
    await sendToGoogleSheets(data);
}

async function logExperimentCompletion() {
    const totalCorrect = responses.filter(r => r.isCorrect).length;
    const accuracy = responses.length > 0 ? (totalCorrect / responses.length * 100).toFixed(1) : 0;
    
    const data = {
        type: 'experiment_complete',
        timestamp: new Date().toISOString(),
        participantId: participantData.id,
        totalQuestions: responses.length,
        totalCorrect: totalCorrect,
        accuracy: accuracy,
        experimentDuration: experimentStartTime ? 
            (new Date() - new Date(experimentStartTime)) / 1000 / 60 : 0
    };
    
    await sendToGoogleSheets(data);
}

async function sendToGoogleSheets(data) {
    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.text();
        console.log('Google Sheets 저장 성공:', result);
        
    } catch (error) {
        console.error('Google Sheets 저장 실패:', error);
        // 네트워크 오류가 있어도 실험은 계속 진행되도록 함
    }
}

// ====================================
// 초기화 및 이벤트 리스너
// ====================================

// 페이지 로드 시 초기화
window.addEventListener('load', function() {
    console.log('간호연구 프로젝트 로드 완료');
    
    // questions 배열 확인
    if (typeof questions !== 'undefined') {
        console.log('총 문항 수:', questions.length);
    } else {
        console.warn('questions.js 파일이 로딩되지 않았습니다.');
    }
    
    // practiceQuestions 배열 확인
    if (typeof practiceQuestions !== 'undefined') {
        console.log('연습 문항 수:', practiceQuestions.length);
    } else {
        console.warn('practiceQuestions가 정의되지 않았습니다.');
    }
    
    // Google Sheets 설정 확인
    if (GOOGLE_SHEETS_CONFIG.webAppUrl.includes('YOUR_SCRIPT_ID')) {
        console.warn('Google Sheets 설정이 필요합니다. GOOGLE_SHEETS_CONFIG를 업데이트하세요.');
    }
});

// 브라우저 새로고침 방지 (실험 중일 때)
window.addEventListener('beforeunload', function(e) {
    if (responses.length > 0 && currentScreen !== 'completeScreen') {
        e.preventDefault();
        e.returnValue = '실험이 진행 중입니다. 페이지를 떠나시겠습니까?';
    }
});

// 키보드 단축키 (연구자용)
window.addEventListener('keydown', function(e) {
    // Ctrl+Shift+R: 강제 결과 보기
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        showResults();
    }
    
    // Ctrl+Shift+E: 강제 실험 종료
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        if (confirm('실험을 강제로 종료하시겠습니까?')) {
            endExperiment();
        }
    }
});

// ====================================
// 유틸리티 함수들
// ====================================

// 네트워크 상태 모니터링
function checkNetworkStatus() {
    if (!navigator.onLine) {
        console.warn('네트워크 연결이 끊어졌습니다. 데이터 저장에 실패할 수 있습니다.');
    }
}

window.addEventListener('online', function() {
    console.log('네트워크 연결이 복구되었습니다.');
});

window.addEventListener('offline', function() {
    console.warn('네트워크 연결이 끊어졌습니다.');
});

// 디버그 모드 (개발용)
function enableDebugMode() {
    window.debugMode = true;
    console.log('디버그 모드가 활성화되었습니다.');
    console.log('사용 가능한 디버그 함수:');
    console.log('- skipToQuestion(n): n번째 문제로 이동');
    console.log('- showAllResponses(): 모든 응답 출력');
    console.log('- forceComplete(): 강제 완료');
}

function skipToQuestion(questionNumber) {
    if (!window.debugMode) return;
    if (questionNumber >= 0 && questionNumber < questions.length) {
        currentQuestion = questionNumber;
        startMemoryPhase();
    }
}

function showAllResponses() {
    if (!window.debugMode) return;
    console.table(responses);
}

function forceComplete() {
    if (!window.debugMode) return;
    endExperiment();
}

// 콘솔에 디버그 활성화 안내
console.log('개발자용: enableDebugMode() 함수를 호출하여 디버그 기능을 활성화할 수 있습니다.');
