import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  // 100 Level
  { title: "Rookie of the Year", order: 1 },
  { title: "Best Dressed (Male & Female) — 100 Level", order: 2 },

  // General Categories
  { title: "Most Fashionable (M/F)", order: 3 },
  { title: "Most Influential (M/F)", order: 4 },
  { title: "Producer of the Year", order: 5 },
  { title: "Artfully Creative", order: 6 },
  { title: "Photographer of the Year", order: 7 },
  { title: "Best Cafeteria Stand", order: 8 },
  { title: "Best Course Rep", order: 9 },
  { title: "Best Lecturer (CBAS/CHMS/CAHS)", order: 10 },
  { title: "Vocalist of the Year", order: 11 },
  { title: "Tech Savvy", order: 12 },
  { title: "Portalen of the Year (M/F)", order: 13 },
  { title: "Entrepreneur of the Year", order: 14 },
  { title: "Hairstylist of the Year", order: 15 },
  { title: "Fashion Designer of the Year", order: 16 },
  { title: "Sportsman & Sportswoman of the Year", order: 17 },
  { title: "Content Creator of the Year", order: 18 },
  { title: "Most Sociable (M/F)", order: 19 },
  { title: "Videographer of the Year", order: 20 },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { title: category.title },
      update: { order: category.order, isActive: true },
      create: { title: category.title, order: category.order, isActive: true },
    });
  }
  console.log(`✓ Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
