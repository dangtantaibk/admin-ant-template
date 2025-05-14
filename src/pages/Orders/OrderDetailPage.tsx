/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Spin, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import { Order } from './types';

const { Title } = Typography;

// Define mapping function for order
const mapOrderDetail = (item: any): Order => ({
  id: item.id || '',
  fullName: item.fullName || '',
  phone: item.phone || '',
  product: item.product || '',
  notes: item.notes || '',
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
});

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use our custom hook for data fetching
  const { 
    data: order,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Order>({
    endpoint: '/orders',
    id,
    mappingFunction: mapOrderDetail,
  });
  
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

  const handleGoBack = () => {
    navigate('/admin/orders');
  };

  return (
    <div className="order-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Orders
          </Button>
          <Title level={2} style={{ margin: 0 }}>Order Details</Title>
        </div>
        
        {hasError && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
          >
            Try Again
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
        {order ? (
          <Card>
            <Descriptions 
              title={`Order ID: ${order.id}`} 
              bordered 
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="Full Name">{order.fullName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{order.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Product">{order.product || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Notes" span={3}>{order.notes || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDate(order.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{formatDate(order.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        ) : !loading && !hasError && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p>No order data found</p>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default OrderDetailPage;
