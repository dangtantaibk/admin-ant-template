/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  Select,
  Spin,
  Typography,
  notification,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import apiService from '../../services/api';
import { Blog, BlogFormValues } from './types';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const { Title } = Typography;
// const { Option } = Select;

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

const BlogDetailPage: React.FC = () => {
  const quillRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Quill | null>(null);

  const [notificationApi, contextHolder] = notification.useNotification();
  const openNotification = (pauseOnHover: boolean, title: string, description: string) => {
    notificationApi.open({
      message: title,
      description: description,
      showProgress: true,
      pauseOnHover,
    });
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEditing = false; // Remove editing mode from this component

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

  const [submitting, setSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[]>([
    'health', 'nutrition', 'traditional-medicine', 'wellness',
    'birds-nest', 'beauty', 'recipes', 'lifestyle'
  ]);

  useEffect(() => {
    if (blog && form) {
      // Set form values when blog data is available
      form.setFieldsValue({
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
        business: blog.business,
      });
    }
  }, [blog, form]);

  // Add effect to set up the Quill editor with initial content when ready
  // useEffect(() => {
  //   if (editorRef.current && blog && blog.content) {
  //     // Thêm try-catch để bắt lỗi nếu có
  //     try {
  //       console.log("Loading blog content:", blog.content.substring(0, 50) + "...");
  //       // editorRef.current.clipboard.dangerouslyPasteHTML("123123");
  //     } catch (error) {
  //       console.error("Failed to load content into editor:", error);
  //     }
  //   }
  // }, [editorRef, blog]);

  useEffect(() => {
    if (blog) {
      console.log("Blog data loaded:", {
        hasContent: !!blog.content,
        contentLength: blog.content?.length || 0,
        contentPreview: blog.content?.substring(0, 50) + "..."
      });
    }
  }, [blog]);

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

  const handleSave = async (values: BlogFormValues) => {
    if (!id) return;

    setSubmitting(true);
    try {
      await apiService.patch(`/blogs/${id}`, values);
      openNotification(true, 'Blog updated successfully', '111');
      handleGoBack();
    } catch (err: any) {
      console.error('Error updating blog:', err);
      openNotification(true, 'Error updating blog', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/admin/blogs');
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

  const headerTitle = "Blog Details";
  const headerExtra = (
    <>
      <Button
        icon={<ReloadOutlined />}
        onClick={handleRetry}
        style={{ marginRight: 8 }}
      >
        Refresh
      </Button>
      <Link to={`/admin/blogs/edit/${id}`}>
        <Button type="primary">
          Edit Blog
        </Button>
      </Link>
    </>
  );

  return (
    <div className="blog-detail-container">
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Blogs
          </Button>
          <Title level={4} style={{ margin: 0 }}>{headerTitle}</Title>
        </div>
        <div>
          {headerExtra}
        </div>
      </div>

      <Card>
        {blog ? (
          <div className="blog-view">
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <Image
                src={blog.image}
                alt={blog.title}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
            <Title level={2}>{blog.title}</Title>
            <p><strong>Author:</strong> {blog.author}</p>
            <p><strong>Date:</strong> {blog.date}</p>
            <p><strong>Read Time:</strong> {blog.readTime}</p>
            <p><strong>Category:</strong> {blog.category}</p>
            <p><strong>Tags:</strong> {blog.tags?.join(', ')}</p>
            <p><strong>Slug:</strong> {blog.slug}</p>
            <p><strong>Business:</strong> {blog.business}</p>
            <div style={{ marginTop: 20 }}>
              <Title level={4}>Description</Title>
              <p>{blog.description}</p>
            </div>
            <div style={{ marginTop: 20 }}>
              <Title level={4}>Content</Title>
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BlogDetailPage;
