# 🧪 VibeCheck

> **The "Sanity Sandbox" for AI-Built Code** — Audit your GitHub repo for hidden cloud costs and security risks before you launch.

![VibeCheck Banner](https://img.shields.io/badge/Status-MVP-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 What is VibeCheck?

VibeCheck is a **cloud cost estimator and security auditor** designed for non-technical founders and indie hackers who build with AI tools like Cursor, Copilot, or ChatGPT.

**The Problem:** AI-generated code often contains hidden inefficiencies — API calls in loops, unoptimized database queries, and exposed secrets — that can silently drain your cloud budget.

**The Solution:** Paste your GitHub URL, and VibeCheck's AI analyzes your codebase to find:
- 💸 **Cost Leaks** — Loops, polling, N+1 queries that inflate your monthly bill
- 🔓 **Security Risks** — Hardcoded secrets, injection vulnerabilities, exposed APIs
- 🛠️ **Fixer Prompts** — Copy-paste solutions to fix issues instantly

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Sieve** | Automatically fetches and filters relevant code files from public GitHub repos |
| 🧠 **AI Analyst** | Powered by Google Gemini 2.5 Flash for intelligent code analysis |
| 💰 **Cost Calculator** | Estimates monthly waste based on traffic assumptions (1,000 MAU) |
| 🔒 **Security Scanner** | Detects exposed keys, injection flaws, and other vulnerabilities |
| 🎨 **Leaking Bucket UI** | Visual metaphor showing your code "leaking" money |
| 💳 **$1 Unlock** | Premium fixer prompts behind a Stripe payment wall |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API Keys for: Gemini, Supabase, Stripe

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/vibe-check.git
cd vibe-check

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local
```

### Environment Variables

Edit `.env.local` with your actual keys:

```env
# Google Gemini API (Required)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (Required for payment tracking)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Required for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key

# App URL (Used for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  fingerprint text not null,
  is_paid boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.scans enable row level security;

create policy "Enable insert for all users" on public.scans
  for insert with check (true);

create policy "Enable read for all users" on public.scans
  for select using (true);
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🏗️ Architecture

```
vibe-check/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── fetch-repo.ts  # GitHub file fetcher
│   │   ├── analyze-code.ts # Gemini AI analysis
│   │   └── payment.ts     # Stripe integration
│   └── page.tsx           # Main entry point
├── components/
│   ├── landing-page.tsx   # Main UI component
│   ├── leaking-bucket.tsx # Visual cost indicator
│   └── locked-stepper.tsx # Progressive disclosure UI
├── lib/
│   ├── gemini.ts          # Gemini AI client
│   ├── prompts.ts         # AI system prompts
│   └── supabase.ts        # Database client
└── scripts/
    └── list-models.js     # Gemini model debugger
```

---

## 🧠 How It Works

### 1. The Smart Sieve
Fetches up to 30 relevant code files from a public GitHub repo, filtering out:
- `node_modules`, `.git`, `dist`, `build`
- Lock files, images, binaries

### 2. The AI Analyst
Uses Gemini 2.5 Flash to scan code for **5 cost patterns**:

| Pattern | Description | Cost Multiplier |
|---------|-------------|-----------------|
| 🔄 Loop Tax | API calls inside loops | ×100 |
| ⏰ Polling Penalty | setInterval API calls | ×2,160/day |
| 📊 N+1 Query | DB calls inside loops | ×iterations |
| 🖼️ Heavy Asset | Large files without CDN | +$50/mo |
| 🔁 Unoptimized Fetch | No caching | ×3 |

### 3. The Arcade Payment
After seeing the "leak", users can unlock detailed fixer prompts for $1 via Stripe Checkout.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + Shadcn/UI
- **AI:** Google Gemini 2.5 Flash
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe Checkout
- **Deployment:** Vercel (recommended)

---

## 🔧 Development

### Debug Mode

To bypass the payment wall during development:

```typescript
// In components/locked-stepper.tsx
const DEBUG_MODE = true; // Set to false for production
```

### Test Gemini Connection

```bash
node scripts/list-models.js
```

---

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set:
- `NEXT_PUBLIC_APP_URL` to your production domain
- All API keys in Vercel's environment settings

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — feel free to use this project for your own purposes.

---

## 🙏 Acknowledgments

- Built with ❤️ using AI-assisted development
- Inspired by the "Vibe Coding" movement
- Special thanks to the open-source community

---

**Made for indie hackers who ship fast and want to ship smart.** 🚀
