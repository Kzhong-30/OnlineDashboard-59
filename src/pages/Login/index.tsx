import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth as authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const from = (location.state as { from?: string })?.from || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const result = await authApi.login(values);
      login(result.user, result.token);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
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
            欢迎回来
          </h1>
          <p className="text-gray-500">登录继续你的烘焙之旅</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#D2691E' }} />} placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#D2691E' }} />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
                  记住我
                </Checkbox>
              </div>
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
                登录
              </Button>
            </Form.Item>
          </Form>
        )}

        <div className="text-center text-gray-500">
          没有账号？
          <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium ml-1">
            去注册
          </Link>
        </div>
      </Card>
    </div>
  );
}
