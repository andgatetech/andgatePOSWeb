import process from 'node:process';

const API_KEY = process.env.GOOGLE_TTS_API_KEY || '';
const LANGUAGE_CODE = process.env.GOOGLE_TTS_LANGUAGE_CODE || 'bn-IN';

if (!API_KEY) {
    console.error('Missing GOOGLE_TTS_API_KEY.');
    console.error('Run: GOOGLE_TTS_API_KEY=your-key npm run video:voices:google');
    process.exit(1);
}

const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(LANGUAGE_CODE)}&key=${API_KEY}`);

if (!response.ok) {
    const message = await response.text();
    console.error(`Google Cloud TTS voices request failed: ${response.status}`);
    console.error(message);
    process.exit(1);
}

const data = await response.json();
const voices = data.voices || [];

if (!voices.length) {
    console.log(`No voices found for ${LANGUAGE_CODE}.`);
    process.exit(0);
}

console.log(`Google Cloud Text-to-Speech voices for ${LANGUAGE_CODE}:`);
console.log('');

voices.forEach((voice) => {
    const genders = voice.ssmlGender ? `, ${voice.ssmlGender}` : '';
    const rate = voice.naturalSampleRateHertz ? `, ${voice.naturalSampleRateHertz}Hz` : '';
    console.log(`- ${voice.name}${genders}${rate}`);
});

