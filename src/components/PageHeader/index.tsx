import React, { ReactNode } from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  extra?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, extra }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 16 
    }}>
      <Title level={2} style={{ margin: 0 }}>{title}</Title>
      {extra}
    </div>
  );
};

export default PageHeader;
