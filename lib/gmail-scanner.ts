import { google } from 'googleapis';

// ============================================================
// القوائم: الخدمات المعروفة (سريعة، مجانية، بلا AI)
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
  // خدمات مغربية / فرنسية مضافة
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
// استخراج المبلغ + العملة (متعدد العملات)
// ============================================================
function extractAmountAndCurrency(text: string): { amount: number; currency: string } | null {
  const patterns: { re: RegExp; cur: string }[] = [
    { re: /\$\s*(\d{1,4}(?:[.,]\d{2})?)/,                         cur: 'USD' },
    { re: /(\d{1,4}(?:[.,]\d{2})?)\s*(?:USD|usd)/,                cur: 'USD' },
    { re: /€\s*(\d{1,4}(?:[.,]\d{2})?)/,                          cur: 'EUR' },
    { re: /(\d{1,4}(?:[.,]\d{2})?)\s*(?:€|EUR|eur|euros?)/,       cur: 'EUR' },
    { re: /£\s*(\d{1,4}(?:[.,]\d{2})?)/,                          cur: 'GBP' },
    { re: /(\d{1,4}(?:[.,]\d{2})?)\s*(?:£|GBP)/,                  cur: 'GBP' },
    { re: /(\d{1,4}(?:[.,]\d{2})?)\s*(?:MAD|DH|dh|درهم|dhs)/i,    cur: 'MAD' },
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
// طبقة AI: Groq + Llama 3 (عبر fetch، بلا حزمة)
// كتحلل الايميلات لي ما عرفهومش بالقوائم — بأي لغة
// ============================================================
async function analyzeWithAI(
  emails: { from: string; subject: string }[]
): Promise<{ from: string; serviceName: string; amount: number; currency: string }[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || emails.length === 0) return [];

  const list = emails
    .map((e, i) => `${i + 1}. From: ${e.from} | Subject: ${e.subject}`)
    .join('\n');

  const prompt = `You are a subscription detector. Analyze these emails (any language: English, French, Arabic, etc.) and identify which ones are RECURRING SUBSCRIPTION charges or invoices (Netflix, telecom forfait, SaaS, gym, streaming, etc.). Ignore one-time purchases, shipping, ads, newsletters, and security alerts.

For each email that IS a subscription, return its number, the service name, the amount (number only), and the currency code (USD, EUR, GBP, MAD...). If the amount or currency is unknown, use 0 and "USD".

Emails:
${list}

Respond ONLY with a valid JSON array, no markdown, no explanation. Format:
[{"index": 1, "serviceName": "Orange", "amount": 199, "currency": "MAD"}]
If none are subscriptions, return [].`;

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
    let content: string = data.choices?.[0]?.message?.content ?? '[]';
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(content) as {
      index: number;
      serviceName: string;
      amount: number;
      currency: string;
    }[];

    return parsed
      .filter((p) => p.index >= 1 && p.index <= emails.length && p.serviceName)
      .map((p) => ({
        from: emails[p.index - 1].from,
        serviceName: p.serviceName,
        amount: typeof p.amount === 'number' ? p.amount : 0,
        currency: p.currency || 'USD',
      }));
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

  // query موسّع: لغات + كلمات متعددة
  const query = [
    'subscription', 'receipt', 'invoice', 'billing', 'renewal', 'payment',
    'facture', 'abonnement', 'paiement', 'reçu',
    'rechnung', 'abo',
    'factura', 'suscripción', 'recibo',
    'اشتراك', 'فاتورة', 'تجديد',
  ].map((k) => `"${k}"`).join(' OR ');

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:90d (${query})`,
    maxResults: 50,
  });

  const messages = list.data.messages || [];
  const found = new Map<string, any>();          // الخدمات المكتشفة بالقوائم
  const unknownEmails: { from: string; subject: string }[] = []; // للـ AI

  await Promise.all(
    messages.map(async (msg) => {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject'],
        });
        const headers = detail.data.payload?.headers || [];
        const from = headers.find((h) => h.name === 'From')?.value || '';
        const subject = headers.find((h) => h.name === 'Subject')?.value || '';
        const domain = extractDomain(from);
        if (!domain) return;

        // المرحلة 1: القوائم
        let service = SERVICES[domain];
        if (!service) {
          for (const [key, val] of Object.entries(SERVICES)) {
            if (domain.includes(key.split('.')[0])) { service = val; break; }
          }
        }

        if (service) {
          const money = extractAmountAndCurrency(subject);
          const label = money && money.currency !== 'USD'
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
          // ما عرفوش بالقوائم → نخليوه لل AI
          unknownEmails.push({ from, subject });
        }
      } catch {}
    })
  );

  // المرحلة 2: AI على الايميلات المجهولة (نحدّو العدد باش ما نطولوش)
  const aiResults = await analyzeWithAI(unknownEmails.slice(0, 20));
  for (const r of aiResults) {
    const label = r.currency !== 'USD' ? `${r.serviceName} (${r.currency})` : r.serviceName;
    if (!found.has(r.serviceName)) {
      found.set(r.serviceName, {
        serviceName: label,
        serviceIcon: '🔔',
        cancelUrl: null,
        amount: r.amount,
        emailFrom: r.from.replace(/<.*>/, '').trim() || r.from,
        status: 'active',
      });
    }
  }

  return Array.from(found.values());
}
