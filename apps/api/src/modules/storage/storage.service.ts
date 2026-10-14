import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnBase: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || undefined;
    this.s3 = new S3Client({
      region: process.env.AWS_REGION ?? 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'minioadmin',
      },
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    });
    this.bucket = process.env.S3_BUCKET ?? 'saas-restaurant';
    this.cdnBase = process.env.CDN_BASE_URL ?? process.env.S3_PUBLIC_URL ?? `http://localhost:9000/${this.bucket}`;
  }

  async uploadImage(
    fileOrBuffer: Express.Multer.File | Buffer,
    folder: string,
    mimeType = 'image/jpeg',
    resize?: { width: number; height?: number },
  ): Promise<string> {
    const buffer = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : fileOrBuffer.buffer;
    const actualMime = Buffer.isBuffer(fileOrBuffer) ? mimeType : (fileOrBuffer.mimetype || mimeType);

    let processedBuffer = buffer;
    if (actualMime.startsWith('image/')) {
      let sharpInstance = sharp(buffer);
      if (resize) {
        sharpInstance = sharpInstance.resize(resize.width, resize.height, { fit: 'cover' });
      }
      processedBuffer = await sharpInstance.webp({ quality: 85 }).toBuffer();
    }

    const key = `${folder}/${uuidv4()}.webp`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      }),
    );

    return `${this.cdnBase}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.error(`Failed to delete file ${key}`, err);
    }
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }
}
