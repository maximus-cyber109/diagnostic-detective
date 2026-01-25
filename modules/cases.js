// modules/cases.js - Case Management Module

class Cases {
    constructor() {
        this.cases = [];
        this.defineCases(); // Load the 17 unique cases
        this.generateAdvancedCases(300); // Generate 300 text-based cases
    }

    loadCases() {
        console.log(`✅ Loaded ${this.cases.length} unique cases`);
    }

    defineCases() {
        // 17 Unique Cases based on provided assets
        // Correct answers randomized (A, B, C, D)
        this.cases = [
            {
                id: 'c1',
                caseCode: 'CASE001',
                title: 'Acute Apical Abscess',
                difficulty: 'beginner',
                patientName: 'John Doe',
                patientAge: 34,
                patientGender: 'Male',
                vitals: { bp: '128/82', diabetes: 'No', allergies: 'Penicillin' },
                chiefComplaint: 'Severe spontaneous throbbing pain and swelling on the lower right.',
                medicalHistory: 'No significant history. Patient denies recent trauma.',
                clinicalFindings: ['Facial swelling localized to right mandible', 'Tenderness to palpation at apical area', 'Grade 3 mobility on #46'],
                radiographicFindings: ['Large diffuse radiolucency at apex of #46', 'Widened PDL space', 'Loss of lamina dura'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/abscess.png',
                question: 'What is the most likely diagnosis?',
                option_a: 'Chronic Periodontitis',
                option_b: 'Acute Apical Abscess',
                option_c: 'Reversible Pulpitis',
                option_d: 'Cementoma',
                correctAnswer: 'B',
                explanation: 'Severe throbbing pain, visible swelling, and periapical radiolucency are classic signs of an acute abscess.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c2',
                caseCode: 'CASE002',
                title: 'Amalgam Overhang',
                difficulty: 'intermediate',
                patientName: 'Sarah Smith',
                patientAge: 42,
                patientGender: 'Female',
                vitals: { bp: '118/76', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'Food gets stuck between my back teeth and causes irritation.',
                medicalHistory: 'Hypertension controlled with medication.',
                clinicalFindings: ['Gingival inflammation between #46 and #47', 'Shredding of floss', 'Bleeding on probing'],
                radiographicFindings: ['Radio-opaque projection extending from distal box of #46', 'Localised bone loss'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/amalgam_overhang.png',
                question: 'Identify the iatrogenic factor contributing to the periodontal issue.',
                option_a: 'Recurrent Caries',
                option_b: 'Furcation Involvement',
                option_c: 'Amalgam Overhang',
                option_d: 'Vertical Root Fracture',
                correctAnswer: 'C',
                explanation: 'The radiograph clearly shows an amalgam overhang on the distal margin, acting as a plaque trap.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c3',
                caseCode: 'CASE003',
                title: 'Interproximal Caries',
                difficulty: 'beginner',
                patientName: 'Mike Johnson',
                patientAge: 19,
                patientGender: 'Male',
                vitals: { bp: '120/80', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'Brief sensitivity to sugary foods and cold drinks.',
                medicalHistory: 'None. High sugar intake reported.',
                clinicalFindings: ['No visible cavitation occlusally', 'Chalky enamel on marginal ridges'],
                radiographicFindings: ['Radiolucent triangle in enamel extending to DEJ on mesial of #36'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/caries_interproximal.png',
                question: 'What is the diagnosis based on the radiograph?',
                option_a: 'Proximal Caries',
                option_b: 'Amalgam Tattoo',
                option_c: 'Internal Resorption',
                option_d: 'Calculus',
                correctAnswer: 'A',
                explanation: 'Classic triangular radiolucency at the contact point indicating demineralization typical of proximal caries.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c4',
                caseCode: 'CASE004',
                title: 'Mixed Dentition Checkup',
                difficulty: 'beginner',
                patientName: 'Emily Rose',
                patientAge: 9,
                patientGender: 'Female',
                vitals: { bp: '100/60', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'Routine checkup. Mother concerned about loose teeth.',
                medicalHistory: 'None',
                clinicalFindings: ['Mixed dentition stage', 'Mobile primary mandibular molars'],
                radiographicFindings: ['Developing permanent successors beneath primary roots', 'Active physiological resorption'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/case001_primary.jpg',
                question: 'Assessment of dental development:',
                option_a: 'Delayed Eruption',
                option_b: 'Ectopic Eruption',
                option_c: 'Congenitally Missing Teeth',
                option_d: 'Normal Development',
                correctAnswer: 'D',
                explanation: 'Radiographic appearance shows normal root resorption and successor development consistent with a 9-year-old.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c5',
                caseCode: 'CASE005',
                title: 'Condensing Osteitis',
                difficulty: 'intermediate',
                patientName: 'Robert Brown',
                patientAge: 30,
                patientGender: 'Male',
                vitals: { bp: '130/85', diabetes: 'No', allergies: 'Codeine' },
                chiefComplaint: 'Mild dull ache occasionally in the lower left jaw.',
                medicalHistory: 'None',
                clinicalFindings: ['Large restoration on #36', 'Tooth is non-vital to thermal testing'],
                radiographicFindings: ['Diffuse radiopacity at apex of #36 blending with normal bone'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/condensing_osteitis.png',
                question: 'What is the radiopaque lesion at the apex?',
                option_a: 'Cementoblastoma',
                option_b: 'Condensing Osteitis',
                option_c: 'Osteosclerosis',
                option_d: 'Hypercementosis',
                correctAnswer: 'B',
                explanation: 'Condensing osteitis is a bony reaction to low-grade infection, common at the apex of non-vital teeth.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c6',
                caseCode: 'CASE006',
                title: 'Cracked Tooth',
                difficulty: 'advanced',
                patientName: 'Jennifer Wu',
                patientAge: 50,
                patientGender: 'Female',
                vitals: { bp: '122/78', diabetes: 'No', allergies: 'Latex' },
                chiefComplaint: 'Sharp, electric-shock pain when I bite on certain foods.',
                medicalHistory: 'None',
                clinicalFindings: ['Visible hairline fracture on marginal ridge', 'Positive bite test on #16'],
                radiographicFindings: ['Radiograph inconclusive', 'No apical pathology visible yet'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/crack.png',
                question: 'Which clinical test is pathognomonic for this condition?',
                option_a: 'EPT',
                option_b: 'Percussion',
                option_c: 'Bite Test (Tooth Slooth)',
                option_d: 'Palpation',
                correctAnswer: 'C',
                explanation: 'Sharp pain specifically on the release of biting pressure is the hallmark of a cracked tooth.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c7',
                caseCode: 'CASE007',
                title: 'Radicular Cyst',
                difficulty: 'advanced',
                patientName: 'Alan Grant',
                patientAge: 45,
                patientGender: 'Male',
                vitals: { bp: '135/88', diabetes: 'Type 2', allergies: 'None' },
                chiefComplaint: 'Noticed a painless bump on my gum above the front tooth.',
                medicalHistory: 'Controlled Diabetes',
                clinicalFindings: ['Non-vital central incisor', 'Slight bony expansion', 'Negative aspiration'],
                radiographicFindings: ['Well-defined unilocular radiolucency with corticated border'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/endo_cyst.png',
                question: 'What is the most likely cystic lesion?',
                option_a: 'Dentigerous Cyst',
                option_b: 'OKC',
                option_c: 'Radicular Cyst',
                option_d: 'Lateral Periodontal Cyst',
                correctAnswer: 'C',
                explanation: 'Radicular cysts are inflammatory cysts associated with non-vital teeth, often showing a corticated border.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c8',
                caseCode: 'CASE008',
                title: 'Dental Fluorosis',
                difficulty: 'beginner',
                patientName: 'Lisa Simpson',
                patientAge: 12,
                patientGender: 'Female',
                vitals: { bp: '110/70', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'My teeth have these white spots on them.',
                medicalHistory: 'Lived in an area with high fluoride water levels.',
                clinicalFindings: ['Generalized white mottling', 'Enamel is hard, smooth, and shiny'],
                radiographicFindings: ['Normal enamel density', 'No carious lesions'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/fluorosis_mottled.png',
                question: 'What is the cause of this intrinsic discoloration?',
                option_a: 'Amelogenesis Imperfecta',
                option_b: 'Dental Fluorosis',
                option_c: 'Tetracycline Staining',
                option_d: 'Early Childhood Caries',
                correctAnswer: 'B',
                explanation: 'Generalized mottling caused by excess fluoride intake during tooth development.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c9',
                caseCode: 'CASE009',
                title: 'Plaque Induced Gingivitis',
                difficulty: 'beginner',
                patientName: 'Kevin Hart',
                patientAge: 25,
                patientGender: 'Male',
                vitals: { bp: '120/80', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'My gums bleed whenever I brush or floss.',
                medicalHistory: 'Smoker (5 cigs/day)',
                clinicalFindings: ['Erythematous, edematous gingiva', 'Bleeding on probing', 'No loss of attachment'],
                radiographicFindings: ['No horizontal or vertical bone loss'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/gingivitis_inflamed.png',
                question: 'What is the primary etiology?',
                option_a: 'Vitamin C Deficiency',
                option_b: 'Leukemia',
                option_c: 'Viral Infection',
                option_d: 'Plaque Biofilm',
                correctAnswer: 'D',
                explanation: 'Gingivitis is primarily caused by the accumulation and maturation of plaque biofilm.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c10',
                caseCode: 'CASE010',
                title: 'Impacted Canine',
                difficulty: 'intermediate',
                patientName: 'Tony Stark',
                patientAge: 16,
                patientGender: 'Male',
                vitals: { bp: '118/75', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'My baby tooth never fell out on the top left.',
                medicalHistory: 'None',
                clinicalFindings: ['Retained deciduous canine #63', 'Palpable bulge on palate'],
                radiographicFindings: ['Permanent canine #23 impacted palatally'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/impacted_canine.png',
                question: 'Based on the clinical bulge, where is the impaction?',
                option_a: 'Labial Impaction',
                option_b: 'Transposition',
                option_c: 'Palatal Impaction',
                option_d: 'Ankylosis',
                correctAnswer: 'C',
                explanation: 'A palatal bulge suggests the crown of the impacted canine is located on the palatal aspect.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c11',
                caseCode: 'CASE011',
                title: 'Aphthous Ulcer',
                difficulty: 'beginner',
                patientName: 'Diana Prince',
                patientAge: 28,
                patientGender: 'Female',
                vitals: { bp: '110/65', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'Very painful sore inside my lip started 2 days ago.',
                medicalHistory: 'High stress at work recently.',
                clinicalFindings: ['Single ovoid ulcer with yellow-white fibrinous base', 'Erythematous halo', 'On labial mucosa'],
                radiographicFindings: ['N/A'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/path_ulcer.png',
                question: 'What is the diagnosis?',
                option_a: 'Herpes Simplex',
                option_b: 'Traumatic Ulcer',
                option_c: 'Recurrent Aphthous Ulcer',
                option_d: 'Squamous Cell Carcinoma',
                correctAnswer: 'C',
                explanation: 'The appearance (yellow center, red halo) on non-keratinized mucosa is classic for an aphthous ulcer (canker sore).',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c12',
                caseCode: 'CASE012',
                title: 'Heavy Calculus',
                difficulty: 'beginner',
                patientName: 'Bruce Wayne',
                patientAge: 40,
                patientGender: 'Male',
                vitals: { bp: '130/80', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'I have not seen a dentist in 10 years. I have bad breath.',
                medicalHistory: 'None',
                clinicalFindings: ['Heavy supragingival calculus bridges', 'Generalized gingivitis'],
                radiographicFindings: ['Horizontal bone loss visible in posterior sextants'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/perio_calculus.png',
                question: 'What is the hardened deposit visible in the image?',
                option_a: 'Calculus',
                option_b: 'Materia Alba',
                option_c: 'Plaque',
                option_d: 'Hyperplasia',
                correctAnswer: 'A',
                explanation: 'Hardened, mineralized plaque deposits are known as Calculus (Tartar).',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c13',
                caseCode: 'CASE013',
                title: 'Chronic Periodontitis',
                difficulty: 'intermediate',
                patientName: 'Clark Kent',
                patientAge: 55,
                patientGender: 'Male',
                vitals: { bp: '135/90', diabetes: 'Type 2', allergies: 'None' },
                chiefComplaint: 'My teeth feel lose and my gums are receding.',
                medicalHistory: 'Type 2 Diabetes (HbA1c 7.5%)',
                clinicalFindings: ['Generalized pocket depths >5mm', 'Class 2 mobility on molars', 'Suppuration'],
                radiographicFindings: ['Generalized horizontal bone loss > 30%', 'Furcation involvement'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/perio.png',
                question: 'What is the diagnosis?',
                option_a: 'Aggressive Periodontitis',
                option_b: 'Gingivitis',
                option_c: 'Generalized Chronic Periodontitis',
                option_d: 'Pericoronitis',
                correctAnswer: 'C',
                explanation: 'Significant bone loss, pocketing, and mobility in an older patient with diabetes suggests Chronic Periodontitis.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c14',
                caseCode: 'CASE014',
                title: 'Irreversible Pulpitis',
                difficulty: 'intermediate',
                patientName: 'Peter Parker',
                patientAge: 22,
                patientGender: 'Male',
                vitals: { bp: '115/75', diabetes: 'No', allergies: 'Spider bites' },
                chiefComplaint: 'Excruciating pain keeps me up at night. Cold water makes it worse for minutes.',
                medicalHistory: 'None',
                clinicalFindings: ['Large occlusal caries on #36', 'Lingering response to cold (>30s)'],
                radiographicFindings: ['Deep radiolucency approaching the pulp horn'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/pulpitis.png',
                question: 'What is the pulpal diagnosis?',
                option_a: 'Reversible Pulpitis',
                option_b: 'Necrotic Pulp',
                option_c: 'Normal Pulp',
                option_d: 'Irreversible Pulpitis',
                correctAnswer: 'D',
                explanation: 'Lingering pain after stimulus and spontaneous night pain are pathognomonic for Irreversible Pulpitis.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c15',
                caseCode: 'CASE015',
                title: 'Root Resorption',
                difficulty: 'advanced',
                patientName: 'Wade Wilson',
                patientAge: 35,
                patientGender: 'Male',
                vitals: { bp: '120/80', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'My front tooth looks pinkish.',
                medicalHistory: 'History of trauma 5 years ago.',
                clinicalFindings: ['Pink spot visible through crown enamel', 'Tooth is vital'],
                radiographicFindings: ['Oval ballooning radiolucency within the pulp chamber'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/root_resorption.png',
                question: 'What is the resorptive process shown?',
                option_a: 'External Resorption',
                option_b: 'Internal Resorption',
                option_c: 'Caries',
                option_d: 'Calcific Metamorphosis',
                correctAnswer: 'B',
                explanation: 'A ballooning radiolucency centered on the pulp canal indicates Internal Resorption.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c16',
                caseCode: 'CASE016',
                title: 'Coronal Fracture',
                difficulty: 'intermediate',
                patientName: 'Steve Rogers',
                patientAge: 27,
                patientGender: 'Male',
                vitals: { bp: '110/70', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'Broke my front tooth during a fall.',
                medicalHistory: 'None',
                clinicalFindings: ['Fracture involving enamel and dentin', 'No pinpoint exposure', 'Non-tender'],
                radiographicFindings: ['Loss of coronal tooth structure', 'Root integrity intact'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/trauma_fracture.png',
                question: 'Classify this fracture (Ellis Class).',
                option_a: 'Ellis Class I',
                option_b: 'Ellis Class III',
                option_c: 'Ellis Class II',
                option_d: 'Le Fort I',
                correctAnswer: 'C',
                explanation: 'Ellis Class II involves enamel and dentin but not the pulp.',
                pointsValue: 100,
                timeLimit: 120
            },
            {
                id: 'c17',
                caseCode: 'CASE017',
                title: 'Pericoronitis',
                difficulty: 'beginner',
                patientName: 'Natasha Romanoff',
                patientAge: 24,
                patientGender: 'Female',
                vitals: { bp: '115/72', diabetes: 'No', allergies: 'None' },
                chiefComplaint: 'My wisdom tooth area hurts and I cannot open my mouth fully.',
                medicalHistory: 'None',
                clinicalFindings: ['Inflamed operculum over #38', 'Trismus (limited opening)', 'Purulent discharge'],
                radiographicFindings: ['Vertically impacted #38'],
                primaryImageUrl: 'https://bwuercsdytqsvjgpntjn.supabase.co/storage/v1/object/public/Whistle/wisdom.png',
                question: 'What is the diagnosis?',
                option_a: 'Pericoronitis',
                option_b: 'Periodontitis',
                option_c: 'Pulpitis',
                option_d: 'Tonsillitis',
                correctAnswer: 'A',
                explanation: 'Inflammation of the soft tissue (operculum) around a partially erupted tooth is Pericoronitis.',
                pointsValue: 100,
                timeLimit: 120
            }
        ];
    }

    generateAdvancedCases(count) {
        const difficulty = 'advanced';

        // Data Pools
        const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        const diagnoses = [
            {
                condition: 'Trigeminal Neuralgia',
                templates: [
                    "Patient describes sharp, electric-shock like pain on the right side of the face triggered by light touch or washing.",
                    "Complains of paroxysmal 'lightning' stabs in the maxillary region, lasting seconds.",
                    "Reports intense, brief episodes of unilateral facial pain provoked by shaving or brushing teeth.",
                    "Experiencing rapid, excruciating pain attacks along the mandible, leaving them afraid to eat."
                ],
                clinical: 'No dental pathology. Trigger zone identified on nasolabial fold.',
                options: ['Acute Pulpitis', 'Trigeminal Neuralgia', 'TMD', 'Sinusitis'],
                correct: 'B',
                explanation: 'Brief, electric-shock pain triggered by light touch (trigger zones) is pathognomonic for Trigeminal Neuralgia.',
                chiefComplaintPref: "The pain is unbearable, like a shock, but only lasts a moment."
            },
            {
                condition: 'Dry Socket (Alveolar Osteitis)',
                templates: [
                    "Patient returns 3 days post-extraction complaining of severe throbbing pain radiating to the ear.",
                    "Reports foul taste and intense pain starting 48 hours after having a lower molar pulled.",
                    "Severe pain following recent extraction. Site appears empty with exposed bone."
                ],
                clinical: 'Extraction socket #38 is empty, losing the clot. Halitosis present.',
                options: ['Infected Socket', 'Dry Socket', 'Retained Root', 'Osteomyelitis'],
                correct: 'B',
                explanation: 'Onset of severe throbbing pain 2-3 days post-op with loss of clot matches Dry Socket.',
                chiefComplaintPref: "It hurts more now than when you pulled the tooth!"
            },
            {
                condition: 'Sjogren\'s Syndrome',
                templates: [
                    "Complains of persistent dry mouth, difficulty swallowing dry food, and dry gritty eyes.",
                    "Reports needing to drink water constantly to talk. Tongue feels sticky and dry.",
                    "History of rheumatoid arthritis. Now complaining of burning tongue and rampant cervical caries."
                ],
                clinical: 'Mucosa is dry/parched. Mirror sticks to buccal mucosa. Salivary pooling absent.',
                options: ['Diabetes Mellitus', 'Sjogren\'s Syndrome', 'Candidiasis', 'Medication Side Effect'],
                correct: 'B',
                explanation: 'The triad of dry eyes (keratoconjunctivitis sicca), dry mouth (xerostomia), and autoimmune history suggests Sjogren\'s.',
                chiefComplaintPref: "My mouth is so dry I can barely swallow a cracker."
            },
            {
                condition: 'Oral Pemphigus Vulgaris',
                templates: [
                    "Patient presents with multiple painful oral blisters that rupture easily, leaving raw erosions.",
                    "Reports skin blisters and widespread painful ulcers in the mouth. Positive Nikolsky sign.",
                    "Complains of desquamative gingivitis and large, irregular ulcers effectively preventing eating."
                ],
                clinical: 'Large, irregular erosions. Slight rubbing of normal mucosa causes blistering (Nikolsky+).',
                options: ['Lichen Planus', 'Pemphigus Vulgaris', 'Herpes Simplex', 'Erythema Multiforme'],
                correct: 'B',
                explanation: 'Acantholysis resulting in intraepithelial blistering and a positive Nikolsky sign is characteristic of Pemphigus Vulgaris.',
                chiefComplaintPref: "The skin inside my mouth is just peeling off."
            },
            {
                condition: 'Ludwig\'s Angina',
                templates: [
                    "Emergency: Patient has bilateral submandibular swelling, elevated tongue, and difficulty breathing.",
                    "Rapidly spreading firm swelling of the floor of mouth. Patient is drooling and struggling to speak (hot potato voice).",
                    "Massive indurated swelling of the neck following a lower molar infection. Airways at risk."
                ],
                clinical: 'Bilateral, board-like firmness of submandibular/sublingual spaces. Tongue elevated.',
                options: ['Peritonsillar Abscess', 'Ludwig\'s Angina', 'Cellulitis', 'Parotitis'],
                correct: 'B',
                explanation: 'Bilateral involvement of submandibular/sublingual/submental spaces with airway threat defines Ludwig\'s Angina.',
                chiefComplaintPref: "I can't breathe... my tongue feels huge."
            },
            {
                condition: 'Osteomyelitis',
                templates: [
                    "Patient reports deep, boring pain in the jaw and numbness of the lip (Vincent's sign) for 2 weeks.",
                    "History of broken jaw treated poorly. Now has draining sinuses and moth-eaten bone appearance on X-ray.",
                    "Persistent dull ache, fever, and loose teeth in the area of a past extraction."
                ],
                clinical: 'Pustular drainage, mobile sequestrum of bone possible. Paresthesia of V3.',
                options: ['Osteosarcoma', 'Osteomyelitis', 'Fibrous Dysplasia', 'Paget\'s Disease'],
                correct: 'B',
                explanation: 'Deep pain, fever, sequestrum formation, and "moth-eaten" radiolucency indicates Osteomyelitis.',
                chiefComplaintPref: "My jaw feels dead and numb, and there is pus coming out."
            },
            {
                condition: 'Ameloblastoma',
                templates: [
                    "Routine X-ray reveals a large, multilocular 'soap-bubble' radiolucency in the posterior mandible.",
                    "Painless, slow-growing expansion of the jaw. Radiograph shows honeycomb pattern.",
                    "Noticed jaw getting bigger on one side over years. No pain. Teeth are shifting."
                ],
                clinical: 'Hard bony expansion of mandible. Crepitus (egg-shell cracking) on palpation.',
                options: ['Odontogenic Keratocyst', 'Ameloblastoma', 'Radicular Cyst', 'Central Giant Cell Granuloma'],
                correct: 'B',
                explanation: 'The classic "soap-bubble" or "honeycomb" multilocular radiolucency in the posterior mandible is highly suggestive of Ameloblastoma.',
                chiefComplaintPref: "My jaw looks swollen but it doesn't hurt at all."
            },
            {
                condition: 'Dentinogenesis Imperfecta',
                templates: [
                    "Patient concerned that teeth look blue-gray and translucent. Enamel chips off easily.",
                    "Both primary and permanent teeth have an opalescent amber color. Early extensive attrition.",
                    "Radiographs show bulbous crowns and obliterated pulp chambers (cervical constriction)."
                ],
                clinical: ' teeth have an opalescent/gray hue. Attrition is severe.',
                options: ['Amelogenesis Imperfecta', 'Dentinogenesis Imperfecta', 'Tetracycline Staining', 'Fluorosis'],
                correct: 'B',
                explanation: 'Opalescent teeth, bulbous crowns, and obliterated pulps are the hallmark of Dentinogenesis Imperfecta.',
                chiefComplaintPref: "My teeth are crumbling and they look weirdly grey."
            },
            {
                condition: 'Erythema Multiforme',
                templates: [
                    "Young adult presents with rapid onset of extensive oral ulcers and crusting, bloody lips.",
                    "Reports 'target' or 'bulls-eye' lesions on hands and feet accompanying oral sores.",
                    "Sudden outbreak of oral ulcers and blood-crusted lips following intake of new antibiotic."
                ],
                clinical: 'Crusted, hemorrhagic lips. & Target lesions on skin.',
                options: ['Herpes Zoster', 'Erythema Multiforme', 'Pemphigoid', 'Syphilis'],
                correct: 'B',
                explanation: 'Hemorrhagic crusting of lips and cutaneous "target" lesions are classic signs of Erythema Multiforme.',
                chiefComplaintPref: "My lips are bleeding and I have these target spots on my hands."
            },
            {
                condition: 'Burning Mouth Syndrome',
                templates: [
                    "Post-menopausal female complains of scalding sensation on tongue. Tip of tongue looks normal.",
                    "Constant burning pain 'like hot coffee' on tongue and palate, worsening through the day.",
                    "Reports taste alterations (metallic) and burning, but no clinical signs of inflammation."
                ],
                clinical: 'Oral mucosa appears completely normal despite severe symptom description.',
                options: ['Candidiasis', 'Burning Mouth Syndrome', 'Geographic Tongue', 'Lichen Planus'],
                correct: 'B',
                explanation: 'Chronic burning pain in the absence of clinical or laboratory findings suggests Burning Mouth Syndrome.',
                chiefComplaintPref: "My tongue feels like I burned it with soup, all day long."
            }
        ];

        // Generator Loop
        for (let i = 0; i < count; i++) {
            const template = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const narrative = template.templates[Math.floor(Math.random() * template.templates.length)];
            const gender = Math.random() > 0.5 ? 'Male' : 'Female';
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];

            const sys = 110 + Math.floor(Math.random() * 30);
            const dia = 70 + Math.floor(Math.random() * 20);

            // Randomize Options Order
            const shuffledOptions = [...template.options]; // Copy
            // Ensure correct answer is tracked. We know the correct string from template.correct (e.g., 'B').
            // But we need to assign it dynamically.
            // Let's simple-shuffle:
            // 1. Get the actual correct text string
            const correctText = template.options[['A', 'B', 'C', 'D'].indexOf(template.correct)];

            // 2. Shuffle array
            shuffledOptions.sort(() => Math.random() - 0.5);

            // 3. Find new index of correct answer
            const newCorrectIndex = shuffledOptions.indexOf(correctText);
            const newCorrectLetter = ['A', 'B', 'C', 'D'][newCorrectIndex];

            const newCase = {
                id: `gen_${i + 1}`,
                caseCode: `ADV${(i + 1).toString().padStart(3, '0')}`,
                title: 'Medical Mystery #' + (i + 1), // Obscure title
                difficulty: 'advanced',
                patientName: `${fname} ${lname}`,
                patientAge: 20 + Math.floor(Math.random() * 50),
                patientGender: gender,
                vitals: { bp: `${sys}/${dia}`, diabetes: Math.random() > 0.8 ? 'Yes' : 'No', allergies: Math.random() > 0.8 ? 'Sulfa' : 'None' },
                chiefComplaint: `${narrative} Patient states: "${template.chiefComplaintPref || "It hurts."}"`,
                medicalHistory: "See detailed complaint.", // Redundant but kept for structure
                clinicalFindings: [template.clinical, `BP: ${sys}/${dia}`],
                radiographicFindings: ['See description above.'], // No image
                primaryImageUrl: null,
                question: 'Based on the findings, what is the most likely diagnosis?',
                option_a: shuffledOptions[0],
                option_b: shuffledOptions[1],
                option_c: shuffledOptions[2],
                option_d: shuffledOptions[3],
                correctAnswer: newCorrectLetter,
                explanation: template.explanation,
                pointsValue: 150, // Higher points for advanced
                timeLimit: 120
            };

            this.cases.push(newCase);
        }

        console.log(`✨ Generated ${count} advanced cases.`);
    }

    getRandomCase(excludeCodes = []) {
        // Filter out cases that have been played
        const availableCases = this.cases.filter(c => !excludeCodes.includes(c.caseCode));

        if (availableCases.length === 0) {
            console.warn('All cases played! Resetting pool.');
            const randomIndex = Math.floor(Math.random() * this.cases.length);
            return this.cases[randomIndex];
        }

        const randomIndex = Math.floor(Math.random() * availableCases.length);
        return availableCases[randomIndex];
    }

    getCaseById(id) {
        return this.cases.find(c => c.id === id);
    }

    getCaseByCode(code) {
        return this.cases.find(c => c.caseCode === code);
    }
}

// Create global instance
window.cases = new Cases();
