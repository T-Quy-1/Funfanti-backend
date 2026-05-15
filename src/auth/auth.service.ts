import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: any) {
    // To be implemented
  }

  async login(dto: any) {
    // To be implemented
  }
}
