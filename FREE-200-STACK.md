# FREE-200/DAY SEND STACK — build card (2026-10-08)

## The honest math
| Layer | Daily cap | Cost | Status |
|---|---|---|---|
| Gmail (coden607@gmail.com) | 15 → 30 → 50 as reputation holds | $0 | LIVE — 15 sent day 1, 1 bounce, 0 complaints |
| **Brevo free tier** | **300/day** | **$0** | **Needs 2-min signup (below)** |
| Resend free tier | 100/day | $0 | Backup (own domain) |

## Brevo signup — the 2-minute phone job (browser on VPS is bot-walled)
1. Phone/PC browser → https://onboarding.brevo.com/account/register
2. Email: coden607@gmail.com · password: (make one up, store it)
3. Confirm the verification email (lands in this inbox — I can grab the link the second it arrives, just say "Brevo confirmed")
4. Dashboard → SMTP & API → API Keys → "Create a new API key" (name: cortese)
5. Paste me the key (xkeysib-...) — I'll wire it into campaign-sender.js .env and test-fire

## What happens the moment the key lands
- campaign-sender.js --via brevo goes live (code already written + reviewed)
- Tomorrow's 6 queued sends fire through Brevo at $0
- Daily ceiling becomes 300 — BUT we ramp 30 → 80 → 150 → 200+ over days while watching bounce <5% + complaint <0.1%. Ceiling ≠ starting line.

## The REAL bottleneck at 200/day: LEADS, not capacity
At 200/day the entire 68-lead NY/PA emailable pool burns in one morning. To USE 200/day:
- More regions (wave-4 decision pending: Chicago pizza? Philly? Ohio Valley?)
- The 55-lead AUS/NZ list (new market, needs local opener variants)
- Second national pass (~245 more independents, needs the stale-check fixes)
- Harvest-to-lead ratio runs ~17% → 200 sends/day needs ~1,200 fresh leads/week

## Reputation rules (non-negotiable at volume)
1. Bounce >5% → pause + clean list before resuming
2. Complaint >0.1% → pause + review copy
3. STOP requests → permanent suppression within 24h
4. Never send to a bounced address again (hard-bounce ledger lives in send-log.jsonl)
