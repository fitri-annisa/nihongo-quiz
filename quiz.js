// ════════════════════════════════════════════════════════════════════
// QUIZ.JS — engine + data loader
// Data lives in data/*.json — add questions there, not here
// ════════════════════════════════════════════════════════════════════

// ── DATA ─────────────────────────────────────────────────────────────
const QUIZ_DATA = [];

const DATA_FILES = [
  'data/hiragana.json',
  'data/katakana.json',
  'data/kanji.json',
  'data/particle.json',
  'data/time.json',
  'data/counters.json',
  // numbers.json is procedural — generated on the fly, no data file needed
];

async function loadData() {
  const results = await Promise.all(
    DATA_FILES.map(f =>
      fetch(f)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(err => { console.warn(`Could not load ${f}:`, err.message); return []; })
    )
  );
  results.flat().forEach(item => QUIZ_DATA.push(item));
  console.log(`Loaded ${QUIZ_DATA.length} questions from ${DATA_FILES.length} files`);
}

// ── NUMBER GENERATOR (procedural, infinite) ──────────────────────────
function numToJapanese(n) {
  if (n === 0) return 'ぜろ';
  const ones = ['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
  function t(n) {
    if (n < 10) return ones[n];
    if (n < 100) {
      const d = Math.floor(n/10), r = n%10;
      return (d===1?'':ones[d])+'じゅう'+(r?ones[r]:'');
    }
    if (n < 1000) {
      const d = Math.floor(n/100), r = n%100;
      const h = d===3?'さんびゃく':d===6?'ろっぴゃく':d===8?'はっぴゃく':ones[d]+'ひゃく';
      return h+(r?t(r):'');
    }
    if (n < 10000) {
      const d = Math.floor(n/1000), r = n%1000;
      const k = d===1?'せん':d===3?'さんぜん':d===8?'はっせん':ones[d]+'せん';
      return k+(r?t(r):'');
    }
    if (n < 100000000) {
      const man = Math.floor(n/10000), r = n%10000;
      return t(man)+'まん'+(r?t(r):'');
    }
    return n.toString();
  }
  return t(n);
}

function generateNumberQ(level) {
  let n;
  const pools = {
    easy:   [() => Math.floor(Math.random()*9)+1, () => Math.floor(Math.random()*9)*10+10, () => Math.floor(Math.random()*89)+11],
    medium: [() => Math.floor(Math.random()*900)+100, () => Math.floor(Math.random()*9000)+1000],
    hard:   [() => Math.floor(Math.random()*90000)+10000, () => Math.floor(Math.random()*900000)+100000],
  };
  const pool = pools[level] || pools.easy;
  n = pool[Math.floor(Math.random()*pool.length)]();

  const correct = numToJapanese(n);
  const wrongs = new Set();
  [n-1,n+1,n-10,n+10,n-100,n+100,n*2,Math.floor(n/2)].forEach(w => {
    if (w > 0 && w !== n) wrongs.add(numToJapanese(w));
  });
  while (wrongs.size < 4) {
    const offset = (Math.floor(Math.random()*6)-3) * (level==='easy'?1:level==='medium'?100:1000);
    const w = n + offset;
    if (w > 0 && w !== n) wrongs.add(numToJapanese(w));
  }
  const d = [...wrongs].filter(w=>w!==correct).slice(0,3);
  const display = n.toLocaleString('en-US').replace(/,/g,'，');
  return { category:'numbers', level, _generated:true, q:display, a:correct, d, note:`${display} = ${correct}`, hint:'How do you read this number?' };
}

// ── TYPED ANSWER SUPPORT ─────────────────────────────────────────────
// Categories where typing romaji is supported (answer is romaji or derivable)
const TYPE_SUPPORTED = ['hiragana', 'katakana', 'numbers'];

// Kana → romaji (strict Hepburn: shi, chi, tsu, fu, ji)
const KANA_MAP = {
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
};

function kanaToRomaji(s) {
  let out = '', i = 0;
  while (i < s.length) {
    // sokuon っ — double the next consonant
    if (s[i] === 'っ') {
      const nextTwo = s.substr(i+1, 2);
      const nextOne = s[i+1];
      const next = KANA_MAP[nextTwo] || KANA_MAP[nextOne] || '';
      if (next) out += next[0] === 'c' ? 't' : next[0]; // っち → tchi
      i++;
      continue;
    }
    const two = s.substr(i, 2);
    if (KANA_MAP[two]) { out += KANA_MAP[two]; i += 2; continue; }
    const one = s[i];
    out += KANA_MAP[one] !== undefined ? KANA_MAP[one] : one;
    i++;
  }
  return out;
}

// Normalize user input: lowercase, trim, remove all whitespace
function normalizeAnswer(s) {
  return s.toLowerCase().trim().replace(/\s+/g, '');
}

// Levenshtein distance for "almost correct" detection
function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 99;
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
  return dp[m][n];
}

