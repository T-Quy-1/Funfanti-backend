import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuizSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, questionSetId: string, dto: any) {
    // To be implemented
  }
}
