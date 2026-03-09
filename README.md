# EOS Process Documenter — La Vaquita Flea Market

An AI-powered agent that walks team members through the EOS 3-Step Process Documentation method and produces branded, downloadable process sheets.

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- A free [Vercel account](https://vercel.com/signup) (sign up with GitHub)
- A free [GitHub account](https://github.com/signup)  
- An [Anthropic API key](https://console.anthropic.com/settings/keys)

### Step-by-Step

**1. Push this project to GitHub**

Create a new repository on GitHub, then:

```bash
cd eos-deploy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**2. Deploy on Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Click "Import Git Repository" and select the repo you just pushed
- Vercel auto-detects it's a Next.js project — no config needed
- Before clicking "Deploy", expand **Environment Variables** and add:
  - **Key:** `ANTHROPIC_API_KEY`
  - **Value:** your Anthropic API key (starts with `sk-ant-`)
- Click **Deploy**

**3. Share the URL**

Vercel gives you a URL like `https://your-project.vercel.app`. Share that with your leadership team. Done.

---

## Alternative: Deploy to Netlify

### Step-by-Step

**1. Push to GitHub** (same as above)

**2. Deploy on Netlify**

- Go to [app.netlify.com](https://app.netlify.com)
- Click "Add new site" → "Import an existing project"
- Connect your GitHub repo
- Set build settings:
  - **Build command:** `npm run build`
  - **Publish directory:** `.next`
- Go to **Site settings → Environment variables** and add:
  - **Key:** `ANTHROPIC_API_KEY`
  - **Value:** your API key
- Install the Next.js plugin: Go to **Plugins** and search for `@netlify/plugin-nextjs`
- Trigger a redeploy

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.local.example .env.local
# Edit .env.local and paste your Anthropic API key

# 3. Run the dev server
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
eos-deploy/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js      ← Server-side API proxy (hides your API key)
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx               ← Main app UI (all client-side)
├── .env.local.example          ← Template for your API key
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## How It Works

- **`app/page.jsx`** — The full chat UI. Calls `/api/chat` (your own server) instead of the Anthropic API directly. Your API key never touches the browser.
- **`app/api/chat/route.js`** — An Edge Function that receives messages from the frontend, adds your API key, forwards the request to Anthropic, and returns the response. This is where `max_tokens`, the model, and the system prompt are configured.

## Configuration

All configuration lives in `app/api/chat/route.js`:

| Setting | Current Value | What It Does |
|---------|--------------|--------------|
| `model` | `claude-sonnet-4-20250514` | Which Claude model to use |
| `max_tokens` | `5000` | Maximum response length |
| `cache_control` | `ephemeral` | Prompt caching (saves ~90% on system prompt tokens) |

## Costs

At ~6 process documents per month: **~$1–2/month** on the Anthropic API.