// Get all accepted romaji answers for a question
function getAcceptedAnswers(q) {
  const accepted = new Set();

  if (q.category === 'numbers') {
    // Answer is kana (e.g. よんじゅうなな) — convert to romaji
    const canonical = kanaToRomaji(q.a);
    accepted.add(canonical);
    // Accept alternate readings: nana↔shichi anywhere in compounds
    accepted.add(canonical.replace(/nana/g, 'shichi'));
    accepted.add(canonical.replace(/shichi/g, 'nana'));
    // Standalone digit alternates: yon↔shi, kyuu↔ku
    if (canonical === 'yon') accepted.add('shi');
    if (canonical === 'shi') accepted.add('yon');
    if (canonical === 'kyuu') accepted.add('ku');
    if (canonical === 'ku') accepted.add('kyuu');
  } else {
    // hiragana/katakana — answer is already romaji ('neko', 'ohayou gozaimasu')
    accepted.add(normalizeAnswer(q.a));
  }

  return [...accepted].map(normalizeAnswer);
}

// Detect Kunrei-shiki / non-Hepburn input (si→shi, ti→chi, tu→tsu...)
// These are marked WRONG with an explanation — not "almost correct" typos
function kunreiToHepburn(s) {
  return s
    .replace(/sya/g,'sha').replace(/syu/g,'shu').replace(/syo/g,'sho')
    .replace(/tya/g,'cha').replace(/tyu/g,'chu').replace(/tyo/g,'cho')
    .replace(/zya/g,'ja').replace(/zyu/g,'ju').replace(/zyo/g,'jo')
    .replace(/si/g,'shi').replace(/ti/g,'chi').replace(/tu/g,'tsu')
    .replace(/hu/g,'fu').replace(/zi/g,'ji');
}

// Check a typed answer. Returns { result: 'correct'|'almost'|'kunrei'|'wrong', closest }
function checkTypedAnswer(input, q) {
  const user = normalizeAnswer(input);
  const accepted = getAcceptedAnswers(q);

  if (accepted.includes(user)) return { result: 'correct', closest: accepted[0] };

  // Kunrei-shiki check: if converting si→shi etc. makes it match, it's a
  // romanization-system error, not a typo — mark wrong with explanation
  const hepburnized = kunreiToHepburn(user);
  if (hepburnized !== user && accepted.includes(hepburnized)) {
    return { result: 'kunrei', closest: accepted.find(a => a === hepburnized) };
  }

  // Fuzzy: levenshtein distance 1 = almost correct (typo tolerance).
  // Disabled when:
  //  - level is easy, OR
  //  - the question itself is a single kana character/digraph (≤2 kana,
  //    e.g. う、か、しゃ、きょ) — regardless of romaji length ("sha" = 3
  //    letters but still ONE kana). Distance 1 on these matches completely
  //    different kana, so a wrong reading would falsely count as a typo.
  const isSingleKana = (q.category === 'hiragana' || q.category === 'katakana') &&
    (q.q.length === 1 || (q.q.length === 2 && 'ゃゅょャュョ'.includes(q.q[1])));
  if (q.level !== 'easy' && !isSingleKana) {
    for (const ans of accepted) {
      if (levenshtein(user, ans) === 1) return { result: 'almost', closest: ans };
    }
  }
  return { result: 'wrong', closest: accepted[0] };
}

// ── ENGINE ────────────────────────────────────────────────────────────
function shuffle(arr) { return arr.slice().sort(()=>Math.random()-0.5); }

const seen = {};         // fingerprint → times shown
const wrongWeights = {}; // fingerprint → wrong answer count

function getKey(item) {
  return `${item.category}|${item.level}|${item.q}|${item.a}`;
}

