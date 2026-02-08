import { NextResponse } from 'next/server';
import { exchangeDeviceCode } from '../../../../../lib/cliAuth.js';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const deviceCode = String(body.deviceCode || '');
  if (!deviceCode) {
    return NextResponse.json({ error: 'Missing device code' }, { status: 400 });
  }

  try {
    const out = await exchangeDeviceCode(deviceCode);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to exchange token' }, { status: 500 });
  }
}
