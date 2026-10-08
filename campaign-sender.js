#!/usr/bin/env node
// Cortese campaign sender — automated queue-driven outreach.
// Reads send-queue.json (see queue manifest), paces sends, honors stop-list +
// collision guards, logs every outcome to send-log.jsonl for the tracker.
//
// FREE-SENDER LAYERS (plug in as you grow; reputation is the real ceiling):
//   1. gmail-apppw   — what we use now. Warm up ~15/day, Google watches everything.
//   2. brevo         — 300/day FREE tier w/ own domain (best free cold-email tier).
//   3. resend        — 100/day FREE w/ own domain (transactional-grade deliverability).
// Add keys to .env (BREVO_API_KEY / RESEND_API_KEY) and pass --via brevo.
//
// Usage: node campaign-sender.js --via gmail [--max 15] [--gap 240] [--dry]

const fs = require('fs');
const { execSync } = require('child_process');
const SMTP = { gmail: { host: 'smtp.gmail.com', port: 587 } };

const args = process.argv.slice(2);
const via = (args[args.indexOf('--via') + 1]) || 'gmail';
const MAX = parseInt((args[args.indexOf('--max')] ?? [])[1] || '15', 10);
const GAP = parseInt((args[args.indexOf('--gap')] ?? [])[1] || '240', 10) * 1000;
const DRY = args.includes('--dry');

const FOOT = `\n\n— Stephen Blanford · Cortese Digital · Binghamton, NY\n\n---\nYou're receiving this one-time note because your shop's public business listing invited contact. Reply STOP and you'll never hear from us again.`;

const queue = JSON.parse(fs.readFileSync('send-queue.json', 'utf8')).filter(q => q.status === 'queued');
const stopList = new Set(fs.existsSync('stop-list.txt') ? fs.readFileSync('stop-list.txt', 'utf8').split('\n').map(s => s.trim().toLowerCase()).filter(Boolean) : []);
const sent = fs.existsSync('send-log.jsonl') ? fs.readFileSync('send-log.jsonl', 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l).to } catch { return null } }) : [];

async function main() {
  let n = 0;
  for (const job of queue) {
    if (n >= MAX) break;
    const addr = job.to.toLowerCase();
    if (stopList.has(addr)) { job.status = 'suppressed'; continue; }
    if (sent.includes(addr)) { job.status = 'already-sent'; continue; }
    if (DRY) { console.log(`[dry] would send → ${addr} | ${job.subject}`); n++; continue; }
    const body = job.body + FOOT;
    if (via === 'gmail') {
      const pw = fs.readFileSync('/root/.openclaw/workspace/.wf_apppw', 'utf8').trim();
      const py = `import smtplib\nfrom email.message import EmailMessage\nm=EmailMessage();m['From']='coden607@gmail.com';m['To']='${addr}';m['Subject']='''${job.subject.replace(/'/g, "\\'")}'''\nm.set_content('''${body.replace(/'/g, "\\'").replace(/`/g, '\\`')}''')\ns=smtplib.SMTP('smtp.gmail.com',587,timeout=30);s.starttls();s.login('coden607@gmail.com','${pw}');s.send_message(m);s.quit()\nprint('ok')`;
      execSync(`python3 -c "${py}"`, { stdio: 'pipe' });
    } else if (via === 'brevo') {
      const key = process.env.BREVO_API_KEY;
      if (!key) throw new Error('BREVO_API_KEY not set');
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: { email: process.env.BREVO_SENDER }, to: [{ email: addr }], subject: job.subject, textContent: body })
      }).then(r => { if (!r.ok) throw new Error('brevo ' + r.status) });
    }
    fs.appendFileSync('send-log.jsonl', JSON.stringify({ ts: new Date().toISOString(), to: addr, via, subject: job.subject }) + '\n');
    job.status = 'sent'; job.sent_at = new Date().toISOString();
    console.log(`SENT [${via}] ${n + 1}/${MAX}: ${addr}`);
    n++;
    if (n < MAX) await new Promise(r => setTimeout(r, GAP));
  }
  fs.writeFileSync('send-queue.json', JSON.stringify(queue, null, 2));
  console.log(`done: ${n} sent${DRY ? ' (DRY RUN)' : ''}. ${queue.filter(q => q.status === 'queued').length} still queued.`);
}
main().catch(e => { console.error('SENDER ERROR:', e.message); process.exit(1); });
