const PAUSE = '...';

export const BANGLADESHI_TTS_PROMPT = [
    'Speak like an experienced Bangladeshi software trainer sitting beside a shop owner.',
    'Use natural spoken Bangladeshi Bengali, not literary or Indian Bengali.',
    'Keep the voice warm, calm, patient, confident, and professional.',
    'Every instruction should sound practical and easy to follow.',
    'Use short pauses after each sentence and a slightly longer pause before a new step.',
    'Do not sound like news reading, marketing copy, textbook narration, or an AI assistant.',
    'Pronounce common software words naturally: লগইন, ড্যাশবোর্ড, POS, স্টক, রিপোর্ট, ইনভয়েস, বারকোড, কুরিয়ার, ecommerce.',
    'Avoid unnecessary English words when a common Bangla word exists.',
    'Keep sentence rhythm simple. Do not rush.',
].join(' ');

export const SCRIPT_STANDARD = {
    maxWordsPerSentence: 15,
    preferredWordsPerSentence: 10,
    pauseMarker: PAUSE,
    requiredSections: ['introduction', 'purpose', 'navigation', 'actions', 'mistakes', 'tips', 'summary', 'next'],
    outputFields: ['module', 'estimatedDuration', 'learningGoal', 'narration', 'pauseMarkers', 'screenAction', 'voiceNotes', 'timing', 'summary', 'quiz', 'nextLesson'],
    terminology: {
        login: 'লগইন',
        dashboard: 'ড্যাশবোর্ড',
        sale: 'বিক্রয়',
        purchase: 'ক্রয়',
        stock: 'স্টক',
        customer: 'গ্রাহক',
        supplier: 'সরবরাহকারী',
        print: 'প্রিন্ট',
        barcode: 'বারকোড',
        report: 'রিপোর্ট',
        invoice: 'ইনভয়েস',
        order: 'অর্ডার',
        payment: 'পেমেন্ট',
        settings: 'সেটিংস',
    },
};

