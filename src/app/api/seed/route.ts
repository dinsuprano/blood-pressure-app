import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('Intan226@', 10);

    await prisma.user.upsert({
      where: { email: 'dinsuprano@gmail.com' },
      update: {},
      create: {
        email: 'dinsuprano@gmail.com',
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: '✅ Admin user seeded' });
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    return NextResponse.json({ error: error.message || '❌ Seeding failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
