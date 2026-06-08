export async function createCheckout(email: string, userId: string) {
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: { email, custom: { user_id: userId } },
        product_options: {
          redirect_url: `${process.env.NEXTAUTH_URL}/success`,
        },
      },
      relationships: {
        store:   { data: { type:'stores',   id: process.env.LEMONSQUEEZY_STORE_ID! } },
        variant: { data: { type:'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID! } },
      },
    },
  };
  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept':        'application/vnd.api+json',
      'Content-Type':  'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Checkout failed');
  const data = await res.json();
  return data.data.attributes.url as string;
}

export async function verifyWebhook(body: string, signature: string): Promise<boolean> {
  const secret  = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const encoder = new TextEncoder();
  const key     = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name:'HMAC', hash:'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2,'0')).join('');
  return hex === signature;
}
