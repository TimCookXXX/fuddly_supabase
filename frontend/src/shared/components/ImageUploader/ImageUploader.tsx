import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import { storage, validateImageFiles, formatFileSize } from '@/shared/api/storage';
import type { UploadResult } from '@/shared/api/storage';
import styles from './ImageUploader.module.scss';

interface ImageUploaderProps {
  folder?: string;
  maxFiles?: number;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  existingImages?: UploadResult[];
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
  uploaded?: boolean;
  result?: UploadResult;
}

const ImageUploader = ({
  folder = 'products',
  maxFiles = 5,
  onUploadComplete,
  onUploadError,
  multiple = true,
  existingImages = [],
}: ImageUploaderProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // Сжатие изображения на клиенте
  // ═══════════════════════════════════════════════════════════════════════════
  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1, // Максимум 1MB
        maxWidthOrHeight: 1920, // Максимум 1920px
        useWebWorker: true,
        fileType: 'image/jpeg', // Конвертируем в JPEG для меньшего размера
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`Сжатие: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      return compressedFile;
    } catch (error) {
      console.error('Ошибка сжатия:', error);
      return file; // Если не получилось сжать, используем оригинал
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Обработка файлов
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Проверяем количество файлов
    if (uploadedImages.length + fileArray.length > maxFiles) {
      onUploadError?.(`Максимум ${maxFiles} файлов`);
      return;
    }

    // Валидация
    const validationErrors = validateImageFiles(fileArray, maxFiles);
    const invalidFiles = validationErrors.filter((v) => v.error);

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((v) => {
        onUploadError?.(`${v.fileName}: ${v.error}`);
      });
      return;
    }

    // Создаём превью для каждого файла
    const newUploadingFiles: UploadingFile[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Загружаем каждый файл
    for (let i = 0; i < newUploadingFiles.length; i++) {
      const uploadingFile = newUploadingFiles[i];
      try {
        // Сжимаем изображение
        const compressedFile = await compressImage(uploadingFile.file);

        // Загружаем в Supabase
        const result = await storage.uploadImage(compressedFile, folder, (progress) => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.preview === uploadingFile.preview ? { ...f, progress: progress.percentage } : f
            )
          );
        });

        // Помечаем как загруженное
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.preview === uploadingFile.preview
              ? { ...f, uploaded: true, result, progress: 100 }
              : f
          )
        );

        setUploadedImages((prev) => [...prev, result]);
      } catch (error: any) {
        // Обрабатываем ошибку
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.preview === uploadingFile.preview
              ? { ...f, error: error.message, progress: 0 }
              : f
          )
        );
        onUploadError?.(error.message);
      }
    }

    // После всех загрузок вызываем callback
    const successfulUploads = newUploadingFiles
      .map((f) => f.result)
      .filter((r): r is UploadResult => !!r);

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Удаление изображения
  // ═══════════════════════════════════════════════════════════════════════════
  const handleRemoveImage = async (image: UploadResult) => {
    try {
      await storage.deleteImage(image.path);
      setUploadedImages((prev) => prev.filter((img) => img.path !== image.path));
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  };

  const handleRemoveUploadingFile = (preview: string) => {
    setUploadingFiles((prev) => {
      const file = prev.find((f) => f.preview === preview);
      if (file) {
        URL.revokeObjectURL(file.preview); // Освобождаем память
      }
      return prev.filter((f) => f.preview !== preview);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Drag & Drop обработчики
  // ═══════════════════════════════════════════════════════════════════════════
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // File input обработчик
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Сбрасываем input чтобы можно было загрузить те же файлы снова
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.container}>
      {/* Dropzone */}
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileInputChange}
          className={styles.fileInput}
        />

        <div className={styles.dropzoneContent}>
          <svg
            className={styles.uploadIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className={styles.dropzoneText}>
            Перетащите изображения сюда или <span className={styles.link}>выберите</span>
          </p>
          <p className={styles.dropzoneHint}>
            JPG, PNG, WebP • Макс {maxFiles} файлов • До 5MB
          </p>
        </div>
      </div>

      {/* Превью загружаемых файлов */}
      {uploadingFiles.length > 0 && (
        <div className={styles.previewGrid}>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.preview} className={styles.previewItem}>
              <div className={styles.imageWrapper}>
                <img src={uploadingFile.preview} alt="Preview" className={styles.previewImage} />

                {/* Прогресс загрузки */}
                {!uploadingFile.uploaded && !uploadingFile.error && (
                  <div className={styles.progressOverlay}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{uploadingFile.progress}%</span>
                  </div>
                )}

                {/* Ошибка */}
                {uploadingFile.error && (
                  <div className={styles.errorOverlay}>
                    <span className={styles.errorText}>Ошибка</span>
                  </div>
                )}

                {/* Успешная загрузка */}
                {uploadingFile.uploaded && (
                  <div className={styles.successOverlay}>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Кнопка удаления */}
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveUploadingFile(uploadingFile.preview)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className={styles.fileName}>{uploadingFile.file.name}</p>
              <p className={styles.fileSize}>{formatFileSize(uploadingFile.file.size)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Загруженные изображения */}
      {uploadedImages.length > 0 && (
        <div className={styles.uploadedSection}>
          <h4 className={styles.sectionTitle}>Загруженные изображения</h4>
          <div className={styles.previewGrid}>
            {uploadedImages.map((image) => (
              <div key={image.path} className={styles.previewItem}>
                <div className={styles.imageWrapper}>
                  <img
                    src={storage.getOptimizedUrl(image.url, { width: 200, height: 200 })}
                    alt={image.fileName}
                    className={styles.previewImage}
                  />

                  {/* Кнопка удаления */}
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveImage(image)}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className={styles.fileName}>{image.fileName}</p>
                <p className={styles.fileSize}>{formatFileSize(image.size)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
