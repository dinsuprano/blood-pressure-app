import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Intan226@', 10);

  await prisma.user.upsert({
    where: { email: 'dinsuprano@gmail.com' },
    update: {},
    create: {
      email: 'dinsuprano@gmail.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user seeded');
}

