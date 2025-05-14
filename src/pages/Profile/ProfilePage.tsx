/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Divider,
  Descriptions,
  Badge
} from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, UploadOutlined, KeyOutlined, MailOutlined, IdcardOutlined, SettingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const { Title, Text } = Typography;

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateForm {
  fullName?: string;
  email: string;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [updateForm] = Form.useForm<ProfileUpdateForm>();
  const [passwordForm] = Form.useForm<PasswordChangeForm>();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get user from localStorage
  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  // Initialize user data, prioritizing localStorage
  useEffect(() => {
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      setUser(localUser);
    } else if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      updateForm.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl
      });
    }
  }, [user, updateForm]);

  const handleUpdateProfile = async (values: ProfileUpdateForm) => {
    setSaving(true);
    try {
      // Call API to update profile
      await apiService.patch(`/users/${user?.id}`, values);
      message.success('Profile updated successfully');
      
      // Update user in localStorage after successful update
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        localStorage.setItem('user', JSON.stringify({
          ...localUser,
          ...values
        }));
      }
      
      // Update state
      setUser((prev: any) => ({
        ...prev,
        ...values
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (values: PasswordChangeForm) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // Call API to change password
      await apiService.post(`/users/${user?.id}/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Failed to change password:', error);
      message.error('Failed to change password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { onSuccess, onError } = options;
    
    setUploadLoading(true);
    try {
      // In a real app, you would upload to a server
      // This is a mock implementation
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await apiService.post('/users/avatar', formData);
      // const avatarUrl = response.data.url;

      // Mock successful upload after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAvatarUrl = 'https://randomuser.me/api/portraits/men/32.jpg';
      
      // Update the form
      updateForm.setFieldValue('avatarUrl', mockAvatarUrl);
      
      // Update localStorage with new avatar
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        localStorage.setItem('user', JSON.stringify({
          ...localUser,
          avatarUrl: mockAvatarUrl
        }));
      }
      
      // Update state
      setUser((prev: any) => ({
        ...prev,
        avatarUrl: mockAvatarUrl
      }));
      
      onSuccess?.('Upload successful');
      message.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      onError?.(new Error('Upload failed'));
      message.error('Failed to upload avatar');
    } finally {
      setUploadLoading(false);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile Information
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  src={user?.avatarUrl} 
                  style={{ marginBottom: 16 }}
                />
                <Title level={4}>{user?.fullName || user?.username}</Title>
                <Text type="secondary">{user?.email}</Text>
                <div style={{ margin: '16px 0' }}>
                  {user?.roles?.map((role: any) => (
                    <Badge 
                      key={typeof role === 'object' ? role.id : role} 
                      status="processing" 
                      text={typeof role === 'object' ? role.name : role} 
                      style={{ margin: '0 8px' }} 
                    />
                  ))}
                </div>
                <Text>User ID: {user?.id}</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Edit Profile">
              <Form
                form={updateForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
                initialValues={{
                  fullName: user?.fullName,
                  email: user?.email
                }}
              >
                <Form.Item
                  name="avatarUrl"
                  label="Profile Picture"
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      size={64} 
                      icon={<UserOutlined />} 
                      src={updateForm.getFieldValue('avatarUrl')} 
                      style={{ marginRight: 16 }}
                    />
                    <Upload
                      customRequest={handleAvatarUpload}
                      showUploadList={false}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadLoading}
                      >
                        Upload New Image
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
                
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please input your full name!' }]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="Full Name" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email address!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={saving}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <KeyOutlined />
          Change Password
        </span>
      ),
      children: (
        <Card>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'account',
      label: (
        <span>
          <SettingOutlined />
          Account Settings
        </span>
      ),
      children: (
        <Card>
          <Descriptions title="Account Information" bordered>
            <Descriptions.Item label="User ID" span={3}>{user?.id}</Descriptions.Item>
            <Descriptions.Item label="Username" span={3}>{user?.username}</Descriptions.Item>
            <Descriptions.Item label="Email" span={3}>{user?.email}</Descriptions.Item>
            <Descriptions.Item label="Roles" span={3}>
              {user?.roles ? user.roles.map((role: { name: any; }) => 
                typeof role === 'object' ? role.name : role
              ).join(', ') : 'No roles assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Account Created" span={3}>
              {/* This would need actual data from your user object */}
              N/A
            </Descriptions.Item>
            <Descriptions.Item label="Last Login" span={3}>
              {/* This would need actual data from your user object */}
              N/A
            </Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button danger>Delete Account</Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>My Profile</Title>
      <Tabs defaultActiveKey="profile" items={items} />
    </>
  );
};

export default ProfilePage;
