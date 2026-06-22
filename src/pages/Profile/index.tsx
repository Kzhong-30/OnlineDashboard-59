import { useState, useEffect } from 'react';
import { Card, Button, Tabs, Row, Col, Statistic, Spin, Empty, Progress } from 'antd';
import { EditOutlined, UserOutlined, TeamOutlined, HeartOutlined, BookOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { users as usersApi, recipes as recipesApi, posts as postsApi, courses as coursesApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import type { User, RecipeSummary, Post, Course } from '@/types';
import RecipeCard from '@/components/RecipeCard/RecipeCard';
import UserAvatar from '@/components/UserAvatar/UserAvatar';

type TabKey = 'recipes' | 'posts' | 'favorites' | 'following' | 'courses';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [favorites, setFavorites] = useState<RecipeSummary[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('recipes');
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getCurrentUser();
        setCurrentUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchTabData = async () => {
      try {
        setTabLoading(true);
        switch (activeTab) {
          case 'recipes': {
            const { recipes: data } = await recipesApi.getRecipes({});
            setRecipes(data.filter((r) => r.author.id === user.id));
            break;
          }
          case 'posts': {
            const { posts: data } = await postsApi.getPosts({});
            setPosts(data.filter((p) => p.author.id === user.id));
            break;
          }
          case 'favorites': {
            const { recipes: data } = await recipesApi.getRecipes({});
            setFavorites(data.slice(0, 6));
            break;
          }
          case 'following': {
            const data = await usersApi.getFollowing(user.id);
            setFollowing(data);
            break;
          }
          case 'courses': {
            const data = await coursesApi.getCourses();
            setCourses(data.filter((c) => (c.progress || 0) > 0));
            break;
          }
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      } finally {
        setTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab, user]);

  const handleUnfollow = async (id: string) => {
    try {
      await usersApi.unfollowUser(id);
      setFollowing((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Failed to unfollow:', error);
    }
  };

  const renderContent = () => {
    if (tabLoading) {
      return (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      );
    }
    switch (activeTab) {
      case 'recipes':
        return recipes.length === 0 ? (
          <Empty description="暂无发布的食谱" />
        ) : (
          <Row gutter={[24, 24]}>
            {recipes.map((r) => (
              <Col xs={24} sm={12} lg={8} key={r.id}>
                <RecipeCard recipe={r} />
              </Col>
            ))}
          </Row>
        );
      case 'posts':
        return posts.length === 0 ? (
          <Empty description="暂无发布的作品" />
        ) : (
          <Row gutter={[16, 16]}>
            {posts.map((p) => (
              <Col xs={12} sm={8} lg={6} key={p.id}>
                <Card
                  hoverable
                  cover={
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${p.images[0]})` }}
                    />
                  }
                  className="rounded-xl"
                  styles={{ body: { padding: '12px' } }}
                >
                  <p className="text-sm text-gray-600 line-clamp-2 m-0">{p.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HeartOutlined /> {p.likesCount}
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        );
      case 'favorites':
        return favorites.length === 0 ? (
          <Empty description="暂无收藏的食谱" />
        ) : (
          <Row gutter={[24, 24]}>
            {favorites.map((r) => (
              <Col xs={24} sm={12} lg={8} key={r.id}>
                <RecipeCard recipe={r} />
              </Col>
            ))}
          </Row>
        );
      case 'following':
        return following.length === 0 ? (
          <Empty description="暂无关注的用户" />
        ) : (
          <Row gutter={[16, 16]}>
            {following.map((u) => (
              <Col xs={24} sm={12} md={8} key={u.id}>
                <Card className="rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={u.avatar} name={u.username} size={48} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate m-0">{u.username}</h4>
                      <p className="text-xs text-gray-500 m-0">
                        {u.followersCount} 粉丝 · {u.recipesCount} 食谱
                      </p>
                    </div>
                    <Button size="small" onClick={() => handleUnfollow(u.id)}>
                      取消关注
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        );
      case 'courses':
        return courses.length === 0 ? (
          <Empty description="暂无学习的课程" />
        ) : (
          <Row gutter={[24, 24]}>
            {courses.map((c) => (
              <Col xs={24} sm={12} lg={8} key={c.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/courses/${c.id}`)}
                  cover={
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${c.cover})` }}
                    />
                  }
                  className="rounded-xl"
                  styles={{ body: { padding: '16px' } }}
                >
                  <h4 className="font-medium line-clamp-1 m-0 mb-2">{c.title}</h4>
                  <Progress
                    percent={c.progress || 0}
                    size="small"
                    strokeColor={{ from: '#E8883D', to: '#D2691E' }}
                    trailColor="#FFF3E0"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return <Empty description="用户不存在" />;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl overflow-hidden">
        <div
          className="h-32 -mx-6 -mt-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-20 sm:-mt-16">
          <UserAvatar
            src={currentUser.avatar}
            name={currentUser.username}
            size={96}
            className="border-4 border-white shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2
                className="text-2xl font-bold m-0"
                style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
              >
                {currentUser.username}
              </h2>
              <Button icon={<EditOutlined />} size="middle">
                编辑资料
              </Button>
            </div>
            <p className="text-gray-500 m-0">{currentUser.bio || '这个人很懒，什么都没写~'}</p>
          </div>
        </div>

        <Row gutter={[16, 16]} className="mt-6 pt-6 border-t border-amber-100">
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={<span className="text-gray-500"><BookOutlined /> 发布食谱</span>}
              value={currentUser.recipesCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={<span className="text-gray-500"><PictureOutlined /> 作品数</span>}
              value={currentUser.postsCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={<span className="text-gray-500"><HeartOutlined /> 获赞</span>}
              value={currentUser.followersCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={<span className="text-gray-500"><TeamOutlined /> 粉丝</span>}
              value={currentUser.followersCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={<span className="text-gray-500"><UserOutlined /> 关注</span>}
              value={currentUser.followingCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
        </Row>
      </Card>

      <Card className="rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          size="large"
          style={{ borderBottom: 'none' }}
          items={[
            { key: 'recipes', label: '我的食谱' },
            { key: 'posts', label: '我的作品' },
            { key: 'favorites', label: '我的收藏' },
            { key: 'following', label: '我的关注' },
            { key: 'courses', label: '我的课程' },
          ]}
        />
        <div className="pt-4">
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}
