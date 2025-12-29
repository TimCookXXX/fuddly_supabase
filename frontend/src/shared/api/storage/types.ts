/**
 * Результат загрузки изображения
 */
export interface UploadResult {
  url: string;        // Публичный URL изображения
  path: string;       // Путь в хранилище (для удаления)
  size: number;       // Размер файла в байтах
  fileName: string;   // Имя файла
}

/**
 * Прогресс загрузки
 */
export interface UploadProgress {
  fileName: string;
  loaded: number;     // Загружено байт
  total: number;      // Всего байт
  percentage: number; // Процент (0-100)
}

/**
 * Опции для оптимизации изображения
 */
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;   // 1-100
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

/**
 * Конфигурация валидации
 */
export interface ValidationConfig {
  maxSizeMB: number;
  maxFiles: number;
  allowedTypes: string[];
}

/**
 * Ошибка валидации
 */
export interface ValidationError {
  fileName: string;
  error: string;
}
