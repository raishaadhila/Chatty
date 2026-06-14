# Chatty

AI-Powered Customer Service Platform for Indonesian SMBs.

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
├── .env.example                    # Environment variables template
├── package.json
├── src/
│   ├── server.js                   # Entry point + cron jobs
│   ├── config/index.js             # Environment config
│   ├── db/firebase.js              # Firebase Realtime DB layer
│   ├── middleware/workspace.js     # Multi-tenant auth + plan enforcement
│   ├── ai/
│   │   ├── router.js              # Routes to Claude or GPT-4o
│   │   ├── claude.js              # Anthropic client
│   │   ├── gpt4o.js               # OpenAI client
│   │   ├── contextBuilder.js      # System prompt + catalog context
│   │   ├── catalogLookup.js       # Stock/price queries
│   │   └── confidence.js          # AI uncertainty detection
│   ├── channels/
│   │   ├── whatsapp.js            # WhatsApp Business API
│   │   └── telegram.js            # Telegram Bot API
│   ├── billing/
│   │   ├── stripe.js              # Stripe checkout, portal, webhooks
│   │   └── plans.js               # Plan limits + usage tracking
│   ├── onboarding/
│   │   ├── wizard.js              # 5-step onboarding flow
│   │   └── nurture.js             # Post-onboarding nurture sequence
│   ├── catalog/
│   │   ├── csv.js                 # CSV upload + parse
│   │   └── sheets.js              # Google Sheets sync
│   ├── invoices/
│   │   ├── parser.js              # NL command → invoice data
│   │   ├── generator.js           # PDF generation + delivery
│   │   └── reminders.js           # Payment due alerts
│   ├── followups/
│   │   ├── engine.js              # Sequence execution
│   │   └── triggers.js            # Trigger detection
│   ├── reports/
│   │   ├── daily.js               # 8AM morning briefing
│   │   ├── evening.js             # 9PM evening summary
│   │   ├── weekly.js              # Monday weekly recap + branded PDF
│   │   └── alert.js               # Urgent escalation alerts
│   ├── routes/
│   │   ├── auth.js                # Sign up, login
│   │   ├── webhook.js             # WhatsApp + Telegram webhooks
│   │   ├── onboarding.js          # Onboarding wizard API
│   │   ├── billing.js             # Stripe billing routes
│   │   └── dashboard.js           # Dashboard API (all CRUD)
│   ├── utils/
│   │   ├── logger.js              # Winston logger
│   │   ├── email.js               # SendGrid integration
│   │   └── pdf.js                 # PDF utilities
│   └── dashboard/public/          # Legacy HTML dashboard (fallback)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                # Routes
        ├── index.css              # Tailwind + custom tokens
        ├── lib/api.js             # API client
        ├── components/
        │   ├── shared/ui.jsx      # Design system
        │   └── landing/           # Landing page components
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Onboarding.jsx
            ├── DashboardLayout.jsx
            ├── Inbox.jsx
            ├── Customers.jsx
            ├── Catalog.jsx
            ├── FollowUps.jsx
            ├── Invoices.jsx
            ├── Reports.jsx
            └── Settings.jsx
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd Fast-Chat

# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
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

# Both simultaneously
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
