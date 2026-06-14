

**CHATTY**

Product Requirements Document

AI-Powered Customer Service Platform for Indonesian SMBs

Version 1.0  ·  June 2026  ·  Confidential

Prepared by: Raisha Adhila

**SECTION 01**

# **Executive Summary**

Chatty is a hosted, multi-tenant SaaS platform that acts as a 24/7 AI customer service representative for small and medium businesses (SMBs) in Indonesia. It handles inbound customer messages on WhatsApp and Telegram, responds in under 2 seconds in the business’s own voice, generates invoices, executes automated follow-ups, and delivers daily intelligence reports to the business owner via email and WhatsApp.

Chatty is built on the Fast-Chat open-source foundation and extends it into a fully productized, billable SaaS with onboarding, subscription management, and a no-code dashboard that any non-technical SMB owner can operate independently.

**Problem Statement**

Indonesian SMB owners manually reply to hundreds of customer messages per day on WhatsApp and Telegram. They have no system for follow-ups, invoicing is done manually (often on paper or WhatsApp), and they receive no daily summary of what happened in their business. This costs 3–5 hours per day and leads to missed leads, unpaid invoices, and zero business visibility.

**Solution**

Chatty automates the entire customer communication lifecycle: AI replies instantly, follow-up sequences run on a schedule, invoices are generated from a single command, and the owner wakes up every morning to a WhatsApp briefing summarizing the previous day.

**Business Goals**

* 10 paying customers within 3 months of launch

* $590+ MRR by end of Month 3 (avg Growth plan)

* 90% customer satisfaction score within 6 months

* Average AI response time under 2 seconds

* Solo-founder operable: zero manual setup per new customer

| Metric | Target |
| :---- | :---- |
| Launch date | Within 4 weeks of PRD sign-off |
| Initial market | Indonesia (Bahasa \+ English) |
| Primary channel | WhatsApp Business API \+ Telegram |
| Pricing range | $19 / $59 / $149 per month |
| Delivery model | Hosted SaaS (no self-hosting) |

**SECTION 02**

# **Target Users & Personas**

## **Primary Personas**

**Persona 1 — Solo Founder (Starter Plan)**

* Name: Aisyah, 27, Bandung

* Business: Instagram-based clothing boutique, 1 person

* Pain: Manually replies to 80+ WA messages/day about stock, price, and orders

* Goal: Never miss a customer message, even outside working hours

* Technical level: Non-technical — uses WhatsApp, Tokopedia, Google Sheets

* Willingness to pay: $15–25/month if it saves 2+ hours/day

**Persona 2 — Growing Business Owner (Growth Plan)**

* Name: Budi, 34, Jakarta

* Business: Home decor store, 3 staff, Shopify \+ WA

* Pain: Sends invoices manually, chases unpaid orders, no visibility on daily revenue

* Goal: Automate invoicing, follow-ups, and get a daily business summary on WA

* Technical level: Semi-technical — uses Shopify, understands integrations

* Willingness to pay: $50–70/month for full automation

**Persona 3 — Agency / Team (Pro Plan)**

* Name: Dini, 31, Surabaya

* Business: Digital agency managing CS for 5 SMB clients

* Pain: Switching between client WA accounts manually, no consolidated reporting

* Goal: One dashboard to manage all client inboxes, white-labeled reports for clients

* Technical level: Technical — comfortable with APIs and integrations

* Willingness to pay: $120–160/month for multi-workspace management

## **Out of Scope Users**

The following user types are explicitly out of scope for v1.0:

* Enterprise companies with 100+ staff (require custom SLAs, SSO, compliance)

* Businesses outside Indonesia (localization deferred to v2.0)

* Developers wanting raw API access only (API endpoints are Pro-only, not the core offering)

**SECTION 03**

# **Product Scope — v1.0**

Chatty v1.0 ships all five product modules. Scope is full-feature but depth is calibrated: core functionality must work reliably before advanced configuration is exposed.

| Module | Name | v1.0 Depth | Built on Fast-Chat? |
| :---- | :---- | :---- | :---- |
| M1 | Smart Inbox | Full | Yes — extend |
| M2 | Real-Time Business Intelligence | Core (Sheets \+ CSV sync) | Partial — build |
| M3 | Follow-Up Automation | Core sequences | No — build |
| M4 | Invoice & Payments | Generate \+ send via WA/email | No — build |
| M5 | Owner Reports | Daily email \+ WA briefing | No — build |

