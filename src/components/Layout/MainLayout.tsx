import { useState } from 'react';
import { Layout, Menu, Dropdown, Button, Input, Space, Badge } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  ShoppingOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import UserAvatar from '@/components/UserAvatar/UserAvatar';

const { Header, Content, Footer } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/recipes')) return 'recipes';
    if (path.startsWith('/posts')) return 'posts';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/shop')) return 'shop';
    if (path.startsWith('/calculator') || path.startsWith('/timer')) return 'tools';
    return 'home';
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'publish-recipe',
      icon: <EditOutlined />,
      label: '发布食谱',
      onClick: () => navigate('/recipes/publish'),
    },
    {
      key: 'publish-post',
      icon: <CameraOutlined />,
      label: '发布作品',
      onClick: () => navigate('/posts/publish'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' as const, key: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const toolsMenuItems = [
    {
      key: '/calculator',
      icon: <CalculatorOutlined />,
      label: '烘焙计算器',
    },
    {
      key: '/timer',
      icon: <ClockCircleOutlined />,
      label: '计时器',
    },
  ];

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/recipes', icon: <BookOutlined />, label: '食谱' },
    { key: '/posts', icon: <PictureOutlined />, label: '作品' },
    { key: '/courses', icon: <PlayCircleOutlined />, label: '课程' },
    { key: '/shop', icon: <ShoppingOutlined />, label: '商城' },
    {
      key: 'tools',
      icon: <AppstoreOutlined />,
      label: (
        <span className="flex items-center gap-1">
          工具
          <DownOutlined className="text-xs" />
        </span>
      ),
      children: toolsMenuItems,
    },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: '#FFF8E7' }}>
      <Header
        className="sticky top-0 z-50 px-4 sm:px-8"
        style={{
          background: '#FFFBF2',
          borderBottom: '1px solid #FDEBC8',
          boxShadow: '0 2px 8px rgba(210, 105, 30, 0.08)',
          height: 72,
          lineHeight: '72px',
        }}
      >
        <div className="flex items-center justify-between h-full">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #D2691E, #E8883D)' }}
            >
              🍰
            </div>
            <span
              className="text-xl font-bold hidden sm:block"
              style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
            >
              烘焙社
            </span>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-8">
            <Menu
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              onClick={handleMenuClick}
              items={menuItems}
              style={{
                background: 'transparent',
                borderBottom: 'none',
                minWidth: 'auto',
                flex: 1,
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Input.Search
                placeholder="搜索食谱..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 200 }}
                size="middle"
              />
            </div>

            {isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Badge dot offset={[-2, 2]}>
                    <UserAvatar src={user.avatar} name={user.username} size="default" />
                  </Badge>
                  <span className="hidden lg:block text-sm text-gray-700">{user.username}</span>
                </div>
              </Dropdown>
            ) : (
              <Space>
                <Button
                  onClick={() => navigate('/login')}
                  size="middle"
                  style={{ borderRadius: 20, padding: '4px 20px' }}
                >
                  登录
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/register')}
                  size="middle"
                  style={{ borderRadius: 20, padding: '4px 20px' }}
                >
                  注册
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Header>

      <div className="md:hidden px-4 py-2" style={{ background: '#FFFBF2', borderBottom: '1px solid #FDEBC8' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ background: 'transparent', borderBottom: 'none' }}
          overflowedIndicator={<DownOutlined />}
        />
      </div>

      <Content className="px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </Content>

      <Footer
        className="text-center"
        style={{
          background: '#FFFBF2',
          borderTop: '1px solid #FDEBC8',
          color: '#8B6914',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #D2691E, #E8883D)' }}
              >
                🍰
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
              >
                烘焙社
              </span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} 烘焙社 BakeHub. All rights reserved. Made with ❤️ for bakers
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
