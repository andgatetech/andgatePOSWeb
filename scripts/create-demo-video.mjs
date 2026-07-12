import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { GoogleAuth } from 'google-auth-library';

const BASE_URL = process.env.VIDEO_BASE_URL || 'http://localhost:3000';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'user@demo.com';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'user123';
const LANG = process.env.VIDEO_LANG || 'bn';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT_DIR = process.env.VIDEO_OUT_DIR || path.join(process.cwd(), 'videos', 'demo', timestamp);
const VIEWPORT = { width: 1280, height: 720 };
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || '';
const GOOGLE_TTS_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
const GOOGLE_TTS_LANGUAGE_CODE = process.env.GOOGLE_TTS_LANGUAGE_CODE || 'bn-IN';
const GOOGLE_TTS_VOICE_NAME = process.env.GOOGLE_TTS_VOICE_NAME || '';
const GOOGLE_TTS_SPEAKING_RATE = Number(process.env.GOOGLE_TTS_SPEAKING_RATE || '0.95');
const GOOGLE_TTS_PITCH = Number(process.env.GOOGLE_TTS_PITCH || '0');
const INPUT_AUDIO = process.env.VIDEO_AUDIO_FILE || '';
const TTS_PROVIDER = process.env.VIDEO_TTS_PROVIDER || (GOOGLE_TTS_API_KEY || GOOGLE_TTS_CREDENTIALS ? 'google' : process.env.OPENAI_API_KEY ? 'openai' : '');

const scenes = [
    {
        key: 'intro',
        title: 'AndgatePOS পরিচিতি',
        path: '/dashboard',
        seconds: 9,
        narration:
            'স্বাগতম। AndgatePOS বাংলাদেশের দোকান, ফার্মেসি, মুদি, রেস্টুরেন্ট আর রিটেইল ব্যবসার জন্য তৈরি একটি সহজ POS সফটওয়্যার।',
    },
    {
        key: 'dashboard',
        title: 'ড্যাশবোর্ড',
        path: '/dashboard',
        seconds: 11,
        narration:
            'ড্যাশবোর্ডে আজকের বিক্রি, অর্ডার, বাকি, স্টক সতর্কতা আর গুরুত্বপূর্ণ রিপোর্ট এক নজরে দেখা যায়। মালিক চাইলে দোকানের অবস্থা দ্রুত বুঝতে পারেন।',
    },
    {
        key: 'products',
        title: 'পণ্য ও স্টক',
        path: '/products',
        seconds: 11,
        narration:
            'পণ্য তালিকায় নাম, ক্যাটাগরি, ব্র্যান্ড, দাম, স্টক আর স্টোর অনুযায়ী তথ্য দেখা যায়। অনেক পণ্য থাকলেও খোঁজা ও ফিল্টার করা সহজ।',
    },
    {
        key: 'pos',
        title: 'POS বিক্রি',
        path: '/pos',
        seconds: 13,
        narration:
            'POS স্ক্রিন থেকে পণ্য যোগ করা, ডিসকাউন্ট দেওয়া, বিকাশ, নগদ, ক্যাশ বা ব্যাংক পেমেন্ট নেওয়া এবং রসিদ তৈরি করা যায় খুব দ্রুত।',
    },
    {
        key: 'customer-due',
        title: 'কাস্টমার বাকি',
        path: '/customers/due',
        seconds: 10,
        narration:
            'বাংলাদেশের SME ব্যবসায় বাকি হিসাব খুব গুরুত্বপূর্ণ। AndgatePOS কাস্টমার অনুযায়ী বাকি, পেমেন্ট এবং আগের লেনদেন পরিষ্কারভাবে রাখে।',
    },
    {
        key: 'supplier-due',
        title: 'সাপ্লায়ার বাকি',
        path: '/suppliers/due',
        seconds: 10,
        narration:
            'সাপ্লায়ারের পাওনা, ক্রয়, আংশিক পেমেন্ট এবং বাকি হিসাবও একইভাবে ম্যানেজ করা যায়। এতে খাতার হিসাবের ঝামেলা কমে।',
    },
    {
        key: 'returns',
        title: 'রিটার্ন',
        path: '/orders/return/list',
        seconds: 10,
        narration:
            'পণ্য রিটার্ন হলে অর্ডার অনুযায়ী সঠিক আইটেম, পরিমাণ, রিফান্ড এবং স্টক আপডেট নিয়ন্ত্রণ করা যায়।',
    },
    {
        key: 'reports',
        title: 'রিপোর্ট',
        path: '/reports/sales',
        seconds: 12,
        narration:
            'সেলস রিপোর্ট, স্টক রিপোর্ট, লাভ-ক্ষতি, ট্যাক্স, কাস্টমার ও সাপ্লায়ার রিপোর্ট দিয়ে ব্যবসার সিদ্ধান্ত নেওয়া আরও সহজ হয়।',
    },
    {
        key: 'outro',
        title: 'শেষ কথা',
        path: '/pricing',
        seconds: 8,
        narration:
            'আপনার ব্যবসা ডিজিটালভাবে চালাতে AndgatePOS ব্যবহার করুন। ফ্রি প্ল্যান দিয়ে শুরু করুন, পরে প্রয়োজন অনুযায়ী আপগ্রেড করুন।',
    },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = (command, args, options = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', ...options });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with code ${code}`));
        });
    });