## **Module 1 — Smart Inbox**

**Description**

The unified inbox receives all inbound messages from WhatsApp and Telegram, routes them through the AI engine, and sends replies back — all automatically. The business owner can monitor conversations, toggle AI on/off per conversation, and manually override any reply.

**Functional Requirements**

* Receive inbound messages via WhatsApp Business API webhook

* Receive inbound messages via Telegram Bot API webhook

* Route messages to AI engine within 500ms of receipt

* AI generates and sends reply in under 2 seconds (p95)

* Maintain per-customer conversation context (last 10 messages)

* Auto-build customer profile on first contact (name, channel, timestamp)

* Business owner can toggle AI off for any individual conversation

* Business owner can send a manual reply from dashboard

* AI escalates to human when uncertainty threshold is exceeded

* Support Bahasa Indonesia and English language detection \+ reply

**Non-Functional Requirements**

* AI response time: \< 2 seconds (p95), \< 5 seconds (p99)

* Webhook ingestion: handle 100 concurrent inbound messages

* Uptime: 99.5% for Starter/Growth, 99.9% for Pro

## **Module 2 — Real-Time Business Intelligence**

**Description**

Chatty connects to the business’s product catalog so the AI can answer stock and pricing questions accurately. In v1.0, this is supported via Google Sheets live sync and CSV upload. Shopify and Tokopedia API sync are Growth-tier features.

**Functional Requirements**

* Business owner can upload a CSV catalog (columns: name, SKU, price, stock)

* Business owner can link a Google Sheets URL for live catalog sync

* AI queries catalog before answering stock or price questions

* Catalog is refreshed every 15 minutes for Google Sheets connections

* AI responds with accurate stock status: in stock / low stock (\< 5\) / out of stock

* If catalog is not configured, AI responds with a graceful fallback message

* Shopify product sync (Growth plan): webhooks update catalog on inventory change

## **Module 3 — Follow-Up Automation**

**Description**

Scheduled message sequences that run automatically without the owner’s involvement. Used for post-purchase check-ins, re-engaging cold leads, and appointment reminders.

**Functional Requirements**

* Owner can create a follow-up sequence: trigger event \+ delay \+ AI-written message

* Trigger events: conversation ended, purchase detected, no reply in X hours

* Sequence steps: up to 3 steps on Starter, unlimited on Growth/Pro

* AI personalizes each follow-up message using the customer’s name and history

* Owner can pause or cancel a sequence for any individual customer

* System logs all sent follow-ups with delivery status

* Cart abandonment detection: if conversation includes a product inquiry with no purchase signal, trigger follow-up after 4 hours (Growth+)

## **Module 4 — Invoice & Payments**

**Description**

The owner types a natural-language invoice command in the Chatty dashboard. The AI parses it, generates a PDF invoice using the business’s details, and sends it to the customer via WhatsApp or email.

**Functional Requirements**

* Owner types invoice command in natural language: “Invoice for Aisyah: 2x Hoodie Blue M Rp150k, due Friday”

* AI parses line items, quantities, prices, due date, and customer name

* System generates a PDF invoice with: business logo, name, address, line items, total, due date, invoice number

* Invoice is sent to customer via WhatsApp (PDF attachment) and/or email

* Invoice status tracked: Unpaid, Paid, Overdue

* Automatic payment reminder sent 1 day before due date and on the due date

* Owner can mark invoice as paid manually

* Invoice history visible per customer and in dashboard summary

* Starter plan: 3 invoices/month. Growth+: unlimited

## **Module 5 — Owner Reports**

**Description**

Chatty aggregates business data daily and sends the owner a concise intelligence briefing. The goal is to replace the owner’s need to log into the dashboard for routine monitoring.

**Functional Requirements**

* Daily email digest: sent at 8:00 AM local time, covering prior day’s conversations, leads, invoice status, and top issues

* WhatsApp morning briefing (Growth+): same content as email, formatted for WA, sent at 8:00 AM

* WhatsApp evening summary (Growth+): end-of-day wrap-up, sent at 9:00 PM

* Weekly recap report: sent every Monday, covering 7-day KPIs, top customers, revenue, sentiment trends

* Urgent alert: owner is pinged immediately when AI escalates a complaint or flags an issue

