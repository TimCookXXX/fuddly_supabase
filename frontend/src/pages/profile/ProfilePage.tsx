import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchMyProducts } from '@/app/store/slices/productsSlice';
import { productsApi } from '@/shared/api/products';
import Loader from '@/shared/components/Loader';
import ButtonLoader from '@/shared/components/ButtonLoader';
import styles from './ProfilePage.module.scss';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myProducts } = useAppSelector((state) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    region: '',
  });

  useEffect(() => {
    dispatch(fetchMyProducts());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsApi.createProduct({
        ...formData,
        price: Number(formData.price),
      });
      alert('Товар создан и отправлен на модерацию!');
      setShowForm(false);
      setFormData({ title: '', description: '', price: '', category: '', region: '' });
      dispatch(fetchMyProducts());
    } catch (error: any) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Профиль</h1>
        </div>

        {!user ? (
          <Loader text="Загрузка профиля..." />
        ) : (
          <div className={styles.userInfo}>
            <h2>{user.name}</h2>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.company && (
              <p>
                <strong>Компания:</strong> {user.company}
              </p>
            )}
            {user.phone && (
              <p>
                <strong>Телефон:</strong> {user.phone}
              </p>
            )}
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Мои объявления</h2>
            {user && (
              <button onClick={() => setShowForm(!showForm)} className={styles.createBtn}>
                {showForm ? 'Отменить' : '+ Создать объявление'}
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className={styles.productForm}>
              <div className={styles.formGroup}>
                <label>Название товара *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Описание *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  minLength={10}
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Цена (₽) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Категория *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Выберите категорию</option>
                  <option value="Мясо и птица">Мясо и птица</option>
                  <option value="Молочные продукты">Молочные продукты</option>
                  <option value="Овощи и фрукты">Овощи и фрукты</option>
                  <option value="Хлебобулочные изделия">Хлебобулочные изделия</option>
                  <option value="Напитки">Напитки</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Регион *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                  placeholder="Например: Москва"
                />
              </div>
              <ButtonLoader type="submit" loading={loading} className={styles.submitBtn}>
                Создать объявление
              </ButtonLoader>
            </form>
          )}

          {myProducts.length === 0 ? (
            <p>У вас пока нет объявлений</p>
          ) : (
            <div className={styles.productsGrid}>
              {myProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <h3>{product.title}</h3>
                  <p className={styles.price}>{product.price} ₽</p>
                  <p className={styles.status}>
                    Статус:{' '}
                    {product.status === 'PENDING' && 'На модерации'}
                    {product.status === 'APPROVED' && 'Одобрено'}
                    {product.status === 'REJECTED' && 'Отклонено'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
