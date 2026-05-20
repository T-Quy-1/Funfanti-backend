import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, CloudinaryService],
  exports: [PrismaService, CloudinaryService],
})
export class CommonModule {}