const TEMPLATE_DEFAULTS = {
    dashboard: {
        purpose: 'আজকের ব্যবসার অবস্থা দ্রুত বোঝা।',
        commonMistakes: ['তারিখ না মিলিয়ে রিপোর্ট দেখা', 'স্টোর বদলানো হয়েছে কিনা না দেখা'],
        tips: ['দিনের শুরুতে একবার দেখুন', 'দিনশেষে বিক্রয় আর স্টক মিলিয়ে নিন'],
    },
    login: {
        purpose: 'নিরাপদভাবে নিজের অ্যাকাউন্টে ঢোকা।',
        commonMistakes: ['শেয়ার করা কম্পিউটারে remember me চালু রাখা', 'ডেমো অ্যাকাউন্টে আসল দোকানের তথ্য রাখা'],
        tips: ['নিজের দোকানের কাজ নিজের অ্যাকাউন্টে করুন', 'ডেমো শুধু practice-এর জন্য ব্যবহার করুন'],
    },
    sales: {
        purpose: 'দ্রুত ও সঠিকভাবে বিক্রয় সম্পন্ন করা।',
        commonMistakes: ['ভুল quantity দেওয়া', 'পেমেন্ট method না মিলিয়ে বিল করা'],
        tips: ['বিল করার আগে cart একবার দেখুন', 'গ্রাহককে ইনভয়েস দিন'],
    },
    pos: {
        purpose: 'কাউন্টারের দৈনিক বিক্রয় চালানো।',
        commonMistakes: ['বারকোড scan না হলে product search না করা', 'discount ভুল জায়গায় দেওয়া'],
        tips: ['Barcode না পেলে name দিয়ে search করুন', 'Payment নেওয়ার আগে total বলুন'],
    },
    orders: {
        purpose: 'অর্ডার, return, refund, আর status ঠিক রাখা।',
        commonMistakes: ['Return reason না লেখা', 'Stock ফেরত যাবে কিনা না দেখা'],
        tips: ['অর্ডার history দেখে কাজ করুন', 'Refund amount confirm করে নিন'],
    },
    inventory: {
        purpose: 'Product, stock, barcode, category, brand ঠিক রাখা।',
        commonMistakes: ['Cost price খালি রাখা', 'Low stock threshold না দেওয়া'],
        tips: ['Product save করার আগে price মিলান', 'Stock report নিয়মিত দেখুন'],
    },
    purchase: {
        purpose: 'সরবরাহকারী থেকে পণ্য ক্রয় ও receive করা।',
        commonMistakes: ['Supplier invoice number না রাখা', 'Partial receive ভুল দেওয়া'],
        tips: ['Receive করার আগে quantity মিলান', 'Supplier due report review করুন'],
    },
    customers: {
        purpose: 'গ্রাহক, বাকি, follow-up, আর loyalty manage করা।',
        commonMistakes: ['Phone number ভুল রাখা', 'Due payment update না করা'],
        tips: ['Due customer নিয়মিত follow-up করুন', 'Top customer list দেখুন'],
    },
    suppliers: {
        purpose: 'সরবরাহকারী profile, due, purchase history দেখা।',
        commonMistakes: ['Opening balance ভুল দেওয়া', 'Payment terms খালি রাখা'],
        tips: ['নতুন purchase-এর আগে supplier due দেখুন', 'Statement মিলিয়ে payment দিন'],
    },
    reports: {
        purpose: 'Owner decision-এর জন্য data বোঝা।',
        commonMistakes: ['Wrong date range নেওয়া', 'একটা report দেখে final decision নেওয়া'],
        tips: ['Sales, stock, expense একসাথে দেখুন', 'Export করার আগে filter check করুন'],
    },
    expenses: {
        purpose: 'দোকানের খরচ record ও review করা।',
        commonMistakes: ['Expense category ভুল দেওয়া', 'Payment method না দেওয়া'],
        tips: ['প্রতিদিনের খরচ প্রতিদিন লিখুন', 'Profit report-এর আগে expense মিলান'],
    },
    employee: {
        purpose: 'কর্মী, attendance, salary, leave, shift manage করা।',
        commonMistakes: ['Attendance না দিয়ে salary তৈরি করা', 'Leave approval update না করা'],
        tips: ['Salary cycle-এর আগে attendance দেখুন', 'Shift ও holiday আগে plan করুন'],
    },
    settings: {
        purpose: 'দোকানের নিয়ম, payment, invoice, default setup ঠিক করা।',
        commonMistakes: ['Invoice তথ্য update না করা', 'MFS number ভুল রাখা'],
        tips: ['Live যাওয়ার আগে setting review করুন', 'Payment details owner দিয়ে confirm করান'],
    },
    account: {
        purpose: 'Profile, password, subscription, আর access নিরাপদ রাখা।',
        commonMistakes: ['Weak password ব্যবহার করা', 'পুরোনো staff access রেখে দেওয়া'],
        tips: ['Password নিয়মিত update করুন', 'Staff access প্রয়োজন অনুযায়ী দিন'],
    },
    subscription: {
        purpose: 'Plan, expiry, payment, আর feature access বোঝা।',
        commonMistakes: ['Expired plan ignore করা', 'Payment reference ভুল দেওয়া'],
        tips: ['Renewal date আগে দেখে নিন', 'Feature not in plan হলে package compare করুন'],
    },
    branch: {
        purpose: 'একাধিক শাখার data, stock, আর performance দেখা।',
        commonMistakes: ['Wrong branch selected রাখা', 'Transfer history না দেখা'],
        tips: ['Report দেখার আগে branch check করুন', 'Stock transfer ledger review করুন'],
    },
    product: {
        purpose: 'পণ্যের নাম, দাম, stock, barcode, variant ঠিক রাখা।',
        commonMistakes: ['Selling price আর cost price মিশিয়ে ফেলা', 'Barcode duplicate রাখা'],
        tips: ['Save করার আগে price check করুন', 'Label print করে product-এ লাগান'],
    },
    category: {
        purpose: 'পণ্য group করে report আর filter সহজ করা।',
        commonMistakes: ['সব product এক category-তে রাখা', 'Low stock threshold না দেওয়া'],
        tips: ['Category simple রাখুন', 'Parent category বেশি জটিল করবেন না'],
    },
    brand: {
        purpose: 'Brand অনুযায়ী product filter ও report করা।',
        commonMistakes: ['একই brand দুইভাবে লেখা', 'Brand ছাড়া product রাখা'],
        tips: ['Brand spelling consistent রাখুন', 'Unknown হলে সাধারণ brand ব্যবহার করুন'],
    },
    barcode: {
        purpose: 'Scan করে দ্রুত bill করা।',
        commonMistakes: ['Label print quality কম রাখা', 'Wrong product label লাগানো'],
        tips: ['Print করার পর scan test করুন', 'Label product-এর visible জায়গায় লাগান'],
    },
    returns: {
        purpose: 'Return, refund, আর stock effect ঠিক রাখা।',
        commonMistakes: ['Refund amount না মিলানো', 'Returned stock কোথায় যাবে না দেখা'],
        tips: ['Reason লিখে রাখুন', 'Customer-এর সামনে amount confirm করুন'],
    },
    offline: {
        purpose: 'Internet দুর্বল থাকলেও counter প্রস্তুত রাখা।',
        commonMistakes: ['Sync status না দেখা', 'Offline sale পরে verify না করা'],
        tips: ['Internet ফিরলে sync দেখুন', 'Duplicate order আছে কিনা check করুন'],
    },
};

