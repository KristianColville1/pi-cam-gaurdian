import { createBrowserRouter } from 'react-router-dom';
import PageTemplate from '@components/templates/PageTemplate';
import Home from '@pages/Home';

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
    ],
  },
]);

export default router;

