import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OUT_DIR = process.env.VOICE_TEST_OUT_DIR || path.join(process.cwd(), 'videos', 'voice-tests');
const MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const VOICE = process.env.OPENAI_TTS_VOICE || 'nova';
const SPEED = process.env.OPENAI_TTS_SPEED ? Number(process.env.OPENAI_TTS_SPEED) : null;
const INSTRUCTIONS = process.env.OPENAI_TTS_INSTRUCTIONS
    || 'Use a natural Bangladeshi female trainer voice. Speak in warm Dhaka-neutral Bangla, like a friendly local software trainer helping Bangladeshi shop owners. Avoid robotic reading, avoid Indian/West Bengal Bengali accent, and do not over-enunciate. Keep the rhythm conversational, patient, and confident, with short natural pauses after each sentence. English product words such as POS, dashboard, report, courier, ecommerce, and barcode should sound like common Bangladeshi business English mixed into Bangla.';
const TEXT = process.env.VOICE_TEST_TEXT
    || 'আসসালামু আলাইকুম। এই ভিডিওতে আমরা AndgatePOS ড্যাশবোর্ড দেখবো। এখানে আজকের বিক্রি, অর্ডার, পেমেন্ট, কম স্টক আর বাকি হিসাব এক জায়গায় দেখা যায়। দোকান খোলার পরে প্রথমে এই পেজ দেখে দিনের অবস্থা বুঝে নিন।';

if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY.');
    process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const body = {
    model: MODEL,
    voice: VOICE,
    input: TEXT,
    instructions: INSTRUCTIONS,
    response_format: 'mp3',
};
if (SPEED !== null && Number.isFinite(SPEED)) {
    body.speed = SPEED;
}

const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
});

if (!response.ok) {
    console.error(`OpenAI TTS failed: ${response.status}`);
    console.error(await response.text());
    process.exit(1);
}

const fileName = `bangla-training-${VOICE}-${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`;
const output = path.join(OUT_DIR, fileName);
await fs.writeFile(output, Buffer.from(await response.arrayBuffer()));

console.log(`Voice sample: ${output}`);
