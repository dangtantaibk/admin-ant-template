import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import enUS from 'antd/locale/en_US';

import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/Login/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import page components
import OrderListPage from './pages/Orders/OrderListPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import ProfilePage from './pages/Profile/ProfilePage';
// Import role management pages
import RoleListPage from './pages/Roles/RoleListPage';
import RoleDetailPage from './pages/Roles/RoleDetailPage';
import RoleFormPage from './pages/Roles/RoleFormPage';
import UserListPage from './pages/Users/UserListPage';
import UserDetailPage from './pages/Users/UserDetailPage';
import UserFormPage from './pages/Users/UserFormPage';
// Import product management pages
import ProductListPage from './pages/Products/ProductListPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import ProductFormPage from './pages/Products/ProductFormPage';

import BlogListPage from './pages/Blogs/BlogListPage';
import BlogDetailPage from './pages/Blogs/BlogDetailPage';
import BlogCreatePage from './pages/Blogs/BlogCreatePage';

import CommentListPage from './pages/Comments/CommentListPage';
import BlogUpdatePage from './pages/Blogs/BlogUpdatePage';
// import CommentForm from './pages/Comments/CommentForm';

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// App Wrapper that provides Auth Context
const AppWithAuth: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <ConfigProvider locale={enUS}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            {/* Index route for /admin */}
            <Route index element={<Navigate to="orders" replace />} />

            {/* Orders Routes */}
            <Route path="orders">
              <Route index element={<OrderListPage />} />
              <Route path=":id" element={<OrderDetailPage />} />
            </Route>
            
            {/* Roles Routes */}
            <Route path="roles">
              <Route index element={<RoleListPage />} />
              <Route path=":id" element={<RoleDetailPage />} />
              <Route path="create" element={<RoleFormPage />} />
              <Route path="edit/:id" element={<RoleFormPage />} />
            </Route>
            
            {/* Users Routes */}
            <Route path="users">
              <Route index element={<UserListPage />} />
              <Route path=":id" element={<UserDetailPage />} />
              <Route path="new" element={<UserFormPage />} />
              <Route path="edit/:id" element={<UserFormPage />} />
            </Route>
            
            {/* Products Routes */}
            <Route path="products">
              <Route index element={<ProductListPage />} />
              <Route path=":id" element={<ProductDetailPage />} />
              <Route path="new" element={<ProductFormPage />} />
              <Route path="edit/:id" element={<ProductFormPage />} />
            </Route>

            {/* Blogs Routes */}
            <Route path="blogs">
              <Route index element={<BlogListPage />} />
              <Route path=":id" element={<BlogDetailPage />} />
              <Route path="create" element={<BlogCreatePage />} />
              <Route path="edit/:id" element={<BlogUpdatePage />} />
            </Route>
            {/* Comments Routes */}
            <Route path="comments">
              <Route index element={<CommentListPage />} />
            </Route>
            
            {/* Profile Route */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Catch-all for unknown admin routes */}
            <Route path="*" element={<div>Admin Page Not Found</div>} />
          </Route>
        </Route>

        {/* Redirect root path to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* General Catch-all for unknown routes */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </ConfigProvider>
  );
};

// Export the wrapped app
function App() {
  return <AppWithAuth />;
}

export default App;
