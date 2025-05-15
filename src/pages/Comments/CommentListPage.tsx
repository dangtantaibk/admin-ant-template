/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EditOutlined, EyeOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Modal, Spin, Table, Typography, Tag, message, Tooltip } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';
import ErrorHandler from '../../components/ErrorHandler';
import PageHeader from '../../components/PageHeader';
import { useDataFetching } from '../../hooks/useDataFetching';
import apiService from '../../services/api';
import { Comment, CommentFormData } from './types';
import CommentForm from './CommentForm';

const { Text, Paragraph } = Typography;

// Define mapping function for comments
const mapCommentData = (item: any): Comment => ({
  id: item.id || 0,
  postId: item.postId || '',
  parentId: item.parentId || null,
  authorName: item.authorName || '',
  authorEmail: item.authorEmail || '',
  content: item.content || '',
  status: item.status || 'pending',
  ipAddress: item.ipAddress || '',
  userAgent: item.userAgent || '',
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

const CommentListPage: React.FC = () => {
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
  } = useDataFetching<Comment>({
    endpoint: '/comments',
    mappingFunction: mapCommentData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleTableChange: TableProps<Comment>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const sorterResult = sorter as SorterResult<Comment>;
    updateParams({
      pagination,
      filters: filters as Record<string, React.Key[] | null>,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order,
    });
  };

  const handleViewDetails = (record: Comment) => {
    try {
      if (!record) {
        message.error('Comment details not available');
        return;
      }
      
      setSelectedComment(record);
      setModalVisible(true);
    } catch (error: unknown) {
      console.error("Error showing modal:", error);
      message.error('Failed to display comment details');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this comment?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(id);
          await apiService.delete(`/comments/${id}`);
          message.success('Comment deleted successfully');
          refreshData();
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Failed to delete comment');
        } finally {
          setDeleteLoading(null);
        }
      }
    });
  };

  const handleEditComment = (record: Comment) => {
    setSelectedComment(record);
    setEditModalVisible(true);
  };

  const handleCreateComment = async (values: CommentFormData) => {
    try {
      setFormLoading(true);
      await apiService.post('/comments', values);
      message.success('Comment created successfully');
      setCreateModalVisible(false);
      refreshData();
    } catch (error) {
      console.error('Failed to create comment:', error);
      message.error('Failed to create comment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateComment = async (values: CommentFormData) => {
    if (!selectedComment) return;

    try {
      setFormLoading(true);
      await apiService.patch(`/comments/${selectedComment.id}`, values);
      message.success('Comment updated successfully');
      setEditModalVisible(false);
      refreshData();
    } catch (error) {
      console.error('Failed to update comment:', error);
      message.error('Failed to update comment');
    } finally {
      setFormLoading(false);
    }
  };
  
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

  const getStatusTag = (status: string) => {
    let color = 'default';
    switch (status.toLowerCase()) {
      case 'approved':
        color = 'green';
        break;
      case 'pending':
        color = 'gold';
        break;
      case 'rejected':
        color = 'red';
        break;
      case 'spam':
        color = 'volcano';
        break;
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const columns: TableProps<Comment>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Blog Post ID',
      dataIndex: 'postId',
      key: 'postId',
      width: 120,
    },
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName',
      sorter: true,
      render: (text: string, record: Comment) => (
        <Tooltip title={record.authorEmail}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {text}
        </Paragraph>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Spam', value: 'spam' },
      ],
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: 180,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            type="link"
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditComment(record)}
            type="link"
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            type="link"
            loading={deleteLoading === record.id}
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  // Render content for the detail modal
  const renderCommentDetails = (comment: Comment) => (
    <div>
      <p><strong>ID:</strong> {comment.id}</p>
      <p><strong>Blog Post ID:</strong> {comment.postId}</p>
      {comment.parentId && <p><strong>Parent Comment ID:</strong> {comment.parentId}</p>}
      <p><strong>Author Name:</strong> {comment.authorName}</p>
      <p><strong>Author Email:</strong> {comment.authorEmail}</p>
      <p><strong>Status:</strong> {getStatusTag(comment.status)}</p>
      <p><strong>IP Address:</strong> {comment.ipAddress || 'N/A'}</p>
      <p><strong>User Agent:</strong></p>
      <Paragraph ellipsis={{ rows: 2, expandable: true }}>
        {comment.userAgent || 'N/A'}
      </Paragraph>
      <p><strong>Content:</strong></p>
      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
        {comment.content}
      </Paragraph>
      <p><strong>Created At:</strong> {formatDate(comment.createdAt)}</p>
      <p><strong>Updated At:</strong> {formatDate(comment.updatedAt)}</p>
    </div>
  );

  const headerExtra = (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setCreateModalVisible(true)}
        style={{ marginRight: 16 }}
      >
        New Comment
      </Button>
      {hasError && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRetry}
        >
          Try Again
        </Button>
      )}
    </>
  );

  return (
    <div className="comment-list-container" style={{ width: '100%' }}>
      <PageHeader 
        title="Blog Comment Management" 
        extra={headerExtra} 
      />
      
      <ErrorHandler 
        error={error} 
        hasError={hasError}
        onRetry={handleRetry}
        showRetryButton={false}
      />
      
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
      
      {/* View details modal */}
      <DetailModal<Comment>
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedComment}
        title={selectedComment ? `Comment Details: #${selectedComment.id}` : 'Comment Details'}
        renderContent={renderCommentDetails}
        width={600}
      />

      {/* Create modal */}
      <Modal
        title="Create New Comment"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <CommentForm
          onFinish={handleCreateComment}
          loading={formLoading}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        title={`Edit Comment #${selectedComment?.id || ''}`}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <CommentForm
          initialValues={selectedComment || undefined}
          onFinish={handleUpdateComment}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default CommentListPage;
