import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Spin,
  Alert,
  Typography,
  Select,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import apiService from '../../services/api';
import { BlogPost } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;

// Basic validation rules
const formRules = {
  title: [{ required: true, message: 'Please input the post title!' }],
  content: [{ required: true, message: 'Please input the post content!' }],
  author: [{ required: true, message: 'Please input the author name!' }],
  category: [{ required: true, message: 'Please select a category!' }],
  slug: [{ required: true, message: 'Please input the URL slug!' },
         { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Slug must be lowercase alphanumeric with hyphens.' }],
};

// Define type for form values
interface BlogPostFormValues {
  title: string;
  slug: string;
  author: string;
  category: string;
  content: string;
  imageUrl?: string;
}

const BlogPostFormPage: React.FC = () => {
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
    setCategories(['Technology', 'Business', 'Lifestyle', 'Tutorials']);
    // Or fetch from API: apiService.get('/blog-categories').then(res => setCategories(res.data));
  }, []);

  // Fetch blog post data if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      apiService.get<BlogPost>(`/blog-posts/${id}`)
        .then(response => {
          form.setFieldsValue(response.data);
          if (response.data.imageUrl) {
            setFileList([
              {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: response.data.imageUrl,
              },
            ]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch blog post:", err);
          setError('Failed to load blog post data.');
          message.error('Failed to load blog post data.');
          setLoading(false);
        });
    }
  }, [id, isEditing, form]);

  const onFinish = async (values: BlogPostFormValues) => {
    setLoading(true);
    setError(null);

    let imageUrl = form.getFieldValue('imageUrl');
    if (fileList.length > 0 && fileList[0].originFileObj) {
        console.log("New image file selected:", fileList[0].originFileObj);
        // Placeholder for actual upload logic
        imageUrl = 'placeholder/uploaded/blog-image.jpg'; // Replace with actual uploaded URL
        message.info('Image upload simulation. Backend integration needed.');
    } else if (fileList.length === 0) {
        imageUrl = null; // Image removed
    }

    const postData = { ...values, imageUrl };

    try {
      if (isEditing && id) {
        await apiService.patch<BlogPost>(`/blog-posts/${id}`, postData);
        message.success('Blog post updated successfully!');
      } else {
        await apiService.post<BlogPost>('/blog-posts', postData);
        message.success('Blog post created successfully!');
      }
      navigate('/admin/blog-posts'); // Navigate back to list on success
    } catch (err: unknown) {
      console.error("Failed to save blog post:", err);
      const errorDetails = err as { response?: { data?: { message?: string } } }; // Type assertion
      setError(`Failed to ${isEditing ? 'update' : 'create'} blog post. ${errorDetails?.response?.data?.message || 'Please try again.'}`);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} blog post.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = () => {
    return false; // Prevent automatic upload
  };

  // Auto-generate slug from title (simple example)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-+/g, '-'); // Replace multiple hyphens with single
    form.setFieldsValue({ slug });
  };

  return (
    <Spin spinning={loading}>
      <Title level={2}>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</Title>
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="title" label="Post Title" rules={formRules.title}>
          <Input onChange={handleTitleChange} />
        </Form.Item>

        <Form.Item name="slug" label="URL Slug" rules={formRules.slug}>
          <Input />
        </Form.Item>

        <Form.Item name="author" label="Author" rules={formRules.author}>
          <Input />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={formRules.category}>
          <Select placeholder="Select a category">
            {categories.map(cat => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="content" label="Content" rules={formRules.content}>
          <TextArea rows={10} />
        </Form.Item>

        <Form.Item name="imageUrl" label="Featured Image">
             <Upload
                listType="picture"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
             >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
             </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Update Post' : 'Create Post'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/blog-posts')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default BlogPostFormPage;
