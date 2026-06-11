# Quiz Data Files

Each JSON file is an array of question objects, loaded at startup by `quiz.js` via `fetch()`. To add questions, edit these files — no code changes needed.

## Files

```
data/
├── hiragana.json    198 questions (easy: single chars · medium: words · hard: phrases)
├── katakana.json    203 questions (easy: single chars · medium/hard: loanwords)
├── kanji.json       784 questions (easy: N5 · medium: N4 · hard: N3 — 2 per kanji)
├── particle.json    150 questions (fill-in-the-blank sentences)
├── time.json        156 questions (hours, dates, months, relative time)
└── counters.json    120 questions (個、枚、本、匹、冊、台...)
```

Numbers have **no data file** — they are generated procedurally in `quiz.js` (`generateNumberQ`), so they never repeat.

## Question object format

```json
{
  "category": "hiragana",
  "level": "medium",
  "q": "ねこ",
  "a": "neko",
  "d": ["inu", "uma", "tori", "kuma"],
  "note": "ねこ = neko (cat)",
  "hint": "How do you read this word?",
  "meaning": "cat"
}
```

| Field | Required | Purpose |
|---|---|---|
| `category` | ✅ | `hiragana` / `katakana` / `kanji` / `particle` / `time` / `counters` |
| `level` | ✅ | `easy` / `medium` / `hard` |
| `q` | ✅ | Question text shown to the user |
| `a` | ✅ | Correct answer — also matched against typed input (see rules below) |
| `d` | ✅ | 3–4 wrong options for multiple choice |
| `note` | ✅ | Explanation shown in feedback after answering |
| `hint` | optional | Subtitle under the question |
| `meaning` | optional | English meaning (kana vocab) |
| `translation` | particle only | English translation of the sentence |
| `_isParticle` | particle only | `true` — switches renderer to blank-fill mode |

### Particle questions

Use `___` in `q` to mark the blank (multiple blanks allowed; join answers with `…`):

```json
{
  "category": "particle",
  "level": "easy",
  "q": "わたし___がくせいです。",
  "a": "は",
  "d": ["が", "を", "で"],
  "note": "は = topic marker",
  "translation": "I am a student.",
  "_isParticle": true
}
```

### Kanji — two objects per kanji

One reading question + one meaning question:

```json
{ "category":"kanji", "level":"easy", "q":"山", "a":"やま (yama)", "d":["かわ (kawa)","き (ki)","ひ (hi)"], "note":"山 = やま — mountain", "hint":"How do you read this kanji?" },
{ "category":"kanji", "level":"easy", "q":"山", "a":"mountain", "d":["river","tree","fire"], "note":"山 = やま (yama)", "hint":"What does this kanji mean?" }
```

## Distractor rules — prevents answer leaks!

1. **Counters**: counter reading only in `a` and `d` — `"いっこ"`, never `"りんご いっこ"`. The object name in an option reveals which one is correct.
2. **Kana (hira/kata)**: romaji only in options — `"neko"`, not `"ねこ (neko)"`.
3. **Kanji reading questions**: kana-only options. **Meaning questions**: English-only options. Never mix — mixing leaks the answer.
4. **Days/months**: reading only — `"げつようび"`, not `"Monday (月曜日)"`.
5. Full explanations (kanji + romaji + meaning) belong in `note` — that only shows **after** answering.

## Typing mode requirements

The `a` field doubles as the expected typed answer for hiragana/katakana, so:

- Keep `a` as **clean Hepburn romaji** for kana questions: lowercase, plain letters, spaces ok (`"ohayou gozaimasu"`)
- No parentheses, no kana, no annotations in `a` — `"neko"` not `"neko (cat)"`
- Checking is case-insensitive and whitespace-insensitive; 1-letter typos count as almost-correct; Kunrei-shiki (si/ti/tu) is rejected with an explanation

## Validating after edits

Quick sanity check that your JSON parses and has no answer leaks:

```bash
node -e "
const d = require('./data/counters.json');
console.log(d.length, 'questions OK');
d.forEach(i => { if (!i.q || !i.a || !i.d) console.log('MISSING FIELD:', i); });
"
```
