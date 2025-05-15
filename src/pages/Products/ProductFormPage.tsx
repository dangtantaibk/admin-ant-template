/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Spin, Typography, Upload, message } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import apiService from '../../services/api';
import { Product } from './types';

const { Title } = Typography;
const { Option } = Select;

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

interface ProductFormValues {
  name: string;
  code: string;
  price: string;
  business: string;
  category: string;
  product_url: string;
  product_url_code: string;
  image_url: string;
}

// Sample categories list - in a real application, you would fetch this from an API
const categories = [
  { value: 'yen-thuong-hang', label: 'Yến Thượng Hạng' },
  { value: 'yen-cao-cap', label: 'Yến Cao Cấp' },
  { value: 'yen-tieu-chuan', label: 'Yến Tiêu Chuẩn' },
];

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ProductFormValues>();
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const isEditing = !!id;
  
  // Only fetch details if editing
  const { 
    data: product,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Product>({
    endpoint: '/products',
    id: isEditing ? id : undefined,
    mappingFunction: mapProductDetail,
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (product && isEditing) {
      form.setFieldsValue({
        name: product.name,
        code: product.code,
        price: product.price,
        business: product.business,
        category: product.category,
        product_url: product.product_url,
        product_url_code: product.product_url_code,
        image_url: product.image_url,
      });
      setImageUrl(product.image_url);
    }
  }, [product, form, isEditing]);

  const handleGoBack = () => {
    navigate('/admin/products');
  };

  const onFinish = async (values: ProductFormValues) => {
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.patch(`/products/${id}`, values);
        message.success('Product updated successfully');
      } else {
        await apiService.post('/products', values);
        message.success('Product created successfully');
        form.resetFields();
        setImageUrl('');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} product:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setSaving(false);
    }
  };

  // File upload preview handlers
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isImage && isLt2M;
  };

  // In a real app, this would upload to your server
  const handleImageUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      // For demo, we'll use a timeout to simulate server upload
      // and return a fake URL. In production, replace with actual API call.
      setTimeout(async () => {
        const base64 = await getBase64(file);
        // In a real app, you'd post the file to your API and get back a URL
        // For demo purposes, we'll just use the base64 string
        setImageUrl(base64);
        form.setFieldsValue({ image_url: base64 });
        onSuccess('ok');
        message.success('Image uploaded successfully');
      }, 1000);
    } catch (err) {
      onError(err);
      message.error('Image upload failed');
    }
  };

  const pageTitle = isEditing ? 'Edit Product' : 'Create New Product';

  return (
    <div className="product-form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Products
          </Button>
          <Title level={2} style={{ margin: 0 }}>{pageTitle}</Title>
        </div>
      </div>
      
      {isEditing && (
        <ErrorHandler 
          error={error} 
          hasError={hasError}
          onRetry={handleRetry}
          showRetryButton={true}
        />
      )}
      
      <Spin spinning={isEditing && loading}>
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ business: 'Yến sào' }}
          >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Please enter the product name' }]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>
            
            <Form.Item
              name="code"
              label="Product Code"
              rules={[{ required: true, message: 'Please enter the product code' }]}
            >
              <Input placeholder="Enter product code" />
            </Form.Item>
            
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter the price' }]}
            >
              <Input placeholder="Enter price (e.g., 1,500,000 VNĐ)" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select category">
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="business"
              label="Business"
              rules={[{ required: true, message: 'Please enter the business' }]}
            >
              <Input placeholder="Enter business name" />
            </Form.Item>
            
            <Form.Item
              name="product_url"
              label="Product URL"
              rules={[
                { required: true, message: 'Please enter the product URL' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input placeholder="Enter product URL" />
            </Form.Item>
            
            <Form.Item
              name="product_url_code"
              label="Product URL Code"
              rules={[{ required: true, message: 'Please enter the product URL code' }]}
            >
              <Input placeholder="Enter product URL code" />
            </Form.Item>
            
            <Form.Item
              name="image_url"
              label="Product Image"
              rules={[{ required: true, message: 'Please upload or enter an image URL' }]}
            >
              <Input placeholder="Enter image URL" onChange={(e) => setImageUrl(e.target.value)} />
            </Form.Item>
            
            <Form.Item label="Upload Image">
              <Upload
                customRequest={handleImageUpload}
                beforeUpload={beforeUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>
            
            {imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <p>Preview:</p>
                <img 
                  src={imageUrl} 
                  alt="Product preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                />
              </div>
            )}
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
              >
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default ProductFormPage;
