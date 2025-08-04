import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  await prisma.record.deleteMany();
  console.log("✅ Record table cleared");

  // optionally: await prisma.user.deleteMany();
}

main().finally(() => prisma.$disconnect());
