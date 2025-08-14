import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'currentPassword and newPassword are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: currentUser.id, tenantId: currentUser.tenantId },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isCurrentValid = await compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    const isSameAsOld = await compare(newPassword, user.password);
    if (isSameAsOld) {
      return NextResponse.json({ message: 'New password must be different from current password' }, { status: 400 });
    }

    const newHashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: newHashed } });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('change-password error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

