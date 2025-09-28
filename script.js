// 현재 script.js의 연습문제 관련 함수들을 이것으로 교체하세요

let currentPracticeQuestion = null;

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
