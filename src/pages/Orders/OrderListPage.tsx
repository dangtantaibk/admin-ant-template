import { useState, useEffect, useRef } from 'react';
import { Table, Typography, Spin, Alert, Button, Modal, message } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import apiService from '../../services/api';
import { Order, PaginatedResponse, TableParams } from '../../types';

const { Title } = Typography;

// Define interface for request params
interface OrderListParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: string;
}

const OrderListPage: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
  });
  
  // Sử dụng useRef để theo dõi trạng thái mà không gây render lại
  const paramsRef = useRef(tableParams);
  // Theo dõi việc cần tải lại dữ liệu
  const shouldFetchRef = useRef(true);

  // Tách hàm fetchData ra khỏi callback để tránh việc tạo lại liên tục
  const fetchData = async () => {
    // Nếu đang có lỗi và không được chỉ định tải lại, bỏ qua
    if (hasError && !shouldFetchRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params: OrderListParams = {
        page: paramsRef.current.pagination?.current,
        limit: paramsRef.current.pagination?.pageSize,
        sortField: paramsRef.current.sortField,
        sortOrder: paramsRef.current.sortOrder ? String(paramsRef.current.sortOrder) : undefined,
      };

      const response = await apiService.get<PaginatedResponse<Order>>('/orders', params);
      setData(response.data.data);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.data.total,
        },
      }));
      setHasError(false);
      shouldFetchRef.current = false;
    } catch (err: unknown) {
      console.error("Failed to fetch orders:", err);
      setError('Failed to load orders. Please try again later.');
      message.error('Failed to load orders.');
      setHasError(true);
      shouldFetchRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi fetchData khi mount component hoặc khi shouldFetch thay đổi
  useEffect(() => {
    // Cập nhật params hiện tại
    paramsRef.current = tableParams;
    
    // Chỉ gọi API khi cần thiết
    if (shouldFetchRef.current) {
      fetchData();
    }
  }, [tableParams, hasError, shouldFetchRef.current]);

  // Hàm thử lại khi có lỗi
  const handleRetry = () => {
    shouldFetchRef.current = true;
    setHasError(false);
    fetchData();
  };

  const handleTableChange: TableProps<Order>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Order>;
    setTableParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
    
    // Đánh dấu rằng cần tải lại dữ liệu mới
    shouldFetchRef.current = true;
  };

  const handleViewDetails = (record: Order) => {
    // Show order details in a modal
    Modal.info({
        title: `Order Details (ID: ${record.id})`,
        content: (
            <div>
                <p><strong>Name:</strong> {record.name}</p>
                <p><strong>Phone:</strong> {record.phone}</p>
                <p><strong>Notes:</strong> {record.notes || 'N/A'}</p>
                <p><strong>Product ID:</strong> {record.productId || 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(record.createdAt).toLocaleString()}</p>
            </div>
        ),
        onOk() {},
        width: 600,
    });
  };

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes || '-',
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId) => productId || 'N/A',
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
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          type="link"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="order-list-container" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Order Management</Title>
        {hasError && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
          >
            Thử lại
          </Button>
        )}
      </div>
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

export default OrderListPage;
