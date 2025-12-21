import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectTheme, updateResolvedTheme } from '@/app/store/slices/uiSlice';

/**
 * Hook to manage theme application to DOM
 * Handles:
 * - Applying data-theme attribute to document.documentElement
 * - Listening to system theme changes
 * - Syncing with Redux state
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const resolvedTheme = useAppSelector((state) => state.ui.resolvedTheme);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      // Remove data-theme to let CSS media query handle it
      root.removeAttribute('data-theme');
    } else {
      // Explicitly set light or dark
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      dispatch(updateResolvedTheme());
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, dispatch]);

  return { theme, resolvedTheme };
};
