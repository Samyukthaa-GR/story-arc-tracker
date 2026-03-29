# ET Story Arc Tracker

> Built for the Economic Times AI Hackathon 2026.
> Enter any business story. Get a complete narrative — timeline, players, sentiment, contrarian view, and predictions — built entirely from Economic Times journalism.

---

## What it does

When a user types "Byju's collapse" or "Adani Hindenburg", the app:

1. Expands the query into 4–5 ET topic slugs (via Claude)
2. Scrapes ET topic pages and fetches full article bodies
3. Runs parallel AI extraction on each article — events, entities, sentiment
4. Synthesizes a contrarian view and forward-looking predictions
5. Streams all of this to the frontend progressively via SSE

---

## Architecture

```
Frontend (Next.js)
    ↓  POST /api/story  (SSE stream)
Backend (FastAPI)
    ├── Query expansion          → Claude API
    ├── ET scraper               → economictimes.indiatimes.com
    ├── Parallel extraction      → Claude API (asyncio.gather)
    ├── Synthesis                → Claude API
    └── In-memory cache          → 30-min TTL

Output modules:
    Timeline · Players · Sentiment series · Contrarian view · Predictions
```

---

## AI pipeline design

### Why parallel extraction?
Each article is extracted independently with `asyncio.gather`. 12 articles that would take 60s sequentially complete in ~8s. This is the key architectural decision that makes the demo feel fast.

### Prompt design
Three distinct prompts, each returning structured JSON:

- **Query expansion**: topic → ET-optimised slugs. Keeps search narrow to ET's URL structure.
- **Per-article extraction**: events, entities, sentiment score (–1 to +1), key quote. Strict JSON schema enforced via prompt.
- **Synthesis**: receives condensed data from all articles, outputs contrarian view + predictions. Deliberately asked to challenge the dominant narrative, not summarise it.

### Caching
Simple in-memory dict cache with 30-min TTL. Repeated searches for the same topic are instant. Pre-cache 4 demo stories before the live demo.

---

## Project structure

```
story-arc-tracker/
├── backend/
│   ├── main.py                  # FastAPI app + CORS
│   ├── requirements.txt
│   ├── routers/
│   │   └── story.py             # /api/story (SSE) + /api/followup
│   ├── services/
│   │   ├── scraper.py           # ET topic page + article body scraper
│   │   └── ai_pipeline.py       # Query expansion, extraction, synthesis, Q&A
│   └── utils/
│       ├── models.py            # Pydantic models (shared schema)
│       ├── builder.py           # Merges extractions → StoryArc object
│       └── cache.py             # In-memory TTL cache
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Main page — search + story arc layout
    │   │   └── layout.tsx
    │   ├── components/
    │   │   ├── shared/
    │   │   │   ├── SearchBar.tsx
    │   │   │   ├── StatusBar.tsx     # Live pipeline progress
    │   │   │   ├── StoryHeader.tsx   # Summary + phase badge
    │   │   │   └── FollowupChat.tsx  # Grounded Q&A
    │   │   ├── timeline/
    │   │   │   └── Timeline.tsx      # Vertical event timeline
    │   │   ├── sentiment/
    │   │   │   └── SentimentChart.tsx # Recharts line chart
    │   │   ├── players/
    │   │   │   └── PlayersPanel.tsx   # Entity cards
    │   │   ├── contrarian/
    │   │   │   └── ContrarianPanel.tsx
    │   │   └── predictions/
    │   │       └── PredictionsPanel.tsx
    │   ├── lib/
    │   │   └── api.ts           # SSE client + followup fetch
    │   └── types/
    │       └── index.ts         # Shared TypeScript types
    └── package.json
```

---

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
# → http://localhost:3000
```

---

## Deployment

| Service | What to deploy |
|---------|---------------|
| Vercel  | `frontend/` — zero config Next.js |
| Railway | `backend/` — add `ANTHROPIC_API_KEY` env var, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT` |

After deploying backend, set `NEXT_PUBLIC_API_URL` in Vercel environment variables to your Railway URL.

---

## Demo tips

- Use pre-loaded story buttons — they hit the cache and load instantly
- Best stories for demo: **Byju's**, **Adani-Hindenburg**, **Paytm RBI action**
- The sentiment chart and timeline populate via SSE streaming — don't skip showing the loading states, they communicate the pipeline depth to judges
- Point out: "every data point links back to the original ET article"

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, asyncio |
| AI | Anthropic Claude (claude-sonnet-4) |
| Scraping | httpx, BeautifulSoup4 |
| Streaming | Server-Sent Events (SSE) |
| Cache | In-memory dict (upgradeable to Redis) |
