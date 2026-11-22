import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { AuthProvider } from '@/app/AuthContext';
import router from '@/app/router';
import { CarritoProvider } from '@/shared/context/CarritoContext';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

import './styles/base.css';
import './styles/components.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CarritoProvider>
          <RouterProvider router={router} />
        </CarritoProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
