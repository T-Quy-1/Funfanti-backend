import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuestionSetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    // To be implemented
  }

  async findOne(id: string) {
    // To be implemented
  }

  async getQuestions(id: string) {
    // To be implemented
  }

  async bookmark(userId: string, questionSetId: string) {
    // To be implemented
  }
}
