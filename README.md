# 🎯 HireTrack AI — Intelligent Job Application Tracker

An AI-powered job search companion that helps candidates track applications, optimize resumes with ATS scoring, auto-generate tailored cover letters, and get interview prep coaching — all in one place.


## Features

### AI Resume Builder
- **ATS Score Checker** — Analyze resume against job description, score 0-100
- **Keyword Gap Analysis** — Identify missing keywords from job descriptions
- **One-click Optimization** — GPT rewrites resume bullets to match job requirements
- **Multiple Formats** — Export to PDF, Word, or JSON Resume standard
- **Version Control** — Keep tailored resume versions per company

### Application Tracker
- **Kanban Pipeline** — Track jobs: Saved → Applied → Phone Screen → Interview → Offer → Rejected
- **Job Scraper** — Paste any LinkedIn/Indeed/Naukri URL to auto-fill job details
- **Smart Reminders** — Follow-up reminders, interview countdowns
- **Salary Insights** — Market salary data from aggregated sources
- **Notes & Documents** — Attach notes, contacts, and files per application

### AI Career Assistant
- **Cover Letter Generator** — Tailored cover letter per job in seconds
- **Interview Coach** — Practice answers to likely interview questions
- **Cold Email Writer** — Personalized recruiter outreach emails
- **Job Match Score** — AI scores how well your profile fits a job (0-100%)
- **Career Path Analysis** — Suggest roles and skills to grow towards

### Analytics
- **Application Funnel** — Response rate, interview rate, offer rate
- **Salary Negotiation Tracker** — Record offers and counteroffers
- **Weekly Goals** — Set and track applications-per-week targets
- **Job Market Heatmap** — See where demand is highest for your skills

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| AI | OpenAI GPT-4o, GPT-4o-mini |
| PDF Generation | Puppeteer (resume export) |
| Web Scraping | Cheerio + Playwright (job detail extraction) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js |
| Email | Resend |
| Charts | Recharts |
| Deployment | Vercel |

## Project Structure

```
├── app/
│   ├── dashboard/page.tsx          # Overview: stats, recent activity
│   ├── resume/
│   │   ├── page.tsx                # Resume list
│   │   ├── [id]/page.tsx           # Resume editor
│   │   └── [id]/ats-check/page.tsx # ATS score checker
│   ├── jobs/
│   │   ├── page.tsx                # Job board (saved jobs)
│   │   └── [id]/page.tsx           # Job detail + AI match
│   └── api/
│       ├── resume/
│       │   ├── analyze/route.ts    # ATS score + keyword gap
│       │   └── optimize/route.ts   # GPT resume optimization
│       ├── jobs/scrape/route.ts    # Job URL scraper
│       ├── ai/
│       │   ├── cover-letter/route.ts
│       │   ├── interview-prep/route.ts
│       │   └── job-match/route.ts
│       └── applications/route.ts
├── components/
│   ├── resume/
│   │   ├── ResumeEditor.tsx        # Rich text resume builder
│   │   ├── ATSScoreCard.tsx        # ATS analysis UI
│   │   └── KeywordHighlighter.tsx
│   ├── jobs/
│   │   ├── ApplicationKanban.tsx   # Drag-and-drop pipeline
│   │   └── JobMatchScore.tsx
│   └── ai/
│       ├── CoverLetterModal.tsx
│       └── InterviewCoach.tsx
└── models/
    ├── Resume.ts
    ├── JobApplication.ts
    └── User.ts
```

## Getting Started

```bash
git clone https://github.com/sandeep-dev/hiretrack-ai.git
cd hiretrack-ai
npm install
cp .env.example .env.local
npm run dev
```

## ATS Score Algorithm

The ATS analyzer compares your resume against job descriptions using:

1. **Keyword Match (40%)** — Hard skills, tools, certifications
2. **Soft Skills (15%)** — Leadership, communication, teamwork
3. **Formatting Score (20%)** — Clean structure, no tables/images, proper headers
4. **Quantified Achievements (15%)** — % of bullet points with numbers
5. **Length & Readability (10%)** — Ideal: 1-2 pages, Flesch score

```
Example Output:
ATS Score: 73/100
Missing Keywords: Docker, GraphQL, AWS Lambda
Suggestions:
  • Add "Agile/Scrum" to experience section
  • Quantify 4 more bullet points with metrics
  • Add "TypeScript" to skills (mentioned 5x in JD)
```

## Cover Letter Generation

```typescript
// POST /api/ai/cover-letter
{
  "jobTitle": "Senior React Developer",
  "company": "Stripe",
  "jobDescription": "...",
  "resumeId": "...",
  "tone": "professional" // or "enthusiastic" | "concise"
}

// Response (streamed)
"Dear Hiring Manager at Stripe..."
```

## License

MIT License
