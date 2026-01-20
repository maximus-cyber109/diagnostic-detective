// Case Generator Module
// Procedurally generates 100 unique cases based on patterns

const BASE_SCENARIOS = [
    {
        diagnosis: 'Irreversible Pulpitis',
        difficulty: 'intermediate',
        symptoms: ['Spontaneous pain', 'Lingering thermal sensitivity', 'Night pain'],
        findings: ['Deep caries', 'Tenderness to percussion'],
        imageType: 'pulpitis.png',
        correctOption: 'Irreversible Pulpitis',
        distractors: ['Reversible Pulpitis', 'Necrotic Pulp', 'Normal Pulp']
    },
    {
        diagnosis: 'Periapical Abscess',
        difficulty: 'beginner',
        symptoms: ['Swelling', 'Severe pain on biting', 'Fever'],
        findings: ['Periapical radiolucency', 'Sinus tract'],
        imageType: 'abscess.png',
        correctOption: 'Acute Apical Abscess',
        distractors: ['Chronic Apical Abscess', 'Phoenix Abscess', 'Cellulitis']
    },
    {
        diagnosis: 'Periodontitis',
        difficulty: 'intermediate',
        symptoms: ['Bleeding gums', 'Loose teeth', 'Bad breath'],
        findings: ['Bone loss', 'Calculus', 'Pocket depth > 5mm'],
        imageType: 'perio.png',
        correctOption: 'Chronic Periodontitis',
        distractors: ['Gingivitis', 'Aggressive Periodontitis', 'Periodontal Abscess']
    },
    {
        diagnosis: 'Pericoronitis',
        difficulty: 'beginner',
        symptoms: ['Pain in back of jaw', 'Difficulty opening mouth', 'Swollen flap'],
        findings: ['Partially impacted 3rd molar', 'Inflamed operculum'],
        imageType: 'wisdom.png',
        correctOption: 'Pericoronitis',
        distractors: ['Pulpitis', 'TMJ Disorder', 'Dry Socket']
    },
    {
        diagnosis: 'Cracked Tooth',
        difficulty: 'advanced',
        symptoms: ['Sharp pain on chewing', 'Sensitivity to cold'],
        findings: ['Fracture line visible', 'Positive bite test'],
        imageType: 'crack.png',
        correctOption: 'Cracked Tooth Syndrome',
        distractors: ['Reversible Pulpitis', 'Occlusal Trauma', 'Sinusitis']
    }
];

const TEETH = [16, 17, 26, 27, 36, 37, 46, 47, 11, 21];
const AGES = [22, 28, 35, 42, 55, 61, 19, 45];
const NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

export const generateCases = () => {
    const cases = [];

    for (let i = 1; i <= 100; i++) {
        const scenario = BASE_SCENARIOS[Math.floor(Math.random() * BASE_SCENARIOS.length)];
        const tooth = TEETH[Math.floor(Math.random() * TEETH.length)];
        const age = AGES[Math.floor(Math.random() * AGES.length)];
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];

        // Random Vitals
        const bpSys = 110 + Math.floor(Math.random() * 30);
        const bpDia = 70 + Math.floor(Math.random() * 15);
        const isDiabetic = Math.random() < 0.2; // 20% chance
        const allergies = Math.random() < 0.1 ? "Penicillin" : "None";

        // Randomize Options
        const options = [...scenario.distractors, scenario.correctOption]
            .sort(() => Math.random() - 0.5);

        const optionMap = {
            A: options[0],
            B: options[1],
            C: options[2],
            D: options[3]
        };

        const correctAnswerKey = Object.keys(optionMap).find(key => optionMap[key] === scenario.correctOption);

        cases.push({
            id: `c${i}`,
            caseCode: `CASE${i.toString().padStart(3, '0')}`,
            caseNumber: i,
            title: `${scenario.diagnosis} - Tooth #${tooth}`,
            difficulty: scenario.difficulty,

            // Patient Info
            patientName: name,
            patientAge: age,
            patientGender: Math.random() > 0.5 ? 'Male' : 'Female',
            vitals: {
                bp: `${bpSys}/${bpDia}`,
                diabetes: isDiabetic ? "Yes (Type 2)" : "No",
                allergies: allergies
            },

            chiefComplaint: `Patient complains of ${scenario.symptoms[0].toLowerCase()} in area of tooth #${tooth}.`,
            medicalHistory: isDiabetic ? "Controlled Diabetes" : "No significant history",

            clinicalFindings: [...scenario.findings, `Tooth #${tooth} tests positive`],
            radiographicFindings: [`Changes consistent with ${scenario.diagnosis.toLowerCase()}`],

            // Image
            primaryImageUrl: `assets/images/cases/${scenario.imageType}`,

            question: "What is the most likely diagnosis?",
            optionA: optionMap.A,
            optionB: optionMap.B,
            optionC: optionMap.C,
            optionD: optionMap.D,
            correctAnswer: correctAnswerKey,

            explanation: `The presence of ${scenario.findings[0]} and ${scenario.symptoms[0]} strongly suggests ${scenario.diagnosis}.`,
            pointsValue: 100,
            timeLimit: 120
        });
    }

    return cases;
};
