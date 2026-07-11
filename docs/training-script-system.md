# AndgatePOS Training Script System

## Audit Summary

The previous generator worked for basic screen capture, but it was not a production content system.

Main issues found:

- Narration lived as hardcoded paragraphs inside `scripts/create-training-videos.mjs`.
- Many lines mixed English words that have common Bangladeshi software terms.
- Some sentences were too long for natural OpenAI TTS delivery.
- There was no standard teaching flow per lesson.
- Screen recording used only two generic scenes, so narration could speak ahead of the visible action.
- Pause timing was implicit through blank lines, not explicit script metadata.
- No automatic quality checker existed before generating video or voice.
- The TTS voice prompt was a single generic instruction, not a reusable voice standard.
- Output files did not include learning goal, screen sync, timing, voice notes, quiz, or quality report.

## Script Standard

Every generated lesson follows `bd-training-v1`.

Rules:

- Maximum sentence length: 15 words.
- Preferred sentence length: around 10 words.
- One sentence should map to one screen action.
- No long paragraphs.
- Use `...` as a pause marker.
- Use natural Bangladeshi Bengali.
- Avoid literary Bengali and Indian Bengali style.
- Avoid unnecessary English.
- Keep software terms consistent.
- Never sound like news reading, textbook, marketing copy, or AI narration.

Required lesson sections:

- Introduction
- Purpose
- Navigation
- Step by step actions
- Common mistakes
- Tips
- Summary
- Next lesson

## Standard Terms

- login: `লগইন`
- dashboard: `ড্যাশবোর্ড`
- sale: `বিক্রয়`
- purchase: `ক্রয়`
- stock: `স্টক`
- customer: `গ্রাহক`
- supplier: `সরবরাহকারী`
- print: `প্রিন্ট`
- barcode: `বারকোড`
- report: `রিপোর্ট`
- invoice: `ইনভয়েস`
- order: `অর্ডার`
- payment: `পেমেন্ট`
- settings: `সেটিংস`

## OpenAI TTS Prompt

The default prompt is generated from `BANGLADESHI_TTS_PROMPT` in `scripts/training-script-engine.mjs`.

It is also exported to:

```bash
videos/training/<timestamp>/openai-tts-system-prompt.txt
```

The prompt asks OpenAI TTS to speak like an experienced Bangladeshi trainer helping a shop owner beside them, with short natural pauses, simple Bengali, and natural pronunciation of common software terms.

## Screen Synchronization

Every generated lesson now includes `screenSync` records:

- spoken sentence
- matching screen action
- recommended seconds

This lets future recording automation capture smaller scenes instead of one long generic screen movement.

## Output Format

Each lesson writes:

- `script.bn.txt`
- `narration.bn.txt`
- `subtitles.bn.srt`
- `script-standard.json`
- `script-standard.bn.md`
- `quality-report.json`

The training run writes:

- `training-video-manifest.json`
- `training-script-audit.json`
- `openai-tts-system-prompt.txt`

## Quality Checker

The validator rejects or warns for:

- long sentences
- long paragraphs
- missing Bangla
- missing pause markers
- missing screen sync
- robotic wording
- repeated unnecessary English
- hard pronunciation phrases

Strict mode:

```bash
TRAINING_STRICT_SCRIPT_QUALITY=true npm run video:training
```

Audit only:

```bash
npm run video:training:audit
```

Script only:

```bash
TRAINING_SCRIPT_ONLY=true npm run video:training
```

## Templates

Reusable templates exist for:

- Dashboard
- Login
- Sales
- POS
- Orders
- Inventory
- Purchase
- Customers
- Suppliers
- Reports
- Expenses
- Employee
- Settings
- Account
- Subscription
- Branch
- Product
- Category
- Brand
- Barcode
- Returns
- Offline mode

The engine infers the best template from lesson id, module, title, and route.

## Before And After

Before:

```text
এখন আমরা ইনভেন্টরি মডিউলে গিয়ে নতুন প্রোডাক্ট তৈরি করব এবং দাম লিখব।
```

After:

```text
এখন প্রোডাক্ট মেনুতে যান।
...
নতুন পণ্য নির্বাচন করুন।
...
পণ্যের নাম লিখুন।
...
দাম লিখুন।
...
এবার সংরক্ষণ করুন।
```

Before:

```text
এই lesson-এ আমরা store profile আর settings দেখবো।
```

After:

```text
আজ আমরা Store Profile and Settings শিখবো।
...
দোকানের নিয়ম আগে ঠিক করুন।
...
সেটিংস মেনুতে যান।
```

## Future Scaling

To add hundreds of lessons, add compact lesson metadata:

```js
{
  id: 'new-lesson',
  module: '05-inventory',
  title: 'New Lesson',
  path: '/products',
  steps: ['Product list খুলুন', 'Filter ব্যবহার করুন', 'Result মিলিয়ে দেখুন'],
}
```

The engine generates:

- learning goal
- narration
- pauses
- screen sync
- timing
- voice notes
- summary
- quiz
- next lesson

Manual editing should only be needed for product-specific UI details.
