import type {
  StorageConfigs,
  StorageDownloadUploadOptions,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from '.';

/**
 * Aliyun OSS storage provider configs
 * @docs https://help.aliyun.com/zh/oss/
 */
export interface AliyunOSSConfigs extends StorageConfigs {
  region: string; // e.g., oss-cn-hangzhou (with oss- prefix)
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  uploadPath?: string;
  endpoint?: string; // Custom endpoint (without bucket), e.g., https://oss-cn-shanghai.aliyuncs.com
  publicDomain?: string; // Custom domain for public access
  internal?: boolean; // Use internal endpoint (for servers in same region)
}

/**
 * Aliyun OSS storage provider implementation
 * Uses Server Actions to avoid exposing AccessKey
 * @website https://www.aliyun.com/product/oss
 */
export class AliyunOSSProvider implements StorageProvider {
  readonly name = 'aliyun-oss';
  configs: AliyunOSSConfigs;

  constructor(configs: AliyunOSSConfigs) {
    this.configs = configs;
  }

  private getUploadPath() {
    let uploadPath = this.configs.uploadPath || 'uploads';
    if (uploadPath.startsWith('/')) {
      uploadPath = uploadPath.slice(1);
    }
    if (uploadPath.endsWith('/')) {
      uploadPath = uploadPath.slice(0, -1);
    }
    return uploadPath;
  }

  /**
   * Get the clean region (without bucket prefix)
   * e.g., "virusoss.oss-cn-shanghai" -> "oss-cn-shanghai"
   */
  private getCleanRegion() {
    let region = this.configs.region;
    // Remove bucket prefix if user accidentally included it
    const bucketPrefix = `${this.configs.bucket}.`;
    if (region.startsWith(bucketPrefix)) {
      region = region.slice(bucketPrefix.length);
    }
    return region;
  }

  /**
   * Get the OSS endpoint (without bucket name)
   * Format: https://oss-cn-shanghai.aliyuncs.com
   */
  private getOSSEndpoint() {
    let endpoint = this.configs.endpoint;

    if (endpoint) {
      // Remove bucket prefix if user accidentally included it
      // e.g., https://mybucket.oss-cn-shanghai.aliyuncs.com -> https://oss-cn-shanghai.aliyuncs.com
      const bucketPrefix = `${this.configs.bucket}.`;
      if (endpoint.includes(bucketPrefix)) {
        endpoint = endpoint.replace(bucketPrefix, '');
      }
      return endpoint;
    }

    const region = this.getCleanRegion();
    const internalSuffix = this.configs.internal ? '-internal' : '';
    // Endpoint format: https://{region}{-internal}.aliyuncs.com (without bucket)
    return `https://${region}${internalSuffix}.aliyuncs.com`;
  }

  /**
   * Get the full bucket endpoint (with bucket name)
   * Format: https://bucket.oss-cn-shanghai.aliyuncs.com
   */
  private getBucketEndpoint() {
    const region = this.getCleanRegion();
    const internalSuffix = this.configs.internal ? '-internal' : '';
    return `https://${this.configs.bucket}.${region}${internalSuffix}.aliyuncs.com`;
  }

  getPublicUrl = (options: { key: string; bucket?: string }) => {
    const uploadPath = this.getUploadPath();
    const fullKey = `${uploadPath}/${options.key}`;

    if (this.configs.publicDomain) {
      return `${this.configs.publicDomain}/${fullKey}`;
    }

    // Default OSS public URL format
    const region = this.getCleanRegion();
    return `https://${this.configs.bucket}.${region}.aliyuncs.com/${fullKey}`;
  };

  exists = async (options: { key: string; bucket?: string }) => {
    try {
      const OSS = (await import('ali-oss')).default;
      const client = new OSS({
        accessKeyId: this.configs.accessKeyId,
        accessKeySecret: this.configs.accessKeySecret,
        bucket: options.bucket || this.configs.bucket,
        endpoint: this.getOSSEndpoint(),
      });

      const uploadPath = this.getUploadPath();
      const fullKey = `${uploadPath}/${options.key}`;

      try {
        await client.head(fullKey);
        return true;
      } catch (e: any) {
        if (e.code === 'NoSuchKey') {
          return false;
        }
        throw e;
      }
    } catch {
      return false;
    }
  };

  async uploadFile(
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const uploadBucket = options.bucket || this.configs.bucket;
      if (!uploadBucket) {
        return {
          success: false,
          error: 'Bucket is required',
          provider: this.name,
        };
      }

      const OSS = (await import('ali-oss')).default;
      const client = new OSS({
        accessKeyId: this.configs.accessKeyId,
        accessKeySecret: this.configs.accessKeySecret,
        bucket: uploadBucket,
        endpoint: this.getOSSEndpoint(),
      });

      const uploadPath = this.getUploadPath();
      const fullKey = `${uploadPath}/${options.key}`;

      const bodyBuffer =
        options.body instanceof Buffer
          ? options.body
          : Buffer.from(options.body);

      const result = await client.put(fullKey, bodyBuffer, {
        headers: {
          'Content-Type': options.contentType || 'application/octet-stream',
          'Content-Disposition': options.disposition || 'inline',
        },
      });

      const publicUrl = this.getPublicUrl({
        key: options.key,
        bucket: uploadBucket,
      });

      return {
        success: true,
        location: result.url,
        bucket: uploadBucket,
        uploadPath: uploadPath,
        key: options.key,
        filename: options.key.split('/').pop(),
        url: publicUrl,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const response = await fetch(options.url);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          provider: this.name,
        };
      }

      if (!response.body) {
        return {
          success: false,
          error: 'No body in response',
          provider: this.name,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const body = Buffer.from(arrayBuffer);

      return this.uploadFile({
        body,
        key: options.key,
        bucket: options.bucket,
        contentType: options.contentType,
        disposition: options.disposition,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }
}

/**
 * Create Aliyun OSS provider with configs
 */
export function createAliyunOSSProvider(
  configs: AliyunOSSConfigs
): AliyunOSSProvider {
  return new AliyunOSSProvider(configs);
}
