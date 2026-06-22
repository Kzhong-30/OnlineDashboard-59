import { useState, useEffect } from 'react';
import { Card, Button, Tabs, Row, Col, Statistic, Spin, Empty } from 'antd';
import { UserOutlined, TeamOutlined, HeartOutlined, BookOutlined, PictureOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { users as usersApi, recipes as recipesApi, posts as postsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import type { User, RecipeSummary, Post } from '@/types';
import RecipeCard from '@/components/RecipeCard/RecipeCard';
import UserAvatar from '@/components/UserAvatar/UserAvatar';

type TabKey = 'recipes' | 'posts';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('recipes');

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getUser(id);
        setUser(data);
        if (isAuthenticated && currentUser) {
          const followers = await usersApi.getFollowers(id);
          setIsFollowing(followers.some((f) => f.id === currentUser.id));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, isAuthenticated, currentUser]);

  useEffect(() => {
    if (!id) return;
    const fetchTabData = async () => {
      try {
        setTabLoading(true);
        if (activeTab === 'recipes') {
          const { recipes: data } = await recipesApi.getRecipes({});
          setRecipes(data.filter((r) => r.author.id === id));
        } else {
          const { posts: data } = await postsApi.getPosts({ userId: id });
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      } finally {
        setTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab, id]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id) return;
    try {
      if (isFollowing) {
        await usersApi.unfollowUser(id);
        setIsFollowing(false);
      } else {
        await usersApi.followUser(id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
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
    if (activeTab === 'recipes') {
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
    }
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
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
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
            src={user.avatar}
            name={user.username}
            size={96}
            className="border-4 border-white shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2
                className="text-2xl font-bold m-0"
                style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
              >
                {user.username}
              </h2>
              {currentUser?.id !== id && (
                <Button
                  type={isFollowing ? 'default' : 'primary'}
                  icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
                  onClick={handleFollow}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
              )}
            </div>
            <p className="text-gray-500 m-0">{user.bio || '这个人很懒，什么都没写~'}</p>
          </div>
        </div>

        <Row gutter={[16, 16]} className="mt-6 pt-6 border-t border-amber-100">
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="text-gray-500"><BookOutlined /> 食谱</span>}
              value={user.recipesCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="text-gray-500"><PictureOutlined /> 作品</span>}
              value={user.postsCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="text-gray-500"><TeamOutlined /> 粉丝</span>}
              value={user.followersCount}
              valueStyle={{ color: '#D2691E' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="text-gray-500"><UserOutlined /> 关注</span>}
              value={user.followingCount}
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
            { key: 'recipes', label: 'TA的食谱' },
            { key: 'posts', label: 'TA的作品' },
          ]}
        />
        <div className="pt-4">
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}
