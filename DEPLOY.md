# Deploying 日本語 Quiz

Two free options: **Netlify** (recommended, easiest) or **GitHub Pages**.

> **Note:** This app loads question data from `data/*.json` via `fetch()`, so it must be served over HTTP — opening `index.html` directly via `file://` will not work. Both Netlify and GitHub Pages handle this automatically with zero configuration.

---

## Option 1 — Netlify (recommended)

### Method A: Drag & Drop (fastest)

1. Go to **[netlify.com/drop](https://app.netlify.com/drop)**
2. Drag your project folder (containing `index.html`, `quiz.js`, and the `data/` folder) onto the page
3. Netlify deploys instantly and gives you a URL like `https://random-name-123.netlify.app`
4. ✅ Done

> To update later, drag and drop again — Netlify keeps version history.

### Method B: Connect to GitHub (auto-deploy on every push)

Best for ongoing development — every push redeploys automatically.

**Step 1 — Push your project to GitHub**

```bash
git init
git add .
git commit -m "Initial commit — Japanese Quiz app"
git remote add origin https://github.com/YOUR_USERNAME/japanese-quiz.git
git branch -M main
git push -u origin main
```

**Step 2 — Connect Netlify**

1. Sign up at **[app.netlify.com](https://app.netlify.com)** (free, use your GitHub account)
2. **Add new site** → **Import an existing project** → **GitHub**
3. Pick your `japanese-quiz` repository
4. Build settings:

   | Setting | Value |
   |---|---|
   | Base directory | *(leave empty)* |
   | Build command | *(leave empty)* |
   | Publish directory | `.` |

5. Click **Deploy site** — live at `https://your-site-name.netlify.app`

**Step 3 — Custom site name (optional)**

Site configuration → Site details → **Change site name** → e.g. `nihongo-quiz` → `https://nihongo-quiz.netlify.app`

**Step 4 — Custom domain (optional)**

Domain management → **Add custom domain** → add a CNAME record at your DNS provider. Netlify provisions free HTTPS automatically.

### Daily workflow after setup

```bash
# edit data/kanji.json, test locally, then:
git add .
git commit -m "Add N2 kanji questions"
git push
# → Netlify redeploys automatically in ~30 seconds
```

---

## Option 2 — GitHub Pages

**Step 1 — Push to GitHub** (same as above)

**Step 2 — Enable Pages**

1. Repository → **Settings** → **Pages** (left sidebar)
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**

Live at:
```
https://YOUR_USERNAME.github.io/japanese-quiz/
```

First deploy takes 1–2 minutes; subsequent pushes auto-deploy.

> Make sure your main file is named `index.html` (not `japanese-quiz.html`) — GitHub Pages looks for it in the root.

---

## Netlify vs GitHub Pages

| | Netlify | GitHub Pages |
|---|---|---|
| Setup time | ~2 min (drag & drop) | ~5 min |
| Custom domain + HTTPS | ✅ Free | ✅ Free |
| Auto-deploy on push | ✅ | ✅ |
| Deploy previews on PRs | ✅ | ❌ |
| Serves `data/*.json` correctly | ✅ | ✅ |

Both work perfectly for this app. Netlify drag & drop is the fastest path to a URL.

---

## Local development

```bash
# Python (built-in on Mac/Linux)
python3 -m http.server 8080

# or Node
npx serve .
```

Open `http://localhost:8080`. The server is only needed because browsers block `fetch()` on `file://` URLs — there's no build step or backend.

---

## Repo structure checklist

Before deploying, your repo should look like:

```
japanese-quiz/
├── index.html
├── quiz.js
├── README.md
├── DEPLOY.md
└── data/
    ├── hiragana.json
    ├── katakana.json
    ├── kanji.json
    ├── particle.json
    ├── time.json
    ├── counters.json
    └── README.md
```

The `data/` folder **must** be deployed alongside `index.html` — the app fetches from relative paths like `data/kanji.json`.
