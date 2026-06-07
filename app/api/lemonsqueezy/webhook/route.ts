import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/lemonsqueezy';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('x-signature') || '';

  if (!await verifyWebhook(body, signature))
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const payload   = JSON.parse(body);
  const event     = payload.meta?.event_name;
  const data      = payload.data?.attributes || {};
  const userEmail = data.user_email;

  if (!userEmail) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return NextResponse.json({ ok: true });

  if (event === 'order_created') {
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        isPro: true,
        lsCustomerId: String(data.customer_id || ''),
        lsSubscriptionId: String(data.id || ''),
      }
    });
  }

  return NextResponse.json({ ok: true });
}