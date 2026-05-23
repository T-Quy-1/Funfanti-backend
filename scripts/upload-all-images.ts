import { CloudinaryService } from '../src/common/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env variables
dotenv.config();

async function run() {
  // Initialize the services
  const configService = new ConfigService(process.env);
  const service = new CloudinaryService(configService);

  // Resolve directory: relative to current working directory (workspace root)
  // or relative to the script directory. Let's try both to be safe.
  let dirPath = path.resolve('../../images');
  if (!fs.existsSync(dirPath)) {
    // If running from somewhere else, check relative to __dirname
    dirPath = path.resolve(__dirname, '../../../images');
  }

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Images directory not found. Checked:`);
    console.error(`   - ${path.resolve('../../images')}`);
    console.error(`   - ${path.resolve(__dirname, '../../../images')}`);
    process.exit(1);
  }

  console.log(`📂 Scanning directory: ${dirPath}`);
  const files = fs.readdirSync(dirPath);
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('⚠️ No images found in the directory.');
    process.exit(0);
  }

  console.log(`found ${imageFiles.length} image(s) to upload.\n`);

  const results: Array<{ filename: string; public_id: string; secure_url: string }> = [];

  for (const filename of imageFiles) {
    const filePath = path.join(dirPath, filename);
    console.log(`📤 Uploading: ${filename}...`);

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimetype = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');

    const mockFile = {
      buffer: fileBuffer,
      originalname: filename,
      mimetype: mimetype,
    } as any;

    try {
      // Use 'funfanti/images' folder to keep it clean and organized
      const result = await service.uploadImage(mockFile, 'funfanti/images');
      console.log(`✅ Uploaded ${filename} successfully!`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   URL: ${result.secure_url}\n`);

      results.push({
        filename,
        public_id: result.public_id,
        secure_url: result.secure_url
      });
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}:`, err);
    }
  }

  console.log('=== UPLOAD SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => {
  console.error('Unhandled error in script:', err);
  process.exit(1);
});
