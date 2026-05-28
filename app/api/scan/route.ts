import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scanGmail } from '@/lib/gmail-scanner';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(session as any).accessToken)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ✅ التحقق من Pro
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  if (!user?.isPro)
    return NextResponse.json({ error: 'Pro required' }, { status: 403 });

  try {
    const subs = await scanGmail((session as any).accessToken);
    for (const sub of subs) {
      await prisma.subscription.upsert({
        where: { userId_serviceName: { userId: session.user.id, serviceName: sub.serviceName } },
        update: { amount: sub.amount, updatedAt: new Date() },
        create: { ...sub, userId: session.user.id },
      });
    }
    const all = await prisma.subscription.findMany({
      where: { userId: session.user.id }, orderBy: { amount: 'desc' },
    });
    return NextResponse.json({ subscriptions: all, found: subs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scan failed' }, { status: 500 });
  }
}