import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️ PREPARING FACTORY RESET ⚠️");
  console.log("This will delete ALL Users, Profiles, OTPs, and Votes.");
  console.log("Categories and Contestants will be kept intact.");

  // Because of onDelete: Cascade, deleting users will automatically wipe out their votes and OTP codes.
  const { count } = await prisma.user.deleteMany();

  console.log(`✅ FACTORY RESET COMPLETE.`);
  console.log(`✅ Deleted ${count} users (and all associated votes/OTPs).`);
  console.log("The system is completely wiped and ready for the real election.");
}

main()
  .catch((e) => {
    console.error("❌ Failed to reset database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
