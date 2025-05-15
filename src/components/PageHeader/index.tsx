import React, { ReactNode } from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  extra?: ReactNode;
  onBack?: () => void;
  backIcon?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  extra, 
  onBack,
  backIcon = <ArrowLeftOutlined />
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 16 
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {onBack && (
          <Button
            icon={backIcon}
            onClick={onBack}
            style={{ marginRight: 16 }}
            type="text"
          />
        )}
        <Title level={2} style={{ margin: 0 }}>{title}</Title>
      </div>
      {extra}
    </div>
  );
};

export default PageHeader;
