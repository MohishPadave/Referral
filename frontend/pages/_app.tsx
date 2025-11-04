import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { darkMode, initializeDarkMode } = useAuthStore();
  
  useEffect(() => {
    // Initialize dark mode on app load
    initializeDarkMode();
  }, [initializeDarkMode]);

  useEffect(() => {
    // Update document class when dark mode changes
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return <Component {...pageProps} />;
}


