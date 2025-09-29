// 간호연구 프로젝트 - 최종 수정된 버전

// Google Forms 설정
const GOOGLE_FORMS_CONFIG = {
    formId: '1FAIpQLScLTum2HGUdAe14FNhj4impp_plz55SISHaEHbbBVQVT-0Z0Q',
    fields: {
        participantId: 'entry.315076392',
        data: 'entry.967211757'
    }
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

// 실험 조건 설정
const conditions = [
    { name: '압박 상황', time: 5, label: 'pressure' },
    { name: '보통 상황', time: 9, label: 'normal' },
    { name: '여유 상황', time: 12, label: 'relaxed' }
];

// Google Forms 데이터 전송 함수
async function sendToGoogleForms(data) {
    try {
        console.log('Google Forms 데이터 전송 중:', data.type || 'unknown');
        
        const formData = new FormData();
        formData.append(GOOGLE_FORMS_CONFIG.fields.participantId, data.participantId || '');
        formData.append(GOOGLE_FORMS_CONFIG.fields.data, JSON.stringify(data));
        
        const response = await fetch(`https://docs.google.com/forms/d/e/${GOOGLE_FORMS_CONFIG.formId}/formResponse`, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        
        console.log('Google Forms 전송 완료');
        return true;
        
    } catch (error) {
        console.error('Google Forms 전송 실패:', error);
        
        const backupKey = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            localStorage.setItem(backupKey, JSON.stringify(data));
            console.log('로컬 백업 저장됨:', backupKey);
        } catch (storageError) {
            console.error('로컬 저장소 백업도 실패:', storageError);
        }
        
        throw error;
    }
}

// 화면 전환 함수
function showScreen(screenId) {
    try {
        const allScreens = document.querySelectorAll('.screen');
        if (allScreens.length === 0) {
            console.warn('화면 요소들이 없습니다. HTML 구조를 확인하세요.');
        }
        
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (!targetScreen) {
            console.error(`화면을 찾을 수 없습니다: ${screenId}`);
            return false;
        }
        
        targetScreen.classList.add('active');
        currentScreen = screenId;
        console.log(`화면 전환: ${screenId}`);
        return true;
        
    } catch (error) {
        console.error('화면 전환 오류:', error);
        return false;
    }
}

function showParticipantInfo() {
    showScreen('participantScreen');
}

async function showInstructions() {
    try {
        const participantId = document.getElementById('participantId')?.value?.trim();
        const experience = document.getElementById('experience')?.value;
        const department = document.getElementById('department')?.value;
        
        if (!participantId || !experience || !department) {
            alert('모든 정보를 입력해주세요.');
            return;
        }
        
        if (participantId.length < 2) {
            alert('참가자 ID는 최소 2자 이상 입력해주세요.');
            return;
        }
        
        participantData = {
            id: participantId,
            experience: experience,
            department: department,
            startTime: new Date().toISOString()
        };
        
        await sendToGoogleForms({
            type: 'participant',
            participantId: participantData.id,
            experience: participantData.experience,
            department: participantData.department,
            timestamp: new Date().toISOString()
        });
        
        showScreen('instructionScreen');
        
    } catch (error) {
        console.error('참가자 정보 저장 오류:', error);
        if (confirm('참가자 정보 저장 중 오류가 발생했습니다. 계속 진행하시겠습니까?')) {
            showScreen('instructionScreen');
        }
    }
}

function startPractice() {
    try {
        if (typeof practiceQuestions === 'undefined' || !Array.isArray(practiceQuestions) || practiceQuestions.length === 0) {
            alert('연습 문제를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        currentPracticeQuestion = practiceQuestions[0];
        showScreen('practiceMemoryScreen');
        displayPracticeQuestion();
        
        let countdown = 3;
        const countdownEl = document.getElementById('practiceCountdown');
        
        if (!countdownEl) {
            console.error('연습 카운트다운 엘리먼트가 없습니다.');
            startPracticeMemory();
            return;
        }
        
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
        
    } catch (error) {
        console.error('연습 시작 오류:', error);
        alert('연습을 시작할 수 없습니다. 페이지를 새로고침해주세요.');
    }
}

function displayPracticeQuestion() {
    if (!currentPracticeQuestion) {
        console.error('연습 문제가 설정되지 않았습니다.');
        return;
    }
    
    try {
        const question = currentPracticeQuestion;
        
        const prescriptionDiv = document.querySelector('#practiceMemoryScreen .prescription-display');
        if (prescriptionDiv && question.prescription) {
            prescriptionDiv.innerHTML = `
                환자: ${question.prescription.patient || 'N/A'}<br>
                진단: ${question.prescription.diagnosis || 'N/A'}<br><br>
                처방: ${question.prescription.order || 'N/A'}<br>
                ${question.prescription.time || ''}<br>
                특이사항: ${question.prescription.note || '없음'}
            `;
        }
        
        const alertDiv = document.querySelector('#practiceMemoryScreen .alert-display');
        if (alertDiv) {
            if (question.alert) {
                alertDiv.innerHTML = `<strong>Alert:</strong> ${question.alert}`;
                alertDiv.style.display = 'block';
            } else {
                alertDiv.style.display = 'none';
            }
        }
        
        updatePracticeQuestionScreen();
        
    } catch (error) {
        console.error('연습 문제 표시 오류:', error);
    }
}

function updatePracticeQuestionScreen() {
    if (!currentPracticeQuestion) return;
    
    try {
        const question = currentPracticeQuestion;
        
        const questionTitleDiv = document.querySelector('#practiceQuestionScreen .question-title');
        if (questionTitleDiv) {
            questionTitleDiv.textContent = question.question || '문제를 불러올 수 없습니다.';
        }
        
        const optionsDiv = document.querySelector('#practiceQuestionScreen .options');
        if (optionsDiv && question.options && Array.isArray(question.options)) {
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
        
    } catch (error) {
        console.error('연습 문제 화면 업데이트 오류:', error);
    }
}

function startPracticeMemory() {
    startMemoryTimer(5, () => {
        showScreen('practiceQuestionScreen');
    });
}

async function checkPractice() {
    if (!currentPracticeQuestion) {
        alert('연습 문제가 설정되지 않았습니다.');
        return;
    }
    
    try {
        const selected = document.querySelector('input[name="practice"]:checked');
        const resultDiv = document.getElementById('practiceResult');
        
        if (!selected) {
            alert('답을 선택해주세요.');
            return;
        }

        const selectedValue = parseInt(selected.value);
        const isCorrect = selectedValue === currentPracticeQuestion.correct;
        
        await sendToGoogleForms({
            type: 'practice',
            participantId: participantData.id,
            selectedOption: selectedValue,
            correctOption: currentPracticeQuestion.correct,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        if (resultDiv) {
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
        
    } catch (error) {
        console.error('연습 문제 확인 오류:', error);
        alert('연습 문제 처리 중 오류가 발생했습니다.');
    }
}

function startMemoryTimer(seconds, callback) {
    try {
        timeLeft = seconds;
        const timerEl = document.getElementById('timer');
        
        if (!timerEl) {
            console.warn('타이머 엘리먼트를 찾을 수 없습니다. 즉시 진행합니다.');
            setTimeout(callback, seconds * 1000);
            return;
        }
        
        timerEl.textContent = timeLeft;
        timerEl.classList.add('show');
        
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerEl.classList.remove('show');
                callback();
            }
        }, 1000);
        
    } catch (error) {
        console.error('타이머 시작 오류:', error);
        setTimeout(callback, seconds * 1000);
    }
}

async function startExperiment() {
    try {
        if (typeof questions === 'undefined' || !Array.isArray(questions) || questions.length === 0) {
            alert('문제 데이터를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        experimentStartTime = new Date().toISOString();
        const conditionIndicator = document.getElementById('conditionIndicator');
        if (conditionIndicator) {
            conditionIndicator.classList.add('show');
        }
        
        currentQuestion = 0;
        currentCondition = Math.floor(Math.random() * conditions.length);
        responses = [];
        
        await sendToGoogleForms({
            type: 'experiment_start',
            participantId: participantData.id,
            totalQuestions: questions.length,
            startTime: experimentStartTime,
            initialCondition: conditions[currentCondition].name,
            timestamp: new Date().toISOString()
        });
        
        startMemoryPhase();
        
    } catch (error) {
        console.error('실험 시작 오류:', error);
        alert('실험을 시작할 수 없습니다. 관리자에게 문의하세요.');
    }
}

function startMemoryPhase() {
    if (currentQuestion >= questions.length) {
        endExperiment();
        return;
    }

    try {
        showScreen('memoryScreen');
        
        const question = questions[currentQuestion];
        const condition = conditions[currentCondition];
        
        const conditionIndicator = document.getElementById('conditionIndicator');
        if (conditionIndicator) {
            conditionIndicator.textContent = `조건: ${condition.name}`;
        }
        
        displayPrescription(question);
        
        memoryStartTime = Date.now();
        startMemoryTimer(condition.time, () => {
            showQuestionPhase();
        });
        
    } catch (error) {
        console.error('기억 단계 오류:', error);
        showQuestionPhase();
    }
}

function displayPrescription(question) {
    try {
        const prescriptionHTML = `
            <div class="prescription-display">
                환자: ${question.prescription?.patient || 'N/A'}<br>
                진단: ${question.prescription?.diagnosis || 'N/A'}<br><br>
                처방: ${question.prescription?.order || 'N/A'}<br>
                ${question.prescription?.time || ''}<br>
                특이사항: ${question.prescription?.note || '없음'}
            </div>
        `;
        
        const prescriptionContent = document.getElementById('prescriptionContent');
        if (prescriptionContent) {
            prescriptionContent.innerHTML = prescriptionHTML;
        }
        
        const alertContent = document.getElementById('alertContent');
        if (alertContent) {
            if (question.alert) {
                alertContent.innerHTML = `
                    <div class="alert-display">
                        <strong>Alert:</strong> ${question.alert}
                    </div>
                `;
                alertContent.style.display = 'block';
            } else {
                alertContent.innerHTML = '';
                alertContent.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('처방전 표시 오류:', error);
    }
}

function showQuestionPhase() {
    try {
        showScreen('questionScreen');
        
        const question = questions[currentQuestion];
        const condition = conditions[currentCondition];
        
        const conditionTitle = document.getElementById('conditionTitle');
        if (conditionTitle) {
            conditionTitle.textContent = `조건 ${currentCondition + 1}: ${condition.name} (${condition.time}초 기억)`;
        }
        
        const questionNumber = document.getElementById('questionNumber');
        if (questionNumber) {
            questionNumber.textContent = currentQuestion + 1;
        }
        
        const totalQuestions = document.getElementById('totalQuestions');
        if (totalQuestions) {
            totalQuestions.textContent = questions.length;
        }
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            progressBar.style.width = progress + '%';
        }
        
        const questionContent = document.getElementById('questionContent');
        if (questionContent) {
            questionContent.innerHTML = `
                <div class="question-container">
                    <div class="question-title">${question.question || '문제를 불러올 수 없습니다.'}</div>
                </div>
            `;
        }
        
        displayAnswerArea(question);
        questionStartTime = Date.now();
        
    } catch (error) {
        console.error('문제 단계 표시 오류:', error);
    }
}

function displayAnswerArea(question) {
    const answerArea = document.getElementById('answerArea');
    if (!answerArea) {
        console.error('답안 영역을 찾을 수 없습니다.');
        return;
    }
    
    try {
        if (question.type === 'multiple_choice') {
            let optionsHTML = '<div class="options">';
            if (question.options && Array.isArray(question.options)) {
                question.options.forEach((option, index) => {
                    optionsHTML += `
                        <label class="option">
                            <input type="radio" name="q${question.id}" value="${index}">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </label>
                    `;
                });
            }
            optionsHTML += '</div>';
            answerArea.innerHTML = optionsHTML;
            
        } else if (question.type === 'calculation') {
            answerArea.innerHTML = `
                <div class="form-group">
                    <label for="calculation${question.id}">계산 결과:</label>
                    <input type="number" id="calculation${question.id}" class="calculation-input" 
                           placeholder="예: 187.5" step="0.1" min="0">
                    <small class="help-text">소수점 첫째 자리까지 입력하세요</small>
                </div>
            `;
        } else {
            console.warn('지원하지 않는 문제 유형:', question.type);
            answerArea.innerHTML = `
                <div class="error-message">
                    <p>지원하지 않는 문제 유형입니다: ${question.type}</p>
                    <button class="btn btn-secondary" onclick="skipCurrentQuestion()">건너뛰기</button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('답안 영역 표시 오류:', error);
        answerArea.innerHTML = '<p>답안 영역을 불러올 수 없습니다.</p>';
    }
}

async function nextQuestion() {
    try {
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
            
        } else if (question.type === 'calculation') {
            const numAnswer = document.getElementById(`calculation${question.id}`)?.value;
            if (numAnswer && !isNaN(numAnswer) && numAnswer.trim() !== '') {
                answer = parseFloat(numAnswer);
                isValid = true;
            } else {
                alert('올바른 숫자를 입력해주세요.');
                return;
            }
        } else {
            console.warn('지원하지 않는 문제 유형 건너뛰기:', question.type);
            answer = null;
            isValid = true;
        }
        
        if (isValid) {
            await recordResponse(answer);
            proceedToNextQuestion();
        }
        
    } catch (error) {
        console.error('다음 문제 진행 오류:', error);
        alert('문제 처리 중 오류가 발생했습니다.');
    }
}

async function skipCurrentQuestion() {
    try {
        console.log('문제 건너뛰기:', currentQuestion + 1);
        await recordResponse(null);
        proceedToNextQuestion();
    } catch (error) {
        console.error('문제 건너뛰기 오류:', error);
        proceedToNextQuestion();
    }
}

function proceedToNextQuestion() {
    currentQuestion++;
    
    if (currentQuestion % 10 === 0 && currentQuestion < questions.length) {
        let newCondition;
        do {
            newCondition = Math.floor(Math.random() * conditions.length);
        } while (newCondition === currentCondition && conditions.length > 1);
        currentCondition = newCondition;
        console.log('조건 변경:', conditions[currentCondition].name);
    }
    
    setTimeout(() => {
        startMemoryPhase();
    }, 1000);
}

async function recordResponse(answer) {
    try {
        const question = questions[currentQuestion];
        const responseTime = Date.now() - questionStartTime;
        const condition = conditions[currentCondition];
        
        let isCorrect = false;
        if (answer !== null) {
            if (question.type === 'multiple_choice') {
                isCorrect = answer === question.correct;
            } else if (question.type === 'calculation') {
                const tolerance = question.tolerance || 0.1;
                isCorrect = Math.abs(answer - (question.correct_answer || question.correct)) <= tolerance;
            }
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
        
        await sendToGoogleForms({
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
        
    } catch (error) {
        console.error('응답 기록 오류:', error);
        responses.push({
            questionId: question?.id || currentQuestion,
            answer: answer,
            responseTime: Date.now() - questionStartTime,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

async function endExperiment() {
    try {
        showScreen('completeScreen');
        
        const conditionIndicator = document.getElementById('conditionIndicator');
        if (conditionIndicator) {
            conditionIndicator.classList.remove('show');
        }
        
        const finalParticipantId = document.getElementById('finalParticipantId');
        if (finalParticipantId) {
            finalParticipantId.textContent = participantData.id;
        }
        
        const completionTime = document.getElementById('completionTime');
        if (completionTime) {
            completionTime.textContent = new Date().toLocaleString();
        }
        
        const finalQuestionCount = document.getElementById('finalQuestionCount');
        if (finalQuestionCount) {
            finalQuestionCount.textContent = responses.length;
        }
        
        const multipleChoiceResponses = responses.filter(r => r.type === 'multiple_choice');
        const calculationResponses = responses.filter(r => r.type === 'calculation');
        const totalCorrect = responses.filter(r => r.isCorrect === true).length;
        
        const mcAccuracy = multipleChoiceResponses.length > 0 ? 
            (multipleChoiceResponses.filter(r => r.isCorrect).length / multipleChoiceResponses.length * 100).toFixed(1) : 0;
        const calcAccuracy = calculationResponses.length > 0 ? 
            (calculationResponses.filter(r => r.isCorrect).length / calculationResponses.length * 100).toFixed(1) : 0;
        
        await sendToGoogleForms({
            type: 'experiment_complete',
            participantId: participantData.id,
            participant: participantData,
            allResponses: responses,
            summary: {
                totalQuestions: responses.length,
                multipleChoiceQuestions: multipleChoiceResponses.length,
                calculationQuestions: calculationResponses.length,
                totalCorrect: totalCorrect,
                mcAccuracy: mcAccuracy,
                calcAccuracy: calcAccuracy,
                experimentDuration: experimentStartTime ? 
                    (new Date() - new Date(experimentStartTime)) / 1000 / 60 : 0
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('실험 종료 처리 오류:', error);
        showScreen('completeScreen');
    }
}

function showResults() {
    try {
        const resultsDiv = document.getElementById('resultsDisplay');
        if (!resultsDiv) return;
        
        const totalQuestions = responses.length;
        const multipleChoiceResponses = responses.filter(r => r.type === 'multiple_choice');
        const calculationResponses = responses.filter(r => r.type === 'calculation');
        
        const correctMC = multipleChoiceResponses.filter(r => r.isCorrect).length;
        const correctCalc = calculationResponses.filter(r => r.isCorrect).length;
        
        const mcAccuracy = multipleChoiceResponses.length > 0 ? 
            ((correctMC / multipleChoiceResponses.length) * 100).toFixed(1) : 0;
        const calcAccuracy = calculationResponses.length > 0 ? 
            ((correctCalc / calculationResponses.length) * 100).toFixed(1) : 0;
        
        let resultsHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3>실험 결과</h3>
                <p><strong>참가자:</strong> ${participantData.id}</p>
                <p><strong>총 응답 수:</strong> ${totalQuestions}개</p>
        `;
        
        if (multipleChoiceResponses.length > 0) {
            resultsHTML += `<p><strong>객관식 정확도:</strong> ${mcAccuracy}% (${correctMC}/${multipleChoiceResponses.length})</p>`;
        }
        
        if (calculationResponses.length > 0) {
            resultsHTML += `<p><strong>계산 문제 정확도:</strong> ${calcAccuracy}% (${correctCalc}/${calculationResponses.length})</p>`;
        }
        
        resultsHTML += `
                <p><em>모든 데이터가 Google Forms에 저장되었습니다.</em></p>
            </div>
        `;
        
        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('결과 표시 오류:', error);
    }
}

function exportResults() {
    try {
        const exportData = {
            participant: participantData,
            responses: responses,
            summary: {
                totalQuestions: responses.length,
                multipleChoiceQuestions: responses.filter(r => r.type === 'multiple_choice').length,
                calculationQuestions: responses.filter(r => r.type === 'calculation').length,
                totalCorrect: responses.filter(r => r.isCorrect === true).length,
                experimentDuration: experimentStartTime ? 
                    (new Date() - new Date(experimentStartTime)) / 1000 / 60 : 0
            },
            completedAt: new Date().toISOString()
        };
        
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `nursing_research_${participantData.id}_${Date.now()}.json`;
        jsonLink.click();
        
        URL.revokeObjectURL(jsonUrl);
        alert('로컬 백업 파일이 다운로드되었습니다.');
        
    } catch (error) {
        console.error('결과 내보내기 오류:', error);
        alert('파일 내보내기 중 오류가 발생했습니다.');
    }
}

window.addEventListener('load', async function() {
    try {
        console.log('간호연구 프로젝트 로드 완료');
        
        if (typeof questions !== 'undefined' && Array.isArray(questions)) {
            console.log('총 문항 수:', questions.length);
        } else {
            console.warn('questions.js 파일이 로딩되지 않았습니다.');
        }
        
        if (typeof practiceQuestions !== 'undefined' && Array.isArray(practiceQuestions)) {
            console.log('연습 문항 로드됨:', practiceQuestions.length);
        } else {
            console.warn('practiceQuestions가 정의되지 않았습니다.');
        }
        
        console.log('Google Forms 설정:', GOOGLE_FORMS_CONFIG);
        
        try {
            await sendToGoogleForms({
                type: 'connection_test',
                message: 'Application loaded successfully',
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Google Forms 연결 테스트 완료');
        } catch (error) {
            console.warn('⚠️ Google Forms 연결 테스트 실패:', error.message);
        }
        
    } catch (error) {
        console.error('초기화 오류:', error);
        alert('애플리케이션 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
    }
});

window.addEventListener('beforeunload', function(e) {
    if (responses.length > 0 && currentScreen !== 'completeScreen') {
        e.preventDefault();
        e.returnValue = '실험이 진행 중입니다. 정말 페이지를 떠나시겠습니까?';
        return e.returnValue;
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (timerInterval && timeLeft > 0) {
            clearInterval(timerInterval);
            console.log('타이머 일시정지');
        }
    } else {
        if (timeLeft > 0 && !timerInterval) {
            startMemoryTimer(timeLeft, () => {
                if (currentScreen === 'memoryScreen' || currentScreen === 'practiceMemoryScreen') {
                    showQuestionPhase();
                }
            });
            console.log('타이머 재시작');
        }
    }
});

window.addEventListener('error', function(e) {
    console.error('전역 오류:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise 오류:', e.reason);
    e.preventDefault();
});

console.log('✅ 간호연구 프로젝트 초기화 완료');
