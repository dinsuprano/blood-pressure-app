// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// async function main() {
//   const password = await bcrypt.hash("Intan226@", 10)

//   await prisma.user.upsert({
//     where: { email: "dinsuprano@gmail.com" },
//     update: {},
//     create: {
//       email: "dinsuprano@gmail.com",
//       password,
//     },
//   })
// }

// main()
//   .then(() => {
//     console.log("✅ Seeded admin user")
//   })
//   .catch((e) => {
//     console.error("❌ Error seeding:", e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
