/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LogoutOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  KeyOutlined,
  TeamOutlined,
  ShoppingOutlined,
  CommentOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Space, theme, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOutlined } from '@ant-design/icons';
import authService from '../services/authService';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

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
  getItem(<Link to="/admin/orders">Orders</Link>, '/admin/orders', <ShoppingCartOutlined />),
  getItem(<Link to="/admin/products">Products</Link>, '/admin/products', <ShoppingOutlined />),
  getItem(<Link to="/admin/roles">Roles</Link>, '/admin/roles', <KeyOutlined />),
  getItem(<Link to="/admin/users">Users</Link>, '/admin/users', <TeamOutlined />),
  getItem(<Link to="/admin/blogs">Blogs</Link>, '/admin/blogs', <BookOutlined />),
  getItem(<Link to="/admin/comments">Comments</Link>, '/admin/comments', <CommentOutlined />),
  // getItem(<Link to="/admin/subscriptions">Subscriptions</Link>, '/admin/subscriptions', <NotificationOutlined />),

];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setCurrentUser } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  useEffect(() => {
    console.log('User: ', user);
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser); 
    } else {
      // Handle the case when no user is found
      navigate('/login');
    }
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize(); // Set initial state based on window size
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (user && !userLoaded) {
      setUserLoaded(true);
    }
  }, [user, userLoaded]);

  // Determine selected keys based on current path
  const selectedKeys = [location.pathname];

  // User dropdown menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong>{user?.fullName || user?.username}</Text><br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/profile#settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, textAlign: 'center', color: 'white', lineHeight: '32px' }}>ADMIN</div>
        <Menu theme="dark" selectedKeys={selectedKeys} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space className="user-profile-dropdown" style={{ cursor: 'pointer', padding: '8px' }}>
              <Avatar
                icon={<UserOutlined />}
                src={user?.avatarUrl}
                style={{ backgroundColor: user?.avatarUrl ? 'transparent' : '#1677ff' }}
              />
              {!collapsed && (
                <Space direction="vertical" style={{ lineHeight: '1.2' }}>
                  <Text strong style={{ marginBottom: 0 }}>{user?.fullName || user?.username}</Text>
                  {/* <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.roles ? user.roles.map((role: any) =>
                      typeof role === 'object' ? role.name : role
                    ).join(', ') : 'No roles assigned'}
                  </Text> */}
                </Space>
              )}
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
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
