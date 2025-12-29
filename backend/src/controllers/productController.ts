import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import crypto from 'crypto';

// Валидация схем
const createProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string(),
  images: z.array(z.string()).default([]),
  region: z.string(),
});

const updateProductSchema = createProductSchema.partial();

// ═══════════════════════════════════════════════════════════════════════════
// MULTER CONFIGURATION ДЛЯ ЗАГРУЗКИ ФАЙЛОВ
// ═══════════════════════════════════════════════════════════════════════════

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Допустимые форматы: JPG, PNG, WebP'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Получить все одобренные товары (публичный доступ)
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, region, search, page = '1', limit = '20' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('products')
      .select('*, seller:users!products_seller_id_fkey(id, name, company, avatar)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category) {
      query = query.eq('category', category);
    }
    if (region) {
      query = query.eq('region', region);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      products: products || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить товар по ID
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*, seller:users!products_seller_id_fkey(id, name, company, phone, avatar)')
      .eq('id', id)
      .single();

    if (error || !product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Если товар не APPROVED, может видеть только продавец
    if (product.status !== 'APPROVED' && product.seller_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Создать товар (требуется авторизация)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createProductSchema.parse(req.body);

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...data,
        seller_id: req.userId!,
        status: 'PENDING', // Все товары сначала на модерации
      })
      .select('*, seller:users!products_seller_id_fkey(id, name, company, avatar)')
      .single();

    if (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Обновить товар (только владелец)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    // Проверка прав доступа
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (existingProduct.seller_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // При обновлении товара он снова отправляется на модерацию
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...data,
        status: 'PENDING',
      })
      .eq('id', id)
      .select('*, seller:users!products_seller_id_fkey(id, name, company, avatar)')
      .single();

    if (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Удалить товар (только владелец)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (product.seller_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить мои товары
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my products error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(products || []);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ЗАГРУЗКА ИЗОБРАЖЕНИЙ В SUPABASE STORAGE
// ═══════════════════════════════════════════════════════════════════════════

const BUCKET_NAME = 'product-images';

/**
 * Генерирует уникальное имя файла
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString('hex');
  const ext = originalName.split('.').pop();
  return `${timestamp}-${randomStr}.${ext}`;
}

/**
 * Загрузить одно изображение
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const folder = req.body.folder || 'products';
    const fileName = generateUniqueFileName(req.file.originalname);
    const filePath = `${folder}/${fileName}`;

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    // Получаем публичный URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    res.status(200).json({
      url: publicUrlData.publicUrl,
      path: data.path,
      size: req.file.size,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Удалить изображение
 */
export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { path } = req.params;

    if (!path) {
      res.status(400).json({ error: 'Image path is required' });
      return;
    }

    const decodedPath = decodeURIComponent(path);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([decodedPath]);

    if (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Удалить несколько изображений
 */
export const deleteImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paths } = req.body;

    if (!paths || !Array.isArray(paths)) {
      res.status(400).json({ error: 'Paths array is required' });
      return;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('Delete images error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Images deleted successfully' });
  } catch (error) {
    console.error('Delete images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
