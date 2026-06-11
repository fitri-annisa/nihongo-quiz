# 日本語 Quiz 🇯🇵

A free, static Japanese learning quiz app — no backend, no API key, no login required. Vanilla HTML/CSS/JS with question data in separate JSON files.

**Live demo:** [*https://nihongo-quiz.netlify.app/*](https://nihongo-quiz.netlify.app/)

---

## What's inside

| Category | Easy | Medium | Hard | Total |
|---|---|---|---|---|
| **Hiragana** | 92 (single chars) | 56 (vocab words) | 50 (phrases) | 198 |
| **Katakana** | 83 (single chars) | 70 (loanwords) | 50 (long loanwords) | 203 |
| **Kanji** | 224 (JLPT N5, 112 kanji) | 250 (JLPT N4, 123 kanji) | 310 (JLPT N3, 154 kanji) | 784 |
| **Particles** | 50 | 50 | 50 | 150 |
| **Time & Date** | 54 | 52 | 50 | 156 |
| **Counters** | 47 | 40 | 33 | 120 |
| **Numbers** | ∞ procedural (1–99) | ∞ (100–9,999) | ∞ (10,000+ with 万/億) | ∞ |
| | | | **Total** | **1,611+** |

### Features

- **Two answer modes** — multiple choice, or ⌨️ type the romaji answer (hiragana, katakana & numbers)
- **Smart romaji checking** — case insensitive, whitespace-tolerant, one-letter typos count as "almost correct", but Kunrei-shiki romanization (si/ti/tu) is rejected with a Hepburn explanation (shi/chi/tsu)
- **Alternate readings accepted** — 4 = yon *or* shi, 7 = nana *or* shichi, 9 = kyuu *or* ku
- **You choose how many questions** — 10, 20, 30, 50, or any custom number 5–100
- **Smart anti-repeat** — unseen questions served first; wrong answers come back sooner
- **Procedural numbers** — generated on the fly, never repeat
- **Particle fill-in-the-blank** — full sentences with a visual blank that fills in with your answer
- **Streak counter** 🔥, exit confirmation, per-question explanations

---

## Project structure

```
japanese-quiz/
├── index.html        ← HTML + CSS (no data, no logic)
├── quiz.js           ← engine: loader, picker, romaji checker, UI
└── data/
    ├── hiragana.json
    ├── katakana.json
    ├── kanji.json
    ├── particle.json
    ├── time.json
    ├── counters.json
    └── README.md     ← data format docs
```

**Questions live in `data/*.json`** — to add questions, edit the JSON. No code changes needed.

---

## How to run locally

The app loads data via `fetch()`, which browsers block on `file://` URLs — so you need a local web server:

```bash
# Python (built-in on Mac/Linux)
python3 -m http.server 8080

# or Node
npx serve .
```

Then open `http://localhost:8080`. 

> On Netlify / GitHub Pages this is not an issue — everything is served over HTTP automatically.

---

## How to add questions

Append a JSON object to the relevant file in `data/`. Format:

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

**Particle questions** use `___` for the blank and need two extra fields:

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

**Kanji** get two objects each — one for reading, one for meaning:

```json
{ "category":"kanji", "level":"easy", "q":"山", "a":"やま (yama)", "d":["かわ (kawa)","き (ki)","ひ (hi)"], "note":"山 = やま — mountain", "hint":"How do you read this kanji?" },
{ "category":"kanji", "level":"easy", "q":"山", "a":"mountain", "d":["river","tree","fire"], "note":"山 = やま (yama)", "hint":"What does this kanji mean?" }
```

### Distractor rules (important — prevents answer leaks!)

- **Counters**: counter reading only — `"いっこ"`, never `"りんご いっこ"` (the object name reveals the answer)
- **Kana**: romaji only in options — `"neko"`, not `"ねこ (neko)"`
- **Kanji reading questions**: kana options only; **meaning questions**: English only — never mix
- **Days/months**: reading only — `"げつようび"`, not `"Monday (月曜日)"`

Full format docs: [`data/README.md`](./data/README.md)

---

## Typing mode details

When "Type answer" is selected, hiragana, katakana, and numbers questions show a text input instead of buttons (other categories stay multiple choice).

Checking rules:
- Case insensitive, leading/trailing/internal whitespace ignored
- Hepburn romanization required: **shi** not si, **chi** not ti, **tsu** not tu, **fu** not hu — Kunrei input is marked wrong with an explanation
- One-letter typos (`neka` for `neko`) count as correct with a spelling reminder
- Numbers accept alternate readings: yon/shi, nana/shichi, kyuu/ku

---

## Deploying

See [DEPLOY.md](./DEPLOY.md) — Netlify drag & drop takes ~2 minutes, GitHub Pages also works. Both serve the JSON files correctly with zero configuration.

---

## Tech stack

- Vanilla HTML/CSS/JS — zero frameworks, zero build step, zero dependencies
- Google Fonts (Noto Sans JP + Inter) from CDN
- Data as plain JSON — easy to contribute, easy to validate

---

## Contributing

PRs welcome! The easiest contribution is adding questions to `data/*.json` — follow the format above.

Roadmap ideas:
- [ ] JLPT N2/N1 kanji
- [ ] Grammar patterns (〜ている、〜たい、〜なければならない...)
- [ ] Progress saved across sessions (localStorage)
- [ ] Review mode — list wrong answers after each quiz
- [ ] Audio pronunciation (Web Speech API)
- [ ] Keigo (honorific speech)

---

## License

MIT — free to use, modify, and share.
