import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Spin,
  Alert,
  Typography,
  InputNumber,
  Select,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Rule } from 'antd/es/form';
import apiService from '../../services/api';
import { Product } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;

// Interface for the form values
interface ProductFormValues {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
}

// Basic validation rules
const formRules = {
  name: [{ required: true, message: 'Please input the product name!' }] as Rule[],
  price: [
    { required: true, message: 'Please input the product price!' } as Rule, 
    { type: 'number', min: 0, message: 'Price must be a positive number!' } as Rule
  ] as Rule[],
  category: [{ required: true, message: 'Please select a category!' }] as Rule[],
};

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!id;
  const [categories, setCategories] = useState<string[]>([]); // Example categories
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Fetch categories (replace with actual API call if needed)
  useEffect(() => {
    // Example static categories
    setCategories(['Electronics', 'Books', 'Clothing', 'Home Goods', 'Sports']);
    // Or fetch from API: apiService.get('/categories').then(res => setCategories(res.data));
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      apiService.get<Product>(`/products/${id}`)
        .then(response => {
          form.setFieldsValue({
            ...response.data,
            // Handle potential image URL for initial file list
          });
          // If imageUrl exists, set the fileList for the Upload component
          if (response.data.imageUrl) {
            setFileList([
              {
                uid: '-1',
                name: 'image.png', // Placeholder name
                status: 'done',
                url: response.data.imageUrl,
              },
            ]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch product:", err);
          setError('Failed to load product data.');
          message.error('Failed to load product data.');
          setLoading(false);
        });
    }
  }, [id, isEditing, form]);

  const onFinish = async (values: ProductFormValues) => {
    setLoading(true);
    setError(null);

    // Handle image upload - This is a basic example.
    // In a real app, you might upload the file to a service (like S3, Cloudinary)
    // and get back a URL to save in your product data.
    // For simplicity here, we'll just use the URL if it already exists (from editing)
    // or potentially a placeholder/null if a new file was added (backend needs to handle the actual upload).
    let imageUrl = form.getFieldValue('imageUrl'); // Get existing URL if any
    if (fileList.length > 0 && fileList[0].originFileObj) {
        // NOTE: This part needs backend integration.
        // You would typically upload fileList[0].originFileObj here.
        // For now, let's assume the backend handles a field named 'imageFile' or similar,
        // or you upload separately and set the URL.
        console.log("New image file selected:", fileList[0].originFileObj);
        // Placeholder: In a real scenario, you'd get the URL after upload.
        // For demo, we might just clear the URL or set a placeholder.
        // imageUrl = await uploadImageAndGetUrl(fileList[0].originFileObj);
        imageUrl = 'placeholder/uploaded/image.jpg'; // Replace with actual uploaded URL
        message.info('Image upload simulation. Backend integration needed.');
    } else if (fileList.length === 0) {
        imageUrl = null; // Image removed
    }

    const productData = { ...values, imageUrl };

    try {
      if (isEditing && id) {
        await apiService.patch<Product>(`/products/${id}`, productData);
        message.success('Product updated successfully!');
      } else {
        await apiService.post<Product>('/products', productData);
        message.success('Product created successfully!');
      }
      navigate('/admin/products'); // Navigate back to list on success
    } catch (err: unknown) {
      console.error("Failed to save product:", err);
      const errorDetails = err as { response?: { data?: { message?: string } } };
      setError(`Failed to ${isEditing ? 'update' : 'create'} product. ${errorDetails?.response?.data?.message || 'Please try again.'}`);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} product.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Only allow one file
    setFileList(newFileList.slice(-1));
  };

  // Prevent default form submission on upload button click inside form
  const beforeUpload = () => {
    return false; // Prevent automatic upload, handle manually in onFinish
  };

  return (
    <Spin spinning={loading}>
      <Title level={2}>{isEditing ? 'Edit Product' : 'Create New Product'}</Title>
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ price: 0 }} // Default price
      >
        <Form.Item name="name" label="Product Name" rules={formRules.name}>
          <Input />
        </Form.Item>

        <Form.Item name="price" label="Price" rules={formRules.price}>
          <InputNumber min={0} style={{ width: '100%' }} addonAfter="$" />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={formRules.category}>
          <Select placeholder="Select a category">
            {categories.map(cat => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item name="imageUrl" label="Product Image">
             {/* Hidden field to store the URL, managed by fileList state */}
             <Upload
                listType="picture"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload} // Prevent auto-upload
                maxCount={1}
             >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
             </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ProductFormPage;
