import crypto from 'node:crypto';
import { prisma } from './prisma.js';

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function createDeviceCode(deviceName = 'typing-trainer-cli') {
  const deviceCode = crypto.randomUUID();
  const userCode = crypto.randomUUID().slice(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + (10 * 60 * 1000));

  await prisma.cliDeviceCode.create({
    data: {
      deviceCodeHash: hash(deviceCode),
      userCode,
      deviceName,
      status: 'pending',
      intervalSec: 5,
      expiresAt
    }
  });

  return {
    deviceCode,
    userCode,
    verificationUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?code=${userCode}`,
    intervalSec: 5,
    expiresIn: 600
  };
}

export async function approveDeviceCode(userCode, userId) {
  const code = await prisma.cliDeviceCode.findFirst({
    where: {
      userCode: String(userCode || '').toUpperCase(),
      status: 'pending',
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!code) {
    throw new Error('Invalid or expired code.');
  }

  await prisma.cliDeviceCode.update({
    where: { id: code.id },
    data: { status: 'approved', userId, approvedAt: new Date() }
  });
}

export async function exchangeDeviceCode(deviceCode) {
  const code = await prisma.cliDeviceCode.findUnique({
    where: { deviceCodeHash: hash(deviceCode) }
  });

  if (!code || code.expiresAt <= new Date()) {
    return { status: 'expired' };
  }

  if (code.status !== 'approved' || !code.userId) {
    return { status: 'pending' };
  }

  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));

  await prisma.cliToken.create({
    data: {
      userId: code.userId,
      tokenHash: hash(accessToken),
      refreshTokenHash: hash(refreshToken),
      expiresAt,
      name: code.deviceName || 'typing-trainer-cli'
    }
  });

  await prisma.cliDeviceCode.update({
    where: { id: code.id },
    data: { status: 'consumed' }
  });

  return {
    status: 'approved',
    accessToken,
    refreshToken,
    expiresAt: expiresAt.getTime(),
    accountId: code.userId
  };
}

export async function userIdFromBearer(authHeader) {
  const token = String(authHeader || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const row = await prisma.cliToken.findFirst({
    where: {
      tokenHash: hash(token),
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!row) return null;

  await prisma.cliToken.update({
    where: { id: row.id },
    data: { lastUsedAt: new Date() }
  });

  return row.userId;
}
