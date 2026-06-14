<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&pause=1000&color=5B6EF5&center=true&vCenter=true&width=600&lines=Chatty;AI-Powered+Customer+Service+Platform" alt="Chatty" />

**AI-Powered Customer Service Platform for Indonesian SMBs.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FF6F00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude-5B6EF5?style=for-the-badge)](https://anthropic.com)
[![Deploy](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)

[Features](#features) · [Quick Start](#getting-started) · [API Reference](#api-routes) · [Deploy](#deployment-railway)

</div>

---

Chatty is a hosted, multi-tenant SaaS that acts as a 24/7 AI customer service representative. It handles inbound messages on WhatsApp and Telegram, responds in under 2 seconds, generates invoices, executes follow-ups, and delivers daily intelligence reports to business owners.

---

## Tech Stack

**Backend**
- Node.js + Express
- Firebase Realtime Database
- Anthropic Claude Sonnet (general replies) + OpenAI GPT-4o (complex queries)
- WhatsApp Business API + Telegram Bot API
- Stripe (billing) + SendGrid (email) + pdf-lib (PDF generation)
- node-cron (scheduled tasks)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- lucide-react (icons)
- recharts (charts)

---

## Features

### Core Modules (v1.0)

| Module | Description |
|---|---|
| **Smart Inbox** | Unified inbox for WhatsApp and Telegram. AI auto-replies in <2s. Manual override per conversation. |
| **Real-Time Catalog** | Upload CSV or connect Google Sheets. AI checks live stock/price before answering. 15-min auto-sync. |
| **Follow-Up Automation** | Trigger-based sequences (purchase, cart abandonment, no reply). Up to 3 steps on Starter, unlimited on Growth+. |
| **Invoice Generation** | Natural language invoice commands. PDF generation and delivery via WhatsApp/email. Payment reminders. |
| **Owner Reports** | Daily morning briefing (Growth+), evening summary, weekly recap, urgent escalation alerts. |

### Additional Features

- Multi-tenant workspace isolation
- 5-step onboarding wizard
- Post-onboarding nurture sequence (Day 1/3/7/10/14)
- AI confidence detection with automatic escalation
- 3 pricing tiers: Starter ($19), Growth ($59), Pro ($149)
- Branded PDF weekly reports (Pro plan)
- Stripe checkout + billing portal

---

## Project Structure

```
├── PRD.md                          # Product Requirements Document
├── README.md
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json
├── data/                           # Legacy SQLite data (Fast-Chat origin)
│   └── store.db
├── src/
│   ├── server.js                   # Entry point + cron jobs
│   ├── config/index.js             # Environment config
│   │
│   ├── db/
│   │   ├── firebase.js            # Firebase Realtime DB layer (Chatty)
│   │   ├── index.js               # Legacy SQLite connection (Fast-Chat)
│   │   ├── queries.js             # Legacy SQLite queries (Fast-Chat)
│   │   └── seed.js                # Legacy seed data (Fast-Chat)
│   │
│   ├── middleware/
│   │   └── workspace.js           # Multi-tenant auth + plan enforcement
│   │
│   ├── ai/
│   │   ├── router.js              # Routes to Claude or GPT-4o based on complexity
│   │   ├── claude.js              # Anthropic Claude Sonnet client
│   │   ├── gpt4o.js               # OpenAI GPT-4o client
│   │   ├── contextBuilder.js      # System prompt builder + catalog context
│   │   ├── catalogLookup.js       # Stock/price queries from Firebase
│   │   ├── confidence.js          # AI uncertainty detection (14 patterns)
│   │   └── groqClient.js          # Legacy Groq client (Fast-Chat, unused)
│   │
│   ├── channels/
│   │   ├── whatsapp.js            # WhatsApp Business API (send, receive, verify)
│   │   └── telegram.js            # Telegram Bot API (send, receive, webhook)
│   │
│   ├── billing/
│   │   ├── stripe.js              # Stripe checkout, portal, webhooks
│   │   └── plans.js               # Plan limits + usage enforcement
│   │
│   ├── onboarding/
│   │   ├── wizard.js              # 5-step onboarding flow
│   │   └── nurture.js             # Post-onboarding nurture (Day 1/3/7/10/14)
│   │
│   ├── catalog/
│   │   ├── csv.js                 # CSV upload + parse
│   │   └── sheets.js              # Google Sheets live sync
│   │
│   ├── invoices/
│   │   ├── parser.js              # NL command → invoice data
│   │   ├── generator.js           # PDF generation + delivery to customer
│   │   └── reminders.js           # Payment due date alerts
│   │
│   ├── followups/
│   │   ├── engine.js              # Sequence execution engine
│   │   └── triggers.js            # 4 trigger types detection
│   │
│   ├── reports/
│   │   ├── daily.js               # 8AM morning briefing (WA + email)
│   │   ├── evening.js             # 9PM evening summary (Growth+)
│   │   ├── weekly.js              # Monday recap + branded PDF (Pro)
│   │   └── alert.js               # Urgent escalation alerts
│   │
│   ├── routes/
│   │   ├── auth.js                # Sign up, login (JWT)
│   │   ├── webhook.js             # WhatsApp + Telegram inbound webhooks
│   │   ├── onboarding.js          # Onboarding wizard API
│   │   ├── billing.js             # Stripe billing routes
│   │   └── dashboard.js           # Dashboard CRUD (20+ endpoints)
│   │
│   ├── bot/
│   │   ├── messageHandler.js      # Core message handler (AI routing + escalation)
│   │   └── telegram.js            # Legacy Telegram bot (Fast-Chat, unused)
│   │
│   ├── utils/
│   │   ├── logger.js              # Winston logger
│   │   ├── email.js               # SendGrid email integration
│   │   └── pdf.js                 # PDF utility helpers
│   │
│   └── dashboard/public/
│       └── index.html             # Legacy HTML dashboard (fallback in dev)
│
└── frontend/                      # React SPA (Vite + Tailwind)
    ├── index.html
    ├── package.json
    ├── vite.config.js             # Dev proxy → Express :3000
    ├── tailwind.config.js         # Design tokens (colors, shadows, fonts)
    ├── postcss.config.js
    ├── public/favicon.svg
    └── src/
        ├── main.jsx               # React entry
        ├── App.jsx                # Client-side routes
        ├── index.css              # Tailwind + custom utilities
        ├── lib/api.js             # API client (JWT auth)
        ├── components/
        │   ├── shared/ui.jsx      # Design system (Button, Card, Badge, etc.)
        │   └── landing/
        │       ├── Navbar.jsx     # Sticky glassmorphic nav
        │       ├── Hero.jsx       # Full-screen hero + animated chat demo
        │       ├── SocialProof.jsx
        │       ├── ProblemSolution.jsx
        │       ├── Features.jsx   # 5 modules showcase
        │       ├── HowItWorks.jsx
        │       ├── Pricing.jsx    # 3 tiers + monthly/annual toggle
        │       ├── Testimonials.jsx
        │       ├── FinalCTA.jsx
        │       └── Footer.jsx
        └── pages/
            ├── Landing.jsx        # Landing page composition
            ├── Login.jsx          # Auth (sign in / sign up)
            ├── Onboarding.jsx     # 5-step wizard with progress bar
            ├── DashboardLayout.jsx # Sidebar + header shell
            ├── Inbox.jsx          # 3-pane inbox (list | chat | context)
            ├── Customers.jsx      # Customer table with search
            ├── Catalog.jsx        # Product catalog + sync status
            ├── FollowUps.jsx      # Sequence list + visual step builder
            ├── Invoices.jsx       # Invoice table + NL create modal
            ├── Reports.jsx        # KPI cards + charts + settings
            └── Settings.jsx       # Business profile + notifications
```

### Legacy Files (from Fast-Chat origin)

These files exist from the original Fast-Chat coffee shop bot but are **not used** by Chatty:

| File | Purpose | Status |
|---|---|---|
| `src/db/index.js` | SQLite connection | Replaced by `firebase.js` |
| `src/db/queries.js` | SQLite queries | Replaced by Firebase reads |
| `src/db/seed.js` | SQLite seed data | Not needed (Firebase) |
| `src/ai/groqClient.js` | Groq SDK client | Replaced by Claude + GPT-4o |
| `src/bot/telegram.js` | Telegram polling bot | Replaced by webhook-based `channels/telegram.js` |
| `data/store.db` | SQLite database file | Not used in production |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd Fast-Chat

# Backend (includes all server dependencies)
npm install

# Frontend
cd frontend && npm install && cd ..

# Optional: for running both backend + frontend simultaneously
npm install -D concurrently
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your keys (see Environment Variables below)
```

### 3. Run development

```bash
# Backend only (Express on :3000)
npm run dev

# Frontend only (Vite on :5173, proxies /api → :3000)
npm run frontend:dev

# Both simultaneously (requires concurrently)
npm run dev:all
```

### 4. Production build

```bash
npm run frontend:build    # Build React → frontend/dist/
npm start                 # Express serves frontend/dist/ + API
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Random string for JWT signing |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase service account private key |
| `FIREBASE_DATABASE_URL` | Yes | Firebase Realtime Database URL |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o |
| `WHATSAPP_VERIFY_TOKEN` | No | WhatsApp webhook verify token |
| `WHATSAPP_ACCESS_TOKEN` | No | WhatsApp Business API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | No | WhatsApp phone number ID |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | No | Stripe price ID for Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | No | Stripe price ID for Growth plan |
| `STRIPE_PRO_PRICE_ID` | No | Stripe price ID for Pro plan |
| `SENDGRID_API_KEY` | No | SendGrid API key for email |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Google service account for Sheets sync |
| `GOOGLE_PRIVATE_KEY` | No | Google service account private key |

The app starts gracefully without optional services configured.

---

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account + workspace |
| POST | `/api/auth/login` | Sign in, get JWT |

### Webhooks
| Method | Route | Description |
|---|---|---|
| GET | `/api/webhook/whatsapp` | WhatsApp webhook verification |
| POST | `/api/webhook/whatsapp` | WhatsApp inbound messages |
| POST | `/api/webhook/telegram` | Telegram inbound messages |

### Onboarding (requires auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/onboarding/status` | Get onboarding progress |
| POST | `/api/onboarding/step` | Complete a wizard step |
| GET | `/api/onboarding/samples` | Get sample AI messages |

### Billing (requires auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/billing/plans` | List all plans + limits |
| GET | `/api/billing/current` | Get current plan |
| POST | `/api/billing/create-checkout` | Create Stripe checkout session |
| POST | `/api/billing/portal` | Create Stripe billing portal |
| POST | `/api/billing/stripe-webhook` | Stripe webhook handler |

### Dashboard (requires auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Workspace stats |
| GET | `/api/dashboard/customers` | List customers |
| GET | `/api/dashboard/customers/:id` | Customer detail |
| POST | `/api/dashboard/send-message` | Manual reply to customer |
| GET | `/api/dashboard/conversations` | List conversations |
| POST | `/api/dashboard/catalog/upload` | Upload CSV catalog |
| POST | `/api/dashboard/catalog/sheets` | Connect Google Sheets |
| GET | `/api/dashboard/catalog` | List catalog items |
| POST | `/api/dashboard/invoices/create` | Create invoice (NL command) |
| GET | `/api/dashboard/invoices` | List invoices |
| POST | `/api/dashboard/invoices/:id/pay` | Mark invoice paid |
| POST | `/api/dashboard/sequences/create` | Create follow-up sequence |
| GET | `/api/dashboard/sequences` | List sequences |
| POST | `/api/dashboard/sequences/:id/toggle` | Toggle sequence on/off |
| GET | `/api/dashboard/digest` | Preview daily digest |
| GET | `/api/dashboard/weekly-report` | Preview weekly report |
| GET | `/api/dashboard/settings` | Get workspace settings |
| PUT | `/api/dashboard/settings` | Update workspace settings |

### Health
| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |

---

## Cron Jobs (WIB / UTC+7)

| Schedule | Task | Description |
|---|---|---|
| `*/15 * * * *` | Catalog sync | Sync Google Sheets catalog for all linked workspaces |
| `0 8 * * *` | Daily digest | Send morning briefing via WA + email |
| `0 9 * * *` | Payment reminders | Send invoice due date alerts |
| `0 10 * * *` | Nurture sequence | Process post-onboarding touchpoints |
| `0 21 * * *` | Evening summary | Send end-of-day wrap-up (Growth+) |
| `0 8 * * 1` | Weekly report | Send Monday weekly recap (Pro: branded PDF) |

---

## Pricing Tiers

| | Starter | Growth | Pro |
|---|---|---|---|
| Price | $19/mo | $59/mo | $149/mo |
| AI conversations | 500/mo | 2,500/mo | Unlimited |
| Channels | WA + TG | WA + TG + IG | Unlimited |
| Invoices | 3/mo | Unlimited | Unlimited |
| Follow-up sequences | 2 | Unlimited | Unlimited |
| Team seats | 1 | 2 | 5 |
| Owner briefings | — | WA morning + evening | WA + branded PDF |
| API access | — | — | Yes |

---

## Deployment (Railway)

1. Push to GitHub
2. Create Railway project, connect repo
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on push

```bash
# Railway will run:
npm install
cd frontend && npm install && npm run build
npm start
```

Estimated cost: <$5/month at launch scale.

---

## License

Private — Raisha Adhila