const ROBOTIC_PATTERNS = [
    /এই\s+lesson-এ\s+আমরা/i,
    /এখন\s+আমরা/i,
    /উপরোক্ত/i,
    /নিম্নলিখিত/i,
    /ব্যবহারকারীগণ/i,
    /সিস্টেমটি/i,
    /সফটওয়্যারটি/i,
];

const UNNECESSARY_ENGLISH = [
    'important',
    'useful',
    'clean',
    'safe',
    'workflow',
    'review',
    'verify',
    'update',
    'save',
    'select',
    'submit',
    'status',
    'history',
    'data',
];

const HARD_PHRASES = [
    'দ্রুততম',
    'ব্যবহারকারীগণ',
    'কার্যসম্পাদন',
    'উপর্যুক্ত',
    'প্রযোজ্যতা',
];

const splitSentences = (text) =>
    String(text || '')
        .replace(/\n+/g, ' ')
        .split(/[।.!?]+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

const countWords = (sentence) => sentence.split(/\s+/).filter(Boolean).length;

const hasBangla = (text) => /[\u0980-\u09FF]/.test(text);

const normalizeTerm = (text) => {
    let output = String(text || '');
    const replacements = [
        [/Create Your AndgatePOS Account/gi, 'AndgatePOS অ্যাকাউন্ট তৈরি'],
        [/Login With Your Own Account/gi, 'নিজের অ্যাকাউন্ট দিয়ে লগইন'],
        [/Practice With Demo Account/gi, 'ডেমো অ্যাকাউন্ট দিয়ে practice'],
        [/First Dashboard Checklist/gi, 'প্রথম ড্যাশবোর্ড চেকলিস্ট'],
        [/Register page/gi, 'রেজিস্ট্রেশন পেজ'],
        [/Owner ও store information/gi, 'মালিক ও দোকানের তথ্য'],
        [/Trial account/gi, 'ট্রায়াল অ্যাকাউন্ট'],
        [/remember me/gi, 'রিমেম্বার মি'],
        [/practice/gi, 'প্র্যাকটিস'],
        [/lesson/gi, 'লেসন'],
        [/check/gi, 'মিলিয়ে দেখুন'],
        [/store information/gi, 'দোকানের তথ্য'],
        [/create/gi, 'তৈরি'],
        [/own account/gi, 'নিজের অ্যাকাউন্ট'],
        [/demo account/gi, 'ডেমো অ্যাকাউন্ট'],
        [/first/gi, 'প্রথম'],
        [/checklist/gi, 'চেকলিস্ট'],
        [/overview/gi, 'ওভারভিউ'],
        [/profile/gi, 'প্রোফাইল'],
        [/roles?/gi, 'রোল'],
        [/permissions?/gi, 'পারমিশন'],
        [/cash/gi, 'ক্যাশ'],
        [/drawer/gi, 'ড্রয়ার'],
        [/payroll/gi, 'পে-রোল'],
        [/salary/gi, 'বেতন'],
        [/advance/gi, 'অ্যাডভান্স'],
        [/bonus/gi, 'বোনাস'],
        [/leave/gi, 'ছুটি'],
        [/shift/gi, 'শিফট'],
        [/documents?/gi, 'ডকুমেন্ট'],
        [/bank/gi, 'ব্যাংক'],
        [/income/gi, 'আয়'],
        [/balance sheet/gi, 'ব্যালেন্স শিট'],
        [/trial balance/gi, 'ট্রায়াল ব্যালেন্স'],
        [/cash flow/gi, 'ক্যাশ ফ্লো'],
        [/audit/gi, 'অডিট'],
        [/notifications?/gi, 'নোটিফিকেশন'],
        [/feedback/gi, 'ফিডব্যাক'],
        [/export/gi, 'এক্সপোর্ট'],
        [/data/gi, 'তথ্য'],
        [/verify/gi, 'মিলিয়ে দেখুন'],
        [/review/gi, 'দেখুন'],
        [/update/gi, 'আপডেট'],
        [/save/gi, 'সংরক্ষণ'],
        [/select/gi, 'নির্বাচন'],
        [/submit/gi, 'জমা'],
        [/status/gi, 'অবস্থা'],
        [/history/gi, 'হিস্টোরি'],
        [/workflow/gi, 'কাজের ধাপ'],
        [/dashboard/gi, 'ড্যাশবোর্ড'],
        [/login/gi, 'লগইন'],
        [/report/gi, 'রিপোর্ট'],
        [/invoice/gi, 'ইনভয়েস'],
        [/barcode/gi, 'বারকোড'],
        [/stock/gi, 'স্টক'],
        [/customer/gi, 'গ্রাহক'],
        [/supplier/gi, 'সরবরাহকারী'],
        [/purchase/gi, 'ক্রয়'],
        [/sale/gi, 'বিক্রয়'],
        [/settings?/gi, 'সেটিংস'],
        [/payment/gi, 'পেমেন্ট'],
        [/order/gi, 'অর্ডার'],
    ];
    for (const [pattern, value] of replacements) output = output.replace(pattern, value);
    return output
        .replace(/মিলিয়ে দেখুন করুন/g, 'মিলিয়ে দেখুন')
        .replace(/দেখুন করুন/g, 'দেখুন')
        .replace(/রাখা করবেন না/g, 'রাখবেন না')
        .replace(/দেওয়া করবেন না/g, 'দেবেন না')
        .replace(/করা করবেন না/g, 'করবেন না')
        .replace(/সংরক্ষণ করুন/g, 'সংরক্ষণ করুন');
};

const spokenTitle = (lesson) => shortLine(normalizeTerm(lesson.spokenTitle || lesson.title)).replace(/।$/, '');

const shortLine = (line) => {
    const cleaned = normalizeTerm(line).replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    return /[।.!?]$/.test(cleaned) ? cleaned : `${cleaned}।`;
};

const inferTemplate = (lesson) => {
    const haystack = `${lesson.id} ${lesson.module} ${lesson.title} ${lesson.path}`.toLowerCase();
    if (haystack.includes('login') || haystack.includes('register') || haystack.includes('account-access')) return 'login';
    if (haystack.includes('dashboard')) return 'dashboard';
    if (haystack.includes('pos')) return 'pos';
    if (haystack.includes('order') || haystack.includes('return')) return 'orders';
    if (haystack.includes('product') || haystack.includes('inventory') || haystack.includes('stock')) return 'inventory';
    if (haystack.includes('purchase')) return 'purchase';
    if (haystack.includes('customer') || haystack.includes('crm')) return 'customers';
    if (haystack.includes('supplier')) return 'suppliers';
    if (haystack.includes('report') || haystack.includes('analytics') || haystack.includes('fiscal')) return 'reports';
    if (haystack.includes('expense') || haystack.includes('accounting')) return 'expenses';
    if (haystack.includes('hr') || haystack.includes('employee') || haystack.includes('payroll')) return 'employee';
    if (haystack.includes('setting') || haystack.includes('store')) return 'settings';
    if (haystack.includes('subscription') || haystack.includes('payment-verification') || haystack.includes('renew')) return 'subscription';
    if (haystack.includes('branch') || haystack.includes('multi-store')) return 'branch';
    if (haystack.includes('barcode') || haystack.includes('label')) return 'barcode';
    if (haystack.includes('offline')) return 'offline';
    return 'dashboard';
};

const buildActionLine = (step) => {
    const line = shortLine(step);
    return line.replace(/করুন।$/, 'করুন।');
};

const naturalIntro = (title) => {
    const options = [
        `চলুন, ${title} দেখে নিই`,
        `এখন ${title} কাজটা করি`,
        `এই অংশে ${title} দেখাবো`,
    ];
    return shortLine(options[Math.abs(title.length) % options.length]);
};

const naturalPurpose = (purpose) => {
    const cleaned = shortLine(purpose).replace(/।$/, '');
    if (cleaned.includes('পারবেন')) {
        return shortLine(cleaned);
    }
    if (cleaned.includes('ঢোকা')) {
        return shortLine('এতে নিজের দোকানের অ্যাকাউন্ট নিরাপদে ব্যবহার করতে পারবেন');
    }
    if (cleaned.includes('বোঝা')) {
        return shortLine('এতে দোকানের অবস্থা সহজে বুঝতে পারবেন');
    }
    if (cleaned.includes('রাখা')) {
        return shortLine('এতে হিসাব আর কাজ গুছিয়ে রাখা সহজ হবে');
    }
    if (cleaned.includes('করা')) {
        return shortLine('এতে কাজটা ধাপে ধাপে শেষ করতে পারবেন');
    }
    return shortLine('এতে কাজটা সহজে বুঝে নিতে পারবেন');
};

const naturalMistake = (item) => {
    const cleaned = shortLine(item).replace(/।$/, '');
    const warning = /না|ভুল|এড়/i.test(cleaned) ? cleaned : `${cleaned} করবেন না`;
    const options = [
        `এখানে একটা জিনিস খেয়াল রাখবেন, ${warning}`,
        `অনেকে এখানে ভুল করে, ${warning}`,
        `এই জায়গায় তাড়াহুড়া করবেন না, ${warning}`,
    ];
    return shortLine(options[Math.abs(cleaned.length) % options.length]);
};

const naturalTip = (item) => {
    const cleaned = shortLine(item).replace(/।$/, '');
    const options = [
        `ভালো হয়, ${cleaned}`,
        `দোকানে কাজ করলে, ${cleaned}`,
        `মালিক বা manager হলে, ${cleaned}`,
    ];
    return shortLine(options[Math.abs(cleaned.length) % options.length]);
};

const naturalSummary = (title) => shortLine(`${title} কাজটা এতটুকুই`);

export const buildTrainingScript = (lesson, nextLesson) => {
    const templateKey = lesson.template || inferTemplate(lesson);
    const defaults = TEMPLATE_DEFAULTS[templateKey] || TEMPLATE_DEFAULTS.dashboard;
    const steps = (lesson.screenActions || lesson.steps || []).map(buildActionLine).filter(Boolean);
    const firstStep = steps[0] || 'প্রথমে ঠিক মেনুতে যান।';
    const navigationLine = lesson.navigation || 'প্রথমে সঠিক পেজটি খুলুন।';
    const titleForVoice = spokenTitle(lesson);
    const nextTitleForVoice = nextLesson ? spokenTitle(nextLesson) : '';

    const sections = {
        introduction: [naturalIntro(titleForVoice)],
        purpose: [naturalPurpose(lesson.learningGoal || defaults.purpose)],
        navigation: [shortLine(navigationLine || firstStep)],
        actions: steps,
        mistakes: (lesson.commonMistakes || defaults.commonMistakes).slice(0, 1).map(naturalMistake),
        tips: (lesson.tips || defaults.tips).slice(0, 1).map(naturalTip),
        summary: [shortLine(lesson.summary || naturalSummary(titleForVoice))],
        next: [shortLine(nextLesson ? `এরপর আমরা ${nextTitleForVoice} দেখবো` : 'এই লেসন এখানেই শেষ')],
    };

    const orderedLines = [
        ...sections.introduction,
        PAUSE,
        ...sections.purpose,
        PAUSE,
        ...sections.navigation,
        PAUSE,
        ...sections.actions.flatMap((line) => [line, PAUSE]),
        ...sections.mistakes,
        PAUSE,
        ...sections.tips,
        PAUSE,
        ...sections.summary,
        ...sections.next,
    ];

    const screenSync = [
        { sentence: sections.introduction[0], screenAction: 'Show lesson target screen', seconds: 4 },
        { sentence: sections.purpose[0], screenAction: 'Keep screen steady and point to main area', seconds: 5 },
        { sentence: sections.navigation[0], screenAction: 'Navigate to the required page/menu', seconds: 5 },
        ...steps.map((step, index) => ({
            sentence: step,
            screenAction: lesson.uiLabels?.[index] ? `Use UI label: ${lesson.uiLabels[index]}` : `Perform step ${index + 1}`,
            seconds: 6,
        })),
    ];

    return {
        module: lesson.module,
        title: lesson.title,
        estimatedDuration: Math.max(45, screenSync.reduce((sum, item) => sum + item.seconds, 0) + 18),
        learningGoal: lesson.learningGoal || defaults.purpose,
        narration: orderedLines.join('\n'),
        pauseMarkers: orderedLines.map((line, index) => (line === PAUSE ? index : -1)).filter((index) => index >= 0),
        screenSync,
        voiceNotes: [
            'Friendly Bangladeshi trainer tone.',
            'Pause naturally at every pause marker.',
            'Do not read like a document.',
            'Keep each instruction separate from the next screen action.',
        ],
        timing: screenSync.map((item, index) => ({
            scene: index + 1,
            seconds: item.seconds,
            screenAction: item.screenAction,
        })),
        summary: sections.summary.join(' '),
        quiz: [
            {
                question: `${titleForVoice} করার আগে কোন বিষয়টি আগে মিলাবেন?`,
                answer: steps[0] || 'সঠিক মেনু ও তথ্য।',
            },
            {
                question: 'ভুল হলে কী করবেন?',
                answer: 'তথ্য আবার মিলিয়ে সঠিকভাবে সংরক্ষণ করবেন।',
            },
        ],
        nextLesson: nextLesson?.id || '',
        standardVersion: 'bd-training-v1',
        template: templateKey,
    };
};

export const enrichLessons = (lessons) =>
    lessons.map((lesson, index) => {
        const trainingScript = buildTrainingScript(lesson, lessons[index + 1]);
        return {
            ...lesson,
            learningGoal: trainingScript.learningGoal,
            narration: lesson.narrationQuality === 'legacy' ? lesson.narration : trainingScript.narration,
            trainingScript,
        };
    });

export const validateTrainingScript = (lesson) => {
    const script = lesson.trainingScript || buildTrainingScript(lesson);
    const sentences = splitSentences(script.narration.replaceAll(PAUSE, ''));
    const issues = [];

    if (!hasBangla(script.narration)) {
        issues.push({ severity: 'error', code: 'NO_BANGLA', message: 'Narration must contain Bangla text.' });
    }

    for (const sentence of sentences) {
        const words = countWords(sentence);
        if (words > SCRIPT_STANDARD.maxWordsPerSentence) {
            issues.push({ severity: 'error', code: 'LONG_SENTENCE', message: `Sentence has ${words} words.`, sentence });
        }
    }

    const paragraphBlocks = String(script.narration)
        .split(new RegExp(`\\n\\s*(?:${PAUSE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*\\n|\\n\\s*\\n`))
        .filter((block) => splitSentences(block).length > 2);
    if (paragraphBlocks.length) {
        issues.push({ severity: 'error', code: 'LONG_PARAGRAPH', message: 'Narration contains paragraph blocks with more than two sentences.' });
    }

    for (const pattern of ROBOTIC_PATTERNS) {
        if (pattern.test(script.narration)) {
            issues.push({ severity: 'warning', code: 'ROBOTIC_WORDING', message: `Robotic pattern found: ${pattern}` });
        }
    }

    for (const word of UNNECESSARY_ENGLISH) {
        const matches = script.narration.match(new RegExp(`\\b${word}\\b`, 'gi'));
        if (matches?.length > 1) {
            issues.push({ severity: 'warning', code: 'EXCESS_ENGLISH', message: `Repeated English word: ${word}` });
        }
    }

    for (const phrase of HARD_PHRASES) {
        if (script.narration.includes(phrase)) {
            issues.push({ severity: 'warning', code: 'HARD_PRONUNCIATION', message: `Difficult phrase found: ${phrase}` });
        }
    }

    if (!script.pauseMarkers.length) {
        issues.push({ severity: 'error', code: 'NO_PAUSES', message: 'Script must include pause markers.' });
    }

    if (!script.screenSync.length || script.screenSync.length < 3) {
        issues.push({ severity: 'error', code: 'NO_SCREEN_SYNC', message: 'Script must include screen synchronization steps.' });
    }

    return {
        lessonId: lesson.id,
        title: lesson.title,
        ok: !issues.some((issue) => issue.severity === 'error'),
        issues,
    };
};

export const buildAuditReport = (lessons) => {
    const enriched = enrichLessons(lessons);
    const results = enriched.map(validateTrainingScript);
    const errors = results.flatMap((result) => result.issues.filter((issue) => issue.severity === 'error'));
    const warnings = results.flatMap((result) => result.issues.filter((issue) => issue.severity === 'warning'));

    return {
        generatedAt: new Date().toISOString(),
        standardVersion: 'bd-training-v1',
        lessonCount: lessons.length,
        passed: results.filter((result) => result.ok).length,
        failed: results.filter((result) => !result.ok).length,
        errorCount: errors.length,
        warningCount: warnings.length,
        ttsPrompt: BANGLADESHI_TTS_PROMPT,
        standard: SCRIPT_STANDARD,
        findings: [
            'Existing hardcoded narration often contains long mixed Bangla-English sentences.',
            'Several lessons describe concepts before matching the visible screen action.',
            'Legacy narration lacks consistent intro, purpose, mistake, tip, summary, and next lesson sections.',
            'OpenAI TTS performs better when each sentence is short and separated by pause markers.',
            'A shared validator is required before producing dozens of videos.',
        ],
        results,
    };
};

export const formatScriptMarkdown = (lesson) => {
    const script = lesson.trainingScript || buildTrainingScript(lesson);
    return [
        `# ${script.title}`,
        '',
        `- Module: ${script.module}`,
        `- Estimated Duration: ${script.estimatedDuration}s`,
        `- Learning Goal: ${script.learningGoal}`,
        `- Template: ${script.template}`,
        '',
        '## Narration',
        '',
        script.narration,
        '',
        '## Screen Synchronization',
        '',
        ...script.screenSync.map((item, index) => `${index + 1}. ${item.screenAction} (${item.seconds}s)\n   ${item.sentence}`),
        '',
        '## Voice Notes',
        '',
        ...script.voiceNotes.map((note) => `- ${note}`),
        '',
        '## Summary',
        '',
        script.summary,
        '',
        '## Quiz',
        '',
        ...script.quiz.map((item, index) => `${index + 1}. ${item.question}\n   Answer: ${item.answer}`),
        '',
    ].join('\n');
};
