import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();

async function main() {
  if (!email) {
    console.error("Usage: npm run db:cancel-vote -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`No user found with email: ${email}`);
    return;
  }

  const { count } = await prisma.vote.deleteMany({ where: { userId: user.id } });
  console.log(`✅ Deleted ${count} vote(s) for ${email}`);
}

main()
  .catch((e) => { console.error("❌ Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
