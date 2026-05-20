import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables for conditional integration testing
dotenv.config();

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const hasRealCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'mock';

  const describeIntegration = hasRealCloudinary ? describe : describe.skip;

  describeIntegration('Cloudinary Integration (Real Upload & Delete)', () => {
    let uploadResult: any;
    let publicId: string;
    let secureUrl: string;

    beforeAll(async () => {
      // Run the upload once before assertions to prevent redundant uploads
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
        providers: [CloudinaryService],
      }).compile();

      const testService = module.get<CloudinaryService>(CloudinaryService);

      const filePath = path.join(process.cwd(), 'img/sample.png');
      expect(fs.existsSync(filePath)).toBe(true);
      const fileBuffer = fs.readFileSync(filePath);

      const mockFile = {
        fieldname: 'file',
        originalname: 'sample.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      uploadResult = await testService.uploadImage(mockFile, 'funfanti/test_uploads');
      publicId = uploadResult.public_id;
      secureUrl = uploadResult.secure_url;
    }, 20000);

    afterAll(async () => {
      // Ensure Cloudinary is cleaned up even if tests fail mid-flow
      if (service && publicId) {
        await service.deleteImage(publicId);
      }
    }, 20000);

    it('should successfully upload an image and return valid metadata', () => {
      expect(uploadResult).toHaveProperty('secure_url');
      expect(uploadResult).toHaveProperty('public_id');
      expect(secureUrl).toContain('cloudinary.com');
    });

    it('should be able to access the uploaded image over HTTP', async () => {
      const response = await fetch(secureUrl);
      expect(response.status).toBe(200);
    });

    it('should successfully delete the uploaded image', async () => {
      const deleteResult = await service.deleteImage(publicId);
      expect(deleteResult).toHaveProperty('result');
      expect(deleteResult.result).toBe('ok');

      // Reset publicId so afterAll hook doesn't attempt to delete it again
      publicId = null;
    });
  });
});
