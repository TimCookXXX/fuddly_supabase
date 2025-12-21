import { ButtonHTMLAttributes } from 'react';
import styles from './ButtonLoader.module.scss';

interface ButtonLoaderProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const ButtonLoader = ({ loading = false, children, disabled, ...props }: ButtonLoaderProps) => {
  return (
    <button {...props} disabled={disabled || loading} className={styles.button}>
      {loading && <span className={styles.spinner} />}
      <span className={loading ? styles.textHidden : ''}>{children}</span>
    </button>
  );
};

export default ButtonLoader;
