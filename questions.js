const questions = [
    {
        id: 1,
        type: 'multiple_choice',
        category: 'right_drug',
        time_limit: 9,
        prescription: {
            diagnosis: 'Pneumonia',
            order: 'Tazime 1g tid IV at 0800'
        },
        question: '다음 중 올바른 처방오더는?',
        options: [
            'Tazime 1g bid IV at 0800',
            'Tazocin 1g tid IV at 0800',
            'Tazime 2g tid PO at 0800',
            'Taxime 1g bid PO at 0800'
        ],
        correct: 1
    },
    {
        id: 2,
        type: 'multiple_choice',
        category: 'right_drug',
        time_limit: 5,
        prescription: {
            diagnosis: 'Pain',
            order: 'Norphin 10mg qid IM'
        },
        question: '다음 중 올바른 약물명은?',
        options: [
            'Morphine',
            'Norphine',
            'Nalbuphine',
            'Melphalan'
        ],
        correct: 0
    },
    {
        id: 3,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 12,
        prescription: {
            diagnosis: 'Thrombosis prevention',
            order: 'Heparin 10 Units bid IV'
        },
        alert: '출혈 위험 모니터링',
        question: 'Heparin 용량을 확인하세요. 올바른 용량은?',
        options: [
            '10 Units',
            '100 Units',
            '1 Unit',
            '1000 Units'
        ],
        correct: 3
    },
    {
        id: 4,
        type: 'multiple_choice',
        category: 'right_drug',
        time_limit: 5,
        prescription: {
            diagnosis: 'dehydration',
            order: 'Normal Saline 500mL IV stat'
        },
        alert: '이 환자는 KCl 알레르기가 있습니다',
        question: '올바른 약물은?',
        options: [
            'KCl 500mL',
            'Normal Saline 500mL',
            'D5W 500mL',
            'LR 500mL'
        ],
        correct: 1
    },
    {
        id: 5,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 12,
        prescription: {
            diagnosis: 'HBP',
            order: 'Propranolo 120mg bid PO'
        },
        question: '다음 중 올바른 약물명과 용량은?',
        options: [
            'Propranolo 120mg',
            'Propranolol 20mg',
            'Propranolol 120mg',
            'Propranolo 20mg'
        ],
        correct: 2
    },
    {
        id: 6,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'Diabetes mellitus',
            order: 'Insulin Regular 10 Units tid IV at 0600'
        },
        alert: '저혈당 위험 모니터링',
        question: '올바른 용량은?',
        options: [
            '100 Units',
            '1 Unit',
            '10 Units',
            '1000 Units'
        ],
        correct: 2
    },
    {
        id: 7,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'Epilepsy',
            order: 'Tegreto 1300mg bid PO'
        },
        question: '올바른 약물명과 용량은?',
        options: [
            'Tegreto 1300mg',
            'Tegretol 300mg',
            'Tegretol 1300mg',
            'Tegreto 300mg'
        ],
        correct: 1
    },
    {
        id: 8,
        type: 'multiple_choice',
        category: 'right_route',
        time_limit: 12,
        prescription: {
            diagnosis: 'Angina pectoris',
            order: 'Nitroglycerin 0.4mg SL stat'
        },
        alert: '혈압 강하 주의',
        question: '이 약물의 올바른 투여 경로는?',
        options: [
            'SL',
            'IV',
            'IM',
            'SUP'
        ],
        correct: 0
    },
    {
        id: 9,
        type: 'multiple_choice',
        category: 'right_route',
        time_limit: 9,
        prescription: {
            diagnosis: 'Anxiety',
            order: 'Ativan 2mg tid IM'
        },
        question: '올바른 투여 경로는?',
        options: [
            'IM',
            'PO',
            'IV',
            'SL'
        ],
        correct: 0
    },
    {
        id: 10,
        type: 'multiple_choice',
        category: 'right_route',
        time_limit: 5,
        prescription: {
            diagnosis: 'Schizophrenia',
            order: 'Haloperidol 5mg bid IM at 1400'
        },
        question: '올바른 투여 경로는?',
        options: [
            'IV',
            'PO',
            'IM',
            'SL'
        ],
        correct: 2
    },
    {
        id: 11,
        type: 'multiple_choice',
        category: 'right_time',
        time_limit: 12,
        prescription: {
            patient: '정수민 (28세, 남)',
            diagnosis: 'Headache',
            order: 'Tylenol 500mg q6hr PO'
        },
        alert: '간기능 저하 환자',
        question: '현재 시간이 오후 2:30이고, 마지막 투약이 오전 10:30이었습니다. 다음 투약 시간은?',
        options: [
            '오후 6:30',
            '오후 4:30',
            '오후 8:30',
            '오후 2:30'
        ],
        correct: 1
    },
    {
        id: 12,
        type: 'multiple_choice',
        category: 'right_drug',
        time_limit: 9,
        prescription: {
            diagnosis: 'Sepsis',
            order: 'Tazime 2g bid IV'
        },
        question: '올바른 약물명은?',
        options: [
            'Tazime',
            'Tazocin',
            'Taxime',
            'Tazime'
        ],
        correct: 1
    },
    {
        id: 13,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'MI prevention',
            order: 'Aspirin 3250mg PO at 0900'
        },
        question: '올바른 aspirin 용량은?',
        options: [
            '3250mg',
            '325mg',
            '32.5mg',
            '3.25mg'
        ],
        correct: 1
    },
    {
        id: 14,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 12,
        prescription: {
            diagnosis: 'Heart failure',
            order: 'Lasix 400mg bid IV'
        },
        alert: '전해질 불균형 주의',
        question: '올바른 Lasix 용량은?',
        options: [
            '400mg',
            '40mg',
            '4mg',
            '4000mg'
        ],
        correct: 1
    },
    {
        id: 15,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'Atrial fibrillation',
            order: 'Digoxin 0.25mg PO stat'
        },
        question: '올바른 용량은?',
        options: [
            '2.5mg',
            '0.025mg',
            '0.25mg',
            '25mg'
        ],
        correct: 2
    },
    {
        id: 16,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'Infection',
            order: 'Vancomycin 1g tid IV at 0800'
        },
        alert: '신기능 모니터링 필요',
        question: '올바른 용량은?',
        options: [
            '1g',
            '10g',
            '100mg',
            '10mg'
        ],
        correct: 0
    },
    {
        id: 17,
        type: 'multiple_choice',
        category: 'right_time',
        time_limit: 12,
        prescription: {
            diagnosis: 'Diabetes mellitus',
            order: 'Metformin 850mg bid PO'
        },
        question: '현재 시간: 오전 8:00, 투약 간격: q12hr. 다음 투약 시간은?',
        options: [
            '오후 2:00',
            '오후 8:00',
            '오전 10:00',
            '오후 12:00'
        ],
        correct: 1
    },
    {
        id: 18,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'Anxiety',
            order: 'Lorazepam 1mg tid PO'
        },
        alert: '호흡억제 주의',
        question: '올바른 용량은?',
        options: [
            '10mg',
            '0.1mg',
            '1mg',
            '100mg'
        ],
        correct: 2
    },
    {
        id: 19,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'Infection',
            order: 'Cefazolin 2g qid IV'
        },
        question: '올바른 용량은?',
        options: [
            '20g',
            '200mg',
            '2g',
            '20mg'
        ],
        correct: 2
    },
    {
        id: 20,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 12,
        prescription: {
            patient: '김태현 (41세, 남) - 체중 80kg',
            diagnosis: 'Shock',
            order: 'Dopamine 5mcg/kg/min IV at 1200'
        },
        alert: '혈압 및 심박수 모니터링',
        question: '올바른 dopamine 용량은?',
        options: [
            '1.5mcg/kg/min',
            '5mcg/kg/min',
            '5.5mcg/kg/min',
            '15mcg/kg/min'
        ],
        correct: 1
    },
    {
        id: 21,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'Cardiac arrhythmia',
            order: 'Amiodarone 200mg bid PO'
        },
        alert: '갑상선 기능 모니터링',
        question: '올바른 용량은?',
        options: [
            '2000mg',
            '20mg',
            '200mg',
            '2mg'
        ],
        correct: 2
    },
    {
        id: 22,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'Anticoagulation',
            order: 'Warfarin 5mg PO'
        },
        alert: 'INR 수치 확인 필요',
        question: '올바른 용량은?',
        options: [
            '50mg',
            '0.5mg',
            '5mg',
            '0.05mg'
        ],
        correct: 2
    },
    {
        id: 23,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 12,
        prescription: {
            diagnosis: 'Anaphylactic shock',
            order: 'Epinephrine 1mg IM stat'
        },
        alert: '고위험 약물 - 용량 재확인',
        question: '올바른 epinephrine 용량은?',
        options: [
            '0.3mg',
            '0.5mg',
            '1mg',
            '2mg'
        ],
        correct: 0
    },
    {
        id: 24,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'HBP',
            order: 'Metoprolol 50mg bid PO at 1800'
        },
        question: '올바른 용량은?',
        options: [
            '500mg',
            '5mg',
            '50mg',
            '0.5mg'
        ],
        correct: 2
    },
    {
        id: 25,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'edema',
            order: 'Furosemide 20mg PO'
        },
        alert: '칼륨 수치 모니터링',
        question: '올바른 용량은?',
        options: [
            '200mg',
            '2mg',
            '20mg',
            '0.2mg'
        ],
        correct: 2
    },
    {
        id: 26,
        type: 'multiple_choice',
        category: 'right_time',
        time_limit: 12,
        prescription: {
            diagnosis: 'inflammation',
            order: 'Prednisone 10mg qid PO at 0600'
        },
        alert: '혈당 상승 주의',
        question: '현재 시간 오전 6:00, 첫 투약 후 다음 투약 시간은?',
        options: [
            '오전 10:00',
            '오전 12:00',
            '오후 2:00',
            '오후 6:00'
        ],
        correct: 1
    },
    {
        id: 27,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'GERD',
            order: 'Pantoprazole 40mg PO'
        },
        question: '올바른 용량은?',
        options: [
            '400mg',
            '4mg',
            '40mg',
            '0.4mg'
        ],
        correct: 2
    },
    {
        id: 28,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 5,
        prescription: {
            diagnosis: 'UTI (Urinary tract infection)',
            order: 'Ciprofloxacin 500mg bid IV'
        },
        question: '올바른 용량은?',
        options: [
            '5000mg',
            '50mg',
            '500mg',
            '5mg'
        ],
        correct: 2
    },
    {
        id: 29,
        type: 'multiple_choice',
        category: 'right_route',
        time_limit: 12,
        prescription: {
            diagnosis: 'Vomit',
            order: 'Ondansetron 4mg tid IM at 2100'
        },
        alert: '심전도 모니터링 권장',
        question: '이 환자가 PO 투여가 불가능한 상태라면, 적절한 대체 경로는?',
        options: [
            'IM 유지',
            'IV로 변경',
            '투약 중단',
            'SL으로 변경'
        ],
        correct: 1
    },
    {
        id: 30,
        type: 'multiple_choice',
        category: 'right_dose',
        time_limit: 9,
        prescription: {
            diagnosis: 'Fever',
            order: 'Acetaminophen 650mg qid PO stat'
        },
        alert: '간기능 확인 필요',
        question: '올바른 용량은?',
        options: [
            '6500mg',
            '65mg',
            '650mg',
            '6.5mg'
        ],
        correct: 2
    }
];
