import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@components/organisms/Navigation';
import Footer from '@components/organisms/Footer';

function PageTemplate() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PageTemplate;

