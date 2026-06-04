import { google } from 'googleapis';

// ============================================================
// القوائم: الخدمات المعروفة (سريعة، مجانية، على المرسل)
// ============================================================
const SERVICES: Record<string, { name: string; icon: string; cancelUrl: string }> = {
  'netflix.com':       { name: 'Netflix',        icon: '🎬', cancelUrl: 'https://www.netflix.com/cancelplan' },
  'spotify.com':       { name: 'Spotify',        icon: '🎵', cancelUrl: 'https://www.spotify.com/account/subscription' },
  'hulu.com':          { name: 'Hulu',           icon: '📺', cancelUrl: 'https://secure.hulu.com/account/cancel' },
  'amazon.com':        { name: 'Amazon Prime',   icon: '📦', cancelUrl: 'https://www.amazon.com/mc/pipelines' },
  'disneyplus.com':    { name: 'Disney+',        icon: '🏰', cancelUrl: 'https://www.disneyplus.com/account/subscription' },
  'apple.com':         { name: 'Apple',          icon: '🍎', cancelUrl: 'https://appleid.apple.com/account/manage' },
  'adobe.com':         { name: 'Adobe',          icon: '🎨', cancelUrl: 'https://account.adobe.com/plans' },
  'dropbox.com':       { name: 'Dropbox',        icon: '📁', cancelUrl: 'https://www.dropbox.com/account/plan' },
  'github.com':        { name: 'GitHub',         icon: '🐙', cancelUrl: 'https://github.com/settings/billing' },
  'openai.com':        { name: 'ChatGPT Plus',   icon: '🤖', cancelUrl: 'https://chat.openai.com/settings' },
  'notion.so':         { name: 'Notion',         icon: '📝', cancelUrl: 'https://www.notion.so/profile/billing' },
  'canva.com':         { name: 'Canva Pro',      icon: '🎨', cancelUrl: 'https://www.canva.com/settings/billing' },
  'duolingo.com':      { name: 'Duolingo Plus',  icon: '🦉', cancelUrl: 'https://www.duolingo.com/settings/subscription' },
  'zoom.us':           { name: 'Zoom',           icon: '🎥', cancelUrl: 'https://zoom.us/account/billing' },
  'figma.com':         { name: 'Figma',          icon: '🎨', cancelUrl: 'https://www.figma.com/settings#plan' },
  'audible.com':       { name: 'Audible',        icon: '🎧', cancelUrl: 'https://www.audible.com/account/cancel' },
  'grammarly.com':     { name: 'Grammarly',      icon: '✍️', cancelUrl: 'https://account.grammarly.com/subscription' },
  'nytimes.com':       { name: 'NY Times',       icon: '📰', cancelUrl: 'https://myaccount.nytimes.com/seg/subscription' },
  'planetfitness.com': { name: 'Planet Fitness', icon: '🏋️', cancelUrl: 'https://www.planetfitness.com/members' },
  'anthropic.com':     { name: 'Claude Pro',     icon: '🤖', cancelUrl: 'https://claude.ai/settings/billing' },
  'claude.ai':         { name: 'Claude Pro',     icon: '🤖', cancelUrl: 'https://claude.ai/settings/billing' },
  'orange.ma':         { name: 'Orange',         icon: '📱', cancelUrl: 'https://www.orange.ma' },
  'orange.com':        { name: 'Orange',         icon: '📱', cancelUrl: 'https://www.orange.com' },
  'orange.fr':         { name: 'Orange',         icon: '📱', cancelUrl: 'https://www.orange.fr' },
  'iam.ma':            { name: 'Maroc Telecom',  icon: '📱', cancelUrl: 'https://www.iam.ma' },
  'inwi.ma':           { name: 'inwi',           icon: '📱', cancelUrl: 'https://www.inwi.ma' },
  'youtube.com':       { name: 'YouTube Premium',icon: '▶️', cancelUrl: 'https://www.youtube.com/paid_memberships' },
  'microsoft.com':     { name: 'Microsoft 365',  icon: '🪟', cancelUrl: 'https://account.microsoft.com/services' },
  'linkedin.com':      { name: 'LinkedIn',       icon: '💼', cancelUrl: 'https://www.linkedin.com/premium' },
};

