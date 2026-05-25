import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth';
import { createCheckout }            from '@/lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = await createCheckout(session.user.email, session.user.id);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
