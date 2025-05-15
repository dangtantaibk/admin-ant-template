import React, { useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber } from 'antd';
import { Comment, CommentFormData } from './types';

interface CommentFormProps {
  initialValues?: Comment;
  onFinish: (values: CommentFormData) => void;
  loading: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

const CommentForm: React.FC<CommentFormProps> = ({
  initialValues,
  onFinish,
  loading
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues || {
        status: 'pending'
      }}
    >
      <Form.Item
        name="postId"
        label="Blog Post ID"
        rules={[{ required: true, message: 'Please enter the blog post ID' }]}
      >
        <Input placeholder="Enter blog post ID" />
      </Form.Item>

      <Form.Item
        name="parentId"
        label="Parent Comment ID (optional)"
      >
        <InputNumber placeholder="Parent comment ID" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="authorName"
        label="Author Name"
        rules={[{ required: true, message: 'Please enter the author name' }]}
      >
        <Input placeholder="Enter author name" />
      </Form.Item>

      <Form.Item
        name="authorEmail"
        label="Author Email"
        rules={[
          { required: true, message: 'Please enter the author email' },
          { type: 'email', message: 'Please enter a valid email address' }
        ]}
      >
        <Input placeholder="Enter author email" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Comment Content"
        rules={[{ required: true, message: 'Please enter the comment content' }]}
      >
        <TextArea
          placeholder="Enter comment content"
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select a status' }]}
      >
        <Select placeholder="Select status">
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
          <Option value="spam">Spam</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {initialValues ? 'Update Comment' : 'Create Comment'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CommentForm;
