import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { logout } from '@/app/store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.scss';

const Header = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <Link to="/info" className={styles.logo}>
            Fuddly
          </Link>

          <nav className={styles.nav}>
            <Link to="/">Каталог</Link>
            {isAuthenticated && (
              <>
                <Link to="/profile">Профиль</Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Выйти
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login">Вход</Link>
                <Link to="/register">Регистрация</Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
