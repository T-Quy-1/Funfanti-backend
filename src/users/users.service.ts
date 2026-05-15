import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    // To be implemented
  }

  async updateProfile(userId: string, dto: any) {
    // To be implemented
  }

  async updatePreferences(userId: string, dto: any) {
    // To be implemented
  }
}
