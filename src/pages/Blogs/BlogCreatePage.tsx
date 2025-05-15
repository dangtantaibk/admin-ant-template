/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Select,
  Typography
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import apiService from '../../services/api';
import { BlogFormValues } from './types';
import Quill from 'quill';

const { Title } = Typography;

const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[]>([
    'health', 'nutrition', 'traditional-medicine', 'wellness',
    'birds-nest', 'beauty', 'recipes', 'lifestyle'
  ]);


  const quillRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Quill | null>(null);
  const toolbarOptions = [
    // Text formatting
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],

    // Headers
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    // Font styling
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],

    // Text alignment
    [{ 'align': [] }],

    // Lists and indentation
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],

    // Text direction
    [{ 'direction': 'rtl' }],

    // Colors
    [{ 'color': [] }, { 'background': [] }],

    // Superscript/subscript
    [{ 'script': 'sub' }, { 'script': 'super' }],

    // Media and links
    ['link', 'image', 'video', 'formula'],

    // Clean formatting
    ['clean']
  ];

  const formatOptions = [
    // Text formatting
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',

    // Headers
    'header',

    // Font styling
    'font', 'size',

    // Text alignment
    'align',

    // Lists and indentation
    'list', 'indent',

    // Text direction
    'direction',

    // Colors
    'color', 'background',

    // Superscript/subscript
    'script',

    // Media and links
    'link', 'image', 'video', 'formula',

    // Other formats
    // 'clean'
  ];

  useEffect(() => {
    if (quillRef.current && !editorRef.current) {
      editorRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions,
        },
        formats: formatOptions,
      });
    }
  }, []);

  // Add effect to handle content changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.on('text-change', () => {
        if (editorRef.current) {
          const content = editorRef.current.root.innerHTML;
          form.setFieldsValue({ content });
        }
      });
    }
  }, [editorRef, form]);

  const handleCreate = async (values: BlogFormValues) => {
    setSubmitting(true);
    try {
      await apiService.post('/blogs', values);
      message.success('Blog created successfully');
      navigate('/admin/blogs');
    } catch (err: any) {
      console.error('Failed to create blog:', err);
      message.error('Failed to create blog');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    form.setFieldsValue({ slug });
  };

  return (
    <div className="blog-create-container">
      <PageHeader
        title="Create New Blog"
        onBack={() => navigate('/admin/blogs')}
        backIcon={<ArrowLeftOutlined />}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={form.submit}
            loading={submitting}
          >
            Create Blog
          </Button>
        }
      />

      <Card>
        <Title level={4}>Blog Information</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            business: 'yen-sao',
            tags: [],
            date: new Date().toISOString().split('T')[0],
            readTime: '5 min'
          }}
        >
          <Form.Item
            name="business"
            label="Business"
            rules={[{ required: true, message: 'Please enter business' }]}
          >
            <Input placeholder="Business" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter blog title' }]}
          >
            <Input
              placeholder="Enter blog title"
              onChange={(e) => generateSlug(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please enter slug' }]}
          >
            <Input placeholder="Enter slug (URL-friendly name)" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: 'Please enter author name' }]}
          >
            <Input placeholder="Enter author name" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image URL"
            rules={[{ required: true, message: 'Please enter image URL' }]}
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please enter date' }]}
          >
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="readTime"
            label="Read Time"
            rules={[{ required: true, message: 'Please enter read time' }]}
          >
            <Input placeholder="e.g., 5 min" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input placeholder="Enter category" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: 'Please select at least one tag' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Select tags"
              options={tagOptions.map(tag => ({ label: tag, value: tag }))}
              onChange={(values: string[]) => {
                // Check if any new tags were added and update options
                values.forEach(tag => {
                  if (!tagOptions.includes(tag)) {
                    setTagOptions(prev => [...prev, tag]);
                  }
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Enter blog description" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            {/* <Editor
              apiKey="your-tinymce-api-key" // Get a free API key from TinyMCE
              init={editorInitOptions}
              onEditorChange={(content) => {
                form.setFieldsValue({ content });
              }}
              initialValue=""
            /> */}
            <div style={{ width: 500, height: 300 }}>
              <div ref={quillRef} />
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BlogCreatePage;
