# 日本語 Quiz 🇯🇵

A free, self-contained Japanese learning quiz app — no backend, no API key, no login required. Just one HTML file that runs entirely in the browser.

**Live demo:** *(add your Netlify URL here after deploying)*

---

## What's inside

| Category | Easy | Medium | Hard |
|---|---|---|---|
| **Hiragana** | 92 single characters (incl. dakuten & combos) | 56 vocabulary words with meanings | 50 long phrases & place names |
| **Katakana** | 83 single characters | 70 loanwords | 50 long loanwords |
| **Numbers** | 1–99 *(procedural — infinite!)* | 100–9,999 *(procedural)* | 10,000+ using 万/億 *(procedural)* |
| **Counters** | 50 questions — 個、枚、本、匹、冊 | 50 questions — money (円), people, vehicles | 50 questions — sound changes & tricky patterns |
| **Time & Date** | 54 questions — hours, minutes, days of week | 52 questions — all 12 months, irregular dates | 50 questions — duration, relative time, era names |
| **Kanji** | 52 questions — JLPT N5 reading & meaning | 52 questions — JLPT N4 reading & meaning | 70 questions — JLPT N3 reading & meaning |
| **Particles** | 50 questions — は、が、を、に、で | 50 questions — と、も、へ、から、まで、より | 50 questions — complex multi-particle & passive |
| **Mixed** | Random from all easy pools | Random from all medium pools | Random from all hard pools |

**Total: 1,200+ unique questions** (plus infinite procedural numbers)

### Features

- **You choose how many questions** — pick 10, 20, 30, 50, or type any number from 5–100
- **Smart anti-repeat** — tracks questions you've seen this session; always serves unseen questions first
- **Wrong answer boost** — questions you got wrong are prioritized to come back sooner
- **Streak counter** — 🔥 tracks consecutive correct answers
- **Procedural numbers** — number questions are generated on the fly, so they never repeat regardless of how many you pick
- **Particle fill-in-the-blank** — shows full Japanese sentences with a blank, reveals the filled answer after you choose
- **Exit button** — quit mid-quiz with a confirmation dialog
- **Single HTML file** — host anywhere, works offline after first load

---

## How to run locally

No build step needed. Just open the file:

```bash
# Option 1: open directly
open index.html

# Option 2: serve with Python (avoids any browser file:// restrictions)
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## How to add more questions

All questions live in one `QUIZ_DATA` array inside `index.html`. Adding a new question is one line.

### Basic question (kana, time, counters, etc.)

```js
add(
  'hiragana',               // category: hiragana | katakana | numbers | counters | time | kanji | particle
  'medium',                 // level: easy | medium | hard
  'ねこ',                   // q: the question text shown to the user
  'neko',                   // a: the correct answer
  ['inu','uma','tori','kuma'], // d: wrong options (provide 3–4)
  'ねこ = neko (cat)',       // note: shown in feedback after answering
  {                         // optional extras:
    hint: 'How do you read this word?',
    meaning: 'cat'
  }
);
```

### Particle fill-in-the-blank

Use `___` in the question string to mark the blank. The answer is the particle (or particles joined by `…`).

```js
add(
  'particle', 'easy',
  'わたし___がくせいです。',  // ___ = the blank
  'は',                      // correct particle
  ['が', 'を', 'で'],        // wrong options
  'は = topic marker',
  {
    translation: 'I am a student.',
    _isParticle: true         // tells the renderer to show the sentence format
  }
);
```

### Kanji — two questions in one call

`addKanji` automatically creates two questions: one asking for the reading, one asking for the meaning.

```js
addKanji(
  'easy',                          // level
  '山',                            // kanji character
  'やま (yama)',                   // correct reading
  'mountain',                      // correct meaning
  ['かわ (kawa)', 'き (ki)', 'ひ (hi)', 'うみ (umi)'],  // wrong readings
  ['river', 'tree', 'fire', 'sea'],                     // wrong meanings
  '山 ='                           // note prefix
);
```

### Where to add

You can append to any of the existing data arrays in the file:

| Array | Category | Level |
|---|---|---|
| `HIRA_CHARS` | hiragana | easy |
| `HIRA_WORDS` | hiragana | medium |
| `HIRA_HARD` | hiragana | hard |
| `KATA_CHARS` | katakana | easy |
| `KATA_WORDS` | katakana | medium |
| `KATA_HARD` | katakana | hard |
| `COUNTERS` | counters | easy/medium/hard (set in item) |
| `TIME_DATA` | time | easy/medium/hard (set in item) |
| `PARTICLE_DATA` | particle | easy/medium/hard (set in item) |
| `addKanji(...)` calls | kanji | easy = N5, medium = N4, hard = N3 |

---

## File structure

```
japanese-quiz/
├── index.html    ← the entire app (HTML + CSS + JS + all data)
├── README.md
└── DEPLOY.md     ← step-by-step Netlify & GitHub Pages guide
```

Everything is intentionally in one file — zero build step, works offline, trivially hostable anywhere.

---

## Hosting

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions for Netlify (drag & drop, live in 2 minutes) and GitHub Pages.

---

## Tech stack

- Vanilla HTML/CSS/JS — zero frameworks, zero dependencies
- Google Fonts (Noto Sans JP + Inter) loaded from CDN
- Works fully offline after first load (fonts cached by browser)
- ~1,500 lines of HTML/CSS/JS + data

---

## Contributing

Pull requests welcome! The easiest contribution is adding more questions — just follow the format above and open a PR.

Ideas for future additions:
- [ ] JLPT N2/N1 kanji
- [ ] Grammar patterns (〜ている、〜たい、〜なければならない...)
- [ ] Keigo (honorific speech)
- [ ] Onomatopoeia (擬音語・擬態語)
- [ ] Audio pronunciation (Web Speech API)
- [ ] Progress saved across sessions (localStorage)
- [ ] Dark/light theme toggle

---

## License

MIT — free to use, modify, and share.
