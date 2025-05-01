import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { Table, Typography, Spin, Alert, Button, Modal, message, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { TableProps } from 'antd';
// Remove unused FilterValue import
import type { SorterResult } from 'antd/es/table/interface';
import apiService from '../../services/api';
import { Subscription, PaginatedResponse, TableParams } from '../../types';

const { Title } = Typography;
const { confirm } = Modal;

// Define interface for request params
interface SubscriptionListParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: string;
}

const SubscriptionListPage: React.FC = () => {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const fetchData = useCallback(async () => { // Wrap fetchData in useCallback
    setLoading(true);
    setError(null);
    try {
      const params: SubscriptionListParams = {
        page: tableParams.pagination?.current,
        limit: tableParams.pagination?.pageSize,
        // Add sorting/filtering params if needed
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder ? String(tableParams.sortOrder) : undefined,
      };
      const response = await apiService.get<PaginatedResponse<Subscription>>('/subscriptions', params);
      setData(response.data.data);
      setTableParams((prev) => ({ // Use prev state correctly
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.data.total,
        },
      }));
    } catch (err: unknown) { // Change any to unknown
      console.error("Failed to fetch subscriptions:", err);
      const errorMsg = 'Failed to load subscriptions. Please try again later.';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [tableParams]); // Add tableParams dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Use fetchData as dependency

  const handleTableChange: TableProps<Subscription>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Subscription>;
    setTableParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleDelete = (id: number | string) => {
    confirm({
      title: 'Are you sure you want to delete this subscription?',
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          setLoading(true); // Indicate loading state during deletion
          await apiService.delete(`/subscriptions/${id}`);
          message.success('Subscription deleted successfully!');
          fetchData(); // Refresh the list after deletion
        } catch (err: unknown) { // Change any to unknown
          console.error("Failed to delete subscription:", err);
          message.error('Failed to delete subscription. Please try again.');
          setLoading(false); // Ensure loading is turned off on error
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

  const columns: TableProps<Subscription>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            type="link"
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Subscription Management</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
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
    </div>
  );
};

export default SubscriptionListPage;
