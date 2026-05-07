import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Old combined titles that must be removed before inserting split versions
const OBSOLETE_TITLES = [
  "Best Dressed (Male & Female) — 100 Level",
  "Most Fashionable (M/F)",
  "Most Influential (M/F)",
  "Portalen of the Year (M/F)",
  "Sportsman & Sportswoman of the Year",
  "Most Sociable (M/F)",
];

const categories = [
  // 100 Level
  { title: "Rookie of the Year", order: 1 },
  { title: "Best Dressed (Male) — 100 Level", order: 2 },
  { title: "Best Dressed (Female) — 100 Level", order: 3 },

  // General Categories
  { title: "Most Fashionable (Male)", order: 4 },
  { title: "Most Fashionable (Female)", order: 5 },
  { title: "Most Influential (Male)", order: 6 },
  { title: "Most Influential (Female)", order: 7 },
  { title: "Producer of the Year", order: 8 },
  { title: "Artfully Creative", order: 9 },
  { title: "Photographer of the Year", order: 10 },
  { title: "Best Cafeteria Stand", order: 11 },
  { title: "Best Course Rep", order: 12 },
  { title: "Best Lecturer (CBAS/CHMS/CAHS)", order: 13 },
  { title: "Vocalist of the Year", order: 14 },
  { title: "Tech Savvy", order: 15 },
  { title: "Portalen of the Year (Male)", order: 16 },
  { title: "Portalen of the Year (Female)", order: 17 },
  { title: "Entrepreneur of the Year", order: 18 },
  { title: "Hairstylist of the Year", order: 19 },
  { title: "Fashion Designer of the Year", order: 20 },
  { title: "Sportsman of the Year", order: 21 },
  { title: "Sportswoman of the Year", order: 22 },
  { title: "Content Creator of the Year", order: 23 },
  { title: "Most Sociable (Male)", order: 24 },
  { title: "Most Sociable (Female)", order: 25 },
  { title: "Videographer of the Year", order: 26 },
];

async function main() {
  // Remove old combined M/F categories (cascades to contestants/votes)
  const deleted = await prisma.category.deleteMany({
    where: { title: { in: OBSOLETE_TITLES } },
  });
  if (deleted.count > 0) {
    console.log(`✓ Removed ${deleted.count} obsolete combined categories.`);
  }

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
