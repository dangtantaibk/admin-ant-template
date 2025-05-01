import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US'; // Or your preferred locale

import AdminLayout from './layouts/AdminLayout';

// Import các component thực tế
import OrderListPage from './pages/Orders/OrderListPage';
import SubscriptionListPage from './pages/Subscriptions/SubscriptionListPage';
import ProductListPage from './pages/Products/ProductListPage';
import ProductFormPage from './pages/Products/ProductFormPage';
import BlogPostListPage from './pages/BlogPosts/BlogPostListPage';
import BlogPostFormPage from './pages/BlogPosts/BlogPostFormPage';

// Basic Authentication Check Placeholder
const isAuthenticated = () => {
  // Replace with actual authentication logic (e.g., check for token)
  return true; // Assume user is authenticated for now
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    // return <Navigate to="/login" replace />; // Enable when Login page exists
    console.warn("User not authenticated, redirecting would happen here.");
    // For now, allow access until login is implemented
     return <>{children}</>;
  }

  return <>{children}</>;
};


function App() {
  return (
    <ConfigProvider locale={enUS}>
      <BrowserRouter>
        <Routes>
          {/* Login Route - Uncomment when LoginPage is created */}
          {/* <Route path="/login" element={<LoginPage />} /> */}

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Index route for /admin (optional, could redirect or show dashboard) */}
             <Route index element={<Navigate to="orders" replace />} /> {/* Redirect /admin to /admin/orders */}
            {/* <Route index element={<div>Dashboard Content</div>} /> */}

            <Route path="orders" element={<OrderListPage />} />
            <Route path="subscriptions" element={<SubscriptionListPage />} />

            {/* Product Routes */}
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />

            {/* Blog Post Routes */}
            <Route path="blog-posts" element={<BlogPostListPage />} />
            <Route path="blog-posts/new" element={<BlogPostFormPage />} />
            <Route path="blog-posts/edit/:id" element={<BlogPostFormPage />} />

            {/* Catch-all for unknown admin routes (optional) */}
            <Route path="*" element={<div>Admin Page Not Found</div>} />
          </Route>

          {/* Redirect root path to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* General Catch-all for unknown routes */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