function getPool(category, level) {
  const items = QUIZ_DATA.filter(item =>
    (category === 'mixed' || item.category === category) &&
    item.level === level
  );
  // Inject fresh procedural number questions every time
  const numCount = category === 'numbers' ? 25 : category === 'mixed' ? 10 : 0;
  const numLevel = category === 'mixed' ? ['easy','medium','hard'][Math.floor(Math.random()*3)] : level;
  for (let i = 0; i < numCount; i++) items.push(generateNumberQ(numLevel));
  return items;
}

function pickQuestions(category, level, count) {
  const pool = getPool(category, level);
  const weighted = pool.map(item => {
    const k = getKey(item);
    const seenCount = seen[k] || 0;
    const wrongBonus = wrongWeights[k] || 0;
    const score = seenCount * 10 - wrongBonus * 5 + Math.random() * 8;
    return { item, score };
  });
  weighted.sort((a,b) => a.score - b.score);
  return weighted.slice(0, count).map(w => ({
    ...w.item,
    opts: buildOpts(w.item.a, w.item.d)
  }));
}

function buildOpts(correct, d) {
  return shuffle([correct, ...shuffle(d).slice(0,3)]);
}

// ── DIFF DESCRIPTIONS ─────────────────────────────────────────────────
const DIFF_DESCS = {
  hiragana:  { easy:'Single kana characters (あ, い, が, じゃ...)', medium:'2–3 character words with meanings', hard:'4+ character words, phrases & place names' },
  katakana:  { easy:'Single kana characters (ア, イ, ガ, ジャ...)', medium:'Loanwords 2–3 chars (コーヒー...)', hard:'Long loanwords (スマートフォン...)' },
  numbers:   { easy:'1–99 (procedural — never repeats!)', medium:'100–9,999 (irregular readings!)', hard:'10,000+ using 万 and 億' },
  counters:  { easy:'Basic: 個、枚、本、匹、冊', medium:'Money, people, vehicles, floors', hard:'Sound changes & mixed counter sentences' },
  time:      { easy:'O\'clock, minutes, days of week', medium:'AM/PM, all 12 months, irregular dates', hard:'Duration, relative time, full expressions' },
  kanji:     { easy:'JLPT N5 — reading & meaning', medium:'JLPT N4 — reading & meaning', hard:'JLPT N3 — reading & meaning' },
  particle:  { easy:'は、が、を、に、で — core particles', medium:'と、も、へ、から、まで、より — intermediate', hard:'Complex multi-particle, passive, nuanced usage' },
  mixed:     { easy:'Easy questions from all categories', medium:'Medium questions from all categories', hard:'Hard questions from all categories' },
};

function getPoolSize(category, level) {
  const base = QUIZ_DATA.filter(i =>
    (category==='mixed'||i.category===category) && i.level===level
  ).length;
  if (category==='numbers'||category==='mixed') return base + '+ (∞ numbers)';
  return base;
}

// ── STATE ─────────────────────────────────────────────────────────────
let selMode = 'hiragana', selDiff = 'easy', selCount = 20, selAnswerMode = 'choice';
let questions = [], current = 0, score = 0, answered = false;
let bestStreak = 0, curStreak = 0;

const AMODE_DESCS = {
  choice: '',
  type: 'Type the romaji answer (hiragana, katakana & numbers). Other categories stay multiple choice.',
};

function updateInfo() {
  document.getElementById('diffDesc').textContent = DIFF_DESCS[selMode]?.[selDiff] || '';
  const size = getPoolSize(selMode, selDiff);
  document.getElementById('poolInfo').textContent = `${size} questions in pool`;
  document.getElementById('amodeDesc').textContent = AMODE_DESCS[selAnswerMode] || '';
}

document.getElementById('modeGrid').addEventListener('click', e => {
  const card = e.target.closest('.mode-card');
  if (!card) return;
  document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('active'));
  card.classList.add('active');
  selMode = card.dataset.mode;
  updateInfo();
});

document.getElementById('diffRow').addEventListener('click', e => {
  const btn = e.target.closest('.diff-btn');
  if (!btn) return;
  document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selDiff = btn.dataset.diff;
  updateInfo();
});

