import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook }             from '@/lib/lemonsqueezy';
import { prisma }                    from '@/lib/db';

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('x-signature') || '';

  if (!await verifyWebhook(body, signature))
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const payload = JSON.parse(body);
  const event   = payload.meta?.event_name;
  const data    = payload.data?.attributes || {};
  const userId  = payload.meta?.custom_data?.user_id;
  if (!userId) return NextResponse.json({ ok: true });

  const isActive    = ['order_created'].includes(event);
  const isCancelled = false;

  if (isActive) {
    await prisma.user.update({ where:{ id:userId }, data:{ isPro:true, lsCustomerId:String(data.customer_id||''), lsSubscriptionId:String(data.id||'') } });
  } else if (isCancelled) {
    await prisma.user.update({ where:{ id:userId }, data:{ isPro:false } });
  }
  return NextResponse.json({ ok: true });
}
