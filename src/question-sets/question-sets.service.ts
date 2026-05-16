import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuestionSetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(topic?: string, sort?: string) {
    const where = topic ? { topic } : {};
    let orderBy: any = [
      { isFeatured: 'desc' },
      { createdAt: 'desc' }
    ];

    if (sort === 'latest') {
      orderBy = { createdAt: 'desc' };
    }

    const questionSets = await this.prisma.questionSet.findMany({
      where,
      orderBy,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return questionSets.map(qs => ({
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map(t => t.tag.name)
    }));
  }

  async findOne(id: string) {
    const qs = await this.prisma.questionSet.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    return {
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map(t => t.tag.name)
    };
  }

  async getQuestions(id: string) {
    const qs = await this.prisma.questionSet.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        questions: {
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            choices: true
          }
        }
      }
    });

    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    return {
      id: qs.id,
      title: qs.title,
      description: qs.description,
      topic: qs.topic,
      isFeatured: qs.isFeatured,
      tags: qs.tags.map(t => t.tag.name),
      questions: qs.questions.map(q => ({
        id: q.id,
        text: q.text,
        mediaUrl: q.mediaUrl || undefined,
        explanationText: q.explanationText || undefined,
        orderIndex: q.orderIndex,
        choices: q.choices.map(c => ({
          id: c.id,
          text: c.text,
          isCorrect: c.isCorrect
        }))
      }))
    };
  }

  async bookmark(userId: string, questionSetId: string) {
    const qs = await this.prisma.questionSet.findUnique({ where: { id: questionSetId } });
    if (!qs) {
      throw new NotFoundException('Question set not found');
    }

    const existingBookmark = await this.prisma.bookmark.findFirst({
      where: { userId, questionSetId }
    });

    if (existingBookmark) {
      return { message: 'Question set is already bookmarked' };
    }

    await this.prisma.bookmark.create({
      data: { userId, questionSetId }
    });

    return { message: 'Bookmark created successfully' };
  }
}