const exists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const formatSrtTime = (seconds) => {
    const ms = Math.round((seconds % 1) * 1000);
    const total = Math.floor(seconds);
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

const writeNarrationFiles = async () => {
    let cursor = 0;
    const scriptLines = [];
    const srtBlocks = [];

    scenes.forEach((scene, index) => {
        const start = cursor;
        const end = cursor + scene.seconds;
        scriptLines.push(`${String(index + 1).padStart(2, '0')}. ${scene.title}`);
        scriptLines.push(scene.narration);
        scriptLines.push('');
        srtBlocks.push(`${index + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${scene.narration}\n`);
        cursor = end;
    });

    const fullNarration = scenes.map((scene) => scene.narration).join('\n\n');
    await fs.writeFile(path.join(OUT_DIR, 'andgatepos-bangla-demo-script.bn.txt'), scriptLines.join('\n'));
    await fs.writeFile(path.join(OUT_DIR, 'andgatepos-bangla-demo-narration.bn.txt'), fullNarration);
    await fs.writeFile(path.join(OUT_DIR, 'andgatepos-bangla-demo.srt'), srtBlocks.join('\n'));
};

const waitForAppReady = async (page) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(900);
};

const login = async (page) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    if (LANG) {
        await page.context().addCookies([
            {
                name: 'i18nextLng',
                value: LANG,
                url: BASE_URL,
            },
        ]);
        await page.reload({ waitUntil: 'domcontentloaded' });
    }
    await page.fill('#Email', DEMO_EMAIL);
    await page.fill('#Password', DEMO_PASSWORD);
    await Promise.all([
        page.waitForURL(/\/dashboard|\/subscription|\/store/, { timeout: 45_000 }).catch(() => undefined),
        page.locator('form button[type="submit"]').click(),
    ]);
    await waitForAppReady(page);

    if (page.url().includes('/login')) {
        throw new Error('Login failed. Check DEMO_EMAIL, DEMO_PASSWORD, backend, and demo account status.');
    }
};

const movePointer = async (page, step) => {
    const x = 220 + ((step * 173) % 760);
    const y = 150 + ((step * 89) % 380);
    await page.mouse.move(x, y, { steps: 18 });
};

