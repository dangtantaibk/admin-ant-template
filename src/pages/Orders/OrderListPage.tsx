/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, message, Spin, Table, Typography } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';
import ErrorHandler from '../../components/ErrorHandler';
import { useDataFetching } from '../../hooks/useDataFetching';
import { Order } from './types';

const { Title } = Typography;

// Define mapping function for orders
const mapOrderData = (item: any): Order => ({
  id: item.id || '',
  fullName: item.fullName || '',
  phone: item.phone || '',
  product: item.product || '',
  notes: item.notes || '',
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
});

const OrderListPage: React.FC = () => {
  // Use our custom hook for data fetching
  const { 
    data,
    loading,
    error,
    hasError,
    tableParams,
    updateParams,
    handleRetry,
  } = useDataFetching<Order>({
    endpoint: '/orders',
    mappingFunction: mapOrderData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleTableChange: TableProps<Order>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Order>;
    updateParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleViewDetails = (record: Order) => {
    try {
      if (!record) {
        message.error('Order details not available');
        return;
      }
      
      setSelectedOrder(record);
      setModalVisible(true);
    } catch (error: unknown) {
      console.error("Error showing modal:", error);
      message.error('Failed to display order details');
    }
  };
  
  // Safe date formatting with error handling
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date available';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 300,
      ellipsis: true,
      render: (id: string) => (
        <Link to={`/admin/orders/${id}`} style={{ color: '#1677ff' }}>
          {id}
        </Link>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      ellipsis: true,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes || '-',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
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
          <Link to={`/admin/orders/${record.id}`}>
            <Button icon={<InfoCircleOutlined />} type="link">
              Detail
            </Button>
          </Link>
        </>
      ),
    },
  ];

  // Render content for the detail modal
  const renderOrderDetails = (order: Order) => (
    <div>
      <p><strong>Full Name:</strong> {order.fullName || 'N/A'}</p>
      <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
      <p><strong>Product:</strong> {order.product || 'N/A'}</p>
      <p><strong>Notes:</strong> {order.notes || 'N/A'}</p>
      <p><strong>Created At:</strong> {formatDate(order.createdAt)}</p>
      <p><strong>Updated At:</strong> {formatDate(order.updatedAt)}</p>
    </div>
  );

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
      
      <DetailModal<Order>
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedOrder}
        title={selectedOrder ? `Order Details (ID: ${selectedOrder.id || 'Unknown'})` : 'Order Details'}
        renderContent={renderOrderDetails}
        width={600}
      />
    </div>
  );
};

export default OrderListPage;