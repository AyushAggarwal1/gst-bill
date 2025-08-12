import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateNumericOtp } from '@/lib/utils';
import { hash } from 'bcrypt';
import { sendPasswordOtpMail } from '@/lib/mailer';

const OTP_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const { email, organizationName } = await request.json();
    if (!email || !organizationName) {
      return NextResponse.json({ message: 'email and organizationName are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOrgName = String(organizationName).trim();

    const tenant = await prisma.tenant.findFirst({ where: { name: normalizedOrgName } });
    if (!tenant) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const user = await prisma.user.findFirst({ where: { email: normalizedEmail, tenantId: tenant.id } });
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Email not found for this organization' }, { status: 404 });
    }

    const otp = generateNumericOtp(6);
    const otpHash = await hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetRequest.create({
      data: {
        email: normalizedEmail,
        tenantId: tenant.id,
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    await sendPasswordOtpMail(normalizedEmail, otp);

    return NextResponse.json({ message: 'If the account exists, an email has been sent.' });
  } catch (error) {
    console.error('forgot-password error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


