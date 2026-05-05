import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Preparing to delete all votes from the database...");
  
  const { count } = await prisma.vote.deleteMany();
  
  console.log(`✅ Successfully deleted ${count} votes. The system is now wiped clean for a new election.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed to clear votes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
