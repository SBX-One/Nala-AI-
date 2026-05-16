import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed Categories
  const categories = [
    "Anxiety Management",
    "Stress Relief",
    "Mindfulness",
    "Self Improvement",
    "Relationships",
    "Sleep Hygiene"
  ];

  for (const cat of categories) {
    await prisma.articleCategory.upsert({
      where: { id: categories.indexOf(cat) + 1 },
      update: {},
      create: { name: cat }
    });
  }

  // Seed Topics
  const topics = [
    "Grounding Techniques",
    "Breathing Exercises",
    "Workplace Stress",
    "Digital Detox",
    "Positive Affirmations",
    "CBT Basics"
  ];

  for (const top of topics) {
    await prisma.articleCategoryTopic.upsert({
      where: { id: topics.indexOf(top) + 1 },
      update: {},
      create: { 
        name: top,
        category: { connect: { id: 1 } }
      }
    });
  }

  console.log("Seed finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
