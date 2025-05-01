import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Typography,
  Spin,
  Alert,
  Button,
  Modal,
  message,
  Space,
  Image,
  Input,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { BlogPost, PaginatedResponse, TableParams } from '../../types';

const { Title } = Typography;
const { confirm } = Modal;

// Define interface for request params
interface BlogPostListParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: string;
  category?: string;
  title?: string;
}

const BlogPostListPage: React.FC = () => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]); // State for categories filter
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: BlogPostListParams = {
        page: tableParams.pagination?.current,
        limit: tableParams.pagination?.pageSize,
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder ? String(tableParams.sortOrder) : undefined,
      };
      // Add filter parameters
      if (tableParams.filters?.category?.length) {
        params.category = tableParams.filters.category[0] as string;
      }
      if (tableParams.filters?.title?.length) {
        params.title = tableParams.filters.title[0] as string;
      }

      const response = await apiService.get<PaginatedResponse<BlogPost>>('/blog-posts', params);
      setData(response.data.data);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.data.total,
        },
      }));

      // Derive categories from fetched data (simple example)
      if (response.data.data.length > 0 && categories.length === 0) {
          const uniqueCategories = [...new Set(response.data.data.map(item => item.category))].filter(Boolean);
          setCategories(uniqueCategories);
      }

    } catch (err: unknown) {
      console.error("Failed to fetch blog posts:", err);
      const errorMsg = 'Failed to load blog posts. Please try again later.';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [tableParams, categories.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange: TableProps<BlogPost>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<BlogPost>;
    setTableParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleDelete = (id: number | string) => {
    confirm({
      title: 'Are you sure you want to delete this blog post?',
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          setLoading(true);
          await apiService.delete(`/blog-posts/${id}`);
          message.success('Blog post deleted successfully!');
          fetchData(); // Refresh list
        } catch (err) {
          console.error("Failed to delete blog post:", err);
          message.error('Failed to delete blog post. Please try again.');
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = (id: number | string) => {
    navigate(`/admin/blog-posts/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/blog-posts/new');
  };

  const columns: TableProps<BlogPost>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder={`Search Title`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button 
              onClick={() => {
                if (clearFilters) {
                  clearFilters();
                }
                confirm();
              }} 
              size="small" 
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <span style={{ color: filtered ? '#1890ff' : undefined }}>🔍</span>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: true,
      filters: categories.map(cat => ({ text: cat, value: cat })),
      filterMultiple: false,
    },
    {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
        sorter: true,
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) =>
        url ? <Image width={50} src={url} alt="Blog Post" /> : '-',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            type="link"
            size="small"
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            type="link"
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Blog Post Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create New Post
        </Button>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
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
    </div>
  );
};

export default BlogPostListPage;