document.getElementById('countBtns').addEventListener('click', e => {
  const btn = e.target.closest('.count-btn');
  if (!btn) return;
  document.querySelectorAll('#countBtns .count-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selCount = parseInt(btn.dataset.count);
  document.getElementById('countCustom').value = '';
});

document.getElementById('countCustom').addEventListener('input', e => {
  const val = parseInt(e.target.value);
  if (val >= 5 && val <= 100) {
    document.querySelectorAll('#countBtns .count-btn').forEach(b=>b.classList.remove('active'));
    selCount = val;
  }
});

// Answer mode toggle (multiple choice / type answer)
document.getElementById('answerModeBtns').addEventListener('click', e => {
  const btn = e.target.closest('.count-btn');
  if (!btn) return;
  document.querySelectorAll('#answerModeBtns .count-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selAnswerMode = btn.dataset.amode;
  updateInfo();
});

// ── QUIZ FLOW ─────────────────────────────────────────────────────────
function startQuiz() {
  const customVal = parseInt(document.getElementById('countCustom').value);
  const count = (customVal >= 5 && customVal <= 100) ? customVal : selCount;
  questions = pickQuestions(selMode, selDiff, count);
  current = 0; score = 0; answered = false; curStreak = 0; bestStreak = 0;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quizBox').style.display = 'block';
  document.getElementById('resultBox').classList.remove('show');
  document.getElementById('questionScreen').style.display = 'block';
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  const total = questions.length;
  answered = false;

  document.getElementById('progressFill').style.width = ((current/total)*100)+'%';
  document.getElementById('progressLabel').textContent = (current+1)+' / '+total;
  document.getElementById('scoreBadge').textContent = '✓ '+score;

  const typeLabels = { hiragana:'Hiragana', katakana:'Katakana', numbers:'Numbers', counters:'Counters', time:'Time & Date', kanji:'Kanji', particle:'Particles' };
  document.getElementById('qType').textContent = typeLabels[q.category] || 'Quiz';

  const el = document.getElementById('qText');
  const hintEl = document.getElementById('qHint');

  if (q._isParticle) {
    el.className = 'sentence-display';
    const parts = q.q.split('___');
    el.innerHTML = parts.map((p,i) =>
      i < parts.length-1 ? p+'<span class="sentence-blank" id="sb'+i+'">　</span>' : p
    ).join('');
    hintEl.innerHTML = (q.translation ? '<span class="sentence-translation">'+q.translation+'</span><br>' : '')+'Choose the correct particle(s):';
  } else {
    el.className = 'question-jp'+(q.q.length > 6 ? ' small' : '');
    el.textContent = q.q;
    hintEl.textContent = q.hint || 'How do you read this?';
  }

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  // Typed answer mode — only for supported categories (others fall back to choice)
  const useTyping = selAnswerMode === 'type' && TYPE_SUPPORTED.includes(q.category);

  if (useTyping) {
    grid.style.display = 'block';
    const row = document.createElement('div');
    row.className = 'type-row';
    const input = document.createElement('input');
    input.className = 'type-input';
    input.id = 'typeInput';
    input.type = 'text';
    input.placeholder = 'Type romaji answer...';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    const submit = document.createElement('button');
    submit.className = 'type-submit';
    submit.id = 'typeSubmit';
    submit.textContent = 'Check';
    submit.onclick = () => submitTyped(q);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !answered) submitTyped(q);
    });
    row.appendChild(input);
    row.appendChild(submit);
    grid.appendChild(row);
    setTimeout(() => input.focus(), 50);
  } else {
    grid.style.display = 'grid';
    q.opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(btn, opt, q.a, q);
      grid.appendChild(btn);
    });
  }

  document.getElementById('feedback').className = 'feedback';
  document.getElementById('nextBtn').classList.remove('show');
}

