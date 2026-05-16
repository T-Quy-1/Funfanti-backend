import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'CLOUDINARY_CLOUD_NAME') return 'test_cloud';
      if (key === 'CLOUDINARY_API_KEY') return 'test_key';
      if (key === 'CLOUDINARY_API_SECRET') return 'test_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should successfully upload an image', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockResult = { secure_url: 'https://test.url', public_id: '123' };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const result = await service.uploadImage(mockFile);
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(mockError, null);
        return { end: jest.fn() };
      });

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockImplementation((publicId, callback) => {
        callback(null, { result: 'ok' });
      });

      const result = await service.deleteImage('123');
      expect(result).toEqual({ result: 'ok' });
    });

    it('should throw an error if deletion fails', async () => {
      const mockError = new Error('Delete failed');
      (cloudinary.uploader.destroy as jest.Mock).mockImplementation((publicId, callback) => {
        callback(mockError, null);
      });

      await expect(service.deleteImage('123')).rejects.toThrow('Delete failed');
    });
  });
});
