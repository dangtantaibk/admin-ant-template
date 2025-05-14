/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EyeOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, message, Modal, Spin, Table, Tag, Typography } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';
import ErrorHandler from '../../components/ErrorHandler';
import PageHeader from '../../components/PageHeader';
import { useDataFetching } from '../../hooks/useDataFetching';
import apiService from '../../services/api';
import { User } from './types';
import dayjs from 'dayjs';

const { Text } = Typography;

// Define mapping function for users
const mapUserData = (item: any): User => ({
  id: item.id || '',
  email: item.email || '',
  fullName: item.fullName || '',
  phone: item.phone || '',
  roles: item.roles || [],
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

const UserListPage: React.FC = () => {
  // Use custom hook for data fetching
  const { 
    data,
    loading,
    error,
    hasError,
    tableParams,
    updateParams,
    handleRetry,
    refreshData,
  } = useDataFetching<User>({
    endpoint: '/users',
    mappingFunction: mapUserData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleTableChange: TableProps<User>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<User>;
    updateParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleViewDetails = (record: User) => {
    try {
      if (!record) {
        message.error('User details not available');
        return;
      }
      
      setSelectedUser(record);
      setModalVisible(true);
    } catch (error: unknown) {
      console.error("Error showing modal:", error);
      message.error('Failed to display user details');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(id);
          await apiService.delete(`/users/${id}`);
          message.success('User deleted successfully');
          refreshData();
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('Failed to delete user');
        } finally {
          setDeleteLoading(null);
        }
      }
    });
  };
  
  const columns: TableProps<User>['columns'] = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      render: (text: string, record: User) => (
        <Link to={`/admin/users/${record.id}`} style={{ color: '#1677ff' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: any[]) => (
        <span>
          {roles && roles.map(role => (
            <Tag color="blue" key={role.id}>
              {role.name}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            type="link"
            style={{ marginRight: 8 }}
          >
            Quick View
          </Button>
          <Link to={`/admin/users/${record.id}`}>
            <Button icon={<InfoCircleOutlined />} type="link" style={{ marginRight: 8 }}>
              Detail
            </Button>
          </Link>
          <Button
            icon={<DeleteOutlined />}
            danger
            type="link"
            loading={deleteLoading === record.id}
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  // Render content for the detail modal
  const renderUserDetails = (user: User) => (
    <div>
      <p><strong>Full Name:</strong> {user.fullName || 'N/A'}</p>
      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
      <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
      <p><strong>Roles:</strong></p>
      {user.roles && user.roles.length > 0 ? (
        <ul>
          {user.roles.map((role, idx) => (
            <li key={idx}>{role.name} - {role.description || 'No description'}</li>
          ))}
        </ul>
      ) : (
        <Text type="secondary">No roles assigned</Text>
      )}
      <p><strong>Created At:</strong> {user.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A'}</p>
      <p><strong>Updated At:</strong> {user.updatedAt ? dayjs(user.updatedAt).format('YYYY-MM-DD HH:mm') : 'N/A'}</p>
    </div>
  );

  const headerExtra = (
    <>
      <Link to="/admin/users/new">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginRight: 16 }}
        >
          New User
        </Button>
      </Link>
      {hasError && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRetry}
        >
          Try Again
        </Button>
      )}
    </>
  );

  return (
    <div className="user-list-container" style={{ width: '100%' }}>
      <PageHeader 
        title="User Management" 
        extra={headerExtra} 
      />
      
      <ErrorHandler 
        error={error} 
        hasError={hasError}
        onRetry={handleRetry}
        showRetryButton={false}
      />
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          rowKey="id"
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
      
      <DetailModal<User>
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedUser}
        title={selectedUser ? `User Details: ${selectedUser.fullName}` : 'User Details'}
        renderContent={renderUserDetails}
        width={600}
      />
    </div>
  );
};

export default UserListPage;
