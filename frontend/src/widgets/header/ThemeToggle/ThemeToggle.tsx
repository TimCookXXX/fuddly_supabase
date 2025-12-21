import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { toggleTheme, selectTheme, selectResolvedTheme } from '@/app/store/slices/uiSlice';
import styles from './ThemeToggle.module.scss';

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const resolvedTheme = useAppSelector(selectResolvedTheme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const getIcon = () => {
    if (theme === 'system') return '🖥️';
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') return 'Системная тема';
    return resolvedTheme === 'dark' ? 'Темная тема' : 'Светлая тема';
  };

  return (
    <button
      onClick={handleToggle}
      className={styles.themeToggle}
      aria-label={`Переключить тему. Текущая: ${getLabel()}`}
      title={getLabel()}
    >
      <span className={styles.icon}>{getIcon()}</span>
    </button>
  );
};

export default ThemeToggle;
