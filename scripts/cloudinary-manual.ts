import { CloudinaryService } from '../src/common/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env variables
dotenv.config();

async function run() {
  // 1. Manually initialize the service
  const configService = new ConfigService(process.env);
  const service = new CloudinaryService(configService);

  const action = process.argv[2]; // 'upload' or 'delete'
  const param = process.argv[3];  // File path or Public ID

  if (action === 'upload') {
    const filePath = path.resolve(param || 'img/sample.png');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found at: ${filePath}`);
      process.exit(1);
    }

    console.log(`Uploading: ${filePath}...`);

    const fileBuffer = fs.readFileSync(filePath);
    const mockFile = {
      buffer: fileBuffer,
      originalname: path.basename(filePath),
      mimetype: 'image/png', // Simple fallback
    } as any;

    try {
      const result = await service.uploadImage(mockFile, 'funfanti/images');
      console.log('✅ Upload Success!');
      console.log('Public ID:', result.public_id);
      console.log('URL:', result.secure_url);
    } catch (err) {
      console.error('❌ Upload Failed:', err);
    }
  }

  else if (action === 'delete') {
    if (!param) {
      console.error('❌ Please provide a public_id to delete.');
      process.exit(1);
    }

    console.log(`Deleting Public ID: ${param}...`);
    try {
      const result = await service.deleteImage(param);
      console.log('✅ Delete Result:', result);
    } catch (err) {
      console.error('❌ Delete Failed:', err);
    }
  }

  else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/cloudinary-manual.ts upload <path_to_image>');
    console.log('  npx ts-node scripts/cloudinary-manual.ts delete <public_id>');
  }
}

run();
