/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EyeOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, message, Modal, Spin, Table, Typography } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';
import ErrorHandler from '../../components/ErrorHandler';
import PageHeader from '../../components/PageHeader';
import { useDataFetching } from '../../hooks/useDataFetching';
import apiService from '../../services/api';
import { Role } from './types';

const { Text } = Typography;

// Define mapping function for roles
const mapRoleData = (item: any): Role => ({
  id: item.id || '',
  name: item.name || '',
  description: item.description || '',
  permissions: item.permissions || [],
});

const RoleListPage: React.FC = () => {
  // Use our custom hook for data fetching
  const { 
    data,
    loading,
    error,
    hasError,
    tableParams,
    updateParams,
    handleRetry,
    refreshData,
  } = useDataFetching<Role>({
    endpoint: '/roles',
    mappingFunction: mapRoleData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleTableChange: TableProps<Role>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Role>;
    updateParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleViewDetails = (record: Role) => {
    try {
      if (!record) {
        message.error('Role details not available');
        return;
      }
      
      setSelectedRole(record);
      setModalVisible(true);
    } catch (error: unknown) {
      console.error("Error showing modal:", error);
      message.error('Failed to display role details');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this role?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(id);
          await apiService.delete(`/roles/${id}`);
          message.success('Role deleted successfully');
          refreshData();
        } catch (error) {
          console.error('Failed to delete role:', error);
          message.error('Failed to delete role');
        } finally {
          setDeleteLoading(null);
        }
      }
    });
  };
  
  const columns: TableProps<Role>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 300,
      ellipsis: true,
      render: (id: string) => (
        <Link to={`/admin/roles/${id}`} style={{ color: '#1677ff' }}>
          {id}
        </Link>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <span>
          {permissions?.length ? (
            `${permissions.length} Permission${permissions.length > 1 ? 's' : ''}`
          ) : (
            '-'
          )}
        </span>
      ),
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
          <Link to={`/admin/roles/${record.id}`}>
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
  const renderRoleDetails = (role: Role) => (
    <div>
      <p><strong>Name:</strong> {role.name || 'N/A'}</p>
      <p><strong>Description:</strong> {role.description || 'N/A'}</p>
      <p><strong>Permissions:</strong></p>
      {role.permissions && role.permissions.length > 0 ? (
        <ul>
          {role.permissions.map((permission, idx) => (
            <li key={idx}>{permission}</li>
          ))}
        </ul>
      ) : (
        <Text type="secondary">No permissions assigned</Text>
      )}
    </div>
  );

  const headerExtra = (
    <>
      <Link to="/admin/roles/create">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginRight: 16 }}
        >
          New Role
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
    <div className="role-list-container" style={{ width: '100%' }}>
      <PageHeader 
        title="Role Management" 
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
      
      <DetailModal<Role>
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedRole}
        title={selectedRole ? `Role Details: ${selectedRole.name}` : 'Role Details'}
        renderContent={renderRoleDetails}
        width={600}
      />
    </div>
  );
};

export default RoleListPage;
