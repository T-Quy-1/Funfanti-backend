import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const prisma = new PrismaClient();

interface AnswerDto {
  text: string;
  isCorrect: boolean;
}

interface QuestionDto {
  text: string;
  mediaUrl?: string;
  explanationText: string;
  orderIndex: number;
  answers: AnswerDto[];
}

interface QuestionSetDto {
  id?: string;
  title: string;
  description: string;
  topic: string;
  mediaUrl?: string;
  isFeatured: boolean;
  creatorEmail: string; // Used to link to an existing user
  tags: string[];
  questions: QuestionDto[];
}

export async function addQuestionSetFromJson(filePath: string, prismaClient?: PrismaClient) {
  const isLocalPrisma = !prismaClient;
  const prisma = prismaClient || new PrismaClient();

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found at: ${filePath}`);
    if (isLocalPrisma) process.exit(1);
    throw new Error(`File not found at: ${filePath}`);
  }

  console.log(`Reading question set from: ${filePath}...`);
  let data: QuestionSetDto;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(fileContent) as QuestionSetDto;
  } catch (err) {
    console.error(`❌ Failed to read or parse JSON file ${filePath}:`, err);
    if (isLocalPrisma) process.exit(1);
    throw err;
  }

  try {
    // 1. Find the Creator
    const creator = await prisma.user.findUnique({
      where: { email: data.creatorEmail },
    });

    if (!creator) {
      console.error(`❌ Creator not found with email: ${data.creatorEmail}`);
      if (isLocalPrisma) process.exit(1);
      throw new Error(`Creator not found with email: ${data.creatorEmail}`);
    }

    // 2. Ensure all Tags exist and get their IDs
    const tagIds = await Promise.all(
      data.tags.map(async (tagName) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        return tag.id;
      })
    );

    // 3. Clear existing question set if ID is provided to prevent unique constraint failures
    if (data.id) {
      const existing = await prisma.questionSet.findUnique({ where: { id: data.id } });
      if (existing) {
        await prisma.questionSet.delete({ where: { id: data.id } });
      }
    }

    // 4. Create QuestionSet with Questions and AnswerChoices deeply nested
    const questionSet = await prisma.questionSet.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        title: data.title,
        description: data.description,
        topic: data.topic,
        mediaUrl: data.mediaUrl,
        isFeatured: data.isFeatured,
        questionCount: data.questions.length,
        creatorId: creator.id,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            explanationText: q.explanationText,
            orderIndex: q.orderIndex,
            mediaUrl: q.mediaUrl,
            choices: {
              create: q.answers.map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: { include: { choices: true } },
        tags: { include: { tag: true } },
      },
    });

    console.log(`✅ Successfully created Question Set: "${questionSet.title}" (ID: ${questionSet.id})`);
    console.log(`Included ${questionSet.questions.length} questions and ${questionSet.tags.length} tags.`);
    return questionSet;
  } catch (err) {
    console.error(`❌ Failed to insert Question Set from ${filePath} into database:`, err);
    throw err;
  } finally {
    if (isLocalPrisma) await prisma.$disconnect();
  }
}

async function run() {
  const filePathArg = process.argv[2];

  if (!filePathArg) {
    console.error('❌ Please provide a path to the JSON file containing the question set.');
    console.log('Usage: npx ts-node scripts/add-question-set.ts <path_to_json>');
    process.exit(1);
  }

  await addQuestionSetFromJson(path.resolve(filePathArg));
}

// Only run if called directly
if (require.main === module) {
  run();
}
