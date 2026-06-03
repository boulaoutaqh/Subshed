import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id }, orderBy: { amount: 'desc' },
  });

  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  });

  const monthly = subs.filter(s=>s.status==='active').reduce((a,s)=>a + s.amount, 0);
  
  return NextResponse.json({ 
    subscriptions: subs, 
    monthlyTotal: parseFloat(monthly.toFixed(2)),
    isPro: user?.isPro || false
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  await prisma.subscription.updateMany({ where: { id, userId: session.user.id }, data: { status } });
  return NextResponse.json({ success: true });
}