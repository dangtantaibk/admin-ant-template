/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorHandler from '../../components/ErrorHandler';
import { useDetailFetching } from '../../hooks/useDetailFetching';
import apiService from '../../services/api';
import { Role } from './types';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Sample permissions list - in a real application, you would fetch this from an API
const availablePermissions = [
  'create:users',
  'read:users',
  'update:users',
  'delete:users',
  'create:roles',
  'read:roles',
  'update:roles',
  'delete:roles',
  // Add more permissions as needed
];

// Define mapping function for role
const mapRoleDetail = (item: any): Role => ({
  id: item.id || '',
  name: item.name || '',
  description: item.description || '',
  permissions: item.permissions || [],
});

interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<RoleFormValues>();
  const [saving, setSaving] = useState(false);
  const isEditing = !!id;
  
  // Only fetch details if editing
  const { 
    data: role,
    loading,
    error,
    hasError,
    handleRetry,
  } = useDetailFetching<Role>({
    endpoint: '/roles',
    id: isEditing ? id : undefined,
    mappingFunction: mapRoleDetail,
  });

  // Set form values when role data is loaded
  useEffect(() => {
    if (role && isEditing) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    }
  }, [role, form, isEditing]);

  const handleGoBack = () => {
    navigate('/admin/roles');
  };

  const onFinish = async (values: RoleFormValues) => {
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.patch(`/roles/${id}`, values);
        message.success('Role updated successfully');
      } else {
        await apiService.post('/roles', values);
        message.success('Role created successfully');
        form.resetFields();
      }
      navigate('/admin/roles');
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} role:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} role`);
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isEditing ? 'Edit Role' : 'Create New Role';

  return (
    <div className="role-form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ marginRight: 16 }}
          >
            Back to Roles
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
            initialValues={{ permissions: [] }}
          >
            <Form.Item
              name="name"
              label="Role Name"
              rules={[{ required: true, message: 'Please enter the role name' }]}
            >
              <Input placeholder="Enter role name" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <TextArea 
                placeholder="Enter role description" 
                rows={4} 
              />
            </Form.Item>
            
            <Form.Item
              name="permissions"
              label="Permissions"
              rules={[{ required: true, message: 'Please select at least one permission' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select permissions"
                style={{ width: '100%' }}
                allowClear
              >
                {availablePermissions.map(permission => (
                  <Option key={permission} value={permission}>{permission}</Option>
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
                {isEditing ? 'Update Role' : 'Create Role'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default RoleFormPage;
