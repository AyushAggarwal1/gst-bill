import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, organizationName, otp, newPassword } = await request.json();
    if (!email || !organizationName || !otp || !newPassword) {
      return NextResponse.json({ message: 'email, organizationName, otp and newPassword are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({ where: { name: organizationName } });
    if (!tenant) {
      return NextResponse.json({ message: 'Invalid organization' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email, tenantId: tenant.id } });
    if (!user) {
      // Do not reveal existence
      return NextResponse.json({ message: 'Invalid OTP or expired' }, { status: 400 });
    }

    const recentRequest = await prisma.passwordResetRequest.findFirst({
      where: { userId: user.id, tenantId: tenant.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!recentRequest) {
      return NextResponse.json({ message: 'Invalid OTP or expired' }, { status: 400 });
    }

    const isValid = await compare(otp, recentRequest.otpHash);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid OTP or expired' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.passwordResetRequest.update({ where: { id: recentRequest.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('reset-password error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


