import styles from './Loader.module.scss';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  text?: string;
}

const Loader = ({ size = 'medium', fullscreen = false, text }: LoaderProps) => {
  if (fullscreen) {
    return (
      <div className={styles.fullscreenContainer}>
        <div className={`${styles.spinner} ${styles[size]}`} />
        {text && <p className={styles.text}>{text}</p>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loader;
