import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

// Helper: Get theme from localStorage
const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('fuddly-theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
  }
  return 'system';
};

// Helper: Detect system theme
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Helper: Resolve theme (system -> light/dark)
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme;
};

const initialTheme = getStoredTheme();

const initialState: UiState = {
  theme: initialTheme,
  resolvedTheme: resolveTheme(initialTheme),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme = resolveTheme(action.payload);

      // Persist to localStorage
      try {
        localStorage.setItem('fuddly-theme', action.payload);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    },
    toggleTheme: (state) => {
      // Cycle: light -> dark -> system -> light
      const themeOrder: Theme[] = ['light', 'dark', 'system'];
      const currentIndex = themeOrder.indexOf(state.theme);
      const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];

      state.theme = nextTheme;
      state.resolvedTheme = resolveTheme(nextTheme);

      try {
        localStorage.setItem('fuddly-theme', nextTheme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    },
    updateResolvedTheme: (state) => {
      // Called when system theme changes
      state.resolvedTheme = resolveTheme(state.theme);
    },
  },
});

export const { setTheme, toggleTheme, updateResolvedTheme } = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectResolvedTheme = (state: { ui: UiState }) => state.ui.resolvedTheme;

export default uiSlice.reducer;
