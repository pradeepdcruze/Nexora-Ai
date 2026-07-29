# Nexora AI — AI-Powered Career Intelligence & Mock Interview Platform

Nexora AI is a comprehensive AI-powered career intelligence web application. It builds an evolving digital **Career Twin** from your resume, skill assessments, and mock interviews to provide hyper-personalized role matches, skill-gap analytics, and real-time interview prep.

---

## 🌟 Key Features

- **AI Mock Interview Simulator**: Real-time simulated interviews across Technical, HR, and STAR Behavioral rounds powered by Gemini 1.5 Flash REST API with dynamic fallbacks.
- **Strict Multi-Criteria Evaluation**: Evaluates candidate responses for *Relevance, Technical Accuracy, Communication, Confidence, Grammar, Completeness, and Problem Solving*.
- **Living Career Twin Engine**: Dynamic profile engine calculating job readiness, skill mastery, and targeted improvement plans.
- **Resume Intelligence**: Document parser supporting PDF and DOCX uploads with skill extraction and ATS optimization tips.
- **Opportunity Scanner**: Real-time role matching percentages based on user skill vectors and salary benchmarks.
- **Progress Genome**: Interactive growth visualization using Recharts to track performance trajectories over time.
- **Account & Settings Management**: Save profile edits, custom avatar uploads, theme customization (Dark/Light mode), and Supabase synchronization.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS, Framer Motion
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL DB, Row-Level Security, Supabase Auth)
- **AI Integrations**: Google Gemini REST API (1.5 Flash)
- **Charts & Data Viz**: Recharts
- **Document Parsing**: `pdf-parse`, `mammoth`

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/pradeepdcruze/Nexora-Ai.git
cd Nexora-Ai

# Install dependencies
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using Nexora AI.

### 5. Building for Production

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License.
