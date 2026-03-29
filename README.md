# **ET Story Arc Tracker**

> Turning fragmented business news into structured, explorable intelligence.

---

## **Overview**

Business news is still consumed as separate articles, forcing users to manually piece together timelines, context, and insights.

**ET Story Arc Tracker** transforms journalism from The Economic Times into a **single, structured story experience** using a multi-stage AI pipeline powered by Groq — enabling users to understand, analyze, and interact with any business topic in one place.

---

## **What You Get**

Enter a topic (e.g., *“Byju’s collapse”*) and instantly get:

* Timeline of key events
* Sentiment trend across coverage
* Key players involved
* Contrarian (underreported) insight
* Forward-looking predictions
* Follow-up Q&A grounded in data

---

## **How It Works**

```text
User Query
   ↓
Query Expansion (LLM)
   ↓
ET Article Scraping
   ↓
Structured Extraction (LLM)
   ↓
Synthesis (LLM)
   ↓
StoryArc Object → UI
```

* Multi-stage AI pipeline using Llama 3.3 70B via Groq
* Structured JSON outputs power UI components
* Real-time pipeline updates via Server-Sent Events (SSE)

---

## **Tech Stack**

**Frontend**

* Next.js, React, TypeScript
* Tailwind CSS, Recharts

**Backend**

* FastAPI (async pipeline orchestration)
* BeautifulSoup, httpx (scraping)

**AI Layer**

* Groq API
* Model: Llama 3.3 70B
* Used for:

  * Query expansion
  * Structured extraction
  * Story synthesis
  * Follow-up Q&A

---

## **Key Highlights**

* Multi-stage AI architecture (not a single prompt)
* Structured data → real UI (not just text output)
* Real-time streaming pipeline (SSE)
* Fully grounded Q&A (no hallucinations)

---

## **Run Locally**

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## **Environment Variables**

**Backend**

```
GROQ_API_KEY=your_key_here
```

**Frontend**

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## **Why It Matters**

This project reimagines business news as an **interactive intelligence layer**, not just content — enabling faster understanding, better insights, and deeper engagement.

---

## **Future Improvements**

* Persistent story storage
* Story tracking over time
* Multi-story comparison
* Personalization (portfolio-based insights)
* Multi-source aggregation beyond ET


