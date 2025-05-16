/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Typography,
  notification
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import apiService from '../../services/api';
import { Blog, BlogFormValues } from './types';
import Quill from 'quill';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';

const { Title } = Typography;

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
];

// Define mapping function for blog
const mapBlogDetail = (item: any): Blog => ({
  id: item.id || '',
  title: item.title || '',
  description: item.description || '',
  content: item.content || '',
  image: item.image || '',
  date: item.date || '',
  author: item.author || '',
  slug: item.slug || '',
  category: item.category || '',
  readTime: item.readTime || '',
  tags: item.tags || [],
  business: item.business || 'yen-sao',
});

const BlogUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[]>([
    'health', 'nutrition', 'traditional-medicine', 'wellness',
    'birds-nest', 'beauty', 'recipes', 'lifestyle'
  ]);
  // Debug state variables
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorRendered, setEditorRendered] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true); // Add loading state

  const [notificationApi, contextHolder] = notification.useNotification();
  const openNotification = (pauseOnHover: boolean, title: string, description: string) => {
    notificationApi.open({
      message: title,
      description: description,
      showProgress: true,
      pauseOnHover,
    });
  };

  const quillRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Quill | null>(null);

  // Add form initialization flag
  const formInitialized = useRef(false);

  // Use our custom hook for data fetching
  const {
    data: blog,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Blog>({
    endpoint: '/blogs',
    id,
    mappingFunction: mapBlogDetail,
  });

  // Add dedicated effect for setting ALL form fields when blog data is loaded
  useEffect(() => {
    if (blog && form && !formInitialized.current) {
      console.log('Setting all form values with blog data', blog);

      // Set all form fields from blog data
      form.setFieldsValue({
        business: blog.business,
        title: blog.title,
        description: blog.description,
        content: blog.content,
        image: blog.image,
        date: blog.date,
        author: blog.author,
        slug: blog.slug,
        category: blog.category,
        readTime: blog.readTime,
        tags: blog.tags,
      });

      formInitialized.current = true;
      console.log('Form values set successfully');
    }
  }, [blog, form]);

  // Reset form initialization flag if blog changes
  useEffect(() => {
    if (blog) {
      console.log('Blog data loaded or changed, resetting initialization flags');
      formInitialized.current = false;
      contentSetRef.current = false;
    }
  }, [blog?.id]); // Only reset when the blog ID changes

  // Completely replace the Quill initialization with a more direct approach
  useEffect(() => {
    // Force re-mount the editor container
    const container = quillRef.current;
    if (!container) return;

    setEditorLoading(true); // Start loading state

    // Clear any existing content
    container.innerHTML = '';

    // Create a new div for Quill to target
    const editorElement = document.createElement('div');
    container.appendChild(editorElement);

    console.log('DOM prepared for Quill editor');

    try {
      // Create fresh Quill instance with a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          editorRef.current = new Quill(editorElement, {
            theme: 'snow',
            modules: {
              toolbar: toolbarOptions
            },
            formats: formatOptions,
          });

          console.log('Quill editor created successfully');

          // Set up change handler
          editorRef.current.on('text-change', () => {
            if (editorRef.current) {
              form.setFieldsValue({ content: editorRef.current.root.innerHTML });
            }
          });

          setEditorInitialized(true);
          setEditorRendered(true);
          setEditorLoading(false); // End loading state

          // If blog data is already available, set content immediately
          if (blog?.content) {
            console.log('Setting content immediately after editor initialization');
            editorRef.current.root.innerHTML = blog.content;
          }
        } catch (error) {
          console.error('Failed to initialize Quill in timeout:', error);
          setEditorError(error instanceof Error ? error.message : 'Unknown error');
          setEditorLoading(false);
        }
      }, 200); // Small delay to ensure DOM is ready
    } catch (error) {
      console.error('Failed to initialize Quill:', error);
      setEditorError(error instanceof Error ? error.message : 'Unknown error');
      setEditorLoading(false);
    }
  }, [form, blog]); // Remove blog dependency to prevent re-initialization when blog changes

  // We'll use a separate effect to set blog content with a flag to avoid duplicate setting
  const contentSetRef = useRef(false);

  // Separate effect to handle content setting
  useEffect(() => {
    if (editorInitialized && editorRef.current && blog?.content && !contentSetRef.current) {
      console.log('Setting blog content to editor from effect:', blog.content.substring(0, 50) + '...');
      try {
        // Set content
        editorRef.current.root.innerHTML = blog.content;
        contentSetRef.current = true;
        console.log('Blog content set successfully');

        // Verify content was set correctly (after a short delay)
        setTimeout(() => {
          if (editorRef.current && editorRef.current.root.innerHTML !== blog.content) {
            console.warn('Content verification failed - content was changed after setting');
            editorRef.current.root.innerHTML = blog.content;
          } else {
            console.log('Content verification passed');
          }
        }, 300);
      } catch (error) {
        console.error('Error setting blog content:', error);
      }
    }
  }, [editorInitialized, blog]);

  // Reset content set flag if blog changes
  useEffect(() => {
    contentSetRef.current = false;
  }, [blog]);

  // Add debugging output
  console.log('Render state:', {
    editorInitialized,
    editorRendered,
    hasEditor: !!editorRef.current,
    hasContent: !!blog?.content,
    quillRef: !!quillRef.current
  });

  const handleUpdate = async (values: BlogFormValues) => {
    if (!id) return;

    const jsonPayload = JSON.stringify(values);
    const payloadSizeBytes = new Blob([jsonPayload]).size;
    const payloadSizeMB = (payloadSizeBytes / (1024 * 1024)).toFixed(2);

    console.log(`Payload size: ${payloadSizeMB} MB (${payloadSizeBytes} bytes)`);
    console.log('Content length:', values.content?.length || 0);

    if (payloadSizeBytes > 1024 * 1024 * 10) {
      const confirmSend = window.confirm(
        `The payload size is ${payloadSizeMB} MB. Do you want to continue?`
      );
      if (!confirmSend) return;
    }

    setSubmitting(true);
    try {
      await apiService.patch(`/blogs/${id}`, values);
      openNotification(true, 'Blog updated successfully', 'The blog has been updated successfully');
      navigate('/admin/blogs');
    } catch (err: any) {
      console.error('Error updating blog:', err);
      openNotification(true, 'Error updating blog', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (hasError && !loading) {
    return <ErrorHandler error={error || "Failed to load blog details"} hasError={true} onRetry={handleRetry} />;
  }

  // Modify the return statement to show form values in debug mode
  return (
    <div className="blog-update-container">
      {contextHolder}
      {/* Debug information */}
      {process.env.NODE_ENV !== 'production' && blog && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          background: '#f0f2f5',
          border: '1px solid #d9d9d9',
          display: 'none' // Hide by default, change to 'block' to show
        }}>
          <p>Debug info (blog data):</p>
          <pre>{JSON.stringify({
            blogId: blog.id,
            formInit: formInitialized.current,
            contentSet: contentSetRef.current,
            title: blog.title,
            tags: blog.tags
          }, null, 2)}</pre>
        </div>
      )}

      <PageHeader
        title="Update Blog"
        onBack={() => navigate('/admin/blogs')}
        backIcon={<ArrowLeftOutlined />}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={form.submit}
            loading={submitting}
          >
            Save Changes
          </Button>
        }
      />

      <Card>
        <Title level={4}>Edit Blog Information</Title>
        {editorError && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            Editor error: {editorError}
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            business: 'yen-sao',
            tags: []
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
            <Input placeholder="Enter blog title" />
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
                // Check for new tags
                const newValues = values.filter(val => !tagOptions.includes(val));
                if (newValues.length > 0) {
                  setTagOptions(prev => [...prev, ...newValues]);
                }
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
            <div style={{ width: '100%', marginBottom: 50 }}>
              {/* Use a more explicit container setup */}
              <div style={{
                width: '100%',
                height: 400,
                border: '1px dashed #d9d9d9',
                position: 'relative'
              }}>
                {/* Add prominent loading indicator */}
                {editorLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Spin size="large" />
                      <p style={{ marginTop: 10 }}>Loading rich text editor...</p>
                    </div>
                  </div>
                )}

                <div
                  ref={quillRef}
                  style={{
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    visibility: editorLoading ? 'hidden' : 'visible' // Hide container until editor is ready
                  }}
                />

                {/* Add fallback if editor fails to load */}
                {!editorRendered && !editorLoading && (
                  <div style={{ padding: 10 }}>
                    <p>Editor failed to load.</p>
                    {editorError && <p style={{ color: 'red' }}>{editorError}</p>}
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BlogUpdatePage;
