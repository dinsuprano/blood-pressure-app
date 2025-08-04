import { PrismaClient } from '@/generated/prisma'; // or fix the path if needed
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
    console.error('❌ Seed error:', error);
    return new Response(`❌ Seed failed: ${error.message}`, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