function extractDomain(from: string): string | null {
  const m = from.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (!m) return null;
  const parts = m[1].split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : m[1];
}

// ============================================================
// استخراج المبلغ + العملة من نص (subject أو body)
// ============================================================
function extractAmountAndCurrency(text: string): { amount: number; currency: string } | null {
  const patterns: { re: RegExp; cur: string }[] = [
    { re: /\$\s*(\d{1,5}(?:[.,]\d{1,2})?)/,                               cur: 'USD' },
    { re: /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:USD|usd)/,                      cur: 'USD' },
    { re: /€\s*(\d{1,5}(?:[.,]\d{1,2})?)/,                                cur: 'EUR' },
    { re: /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|EUR|eur|euros?)/,             cur: 'EUR' },
    { re: /£\s*(\d{1,5}(?:[.,]\d{1,2})?)/,                                cur: 'GBP' },
    { re: /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:£|GBP)/,                        cur: 'GBP' },
    { re: /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:MAD|DHS?|dhs?|درهم)/i,          cur: 'MAD' },
  ];
  for (const { re, cur } of patterns) {
    const m = text.match(re);
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'));
      if (val > 0 && val < 100000) return { amount: val, currency: cur };
    }
  }
  return null;
}

// ============================================================
// استخراج نص خام من body ديال الايميل (يفك base64 وينقي HTML)
// ============================================================
function decodeBase64Url(data: string): string {
  try {
    const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(normalized, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

function extractBodyText(payload: any): string {
  let text = '';
  const walk = (part: any) => {
    if (!part) return;
    if (part.body?.data && (part.mimeType === 'text/plain' || part.mimeType === 'text/html')) {
      text += ' ' + decodeBase64Url(part.body.data);
    }
    if (part.parts) part.parts.forEach(walk);
  };
  walk(payload);
  // ننقي HTML tags ونقلّص المسافات
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500); // نقتطعو باش ما نطولوش ال prompt
}

// ============================================================
// طبقة AI: Groq + Llama 3 (عبر fetch، بلا حزمة)
// كتحلل الايميلات المجهولة بمحتواها — بأي لغة
// ============================================================
async function analyzeWithAI(
  emails: { from: string; subject: string; body: string }[]
): Promise<{ index: number; serviceName: string; amount: number; currency: string }[]> {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('[AI] apiKey present:', !!apiKey, '| emails to analyze:', emails.length);
  if (!apiKey || emails.length === 0) return [];

  const list = emails
    .map(
      (e, i) =>
        `--- Email ${i + 1} ---\nFrom: ${e.from}\nSubject: ${e.subject}\nContent: ${e.body.slice(0, 1200)}`
    )
    .join('\n\n');

  console.log('[AI] emails sent to AI:', JSON.stringify(emails.map(e => ({ from: e.from, subject: e.subject, bodyPreview: e.body.slice(0, 200) }))).slice(0, 2000));

  const prompt = `You are a subscription & recurring-payment detector. Analyze these emails (any language: English, French, Arabic, etc.).

Identify ONLY emails that represent a RECURRING SUBSCRIPTION or a PAYMENT/INVOICE for a service (telecom like Orange/Maroc Telecom/inwi, streaming, SaaS, gym, software, etc.). The payment may come from a BANK (e.g. "paiement ORANGE via CIH MOBILE") — in that case the real service is the one being paid FOR (Orange), not the bank.

STRICTLY IGNORE: security alerts, login notifications, welcome emails, password resets, newsletters, marketing/ads, shipping notices, one-time product purchases, and emails from the app "Subshed" itself.

For each REAL subscription/service payment, extract:
- the service name (the company being paid, e.g. "Orange", not "CIH")
- the amount (number only, from the content)
- the currency code (USD, EUR, GBP, MAD...)

Emails:
${list}

Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"index": 1, "serviceName": "Orange", "amount": 10, "currency": "MAD"}]
If none qualify, return [].`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      console.error('Groq API error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    console.log('[AI] raw response:', JSON.stringify(data).slice(0, 800));
    let content: string = data.choices?.[0]?.message?.content ?? '[]';
    console.log('[AI] content:', content.slice(0, 500));
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    // نلقطو أول [ ... ] فالنص باش نتجنبو أي كلام زائد
    const match = content.match(/\[[\s\S]*\]/);
    if (match) content = match[0];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('AI analysis failed:', err);
    return [];
  }
}

// ============================================================
// الدالة الرئيسية
// ============================================================
export async function scanGmail(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  const keywords = [
    'subscription', 'receipt', 'invoice', 'billing', 'renewal', 'payment',
    'facture', 'abonnement', 'paiement', 'reçu',
    'rechnung', 'abo',
    'factura', 'suscripción', 'recibo',
    'اشتراك', 'فاتورة', 'تجديد',
  ].map((k) => `"${k}"`).join(' OR ');

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:90d (${keywords})`,
    maxResults: 50,
  });

  const messages = list.data.messages || [];
  const found = new Map<string, any>();
  const unknownEmails: { from: string; subject: string; body: string }[] = [];

  await Promise.all(
    messages.map(async (msg) => {
      try {
        // كنجيبو الايميل كامل (full) باش نقدرو نقراو ال body
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });
        const payload = detail.data.payload;
        const headers = payload?.headers || [];
        const from = headers.find((h) => h.name === 'From')?.value || '';
        const subject = headers.find((h) => h.name === 'Subject')?.value || '';
        const domain = extractDomain(from);
        if (!domain) return;

        // المرحلة 1: القوائم (على المرسل)
        let service = SERVICES[domain];
        if (!service) {
          for (const [key, val] of Object.entries(SERVICES)) {
            if (domain.includes(key.split('.')[0])) { service = val; break; }
          }
        }

        if (service) {
          const body = extractBodyText(payload);
          const money =
            extractAmountAndCurrency(subject) || extractAmountAndCurrency(body);
          const label =
            money && money.currency !== 'USD'
              ? `${service.name} (${money.currency})`
              : service.name;
          if (!found.has(service.name)) {
            found.set(service.name, {
              serviceName: label,
              serviceIcon: service.icon,
              cancelUrl: service.cancelUrl,
              amount: money ? money.amount : 0,
              emailFrom: from.replace(/<.*>/, '').trim() || from,
              status: 'active',
            });
          }
        } else {
          // مجهول → نقراو ال body ونخليوه لل AI
          const body = extractBodyText(payload);
          unknownEmails.push({ from, subject, body });
        }
      } catch {}
    })
  );

  console.log('[SCAN] total messages:', messages.length, '| found by lists:', found.size, '| unknown for AI:', unknownEmails.length);

  // المرحلة 2: AI على المجهولين (نحدّو العدد)
  const aiResults = await analyzeWithAI(unknownEmails.slice(0, 15));
  console.log('[AI] results returned:', aiResults.length);
  for (const r of aiResults) {
    if (!r.serviceName || r.index < 1 || r.index > unknownEmails.length) continue;
    const src = unknownEmails[r.index - 1];
    const currency = r.currency || 'USD';
    const label = currency !== 'USD' ? `${r.serviceName} (${currency})` : r.serviceName;
    if (!found.has(r.serviceName)) {
      found.set(r.serviceName, {
        serviceName: label,
        serviceIcon: '🔔',
        cancelUrl: null,
        amount: typeof r.amount === 'number' ? r.amount : 0,
        emailFrom: src ? src.from.replace(/<.*>/, '').trim() || src.from : '',
        status: 'active',
      });
    }
  }

  return Array.from(found.values());
}
