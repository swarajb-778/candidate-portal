import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { store } from './store/index.js';
import { router } from './routes.jsx';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // A dead session is not something to retry — the interceptor already
      // routed the user to the explanation screen.
      retry: (count, err) => err?.response?.status !== 401 && count < 2
    }
  }
});

// Fired by the Axios 401 interceptor. Remember where the user was so the
// expired screen can name it and the post-login redirect lands there.
window.addEventListener('session:expired', () => {
  if (location.pathname !== '/session-expired') {
    sessionStorage.setItem('cp:lastLocation', location.pathname + location.search);
    router.navigate('/session-expired');
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
