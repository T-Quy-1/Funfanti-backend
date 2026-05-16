import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: 'dummyhash',
      displayName: 'Test User',
    },
  });

  // 2. Create tags
  const tag1 = await prisma.tag.upsert({
    where: { name: 'science' },
    update: {},
    create: { name: 'science' },
  });

  const tag2 = await prisma.tag.upsert({
    where: { name: 'general' },
    update: {},
    create: { name: 'general' },
  });

  const tag3 = await prisma.tag.upsert({
    where: { name: 'history' },
    update: {},
    create: { name: 'history' },
  });


  // 3. Create a question set
  const qs1 = await prisma.questionSet.create({
    data: {
      title: 'Basic Science Quiz',
      description: 'A quick quiz to test your basic science knowledge!',
      topic: 'science',
      isFeatured: true,
      creatorId: user.id,
      tags: {
        create: [
          { tagId: tag1.id },
          { tagId: tag2.id }
        ]
      },
      questions: {
        create: [
          {
            text: 'What planet is known as the Red Planet?',
            orderIndex: 1,
            choices: {
              create: [
                { text: 'Earth', isCorrect: false },
                { text: 'Mars', isCorrect: true },
                { text: 'Jupiter', isCorrect: false },
              ]
            }
          },
          {
            text: 'What is the chemical symbol for water?',
            orderIndex: 2,
            choices: {
              create: [
                { text: 'O2', isCorrect: false },
                { text: 'CO2', isCorrect: false },
                { text: 'H2O', isCorrect: true },
              ]
            }
          }
        ]
      }
    }
  });

  const qs2 = await prisma.questionSet.create({
    data: {
      title: 'WW2 Quiz',
      description: 'A quick quiz to test your World War 2 knowledge!',
      topic: 'history',
      isFeatured: true,
      creatorId: user.id,
      tags: {
        create: [
          { tagId: tag3.id },
        ]
      },
      questions: {
        create: [
          {
            text: 'When did WW2 start?',
            orderIndex: 1,
            choices: {
              create: [
                { text: '1939', isCorrect: true },
                { text: '1941', isCorrect: false },
                { text: '1945', isCorrect: false },
              ]
            }
          },
          {
            text: 'Which nation is in the Axis?',
            orderIndex: 2,
            choices: {
              create: [
                { text: 'USSR', isCorrect: false },
                { text: 'Germany', isCorrect: true },
                { text: 'USA', isCorrect: false },
              ]
            }
          },
          {
            text: 'Who led Italy during WW2?',
            orderIndex: 3,
            choices: {
              create: [
                { text: 'Adolf Hitler', isCorrect: false },
                { text: 'Francisco Franco', isCorrect: false },
                { text: 'Benito Mussoline', isCorrect: true },
              ]
            }
          }

        ]
      }
    }
  });

  console.log(`Created QuestionSet: ${qs1.title} with ID: ${qs1.id}`);
  console.log(`Created QuestionSet: ${qs2.title} with ID: ${qs2.id}`);
  console.log('Seeding finished.');
}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
