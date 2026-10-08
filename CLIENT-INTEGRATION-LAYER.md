# Client Integration Layer — Zero-Touch Onboarding (NO site code, NO POS)

Cortese Digital's rule for every client install: **we never touch the client's
existing website code or their POS system.** Integration happens entirely in a
separate layer — phone-network configuration and/or a self-hosted web page the
client merely *links to*. This note is the onboarding script and the promise.

## The three integration lanes (pick per client)

### Lane 1 — Carrier call forwarding (primary, ~10 minutes, zero hardware)

The client's phone number stays exactly where it is. Their carrier forwards
calls to us **only when the line is busy or unanswered**:

- Conditional call forwarding (busy / no-answer) to a dedicated Cortese
  Twilio number. On most US carriers this is star-code based
  (e.g. `*92` busy, `*94` no-answer on Verizon/Frontier-style landlines and
  many cell plans) or a checkbox in the carrier's web portal.
- Our system (cortese-voice + the Busy-Line Recovery Engine) sees the forward,
  answers with the shop's greeting, captures the caller's intent, and fires
  the **missed-call text-back** instantly. Real orders land on the counter
  tablet.
- Rollback: dial `*93` (or uncheck the portal box). Two minutes, no residue.

**What the client touches:** their own phone or their carrier portal. Not us.

### Lane 2 — SIP trunk (for clients with VoIP/PBX)

Restaurants on RingCentral, 3CX, or a hosted PBX skip forwarding and register
a SIP trunk straight into our Twilio project: busy/no-answer routes to the
voice agent over SIP. Same zero-touch outcome — configuration lives in their
PBX admin panel, which their IT/phone vendor does for them. We supply the SIP
credentials and a one-page config sheet.

### Lane 3 — Web booking/order link (parallel, optional)

For clients who want online capture without ANY telephony change: we host the
booking/order page on our Vercel stack and hand the client a single URL to
paste into their existing profiles (Facebook page button, Google Business
profile, Instagram bio, printed menu QR). If they already have a website and
want deeper placement, *their own web person* drops in a plain link or iframe
— we never log into their CMS (WordPress/Wix/Squarespace/Toast sites).

## What we NEVER do (hard rule)

- **No edits to client website code.** Ever. Not a pixel, not a plugin.
- **No POS integration in v1.** Toast/Square/Clover/etc. stay untouched.
  Recovered orders are attributed from the text-back thread + the monthly
  recovered-revenue report, not POS polling.
- **No DNS changes, no domain moves, no number ports required.** Number port
  is available if the client *wants* it later, but the product never needs it.

## Rollback & exit (part of the pitch)

- Un-forward the number / delete the trunk / remove the link — 100% reversible.
- Client keeps everything we produced: the greeting script, the text-back
  copy, the recovered-revenue reports (see `performance-agreement.md` — the
  client keeps workflows on exit).
- No uninstaller needed because nothing was installed.

## Demo path (works today, no client needed)

1. `busyline-sample` Vercel project — the neutral **Sample Pizzeria** site,
   live and public (menu + phone ordering info).
2. cortese-voice — dial the demo number or trigger `POST /call` to hear the
   voice agent pitch + text-back flow end to end.
3. This repo — the offer: `$0 upfront, 15% of recovered sales only`,
   performance-agreement.md as the contract.

## The one-paragraph onboarding promise (pitch language)

> "We don't touch your website, your registers, or your phone bill. Your
> number stays put. When your line's busy, your carrier sends that one call to
> us — we text the customer back inside thirty seconds and their order shows
> up on a tablet you already own. Fifteen minutes to set up, two minutes to
> undo, and you only ever pay a percentage of orders we provably recover."
