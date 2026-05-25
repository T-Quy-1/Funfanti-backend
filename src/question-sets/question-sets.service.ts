import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  QueryQuestionSetsDto,
  QuestionSetSort,
} from './dto/query-question-sets.dto';

@Injectable()
export class QuestionSetsService {
  private readonly logger = new Logger(QuestionSetsService.name);

  constructor(private readonly prisma: PrismaService) { }

  async findTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    return tags.map((tag) => tag.name);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateAllRatings() {
    this.logger.log('Running periodic rating aggregation...');

    // Group all reviews by questionSetId and calculate averages/counts
    const aggregations = await this.prisma.review.groupBy({
      by: ['questionSetId'],
      _avg: { rating: true },
      _count: { id: true },
    });

    for (const agg of aggregations) {
      if (!agg._avg.rating) continue;

      await this.prisma.questionSet.update({
        where: { id: agg.questionSetId },
        data: {
          avgRating: agg._avg.rating,
          reviewCount: agg._count.id,
        },
      });
    }

    this.logger.log(
      `Updated ratings for ${aggregations.length} question sets.`,
    );
  }

  async findAll(query: QueryQuestionSetsDto, userId?: string) {
    const {
      topic,
      search,
      tags,
      minQuestions,
      maxQuestions,
      minRating,
      maxRating,
      sort,
      isFeatured,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionSetWhereInput = {};

    if (topic) {
      where.topic = { equals: topic, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags, mode: 'insensitive' },
          },
        },
      };
    }

    if (minQuestions !== undefined || maxQuestions !== undefined) {
      where.questionCount = {
        ...(minQuestions !== undefined && { gte: minQuestions }),
        ...(maxQuestions !== undefined && { lte: maxQuestions }),
      };
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.avgRating = {
        ...(minRating !== undefined && { gte: minRating }),
        ...(maxRating !== undefined && { lte: maxRating }),
      };
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
    } else if (sort === QuestionSetSort.Rating) {
      orderBy = { avgRating: 'desc' };
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

    const completedSessionSetIds = userId
      ? new Set(
        (
          await this.prisma.quizSession.findMany({
            where: {
              userId,
              status: 'COMPLETED',
            },
            select: { questionSetId: true },
          })
        ).map((s) => s.questionSetId),
      )
      : new Set<string>();

    const bookmarkedSetIds = userId
      ? new Set(
        (
          await this.prisma.bookmark.findMany({
            where: { userId },
            select: { questionSetId: true },
          })
        ).map((b) => b.questionSetId),
      )
      : new Set<string>();

    return questionSets.map((qs) => ({
      id: qs.id,
      title: qs.title,
      description: qs.description,
      summary: qs.summary,
      topic: qs.topic,
      mediaUrl: qs.mediaUrl,
      isFeatured: qs.isFeatured,
      avgRating: qs.avgRating,
      reviewCount: qs.reviewCount,
      tags: qs.tags.map((t) => t.tag.name),
      creator: qs.creator,
      questionCount: qs._count.questions,
      sessionCount: qs._count.sessions,
      createdAt: qs.createdAt,
      progress: completedSessionSetIds.has(qs.id) ? 1 : 0,
      isBookmarked: bookmarkedSetIds.has(qs.id),
    }));
  }

  async findOne(id: string, userId?: string) {
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

    let progress = 0;
    let isBookmarked = false;
    if (userId) {
      const completedSession = await this.prisma.quizSession.findFirst({
        where: {
          userId,
          questionSetId: id,
          status: 'COMPLETED',
        },
      });
      if (completedSession) {
        progress = 1;
      }
      const bookmark = await this.prisma.bookmark.findFirst({
        where: {
          userId,
          questionSetId: id,
        },
      });
      if (bookmark) {
        isBookmarked = true;
      }
    }

    return {
      id: qs.id,
      title: qs.title,
      description: qs.description,
      summary: qs.summary,
      topic: qs.topic,
      mediaUrl: qs.mediaUrl,
      isFeatured: qs.isFeatured,
      avgRating: qs.avgRating,
      reviewCount: qs.reviewCount,
      tags: qs.tags.map((t) => t.tag.name),
      creator: qs.creator,
      questionCount: qs._count.questions,
      sessionCount: qs._count.sessions,
      createdAt: qs.createdAt,
      progress,
      isBookmarked,
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
      summary: qs.summary,
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
