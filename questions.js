        const questions = [
            {
                id: 1,
                type: 'multiple_choice',
                category: 'right_drug',
                prescription: {
                    patient: '이영희 (1990.07.22)',
                    diagnosis: 'Pain management',
                    order: 'Acetaminophen 500mg PO q8hr PRN',
                    time: '투약시간: 08:00, 16:00, 24:00',
                    note: '식후 투여 권장'
                },
                alert: '이 환자는 NSAIDs 알레르기가 있습니다.',
                question: '처방된 약물의 이름과 용량은?',
                options: [
                    'Acetaminophen 500mg',
                    'Ibuprofen 500mg', 
                    'Aspirin 500mg',
                    'Acetaminophen 1000mg'
                ],
                correct: 0
            },
            {
                id: 2,
                type: 'subjective',
                category: 'right_patient',
                prescription: {
                    patient: '박민수 (1975.11.03)',
                    diagnosis: 'Diabetes mellitus',
                    order: 'Regular Insulin 10 Units SC AC',
                    time: '투약시간: 07:30, 11:30, 17:30',
                    note: '식사 30분 전 투여'
                },
                alert: '이 환자는 저혈당 위험이 높습니다.',
                question: '이 환자의 이름과 생년월일을 정확히 작성하세요.',
                answer_key: '박민수 (1975.11.03)'
            },
            {
                id: 3,
                type: 'calculation',
                category: 'right_dose',
                prescription: {
                    patient: '최수진 (2010.05.20)',
                    diagnosis: 'Pneumonia',
                    order: 'Amoxicillin 15mg/kg/day PO BID (체중 25kg)',
                    time: '투약시간: 08:00, 20:00',
                    note: '식사와 관계없이 투여 가능'
                },
                alert: '소아 환자입니다. 용량 계산을 정확히 확인하세요.',
                question: '이 환자의 1회 투여량은 얼마입니까? (mg 단위로 답하세요)',
                calculation: '25kg × 15mg/kg/day ÷ 2회 = 187.5mg',
                correct_answer: 187.5
            }
            // 더 많은 문제들이 추가되어야 함
        ];
