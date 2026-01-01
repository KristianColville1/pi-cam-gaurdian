import { createBrowserRouter } from 'react-router-dom';
import PageTemplate from '@components/templates/PageTemplate';
import ProtectedRoute from '@components/organisms/ProtectedRoute';
import Home from '@pages/Home';
import Portal from '@pages/Portal';

/**
 * Application routes configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageTemplate />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'portal',
        element: (
          <ProtectedRoute>
            <Portal />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;

