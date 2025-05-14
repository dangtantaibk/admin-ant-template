import React from 'react';
import { Menu, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="admin-button">
        <Button type="text" size="large">ADMIN</Button>
      </div>
      <Menu theme="dark" mode="inline">
        <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
          Orders
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Sidebar;