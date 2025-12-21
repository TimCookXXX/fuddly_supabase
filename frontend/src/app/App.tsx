import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getMe } from './store/slices/authSlice';
import { useTheme } from '@/shared/hooks/useTheme';

// Pages
import HomePage from '@/pages/home/HomePage';
import CatalogPage from '@/pages/catalog/CatalogPage';
import ProductDetailPage from '@/pages/product-detail/ProductDetailPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Widgets
import Header from '@/widgets/header/Header';
import Footer from '@/widgets/footer/Footer';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Инициализация темы
  useTheme();

  // Автоматическая загрузка пользователя при наличии токена
  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/info" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищённые маршруты */}
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
