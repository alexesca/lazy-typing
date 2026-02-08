import { NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth.js';
import { approveDeviceCode } from '../../../../../lib/cliAuth.js';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const userCode = String(body.userCode || '').toUpperCase();
  if (!userCode) {
    return NextResponse.json({ error: 'Missing user code' }, { status: 400 });
  }

  try {
    await approveDeviceCode(userCode, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to approve code' }, { status: 400 });
  }
}
