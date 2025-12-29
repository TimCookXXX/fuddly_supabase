/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ГЛАВНЫЙ ФАЙЛ STORAGE API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Этот файл - единая точка входа для работы с изображениями.
 * Импортируй отсюда всё, что нужно для загрузки/удаления изображений.
 */

// ───────────────────────────────────────────────────────────────────────────
// Экспортируем типы
// ───────────────────────────────────────────────────────────────────────────
export type {
  UploadResult,
  UploadProgress,
  ImageOptimizationOptions,
  ValidationConfig,
  ValidationError,
} from './types';

export type { StorageAdapter, StorageProvider, StorageConfig } from './adapter';

// ───────────────────────────────────────────────────────────────────────────
// Экспортируем утилиты
// ───────────────────────────────────────────────────────────────────────────
export {
  validateImageFile,
  validateImageFiles,
  generateUniqueFileName,
  formatFileSize,
  defaultStorageConfig,
} from './adapter';

// ───────────────────────────────────────────────────────────────────────────
// Экспортируем адаптеры
// ───────────────────────────────────────────────────────────────────────────
export { createApiStorageAdapter } from './api-adapter';

// ═══════════════════════════════════════════════════════════════════════════
// ФАБРИКА АДАПТЕРОВ - Главная функция для создания storage
// ═══════════════════════════════════════════════════════════════════════════

import { StorageAdapter, StorageConfig, defaultStorageConfig } from './adapter';
import { createApiStorageAdapter } from './api-adapter';

/**
 * Создаёт адаптер хранилища на основе конфигурации
 *
 * Использование:
 *
 * // По умолчанию (Supabase)
 * const storage = createStorageAdapter();
 *
 * // Явно указать провайдер
 * const storage = createStorageAdapter({ provider: 'supabase' });
 *
 * // В будущем можно легко добавить другие:
 * const storage = createStorageAdapter({ provider: 's3' });
 * const storage = createStorageAdapter({ provider: 'cloudinary' });
 */
export function createStorageAdapter(
  config: Partial<StorageConfig> = {}
): StorageAdapter {
  const fullConfig = { ...defaultStorageConfig, ...config };

  switch (fullConfig.provider) {
    case 'supabase':
      // Используем API адаптер вместо прямого подключения к Supabase
      // Это безопаснее, так как бэкенд управляет всей логикой загрузки
      return createApiStorageAdapter();

    case 's3':
      // TODO: Реализовать S3 адаптер в будущем
      throw new Error('S3 adapter not implemented yet');

    case 'cloudinary':
      // TODO: Реализовать Cloudinary адаптер в будущем
      throw new Error('Cloudinary adapter not implemented yet');

    case 'local':
      // TODO: Реализовать локальный адаптер для тестов
      throw new Error('Local adapter not implemented yet');

    default:
      throw new Error(`Unknown storage provider: ${fullConfig.provider}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ДЕФОЛТНЫЙ ЭКЗЕМПЛЯР (для быстрого использования)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Готовый экземпляр storage для использования
 *
 * Использование:
 * import { storage } from '@/shared/api/storage';
 *
 * const result = await storage.uploadImage(file);
 */
export const storage = createStorageAdapter();
