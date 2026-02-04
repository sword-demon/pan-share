/**
 * Aliyun OSS Image Loader for Next.js
 *
 * Uses Aliyun OSS Image Processing (x-oss-process) to resize and optimize images
 * instead of relying on Next.js/Vercel's image optimization (which costs money).
 *
 * @docs https://help.aliyun.com/zh/oss/user-guide/resize-images-4
 *
 * Usage in next.config.ts:
 * ```
 * images: {
 *   loader: 'custom',
 *   loaderFile: './src/shared/lib/oss-loader.ts',
 * }
 * ```
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Check if URL is from Aliyun OSS
 */
function isOSSUrl(src: string): boolean {
  // Match common OSS URL patterns
  const ossPatterns = [
    /\.oss-[\w-]+\.aliyuncs\.com/, // Standard OSS endpoint
    /\.oss\.aliyuncs\.com/, // Legacy OSS endpoint
  ];

  return ossPatterns.some((pattern) => pattern.test(src));
}

/**
 * OSS Image Loader
 *
 * Appends x-oss-process parameter to OSS URLs for server-side image processing.
 * For non-OSS URLs, returns the original URL with width parameter (for other loaders).
 */
export default function ossLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Handle relative URLs (local images)
  if (src.startsWith('/')) {
    return src;
  }

  // Handle data URLs
  if (src.startsWith('data:')) {
    return src;
  }

  // Handle blob URLs
  if (src.startsWith('blob:')) {
    return src;
  }

  // Check if URL is from Aliyun OSS
  if (!isOSSUrl(src)) {
    // For non-OSS URLs, return as-is (or you can add other CDN processors here)
    return src;
  }

  // Build OSS image processing parameters
  // @docs https://help.aliyun.com/zh/oss/user-guide/resize-images-4
  const q = quality || 75;

  // Use x-oss-process for image transformation
  // m_lfit: scale down to fit within the specified dimensions (maintain aspect ratio)
  // w_${width}: target width
  // q_${quality}: JPEG quality (1-100)
  // format,webp: convert to WebP format for better compression
  const processParams = `image/resize,m_lfit,w_${width}/quality,q_${q}/format,webp`;

  // Check if URL already has query parameters
  const separator = src.includes('?') ? '&' : '?';

  return `${src}${separator}x-oss-process=${processParams}`;
}

/**
 * Generate OSS image URL with processing parameters
 *
 * Can be used directly for manual image URL generation:
 * ```
 * const url = getOSSImageUrl('https://bucket.oss-cn-hangzhou.aliyuncs.com/image.jpg', {
 *   width: 800,
 *   height: 600,
 *   quality: 80,
 *   format: 'webp',
 * });
 * ```
 */
export interface OSSImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp' | 'gif' | 'bmp';
  mode?: 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed';
}

export function getOSSImageUrl(
  src: string,
  options: OSSImageOptions = {}
): string {
  if (!isOSSUrl(src)) {
    return src;
  }

  const params: string[] = [];

  // Resize parameters
  if (options.width || options.height || options.mode) {
    const resizeParams: string[] = [];
    if (options.mode) {
      resizeParams.push(`m_${options.mode}`);
    } else {
      resizeParams.push('m_lfit');
    }
    if (options.width) {
      resizeParams.push(`w_${options.width}`);
    }
    if (options.height) {
      resizeParams.push(`h_${options.height}`);
    }
    params.push(`resize,${resizeParams.join(',')}`);
  }

  // Quality parameter
  if (options.quality) {
    params.push(`quality,q_${options.quality}`);
  }

  // Format conversion
  if (options.format) {
    params.push(`format,${options.format}`);
  }

  if (params.length === 0) {
    return src;
  }

  const processParams = `image/${params.join('/')}`;
  const separator = src.includes('?') ? '&' : '?';

  return `${src}${separator}x-oss-process=${processParams}`;
}
