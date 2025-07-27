import AWS from 'aws-sdk';
import { IStorageService, UploadedFile } from '../../application/services/IStorageService';
import { v4 as uuidv4 } from 'uuid';

export class S3StorageService implements IStorageService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-northeast-1',
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'thrive-in-japan';
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadedFile> {
    const key = `uploads/${uuidv4()}-${filename}`;

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();

      // Generate a pre-signed URL that expires in 7 days
      const signedUrl = await this.getSignedUrl(key, 7 * 24 * 3600);

      return {
        url: signedUrl, // Return pre-signed URL instead of direct URL
        key: result.Key,
        size: file.length,
        mimeType,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn, // URL expires in seconds
    };

    try {
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async uploadProfilePhoto(userId: string, file: Buffer, mimeType: string): Promise<string> {
    const extension = mimeType.split('/')[1];
    const filename = `profile-photos/${userId}-${Date.now()}.${extension}`;

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: mimeType,
      Metadata: {
        userId: userId,
        uploadType: 'profile-photo',
      },
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      
      // Generate a long-lived pre-signed URL for profile photos (30 days)
      const signedUrl = await this.getSignedUrl(filename, 30 * 24 * 3600);
      
      return signedUrl;
    } catch (error) {
      console.error('Profile photo upload error:', error);
      throw new Error('Failed to upload profile photo');
    }
  }

  async uploadLessonResource(lessonId: string, file: Buffer, filename: string, mimeType: string): Promise<string> {
    const key = `lesson-resources/${lessonId}/${uuidv4()}-${filename}`;

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      Metadata: {
        lessonId: lessonId,
        uploadType: 'lesson-resource',
      },
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      
      // Generate a pre-signed URL for lesson resources (7 days)
      const signedUrl = await this.getSignedUrl(key, 7 * 24 * 3600);
      
      return signedUrl;
    } catch (error) {
      console.error('Lesson resource upload error:', error);
      throw new Error('Failed to upload lesson resource');
    }
  }

  // Helper method to extract S3 key from URL
  private extractKeyFromUrl(url: string): string {
    // Handle both direct S3 URLs and pre-signed URLs
    try {
      const urlObj = new URL(url);
      
      // For direct S3 URLs: https://bucket.s3.region.amazonaws.com/key
      if (urlObj.hostname.includes('amazonaws.com')) {
        const pathParts = urlObj.pathname.split('/');
        return pathParts.slice(1).join('/'); // Remove leading slash and join
      }
      
      // For pre-signed URLs, extract key from pathname
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return '';
    }
  }

  // Method to delete old profile photo when updating
  async deleteOldProfilePhoto(oldPhotoUrl: string): Promise<void> {
    if (oldPhotoUrl && (oldPhotoUrl.includes('amazonaws.com') || oldPhotoUrl.includes('s3.'))) {
      const key = this.extractKeyFromUrl(oldPhotoUrl);
      if (key) {
        await this.deleteFile(key);
      }
    }
  }

  // Method to refresh expired URLs (call this periodically)
  async refreshProfilePhotoUrl(key: string): Promise<string> {
    return await this.getSignedUrl(key, 30 * 24 * 3600);
  }
}