// Handle typed answer submission
function submitTyped(q) {
  if (answered) return;
  const input = document.getElementById('typeInput');
  const raw = input.value;
  if (!raw.trim()) return; // ignore empty submit
  answered = true;

  const k = getKey(q);
  seen[k] = (seen[k]||0)+1;

  input.disabled = true;
  document.getElementById('typeSubmit').disabled = true;

  const { result, closest } = checkTypedAnswer(raw, q);
  const fb = document.getElementById('feedback');
  const note = q.note ? ' — '+q.note : '';

  if (result === 'correct') {
    score++;
    curStreak++;
    if (curStreak > bestStreak) bestStreak = curStreak;
    delete wrongWeights[k];
    input.classList.add('input-correct');
    fb.className = 'feedback correct-fb show';
    fb.textContent = '✓ Correct!'+(curStreak>2?' 🔥 '+curStreak+' in a row!':'')+note;
  } else if (result === 'almost') {
    // Counted as correct, but show proper spelling — yellow warning style
    score++;
    curStreak++;
    if (curStreak > bestStreak) bestStreak = curStreak;
    delete wrongWeights[k];
    input.classList.add('input-almost');
    fb.className = 'feedback almost-fb show';
    fb.textContent = '❗ Almost! Correct spelling: '+closest+note;
  } else if (result === 'kunrei') {
    // Non-Hepburn romanization — wrong, with explanation
    curStreak = 0;
    wrongWeights[k] = (wrongWeights[k]||0)+1;
    input.classList.add('input-wrong');
    fb.className = 'feedback wrong-fb show';
    fb.textContent = '✗ Use Hepburn romanization: '+closest+' (shi not si, chi not ti, tsu not tu)'+note;
  } else {
    curStreak = 0;
    wrongWeights[k] = (wrongWeights[k]||0)+1;
    input.classList.add('input-wrong');
    fb.className = 'feedback wrong-fb show';
    fb.textContent = '✗ Answer: '+closest+note;
  }
  document.getElementById('scoreBadge').textContent = '✓ '+score;
  document.getElementById('nextBtn').classList.add('show');
}

function selectAnswer(btn, chosen, correct, q) {
  if (answered) return;
  answered = true;

  const k = getKey(q);
  seen[k] = (seen[k]||0)+1;

  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });

  if (q._isParticle) {
    document.querySelectorAll('[id^="sb"]').forEach(bl => {
      bl.textContent = chosen===correct ? correct : chosen;
      bl.className = 'sentence-blank '+(chosen===correct?'filled-correct':'filled-wrong');
    });
  }

  const fb = document.getElementById('feedback');
  const note = q.note ? ' — '+q.note : '';

  if (chosen === correct) {
    score++;
    curStreak++;
    if (curStreak > bestStreak) bestStreak = curStreak;
    delete wrongWeights[k];
    btn.classList.add('correct');
    fb.className = 'feedback correct-fb show';
    fb.textContent = '✓ Correct!'+(curStreak>2?' 🔥 '+curStreak+' in a row!':'')+note;
  } else {
    curStreak = 0;
    wrongWeights[k] = (wrongWeights[k]||0)+1;
    btn.classList.add('wrong');
    fb.className = 'feedback wrong-fb show';
    fb.textContent = '✗ Answer: '+correct+note;
  }
  document.getElementById('scoreBadge').textContent = '✓ '+score;
  document.getElementById('nextBtn').classList.add('show');
}

function nextQuestion() {
  current++;
  if (current >= questions.length) showResult();
  else renderQuestion();
}

function showResult() {
  document.getElementById('questionScreen').style.display = 'none';
  document.getElementById('progressFill').style.width = '100%';
  const total = questions.length;
  const pct = Math.round((score/total)*100);
  document.getElementById('resultScore').textContent = score+'/'+total;
  document.getElementById('resultStreak').textContent = bestStreak > 2 ? '🔥 Best streak: '+bestStreak+' in a row' : '';
  const msgs = [[0,40,'もう一度！Keep at it!'],[40,60,'いいね！Getting better!'],[60,80,'よくできました！Well done!'],[80,95,'すごい！Very impressive!'],[95,101,'完璧です！Perfect! 🎉']];
  const m = msgs.find(([lo,hi])=>pct>=lo&&pct<hi);
  document.getElementById('resultMsg').textContent = m ? m[2] : 'よくできました！';
  document.getElementById('resultBox').classList.add('show');
}

function restartQuiz() {
  document.getElementById('resultBox').classList.remove('show');
  document.getElementById('questionScreen').style.display = 'block';
  startQuiz();
}

function goHome() {
  document.getElementById('quizBox').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}

function confirmExit() { document.getElementById('confirmOverlay').classList.add('show'); }
function closeConfirm() { document.getElementById('confirmOverlay').classList.remove('show'); }
function doExit() { closeConfirm(); goHome(); }

// ── INIT ──────────────────────────────────────────────────────────────
(async () => {
  const startBtn = document.getElementById('startBtn');
  const poolInfo = document.getElementById('poolInfo');

  try {
    await loadData();
    startBtn.disabled = false;
    startBtn.textContent = 'Start Quiz →';
    updateInfo();
  } catch (err) {
    poolInfo.textContent = 'Error loading data. Run via a web server (not file://).';
    startBtn.textContent = 'Cannot start';
    console.error('Data load failed:', err);
  }
})();
