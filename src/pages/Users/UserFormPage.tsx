/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import apiService from '../../services/api';
import { User } from './types';

const { Title } = Typography;
const { Option } = Select;

// Define mapping function for user
const mapUserDetail = (item: any): User => ({
  id: item.id || '',
  email: item.email || '',
  fullName: item.fullName || '',
  phone: item.phone || '',
  roles: item.roles || [],
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserFormValues {
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  password?: string;
}

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<UserFormValues>();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const isEditing = !!id;
  
  // Only fetch details if editing
  const { 
    data: user,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<User>({
    endpoint: '/users',
    id: isEditing ? id : undefined,
    mappingFunction: mapUserDetail,
  });

  // Fetch roles for the select dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.get<Role[]>('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        message.error('Failed to fetch roles');
      }
    };

    fetchRoles();
  }, []);

  // Set form values when user data is loaded
  useEffect(() => {
    if (user && isEditing) {
      form.setFieldsValue({
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        roles: user.roles?.map(role => role.id) || [],
      });
    }
  }, [user, form, isEditing]);

  const handleGoBack = () => {
    navigate('/admin/users');
  };

  const onFinish = async (values: UserFormValues) => {
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.patch(`/users/${id}`, values);
        message.success('User updated successfully');
      } else {
        await apiService.post('/users', values);
        message.success('User created successfully');
        form.resetFields();
      }
      navigate('/admin/users');
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} user:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} user`);
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isEditing ? 'Edit User' : 'Create New User';

  return (
    <div className="user-form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Users
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
            initialValues={{ roles: [] }}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter the full name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter an email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please enter a phone number' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            {!isEditing && (
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter a password' }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            )}
            
            <Form.Item
              name="roles"
              label="Roles"
              rules={[{ required: true, message: 'Please select at least one role' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select roles"
                style={{ width: '100%' }}
                allowClear
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
              >
                {isEditing ? 'Update User' : 'Create User'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default UserFormPage;
