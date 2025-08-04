// src/app/api/seed/route.ts
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';

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

    return new Response('✅ Admin user seeded');
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    return new Response(`❌ Seeding failed: ${error.message}`, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
