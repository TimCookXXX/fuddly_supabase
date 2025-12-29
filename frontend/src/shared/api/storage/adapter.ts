import { UploadResult, UploadProgress, ImageOptimizationOptions, ValidationError } from './types';

export interface StorageAdapter {
  uploadImage: (
    file: File,
    folder?: string,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<UploadResult>;

  uploadImages: (
    files: File[],
    folder?: string,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<UploadResult[]>;

  deleteImage: (path: string) => Promise<void>;

  deleteImages: (paths: string[]) => Promise<void>;

  getOptimizedUrl: (url: string, options?: ImageOptimizationOptions) => string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ОБЩИЕ УТИЛИТЫ (используются всеми адаптерами)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Валидирует один файл изображения
 * @returns null если валидация прошла, иначе текст ошибки
 */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Допустимые форматы: JPG, PNG, WebP';
  }

  if (file.size > MAX_SIZE) {
    return `Максимальный размер: ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB`;
  }

  return null;
}

/**
 * Валидирует массив файлов
 */
export function validateImageFiles(
  files: File[],
  maxFiles: number = 5
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (files.length > maxFiles) {
    files.forEach((file) => {
      errors.push({
        fileName: file.name,
        error: `Максимум ${maxFiles} файлов`,
      });
    });
    return errors;
  }

  files.forEach((file) => {
    const error = validateImageFile(file);
    if (error) {
      errors.push({
        fileName: file.name,
        error,
      });
    }
  });

  return errors;
}

/**
 * Генерирует уникальное имя файла
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Форматирует размер файла в читаемый вид
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export type StorageProvider = 'supabase' | 's3' | 'cloudinary' | 'local';

export interface StorageConfig {
  provider: StorageProvider;
  bucketName?: string;
  supabaseUrl?: string;
  awsRegion?: string;
  cloudinaryCloudName?: string;
}

// Текущий провайдер (можно легко поменять)
export const defaultStorageConfig: StorageConfig = {
  provider: 'supabase',
  bucketName: 'product-images',
};