* Branded PDF weekly report (Pro): auto-generated, white-labeled with business name

* Owner configures: delivery time, channels (email / WA / both), and which alerts to receive

**SECTION 04**

# **System Architecture**

## **Delivery Model: Hosted SaaS**

Chatty is delivered exclusively as a hosted SaaS product. Customers never install software, configure servers, or manage infrastructure. The founder operates a single deployment that serves all customers through isolated workspaces.

| Component | Technology | Role |
| :---- | :---- | :---- |
| Application server | Node.js \+ Express (Railway) | Receives webhooks, runs AI, sends replies |
| Database | Firebase Realtime Database | Customer profiles, workspace config, analytics |
| AI — general | Anthropic Claude Sonnet | Conversational replies, Telegram, Instagram |
| AI — complex | OpenAI GPT-4o | High-complexity sales and product queries (WA) |
| Billing | Stripe | Subscription management, usage metering, invoicing |
| Email delivery | SendGrid | Owner digests, invoice delivery, alerts |
| PDF generation | pdf-lib (Node) | Invoice PDF generation |
| Channels | WhatsApp Business API, Telegram Bot API | Message ingestion and reply delivery |
| Hosting | Railway | Auto-deploy from GitHub, \<$5/month at launch scale |

## **Multi-Tenancy Model**

Every customer gets a workspace. All workspaces share one application deployment but are fully isolated at the data layer via a workspaceId key in Firebase.

**Firebase Schema**

**/workspaces/{workspaceId}/**  config  ·  customers  ·  analytics  ·  invoices  ·  sequences

**/workspaces/{workspaceId}/config**  →  plan, aiPrompt, brandTone, channels\[\], ownerWA, ownerEmail

**/workspaces/{workspaceId}/customers/{customerId}**  →  name, channel, history\[\], purchaseHistory\[\], tags

## **Plan Limits Enforcement**

Limits are enforced server-side on every AI call. The application reads the workspace’s plan tier and current usage counters before processing any request. Limits reset on the first day of each billing cycle.

| Limit Type | Starter | Growth | Pro | Enforcement |
| :---- | :---- | :---- | :---- | :---- |
| AI conversations/month | 500 | 2,500 | Unlimited | Hard stop → AI pauses, human can reply |
| Connected channels | 2 (WA \+ TG) | 3 (+IG) | Unlimited | Block channel add in dashboard |
| Customer profiles | 500 | Unlimited | Unlimited | Soft warning at 450 |
| Invoices/month | 3 | Unlimited | Unlimited | Block at 4th invoice with upgrade prompt |
| Follow-up sequences | 2 | Unlimited | Unlimited | Block creation at limit |
| Team seats | 1 | 2 | 5 | Block invite at limit |
| Workspaces (agencies) | 1 | 1 | 10 | Block workspace creation |

**SECTION 05**

# **Onboarding & User Flow**

## **Onboarding Design Principle**

The owner must reach their “aha moment” — their AI sends a real or simulated customer message in their brand’s voice — within 10 minutes of signing up. Every onboarding step that is not required for this moment is deferred to a post-onboarding checklist.

## **5-Step Onboarding Wizard**

**Step 1 — Business Profile (60 seconds)**

* Fields: business name, business type (dropdown: e-commerce / F\&B / services / other), primary language (Bahasa / English / both)

* This data seeds the AI’s base system prompt automatically

* No technical knowledge required

**Step 2 — Connect a Channel**

* Primary path: Connect WhatsApp Business API (guided QR \+ webhook setup)

* Fallback path: Connect Telegram bot (zero friction — paste a bot token)

* Chatty auto-detects and confirms the connection with a test message

* User cannot proceed to Step 3 without at least one channel connected

**Step 3 — Tell Chatty About Your Business (optional, skippable)**

* Upload product catalog: CSV file or Google Sheets URL

* Add up to 5 FAQs (question \+ answer text fields)

* Set brand tone: Friendly / Professional / Casual / Formal

* This step is skippable — Chatty works immediately with defaults

**Step 4 — Test the AI**

* Chatty simulates 3 sample customer messages based on the business type

* Owner sees AI replies in real time

* Owner can edit the AI’s reply and regenerate

* One-click tone adjustment available

**Step 5 — Set Up Reports**

* Enter owner email and/or WhatsApp number for briefings

* Choose delivery: morning only / evening only / both

* This step is optional — can be configured later in Settings

