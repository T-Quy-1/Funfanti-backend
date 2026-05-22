import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { addQuestionSetFromJson } from '../scripts/add-question-set';

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

  const historyTag = await prisma.tag.upsert({
    where: { name: 'History' },
    update: {},
    create: { name: 'History' },
  });

  // 4. Create Question Sets from JSON files
  const questionSetsDir = path.join(__dirname, '../scripts/question_sets');
  if (fs.existsSync(questionSetsDir)) {
    const files = fs.readdirSync(questionSetsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(questionSetsDir, file);
        console.log(`Processing ${file}...`);
        await addQuestionSetFromJson(filePath, prisma);
      }
    }
  }

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
