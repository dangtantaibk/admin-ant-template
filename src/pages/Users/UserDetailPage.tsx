/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Modal, Spin, Tag, Typography, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import { User } from './types';
import apiService from '../../services/api';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;

// Define mapping function for user
const mapUserDetail = (item: any): User => ({
  id: item.id || '',
  email: item.email || '',
  fullName: item.fullName || '',
  phone: item.phone || '',
  roles: item.roles || [],
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Use our custom hook for data fetching
  const { 
    data: user,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<User>({
    endpoint: '/users',
    id,
    mappingFunction: mapUserDetail,
  });

  const handleGoBack = () => {
    navigate('/admin/users');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await apiService.delete(`/users/${id}`);
          message.success('User deleted successfully');
          navigate('/admin/users');
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('Failed to delete user');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  const handleEdit = () => {
    navigate(`/admin/users/edit/${id}`);
  };

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  return (
    <div className="user-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Users
          </Button>
          <Title level={2} style={{ margin: 0 }}>User Details</Title>
        </div>
        
        <div>
          {user && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
          {hasError && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRetry}
              style={{ marginLeft: 8 }}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
      
      <ErrorHandler 
        error={error} 
        hasError={hasError}
        onRetry={handleRetry}
        showRetryButton={false}
      />
      
      <Spin spinning={loading}>
        {user ? (
          <Card>
            <Descriptions 
              title={`User: ${user.fullName}`} 
              bordered 
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="ID">{user.id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Full Name">{user.fullName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{user.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDate(user.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{formatDate(user.updatedAt)}</Descriptions.Item>
              <Descriptions.Item label="Roles" span={3}>
                {user.roles && user.roles.length > 0 ? (
                  <div>
                    {user.roles.map((role, index) => (
                      <Tag color="blue" key={index} style={{ margin: '0 8px 8px 0' }}>
                        {role.name}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  'No roles assigned'
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : !loading && !hasError && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p>No user data found</p>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default UserDetailPage;
