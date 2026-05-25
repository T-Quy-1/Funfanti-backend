import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import {
  QueryQuestionSetsDto,
  QuestionSetSort,
} from './dto/query-question-sets.dto';

@Injectable()
export class QuestionSetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryQuestionSetsDto) {
    const { topic, sort, isFeatured, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionSetWhereInput = {};
    if (topic) {
      where.topic = { equals: topic, mode: 'insensitive' };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    let orderBy:
      | Prisma.QuestionSetOrderByWithRelationInput
      | Prisma.QuestionSetOrderByWithRelationInput[];
    if (sort === QuestionSetSort.Popular) {
      orderBy = { sessions: { _count: 'desc' } };
    } else if (sort === QuestionSetSort.Latest) {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const questionSets = await this.prisma.questionSet.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        tags: {
          include: { tag: true },
        },
        creator: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        _count: {
          select: { sessions: true, questions: true },
        },
      },
    });

    return questionSets.map((qs) => ({
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      mediaUrl: qs.mediaUrl,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map((t) => t.tag.name),
      creator: qs.creator,
      questionCount: qs._count.questions,
      sessionCount: qs._count.sessions,
      createdAt: qs.createdAt,
    }));
  }

  async getTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    return tags.map((tag) => tag.name);
  }

  async findOne(id: string) {
    const qs = await this.prisma.questionSet.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
        creator: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        _count: {
          select: { sessions: true, questions: true },
        },
      },
    });

    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    return {
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      mediaUrl: qs.mediaUrl,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map((t) => t.tag.name),
      creator: qs.creator,
      questionCount: qs._count.questions,
      sessionCount: qs._count.sessions,
      createdAt: qs.createdAt,
    };
  }

  async getQuestions(id: string) {
    const qs = await this.prisma.questionSet.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            choices: {
              select: {
                id: true,
                text: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    return {
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      mediaUrl: qs.mediaUrl,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map((t) => t.tag.name),
      questions: qs.questions.map((q) => ({
        id: q.id,
        text: q.text,
        mediaUrl: q.mediaUrl,
        explanationText: q.explanationText,
        orderIndex: q.orderIndex,
        choices: q.choices,
      })),
    };
  }

  async bookmark(userId: string, questionSetId: string) {
    // Check if question set exists
    const qs = await this.prisma.questionSet.findUnique({
      where: { id: questionSetId },
    });

    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    // Check if already bookmarked
    const existing = await this.prisma.bookmark.findFirst({
      where: { userId, questionSetId },
    });

    if (existing) {
      throw new ConflictException('Question set already bookmarked');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: { userId, questionSetId },
    });

    return {
      id: bookmark.id,
      questionSetId: bookmark.questionSetId,
      createdAt: bookmark.createdAt,
      message: 'Bookmark created successfully',
    };
  }

  async removeBookmark(userId: string, questionSetId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { userId, questionSetId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return { message: 'Bookmark removed successfully' };
  }
}
