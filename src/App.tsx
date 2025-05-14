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
