/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Image, message, Modal, Space, Spin, Table, Tag, Typography } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';
import ErrorHandler from '../../components/ErrorHandler';
import { useDataFetching } from '../../hooks/useDataFetching';
import apiService from '../../services/api';
import { Blog } from './types';

const { Title, Text } = Typography;

// Define mapping function for blogs
const mapBlogData = (item: any): Blog => ({
  id: item.id || '',
  business: item.business || '',
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
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use our custom hook for data fetching
  const { 
    data,
    loading,
    error,
    hasError,
    tableParams,
    updateParams,
    handleRetry,
    refreshData,
  } = useDataFetching<Blog>({
    endpoint: '/blogs',
    mappingFunction: mapBlogData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleTableChange: TableProps<Blog>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Blog>;
    updateParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleViewDetails = (record: Blog) => {
    try {
      if (!record) {
        message.error('Blog details not available');
        return;
      }
      
      setSelectedBlog(record);
      setModalVisible(true);
    } catch (error: unknown) {
      console.error("Error showing modal:", error);
      message.error('Failed to display blog details');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this blog?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(id);
          await apiService.delete(`/blogs/${id}`);
          message.success('Blog deleted successfully');
          refreshData();
        } catch (error) {
          console.error('Failed to delete blog:', error);
          message.error('Failed to delete blog');
        } finally {
          setDeleteLoading(null);
        }
      }
    });
  };
  
  // Format date with error handling
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date available';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Render content for the detail modal
  const renderBlogDetails = (blog: Blog) => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Image
          src={blog.image}
          alt={blog.title}
          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
          fallback="data:image/png;base64,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"
        />
      </div>
      {blog && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: '1 0 48%' }}>
              <p><strong>Title:</strong> {blog.title || 'N/A'}</p>
              <p><strong>Business:</strong> {blog.business || 'N/A'}</p>
              <p><strong>Author:</strong> {blog.author || 'N/A'}</p>
              <p><strong>Category:</strong> {blog.category || 'N/A'}</p>
              <p><strong>Read Time:</strong> {blog.readTime || 'N/A'}</p>
            </div>
            <div style={{ flex: '1 0 48%' }}>
              <p><strong>Date:</strong> {formatDate(blog.date)}</p>
              <p><strong>Created:</strong> {formatDate(blog.createdAt)}</p>
              <p><strong>Updated:</strong> {formatDate(blog.updatedAt)}</p>
              <p><strong>Slug:</strong> {blog.slug || 'N/A'}</p>
            </div>
          </div>
          
          <p><strong>Tags:</strong></p>
          <div style={{ marginBottom: '10px' }}>
            {(blog.tags && blog.tags.length > 0) ? 
              blog.tags.map(tag => <Tag key={tag}>{tag}</Tag>) :
              <Text type="secondary">No tags</Text>}
          </div>
          
          <p><strong>Description:</strong></p>
          <div style={{ 
            border: '1px solid #f0f0f0', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {blog.description || 'No description provided'}
          </div>
          
          <p><strong>Content:</strong></p>
          <div style={{ 
            maxHeight: '300px', 
            overflow: 'auto', 
            border: '1px solid #f0f0f0', 
            padding: '15px',
            borderRadius: '4px'
          }}>
            <div dangerouslySetInnerHTML={{ __html: blog.content || 'No content provided' }} />
          </div>
        </>
      )}
    </div>
  );

  const columns: TableProps<Blog>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 300,
      ellipsis: true,
      render: (id: string) => (
        <Link to={`/admin/blogs/${id}`} style={{ color: '#1677ff' }}>
          {id}
        </Link>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <Image 
          src={image}
          alt="Blog"
          width={80}
          height={50}
          style={{ objectFit: 'cover' }}
          fallback="data:image/png;base64,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"
        />
      ),
    },
    {
      title: 'Title', 
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (title: string) => (
        <Text ellipsis={{ tooltip: title }} style={{ maxWidth: 200 }}>
          {title}
        </Text>
      ),
    },
    {
      title: 'Business',
      dataIndex: 'business',
      key: 'business',
      sorter: true,
      render: (business: string) => (
        <Text ellipsis={{ tooltip: business }} style={{ maxWidth: 120 }}>
          {business || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: true,   
      render: (author: string) => (
        <Text ellipsis={{ tooltip: author }} style={{ maxWidth: 120 }}>
          {author}
        </Text>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: true,
      filters: [
        { text: 'Technology', value: 'Technology' },
        { text: 'Business', value: 'Business' },
        { text: 'Health', value: 'Health' },
        { text: 'Lifestyle', value: 'Lifestyle' },
      ],
      render: (category: string) => (
        <Tag color="blue">{category || 'Uncategorized'}</Tag>
      ),
    },
    {
      title: 'Read Time',
      dataIndex: 'readTime',
      key: 'readTime',
      width: 100,
      render: (readTime: string) => (
        <Text>{readTime || 'N/A'}</Text>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags && tags.length > 0 ? (
            <div style={{ maxWidth: 200, overflow: 'hidden' }}>
              {tags.map(tag => (
                <Tag key={tag} style={{ margin: '2px' }}>{tag}</Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">No tags</Text>
          )}
        </>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'date',
      key: 'date',
      sorter: true,
      render: (date: string) => (
        <Text>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            type="link"
          />
          <Link to={`/admin/blogs/edit/${record.id}`}>
            <Button
              icon={<EditOutlined />}
              type="link"
            />
          </Link>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id || '')}
            type="link"
            danger
            loading={deleteLoading === record.id}
          />
        </Space>
      ),
    },
  ];

  const handleRefresh = () => {
    refreshData();
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/blogs/edit/${id}`);
  };

  return (
    <div className="blog-list-container" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Blog Management</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
          <Link to="/admin/blogs/create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
            >
              New Blog
            </Button>
          </Link>
        </Space>
      </div>
      
      <ErrorHandler 
        error={error} 
        hasError={hasError}
        onRetry={handleRetry}
      />
      
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
      
      <DetailModal<Blog>
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedBlog}
        title={selectedBlog ? `Blog Details: ${selectedBlog.title}` : 'Blog Details'}
        renderContent={renderBlogDetails}
        width={700}
      />
    </div>
  );
};

export default BlogListPage;