## **Post-Onboarding Nurture Sequence**

| Day | Touchpoint | Goal |
| :---- | :---- | :---- |
| Day 1 | WA message: “Your AI replied 12 times today ✔” | Show early value |
| Day 3 | Email: “Add your catalog to answer stock questions” | Feature adoption |
| Day 7 | First weekly digest delivered | Habit formation |
| Day 10 | In-app: “You’ve saved \~4 hours. Try follow-ups →” | Upsell to Growth |
| Day 14 | Email: upgrade prompt if hitting conversation limit | Plan conversion |

**SECTION 06**

# **Pricing & Business Model**

## **Pricing Tiers**

|  | Starter | Growth | Pro |
| :---- | :---- | :---- | :---- |
| Monthly price | $19/mo | $59/mo | $149/mo |
| Annual price | $15/mo | $47/mo | $119/mo |
| Target persona | Solo / trying it | Daily work replacement | Teams & agencies |
| AI conversations | 500/mo | 2,500/mo | Unlimited |
| Channels | WA \+ Telegram | WA \+ TG \+ Instagram | Unlimited |
| Invoices | 3/month | Unlimited | Unlimited |
| Follow-up sequences | 2 | Unlimited | Unlimited |
| Team seats | 1 | 2 | 5 |
| Agency workspaces | — | — | 10 |
| Owner WA briefings | — | ✓ | ✓ |
| Branded PDF reports | — | — | ✓ |
| API access | — | — | ✓ |
| Support | Email (48hr) | Email (24hr) | Priority (4hr) |

## **Billing Rules**

* Monthly and annual billing supported (annual \= 20% discount)

* No free trial — 14-day money-back guarantee instead

* Overage: $0.02 per AI conversation over the monthly limit (opt-in)

* Payment: Stripe (credit card) and Midtrans (Indonesian payment methods)

* Cancellation: immediate — service continues until end of paid period

## **Unit Economics (Estimates)**

| Plan | Revenue | Est. Cost | Gross Margin |
| :---- | :---- | :---- | :---- |
| Starter | $19 | \~$3.10 | \~84% |
| Growth | $59 | \~$9.20 | \~84% |
| Pro | $149 | \~$25–35 | \~77–83% |
| Break-even (solo founder) | \~40 Growth customers | $2,400 MRR | — |

**SECTION 07**

# **Non-Functional Requirements**

## **Performance**

* AI reply latency: p50 \< 1.5s, p95 \< 2s, p99 \< 5s

* Webhook ingestion: process 100 concurrent inbound events without queuing delay

* Dashboard load time: \< 2s on 4G mobile connection

* Invoice PDF generation: \< 3 seconds

* Catalog sync (Google Sheets): refresh every 15 minutes

## **Reliability**

* Uptime SLA: 99.5% for Starter/Growth, 99.9% for Pro

* Webhook retry: automatic 3-retry with exponential backoff on failure

* AI fallback: if Claude is unavailable, route to GPT-4o automatically

* Database backups: daily automated backups via Firebase

## **Security**

* All API keys stored as environment variables, never in code or database

* Workspace data fully isolated: no cross-workspace data access possible

* Stripe handles all payment data — Chatty never stores card details

* HTTPS enforced on all endpoints

* WhatsApp webhook verification token validated on every request

## **Scalability**

* Architecture supports 1,000+ concurrent workspaces on a single Railway deployment

* Firebase scales automatically; no manual capacity planning required

* AI API costs scale linearly with usage — margin is protected by conversation limits

## **Localization**

* v1.0: Bahasa Indonesia and English (auto-detected per conversation)

* Dashboard UI: English only in v1.0; Bahasa Indonesia in v1.1

* Currency: IDR (Rupiah) and USD both supported in invoices

* Timezone: WIB (UTC+7) default for all scheduling; configurable per workspace

**SECTION 08**

# **Milestones & Delivery**

Target: full v1.0 shipped and accepting paying customers within 4 weeks. The following is the phased build plan from the Fast-Chat foundation.

