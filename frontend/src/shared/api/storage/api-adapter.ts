import { apiClient } from '../client';
import { StorageAdapter } from './adapter';
import { UploadResult, UploadProgress, ImageOptimizationOptions } from './types';

export function createApiStorageAdapter(): StorageAdapter {
  const uploadImage = async (
    file: File,
    folder: string = 'products',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> => {
    try {
      // Создаём FormData для отправки файла
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      // Начальный прогресс
      if (onProgress) {
        onProgress({
          fileName: file.name,
          loaded: 0,
          total: file.size,
          percentage: 0,
        });
      }

      // Отправляем файл на бэкенд через XMLHttpRequest для отслеживания прогресса
      const result = await uploadWithProgress(
        formData,
        (loaded, total) => {
          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100),
            });
          }
        }
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Не удалось загрузить изображение');
    }
  };

  const uploadImages = async (
    files: File[],
    folder: string = 'products',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult[]> => {
    // Загружаем все файлы параллельно
    const uploadPromises = files.map((file) =>
      uploadImage(file, folder, onProgress)
    );

    return Promise.all(uploadPromises);
  };

  const deleteImage = async (path: string): Promise<void> => {
    await apiClient.delete(`/products/images/${encodeURIComponent(path)}`);
  };

  const deleteImages = async (paths: string[]): Promise<void> => {
    await apiClient.post('/products/images/delete-batch', { paths });
  };

  const getOptimizedUrl = (
    url: string,
    options?: ImageOptimizationOptions
  ): string => {
    if (!url || !options) return url;

    // Supabase Storage поддерживает трансформации через query params
    const params = new URLSearchParams();

    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);

    if (params.toString()) {
      return `${url}?${params.toString()}`;
    }

    return url;
  };

  return {
    uploadImage,
    uploadImages,
    deleteImage,
    deleteImages,
    getOptimizedUrl,
  };
}

function uploadWithProgress(
  formData: FormData,
  onProgress: (loaded: number, total: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('token');

    // Прогресс загрузки
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded, e.total);
      }
    });

    // Успешная загрузка
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Неверный ответ сервера'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    // Ошибка сети
    xhr.addEventListener('error', () => {
      reject(new Error('Ошибка сети'));
    });

    // Отправляем запрос
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    xhr.open('POST', `${apiUrl}/products/upload-image`);

    // Добавляем токен авторизации
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}
