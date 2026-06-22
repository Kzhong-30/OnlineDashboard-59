import { useState } from 'react';
import { Card, Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { auth as authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      setLoading(true);
      const result = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      register(result.user, result.token);
      message.success('注册成功');
      navigate('/', { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <Card
        className="w-full max-w-md shadow-xl rounded-3xl"
        styles={{ body: { padding: '40px' } }}
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #D2691E, #E8883D)' }}
          >
            🍰
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
          >
            加入烘焙社
          </h1>
          <p className="text-gray-500">开启你的甜蜜烘焙之旅</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, max: 20, message: '用户名长度需在2-20个字符之间' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#D2691E' }} />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#D2691E' }} />} placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#D2691E' }} />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[{ required: true, message: '请再次输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#D2691E' }} />}
                placeholder="请再次输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #E8883D, #D2691E)',
                  border: 'none',
                  height: 44,
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        )}

        <div className="text-center text-gray-500">
          已有账号？
          <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium ml-1">
            去登录
          </Link>
        </div>
      </Card>
    </div>
  );
}
