import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStore } from '@fde-desktop/fde-core';
import './Infrastructure/i18n';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

// Hydrate the user store before the first render so auto-login never flashes the
// login screen. Doing it during FdeDesktopContent's render wrote to the store
// mid-render and triggered React's "Cannot update a component while rendering a
// different component" warning.
if (!useUserStore.getState().isLoaded) {
  void useUserStore.getState().loadUsers();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

document.dispatchEvent(new Event('prerender-ready'));

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}
