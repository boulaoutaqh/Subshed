import { google } from 'googleapis';

const SERVICES: Record<string, { name:string; icon:string; cancelUrl:string }> = {
  'netflix.com':       { name:'Netflix',       icon:'🎬', cancelUrl:'https://www.netflix.com/cancelplan' },
  'spotify.com':       { name:'Spotify',       icon:'🎵', cancelUrl:'https://www.spotify.com/account/subscription/cancel' },
  'hulu.com':          { name:'Hulu',          icon:'📺', cancelUrl:'https://secure.hulu.com/account/cancel' },
  'amazon.com':        { name:'Amazon Prime',  icon:'📦', cancelUrl:'https://www.amazon.com/mc/pipelines/cancellation' },
  'disneyplus.com':    { name:'Disney+',       icon:'🏰', cancelUrl:'https://www.disneyplus.com/account/subscription' },
  'apple.com':         { name:'Apple',         icon:'🍎', cancelUrl:'https://appleid.apple.com/account/manage' },
  'adobe.com':         { name:'Adobe',         icon:'🎨', cancelUrl:'https://account.adobe.com/plans' },
  'dropbox.com':       { name:'Dropbox',       icon:'📁', cancelUrl:'https://www.dropbox.com/account/plan' },
  'github.com':        { name:'GitHub',        icon:'🐙', cancelUrl:'https://github.com/settings/billing' },
  'openai.com':        { name:'ChatGPT Plus',  icon:'🤖', cancelUrl:'https://chat.openai.com/settings' },
  'notion.so':         { name:'Notion',        icon:'📝', cancelUrl:'https://www.notion.so/profile/billing' },
  'canva.com':         { name:'Canva Pro',     icon:'🎭', cancelUrl:'https://www.canva.com/settings/billing' },
  'duolingo.com':      { name:'Duolingo Plus', icon:'🦉', cancelUrl:'https://www.duolingo.com/settings/super-duo' },
  'zoom.us':           { name:'Zoom',          icon:'📹', cancelUrl:'https://zoom.us/account/billing' },
  'figma.com':         { name:'Figma',         icon:'🖌️', cancelUrl:'https://www.figma.com/settings#plan' },
  'audible.com':       { name:'Audible',       icon:'🎧', cancelUrl:'https://www.audible.com/account/cancel' },
  'grammarly.com':     { name:'Grammarly',     icon:'✍️', cancelUrl:'https://account.grammarly.com/subscription' },
  'nytimes.com':       { name:'NY Times',      icon:'📰', cancelUrl:'https://myaccount.nytimes.com/seg/subscription' },
  'planetfitness.com': { name:'Planet Fitness',icon:'🏋️', cancelUrl:'https://www.planetfitness.com/member' },
  'anthropic.com':     { name:'Claude Pro',    icon:'🧠', cancelUrl:'https://claude.ai/settings' },
};

function extractDomain(from: string): string | null {
  const m = from.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (!m) return null;
  const parts = m[1].split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : m[1];
}

function extractAmount(text: string): number | null {
  const m = text.match(/\$\s*(\d{1,4}(?:\.\d{2})?)/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  return val > 0 && val < 2000 ? val : null;
}

export async function scanGmail(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: 'subject:(subscription OR receipt OR invoice OR billing OR renewal)',
    maxResults: 50,
  });

  const messages = list.data.messages || [];
  const found    = new Map<string, any>();

  await Promise.all(messages.map(async (msg) => {
    try {
      const detail = await gmail.users.messages.get({
        userId: 'me', id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From','Subject'],
      });
      const headers = detail.data.payload?.headers || [];
      const from    = headers.find(h => h.name === 'From')?.value    || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const domain  = extractDomain(from);
      if (!domain) return;

      let service = SERVICES[domain];
      if (!service) {
        for (const [key, val] of Object.entries(SERVICES)) {
          if (domain.includes(key)) { service = val; break; }
        }
      }
      if (!service) return;

      const amount = extractAmount(subject);
      if (!amount) return;

      if (!found.has(service.name)) {
        found.set(service.name, {
          serviceName: service.name,
          serviceIcon: service.icon,
          cancelUrl:   service.cancelUrl,
          amount,
          emailFrom:   from.replace(/<.*>/, '').trim() || from,
          status:      'active',
        });
      }
    } catch {}
  }));

  return Array.from(found.values());
}
