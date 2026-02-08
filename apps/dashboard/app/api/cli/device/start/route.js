import { NextResponse } from 'next/server';
import { createDeviceCode } from '../../../../../lib/cliAuth.js';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const out = await createDeviceCode(body.deviceName);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to start device flow' }, { status: 500 });
  }
}