const recordScreen = async () => {
    let chromium;
    try {
        ({ chromium } = await import('playwright'));
    } catch {
        throw new Error('Playwright missing. Run: npm i -D playwright && npx playwright install chromium');
    }

    const rawDir = path.join(OUT_DIR, 'raw');
    await fs.mkdir(rawDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: VIEWPORT,
        recordVideo: { dir: rawDir, size: VIEWPORT },
    });
    const page = await context.newPage();

    await login(page);

    for (const [index, scene] of scenes.entries()) {
        console.log(`Scene ${index + 1}/${scenes.length}: ${scene.title}`);
        await page.goto(`${BASE_URL}${scene.path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await waitForAppReady(page);
        await movePointer(page, index + 1);
        await page.mouse.wheel(0, 280).catch(() => undefined);
        await sleep(scene.seconds * 500);
        await page.mouse.wheel(0, -140).catch(() => undefined);
        await sleep(scene.seconds * 500);
    }

    await context.close();
    await browser.close();

    const files = await fs.readdir(rawDir);
    const webm = files.find((file) => file.endsWith('.webm'));
    if (!webm) throw new Error('Playwright did not create a video file.');

    const source = path.join(rawDir, webm);
    const videoOnly = path.join(OUT_DIR, 'andgatepos-bangla-demo.video-only.mp4');
    await run('ffmpeg', ['-y', '-i', source, '-vf', 'scale=1280:720,fps=30', '-pix_fmt', 'yuv420p', videoOnly]);
    return videoOnly;
};

const generateOpenAiVoice = async () => {
    if (!process.env.OPENAI_API_KEY) return '';

    const text = await fs.readFile(path.join(OUT_DIR, 'andgatepos-bangla-demo-narration.bn.txt'), 'utf8');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OPENAI_TTS_MODEL,
            voice: OPENAI_TTS_VOICE,
            input: text,
            response_format: 'mp3',
        }),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`OpenAI TTS failed: ${response.status} ${message}`);
    }

    const audioPath = path.join(OUT_DIR, 'andgatepos-bangla-demo-voice.mp3');
    await fs.writeFile(audioPath, Buffer.from(await response.arrayBuffer()));
    return audioPath;
};

const generateGoogleVoice = async () => {
    if (!GOOGLE_TTS_CREDENTIALS && !GOOGLE_TTS_API_KEY) {
        return '';
    }

    if (!GOOGLE_TTS_CREDENTIALS) {
        throw new Error('Google Cloud TTS requires OAuth2 credentials. Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file instead of using an API key.');
    }

    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;

    if (!accessToken) {
        throw new Error('Failed to obtain Google Cloud access token for TTS.');
    }

    const text = await fs.readFile(path.join(OUT_DIR, 'andgatepos-bangla-demo-narration.bn.txt'), 'utf8');
    const voice = {
        languageCode: GOOGLE_TTS_LANGUAGE_CODE,
    };

    if (GOOGLE_TTS_VOICE_NAME) {
        voice.name = GOOGLE_TTS_VOICE_NAME;
    }

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            input: { text },
            voice,
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: GOOGLE_TTS_SPEAKING_RATE,
                pitch: GOOGLE_TTS_PITCH,
            },
        }),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Google Cloud TTS failed: ${response.status} ${message}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
        throw new Error('Google Cloud TTS response did not include audioContent.');
    }

    const audioPath = path.join(OUT_DIR, 'andgatepos-bangla-demo-voice.mp3');
    await fs.writeFile(audioPath, Buffer.from(data.audioContent, 'base64'));
    return audioPath;
};

const muxFinalVideo = async (videoOnly, audioPath) => {
    const srtPath = path.join(OUT_DIR, 'andgatepos-bangla-demo.srt');
    const finalPath = path.join(OUT_DIR, 'andgatepos-bangla-demo.mp4');

    if (audioPath && await exists(audioPath)) {
        await run('ffmpeg', [
            '-y',
            '-i',
            videoOnly,
            '-i',
            audioPath,
            '-vf',
            `subtitles=${srtPath}:force_style='FontName=Noto Sans Bengali,FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H7A000000,BorderStyle=1,Outline=1,Shadow=0'`,
            '-map',
            '0:v:0',
            '-map',
            '1:a:0',
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            '-shortest',
            '-pix_fmt',
            'yuv420p',
            finalPath,
        ]);
    } else {
        await run('ffmpeg', [
            '-y',
            '-i',
            videoOnly,
            '-vf',
            `subtitles=${srtPath}:force_style='FontName=Noto Sans Bengali,FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H7A000000,BorderStyle=1,Outline=1,Shadow=0'`,
            '-c:v',
            'libx264',
            '-pix_fmt',
            'yuv420p',
            finalPath,
        ]);
    }

    return finalPath;
};

const main = async () => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    await writeNarrationFiles();

    const videoOnly = await recordScreen();
    let audioPath = INPUT_AUDIO;

    if (!audioPath && TTS_PROVIDER === 'google') {
        audioPath = await generateGoogleVoice();
    }

    if (!audioPath && TTS_PROVIDER === 'openai') {
        audioPath = await generateOpenAiVoice();
    }

    const finalPath = await muxFinalVideo(videoOnly, audioPath);

    console.log('\nDone.');
    console.log(`Output: ${finalPath}`);
    console.log(`Script: ${path.join(OUT_DIR, 'andgatepos-bangla-demo-script.bn.txt')}`);
    console.log(`Subtitles: ${path.join(OUT_DIR, 'andgatepos-bangla-demo.srt')}`);
    if (!audioPath) {
        console.log('Voice note: no TTS key/audio file found, so final video has Bangla subtitles but no voice.');
        console.log('To add Google voice: GOOGLE_APPLICATION_CREDENTIALS=/path/key.json VIDEO_TTS_PROVIDER=google npm run video:demo');
        console.log('To add OpenAI voice: OPENAI_API_KEY=... VIDEO_TTS_PROVIDER=openai npm run video:demo');
        console.log('Or use a recorded voice file: VIDEO_AUDIO_FILE=/path/voice.mp3 npm run video:demo');
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
