import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = {
  title: string;
  contestants: { name: string; imageUrl: string }[];
};

const categories: SeedCategory[] = [
  {
    title: "Rookie of the Year (100 Level)",
    contestants: [
      { name: "Amina Yusuf", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop" },
      { name: "Daniel Okafor", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&auto=format&fit=crop" },
      { name: "Zainab Bello", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Best Dressed (Male & Female) (100 Level)",
    contestants: [
      { name: "Ibrahim Musa", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop" },
      { name: "Precious Adeyemi", imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&auto=format&fit=crop" },
      { name: "Grace Emmanuel", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Most Fashionable (M/F)",
    contestants: [
      { name: "Tobiloba Akin", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&auto=format&fit=crop" },
      { name: "Mariam Sule", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop" },
      { name: "Philip Nwosu", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Most Influential (M/F)",
    contestants: [
      { name: "Chidi Eze", imageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80&auto=format&fit=crop" },
      { name: "Esther Danjuma", imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80&auto=format&fit=crop" },
      { name: "Samuel Isaac", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Producer of the Year",
    contestants: [
      { name: "Kelvin Pius", imageUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&q=80&auto=format&fit=crop" },
      { name: "Micheal Audu", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&auto=format&fit=crop" },
      { name: "Ella Matthew", imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Artfully Creative",
    contestants: [
      { name: "Rita Chukwu", imageUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&q=80&auto=format&fit=crop" },
      { name: "Bashir Lawal", imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&q=80&auto=format&fit=crop" },
      { name: "Sade Williams", imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Photographer of the Year",
    contestants: [
      { name: "Mfon Udo", imageUrl: "https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=800&q=80&auto=format&fit=crop" },
      { name: "Godwin Joel", imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80&auto=format&fit=crop" },
      { name: "Deborah Simon", imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Best Cafeteria Stand",
    contestants: [
      { name: "Mama Tasty Spot", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format&fit=crop" },
      { name: "Campus Grill Hub", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop" },
      { name: "Fresh Bite Kitchen", imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Best Course Rep",
    contestants: [
      { name: "Maryam Farouk", imageUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800&q=80&auto=format&fit=crop" },
      { name: "Joseph Peter", imageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=800&q=80&auto=format&fit=crop" },
      { name: "Hannah Moses", imageUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Best Lecturer (CBAS/CHMS/CAHS)",
    contestants: [
      { name: "Dr. Abdullahi Sani", imageUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&q=80&auto=format&fit=crop" },
      { name: "Dr. Ifeoma Obi", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop" },
      { name: "Dr. Patrick Ene", imageUrl: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Vocalist of the Year",
    contestants: [
      { name: "Naomi Praise", imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80&auto=format&fit=crop" },
      { name: "Victor Keys", imageUrl: "https://images.unsplash.com/photo-1520367745676-03bbcd9919eb?w=800&q=80&auto=format&fit=crop" },
      { name: "Lilian Voice", imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Tech Savvy",
    contestants: [
      { name: "Aisha Binary", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop" },
      { name: "David Stack", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80&auto=format&fit=crop" },
      { name: "Mustapha Kernel", imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "SRC of the Year",
    contestants: [
      { name: "Ifeanyi Kalu", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&auto=format&fit=crop" },
      { name: "Fatima Adamu", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop" },
      { name: "Blessing Nnamdi", imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Portalen of the Year (M/F)",
    contestants: [
      { name: "Emeka Portal", imageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80&auto=format&fit=crop" },
      { name: "Zara Portal", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80&auto=format&fit=crop" },
      { name: "Nura Portal", imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Entrepreneur of the Year",
    contestants: [
      { name: "Rukayat Ventures", imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&auto=format&fit=crop" },
      { name: "Bala Enterprises", imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80&auto=format&fit=crop" },
      { name: "Cynthia Brand", imageUrl: "https://images.unsplash.com/photo-1541534401786-2077eed87a72?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Hairstylist of the Year",
    contestants: [
      { name: "Styled by Tolu", imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&auto=format&fit=crop" },
      { name: "Braids by Zee", imageUrl: "https://images.unsplash.com/photo-1522336284037-91f7da073525?w=800&q=80&auto=format&fit=crop" },
      { name: "Hair Lab by Kemi", imageUrl: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Fashion Designer of the Year",
    contestants: [
      { name: "Ola Couture", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop" },
      { name: "Nene Stitch", imageUrl: "https://images.unsplash.com/photo-1465406325903-9d93ee82f613?w=800&q=80&auto=format&fit=crop" },
      { name: "Yusuf Atelier", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop" }
    ]
  },
  {
    title: "Sportsman & Sportswoman of the Year",
    contestants: [
      { name: "Abdul Sprinter", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&auto=format&fit=crop" },
      { name: "Joy Athlete", imageUrl: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=800&q=80&auto=format&fit=crop" },
      { name: "Peter Champion", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80&auto=format&fit=crop" }
    ]
  }
];

async function main() {
  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { title: category.title },
      update: { isActive: true },
      create: { title: category.title, isActive: true }
    });

    for (const contestant of category.contestants) {
      await prisma.contestant.upsert({
        where: {
          categoryId_name: {
            categoryId: savedCategory.id,
            name: contestant.name
          }
        },
        update: {
          imageUrl: contestant.imageUrl
        },
        create: {
          categoryId: savedCategory.id,
          name: contestant.name,
          imageUrl: contestant.imageUrl
        }
      });
    }
  }

  console.log(`Safely seeded ${categories.length} categories with upserted contestants.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