| Week | Milestone | Key Deliverables |
| :---- | :---- | :---- |
| Week 1 | Infrastructure & Auth | Multi-tenant workspace model, Stripe billing, sign-up \+ onboarding wizard (Steps 1–2) |
| Week 2 | AI \+ Catalog | Catalog upload (CSV \+ Sheets), live stock lookup in AI, onboarding Steps 3–5, plan limit enforcement |
| Week 3 | Invoices \+ Follow-ups | Invoice PDF generation \+ WA/email delivery, follow-up sequence builder, payment reminders |
| Week 4 | Reports \+ Polish | Daily email digest, WA owner briefings, dashboard analytics, bug fixes, beta testing with 3 real SMBs |
| Post-launch | Growth features | Instagram DM, Shopify sync, cart abandonment, branded PDF reports (Pro), agency workspaces |

## **Launch Criteria (v1.0 Go/No-Go)**

* All five modules functional for at least one paying customer end-to-end

* Onboarding wizard completed in under 10 minutes by a non-technical tester

* AI response time under 2 seconds in p95 load test

* Stripe billing and plan limits enforced correctly

* At least 3 beta customers using the product without founder intervention

## **Out of Scope for v1.0**

* Instagram DM integration (v1.1)

* Shopify / Tokopedia live sync (v1.1)

* Agency multi-workspace management (v1.1)

* Branded PDF reports (v1.1)

* API access for Pro plan (v1.2)

* Mobile app (deferred — mobile-responsive web is sufficient for v1.0)

* Bahasa Indonesia dashboard UI (v1.1)

**SECTION 09**

# **Risks & Mitigations**

| Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| WhatsApp API access denied or restricted by Meta | Medium | Critical | Telegram as zero-friction alternative; WA setup documented step-by-step |
| AI hallucination on stock or price answers | High | High | AI always queries catalog first; fallback message if catalog not loaded |
| Onboarding drop-off at WhatsApp API step | High | High | Telegram fallback removes friction; WA setup tutorial with screenshots |
| AI API costs exceed projections at scale | Medium | Medium | Conversation limits per plan; overage pricing protects margin |
| Competitor copies feature set quickly | Medium | Low | Moat is customer data \+ workflow integration; switch cost grows with usage |
| Solo founder burnout / support overload | Medium | High | Self-serve onboarding; in-app documentation; no manual setup per customer |

**APPENDIX**

# **Appendix**

## **A. Existing Fast-Chat Foundation**

Chatty is built on the Fast-Chat open-source repository (github.com/raishaadhila/Fast-Chat). The following components are inherited and extended:

* AI routing engine (Claude \+ GPT-4o) — extend with catalog lookup

* WhatsApp, Telegram, Instagram webhook handlers — extend with workspace routing

* Firebase customer profiles \+ context manager — extend with workspace isolation

* Analytics event logging \+ aggregator — extend with owner reports

* Brand tone customizer — extend with per-workspace config

* Human escalation fallback — keep as-is

## **B. Key Integration Dependencies**

| Service | Purpose | Plan Availability | Cost Model |
| :---- | :---- | :---- | :---- |
| WhatsApp Business API (Meta) | Primary messaging channel | All plans | Per-message (variable by country) |
| Telegram Bot API | Secondary channel, zero-friction setup | All plans | Free |
| Anthropic Claude Sonnet | AI replies (general) | All plans | Per token |
| OpenAI GPT-4o | AI replies (complex queries) | All plans | Per token |
| Firebase Realtime DB | Data storage \+ auth | All plans | Usage-based, scales with customers |
| Stripe | Subscription billing | All plans | 2.9% \+ $0.30 per transaction |
| Midtrans | Indonesian payment methods | All plans | Variable |
| SendGrid | Email delivery | All plans | Per email sent |
| Railway | App hosting | All plans | \~$5/month at launch scale |

## **C. Glossary**

| Term | Definition |
| :---- | :---- |
| Workspace | A single business’s isolated environment within Chatty, containing their channels, customers, config, and billing |
| AI conversation | One complete exchange: one inbound customer message \+ one AI-generated reply. This is the primary billing metric. |
| Follow-up sequence | A pre-configured series of messages sent automatically to a customer after a trigger event, with a configurable delay between steps |
| Owner briefing | An automated summary message sent to the business owner via WhatsApp or email on a daily or weekly schedule |
| Escalation | The process by which the AI detects uncertainty and flags a conversation for human review, pausing auto-replies for that thread |
| Catalog sync | The process of reading the business’s product list (from CSV or Google Sheets) into Chatty’s knowledge base for AI stock/price queries |

End of Document — Chatty PRD v1.0

raishaalfadhilaputri@gmail.com