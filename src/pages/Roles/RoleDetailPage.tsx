/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Modal, Spin, Tag, Typography, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import { Role } from './types';
import apiService from '../../services/api';
import { useState } from 'react';

const { Title } = Typography;

// Define mapping function for role
const mapRoleDetail = (item: any): Role => ({
  id: item.id || '',
  name: item.name || '',
  description: item.description || '',
  permissions: item.permissions || [],
});

const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Use our custom hook for data fetching
  const { 
    data: role,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Role>({
    endpoint: '/roles',
    id,
    mappingFunction: mapRoleDetail,
  });

  const handleGoBack = () => {
    navigate('/admin/roles');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this role?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await apiService.delete(`/roles/${id}`);
          message.success('Role deleted successfully');
          navigate('/admin/roles');
        } catch (error) {
          console.error('Failed to delete role:', error);
          message.error('Failed to delete role');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  const handleEdit = () => {
    navigate(`/admin/roles/edit/${id}`);
  };

  return (
    <div className="role-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Roles
          </Button>
          <Title level={2} style={{ margin: 0 }}>Role Details</Title>
        </div>
        
        <div>
          {role && (
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
        {role ? (
          <Card>
            <Descriptions 
              title={`Role: ${role.name}`} 
              bordered 
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="ID">{role.id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Name">{role.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Description">{role.description || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Permissions" span={3}>
                {role.permissions && role.permissions.length > 0 ? (
                  <div>
                    {role.permissions.map((permission, index) => (
                      <Tag color="blue" key={index} style={{ margin: '0 8px 8px 0' }}>
                        {permission}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  'No permissions assigned'
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : !loading && !hasError && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p>No role data found</p>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default RoleDetailPage;
