import React, { useState } from 'react';
import {
  ShoppingCartOutlined,
  BookOutlined,
  ProductOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  // getItem('Dashboard', '/admin', <PieChartOutlined />), // Optional Dashboard
  getItem(<Link to="/admin/orders">Orders</Link>, '/admin/orders', <ShoppingCartOutlined />),
  getItem(<Link to="/admin/subscriptions">Subscriptions</Link>, '/admin/subscriptions', <NotificationOutlined />),
  getItem(<Link to="/admin/products">Products</Link>, '/admin/products', <ProductOutlined />),
  getItem(<Link to="/admin/blog-posts">Blog Posts</Link>, '/admin/blog-posts', <BookOutlined />),
  // Example with sub-menu if needed later
  // getItem('User', 'sub1', <UserOutlined />, [
  //   getItem('Tom', '3'),
  //   getItem('Bill', '4'),
  //   getItem('Alex', '5'),
  // ]),
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Determine selected keys based on current path
  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, textAlign: 'center', color: 'white', lineHeight: '32px' }}>ADMIN</div>
        <Menu theme="dark" selectedKeys={selectedKeys} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer }}>
            {/* Header Content can go here - e.g., User profile dropdown */}
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {/* Basic Breadcrumb - can be made dynamic later */}
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            <Breadcrumb.Item>{location.pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Protected Route Content will be rendered here */}
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin Dashboard ©{new Date().getFullYear()} Created with Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
