import { createBrowserRouter } from 'react-router-dom';
import PageTemplate from '@components/templates/PageTemplate';
import ProtectedRoute from '@components/organisms/ProtectedRoute';
import Home from '@pages/Home';
import Portal from '@pages/Portal';
import ApiDocs from '@pages/ApiDocs';
import MetricsHistory from '@pages/MetricsHistory';

/**
 * Application routes configuration
 * @returns {Object}
 * @description Creates the application routes configuration.
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
      {
        path: 'api-docs',
        element: (
          <ProtectedRoute>
            <ApiDocs />
          </ProtectedRoute>
        ),
      },
      {
        path: 'metrics-history',
        element: (
          <ProtectedRoute>
            <MetricsHistory />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;

