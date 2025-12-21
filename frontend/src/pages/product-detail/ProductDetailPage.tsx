import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProduct } from '@/app/store/slices/productsSlice';
import Loader from '@/shared/components/Loader';
import styles from './ProductDetailPage.module.scss';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className={styles.productDetailPage}>
        <div className="container">
          <Loader text="Загрузка товара..." />
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className={styles.productDetailPage}>
        <div className="container">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Товар не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productDetailPage}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.imageSection}>
            {currentProduct.images[0] ? (
              <img src={currentProduct.images[0]} alt={currentProduct.title} />
            ) : (
              <div className={styles.noImage}>Нет изображения</div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1>{currentProduct.title}</h1>
            <p className={styles.price}>{currentProduct.price} ₽</p>

            <div className={styles.meta}>
              <p>
                <strong>Категория:</strong> {currentProduct.category}
              </p>
              <p>
                <strong>Регион:</strong> {currentProduct.region}
              </p>
              <p>
                <strong>Продавец:</strong> {currentProduct.seller?.name}
              </p>
              {currentProduct.seller?.company && (
                <p>
                  <strong>Компания:</strong> {currentProduct.seller.company}
                </p>
              )}
            </div>

            <div className={styles.description}>
              <h3>Описание</h3>
              <p>{currentProduct.description}</p>
            </div>

            <button className={styles.contactBtn}>Связаться с продавцом</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
