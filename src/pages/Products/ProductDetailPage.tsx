/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Image, Modal, Spin, Typography, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import { Product } from './types';
import apiService from '../../services/api';
import { useState } from 'react';

const { Title } = Typography;

// Define mapping function for product
const mapProductDetail = (item: any): Product => ({
  id: item.id || '',
  business: item.business || '',
  product_url: item.product_url || '',
  product_url_code: item.product_url_code || '',
  image_url: item.image_url || '',
  name: item.name || '',
  price: item.price || '',
  code: item.code || '',
  category: item.category || '',
  categoryName: item.categoryName || '',
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Use our custom hook for data fetching
  const { 
    data: product,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Product>({
    endpoint: '/products',
    id,
    mappingFunction: mapProductDetail,
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
    navigate('/admin/products');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await apiService.delete(`/products/${id}`);
          message.success('Product deleted successfully');
          navigate('/admin/products');
        } catch (error) {
          console.error('Failed to delete product:', error);
          message.error('Failed to delete product');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  const handleEdit = () => {
    navigate(`/admin/products/edit/${id}`);
  };

  return (
    <div className="product-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Products
          </Button>
          <Title level={2} style={{ margin: 0 }}>Product Details</Title>
        </div>
        
        <div>
          {product && (
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
        {product ? (
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image
                src={product.image_url}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
              />
            </div>
            <Descriptions 
              title={`Product: ${product.name}`} 
              bordered 
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="ID">{product.id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Name">{product.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Code">{product.code || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Price">{product.price || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Category">{product.categoryName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Business">{product.business || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Product URL" span={3}>
                <a href={product.product_url} target="_blank" rel="noopener noreferrer">{product.product_url}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Product URL Code">{product.product_url_code || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDate(product.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{formatDate(product.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        ) : !loading && !hasError && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p>No product data found</p>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default ProductDetailPage;
