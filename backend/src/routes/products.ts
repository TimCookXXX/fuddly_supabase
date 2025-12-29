import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  uploadImage,
  deleteImage,
  deleteImages,
  upload,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/products - получить все одобренные товары (публичный)
router.get('/', getProducts);

// GET /api/products/my - получить мои товары (требуется авторизация)
router.get('/my', authenticateToken, getMyProducts);

// POST /api/products/upload-image - загрузить изображение (требуется авторизация)
router.post('/upload-image', authenticateToken, upload.single('image'), uploadImage);

// DELETE /api/products/images/:path - удалить изображение (требуется авторизация)
router.delete('/images/:path', authenticateToken, deleteImage);

// POST /api/products/images/delete-batch - удалить несколько изображений (требуется авторизация)
router.post('/images/delete-batch', authenticateToken, deleteImages);

// GET /api/products/:id - получить товар по ID
router.get('/:id', getProduct);

// POST /api/products - создать товар (требуется авторизация)
router.post('/', authenticateToken, createProduct);

// PATCH /api/products/:id - обновить товар (требуется авторизация)
router.patch('/:id', authenticateToken, updateProduct);

// DELETE /api/products/:id - удалить товар (требуется авторизация)
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
