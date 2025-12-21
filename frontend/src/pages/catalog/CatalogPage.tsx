import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProducts } from '@/app/store/slices/productsSlice';
import { Link } from 'react-router-dom';
import Loader from '@/shared/components/Loader';
import styles from './CatalogPage.module.scss';

const CatalogPage = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchProducts({ search, page: 1, limit: 20 }));
  };

  if (loading) {
    return (
      <div className={styles.catalogPage}>
        <div className="container">
          <Loader text="Загрузка товаров..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      <div className="container">
        <h1>Каталог товаров</h1>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Найти</button>
        </form>

        {products.length === 0 ? (
          <p>Товары не найдены</p>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className={styles.noImage}>Нет изображения</div>
                  )}
                </div>
                <div className={styles.info}>
                  <h3>{product.title}</h3>
                  <p className={styles.price}>{product.price} ₽</p>
                  <p className={styles.seller}>{product.seller?.name || 'Неизвестно'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
