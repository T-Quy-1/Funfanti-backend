import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a hashed password for seed users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Create Users
  const creator = await prisma.user.upsert({
    where: { email: 'creator@example.com' },
    update: {},
    create: {
      email: 'creator@example.com',
      passwordHash,
      displayName: 'Creator User',
      preference: {
        create: {
          theme: 'dark',
          hapticsEnabled: true,
          notificationOverlay: true,
          lockScreenTiming: { morning: '08:00', evening: '20:00' },
        },
      },
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@example.com' },
    update: {},
    create: {
      email: 'learner@example.com',
      passwordHash,
      displayName: 'Learner User',
      preference: {
        create: {
          theme: 'system',
          hapticsEnabled: true,
          notificationOverlay: false,
          lockScreenTiming: { noon: '12:00' },
        },
      },
    },
  });

  // 3. Create Tags
  const mathTag = await prisma.tag.upsert({
    where: { name: 'Math' },
    update: {},
    create: { name: 'Math' },
  });

  const scienceTag = await prisma.tag.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science' },
  });

  const generalTag = await prisma.tag.upsert({
    where: { name: 'General' },
    update: {},
    create: { name: 'General' },
  });

  // 4. Create Question Sets
  const mathSet = await prisma.questionSet.upsert({
    where: { id: 'a5f22e84-1849-417f-94ad-731ff58fb810' }, // static UUID for E2E tests consistency
    update: {},
    create: {
      id: 'a5f22e84-1849-417f-94ad-731ff58fb810',
      creatorId: creator.id,
      title: 'Mental Math Magic',
      description: 'Test your quick thinking and basic arithmetic skills in under 15 seconds.',
      topic: 'math',
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1612345678/math.jpg',
      isFeatured: true,
      tags: {
        create: [
          { tagId: mathTag.id },
          { tagId: generalTag.id },
        ],
      },
    },
  });

  const scienceSet = await prisma.questionSet.upsert({
    where: { id: 'b2c93d95-2950-528f-a5be-842ff69fc921' }, // static UUID
    update: {},
    create: {
      id: 'b2c93d95-2950-528f-a5be-842ff69fc921',
      creatorId: creator.id,
      title: 'Intro to Chemistry',
      description: 'Learn the fundamentals of elements, atoms, and chemical reactions.',
      topic: 'science',
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1612345678/chemistry.jpg',
      isFeatured: false,
      tags: {
        create: [
          { tagId: scienceTag.id },
        ],
      },
    },
  });

  // 5. Create Questions and Answers for Math
  await prisma.question.createMany({
    data: [
      {
        id: '1e37452e-c124-4fbb-a297-c256338fb502',
        questionSetId: mathSet.id,
        text: 'What is 15 x 6?',
        explanationText: '15 x 6 = 90. A quick trick is (10 x 6) + (5 x 6) = 60 + 30 = 90.',
        orderIndex: 0,
      },
      {
        id: 'f87a8c62-11ef-42d4-a8eb-9d8a571f543e',
        questionSetId: mathSet.id,
        text: 'Solve for x: 3x - 7 = 14',
        explanationText: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.',
        orderIndex: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Insert choices for math questions
  await prisma.answerChoice.createMany({
    data: [
      { questionId: '1e37452e-c124-4fbb-a297-c256338fb502', text: '80', isCorrect: false },
      { questionId: '1e37452e-c124-4fbb-a297-c256338fb502', text: '90', isCorrect: true },
      { questionId: '1e37452e-c124-4fbb-a297-c256338fb502', text: '85', isCorrect: false },
      { questionId: '1e37452e-c124-4fbb-a297-c256338fb502', text: '95', isCorrect: false },

      { questionId: 'f87a8c62-11ef-42d4-a8eb-9d8a571f543e', text: 'x = 5', isCorrect: false },
      { questionId: 'f87a8c62-11ef-42d4-a8eb-9d8a571f543e', text: 'x = 6', isCorrect: false },
      { questionId: 'f87a8c62-11ef-42d4-a8eb-9d8a571f543e', text: 'x = 7', isCorrect: true },
      { questionId: 'f87a8c62-11ef-42d4-a8eb-9d8a571f543e', text: 'x = 8', isCorrect: false },
    ],
    skipDuplicates: true,
  });

  // 6. Create Questions and Answers for Science
  await prisma.question.createMany({
    data: [
      {
        id: 'cd916298-9418-4b7d-8153-294b29bb859a',
        questionSetId: scienceSet.id,
        text: 'What is the chemical symbol for Gold?',
        explanationText: 'The symbol for Gold is Au, which comes from the Latin word aurum (meaning shining dawn).',
        orderIndex: 0,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.answerChoice.createMany({
    data: [
      { questionId: 'cd916298-9418-4b7d-8153-294b29bb859a', text: 'Ag', isCorrect: false },
      { questionId: 'cd916298-9418-4b7d-8153-294b29bb859a', text: 'Fe', isCorrect: false },
      { questionId: 'cd916298-9418-4b7d-8153-294b29bb859a', text: 'Au', isCorrect: true },
      { questionId: 'cd916298-9418-4b7d-8153-294b29bb859a', text: 'Gd', isCorrect: false },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
