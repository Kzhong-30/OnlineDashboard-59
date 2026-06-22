import { useEffect, useState } from 'react';
import { Carousel, Card, Button, Skeleton, Row, Col, Tag, message } from 'antd';
import {
  HomeOutlined,
  FireOutlined,
  TeamOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recipes, users } from '@/api';
import { useAuthStore } from '@/store/authStore';
import RecipeCard from '@/components/RecipeCard/RecipeCard';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import type { RecipeSummary, User as UserType, RecipeCategory } from '@/types';

const bannerImages = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&h=600&fit=crop',
];

const categories: { key: RecipeCategory; label: string; icon: string; color: string }[] = [
  { key: 'bread', label: '面包', icon: '🍞', color: 'from-amber-400 to-orange-500' },
  { key: 'cake', label: '蛋糕', icon: '🎂', color: 'from-pink-400 to-rose-500' },
  { key: 'cookie', label: '饼干', icon: '🍪', color: 'from-yellow-400 to-amber-500' },
  { key: 'dessert', label: '甜点', icon: '🍮', color: 'from-purple-400 to-fuchsia-500' },
];

const dummyUsers: UserType[] = [
  {
    id: 'u1',
    username: '甜心烘焙师',
    email: 'u1@test.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    bio: '热爱烘焙的甜品控',
    followersCount: 12580,
    followingCount: 120,
    recipesCount: 45,
    postsCount: 89,
  },
  {
    id: 'u2',
    username: '面包大师阿杰',
    email: 'u2@test.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    bio: '专注欧式面包10年',
    followersCount: 9876,
    followingCount: 88,
    recipesCount: 67,
    postsCount: 120,
  },
  {
    id: 'u3',
    username: '糖霜小妹',
    email: 'u3@test.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    bio: '翻糖蛋糕艺术家',
    followersCount: 8654,
    followingCount: 156,
    recipesCount: 34,
    postsCount: 78,
  },
  {
    id: 'u4',
    username: '饼干达人Lily',
    email: 'u4@test.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    bio: '创意饼干造型',
    followersCount: 7234,
    followingCount: 200,
    recipesCount: 52,
    postsCount: 95,
  },
  {
    id: 'u5',
    username: '法式甜点王',
    email: 'u5@test.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    bio: '巴黎蓝带毕业',
    followersCount: 6543,
    followingCount: 45,
    recipesCount: 78,
    postsCount: 110,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [hotRecipes, setHotRecipes] = useState<RecipeSummary[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [topUsers, setTopUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const fetchData = async () => {
      try {
        const [recipesRes] = await Promise.all([recipes.getRecipes({ limit: 8 })]);
        setHotRecipes(recipesRes.recipes);
      } catch (err) {
        console.error('Failed to fetch recipes', err);
      } finally {
        setLoadingRecipes(false);
      }
      try {
        setTopUsers(dummyUsers);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, []);

  const handleFollow = async (user: UserType) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      if (followingIds.has(user.id)) {
        await users.unfollowUser(user.id);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
        message.success(`已取消关注 ${user.username}`);
      } else {
        await users.followUser(user.id);
        setFollowingIds((prev) => new Set(prev).add(user.id));
        message.success(`已关注 ${user.username}`);
      }
    } catch (err) {
      console.error(err);
      message.error('操作失败');
    }
  };

  const handleCategoryClick = (key: RecipeCategory) => {
    navigate(`/recipes?category=${key}`);
  };

  return (
    <div className="pb-12">
      <Carousel autoplay effect="fade" className="mb-10 rounded-2xl overflow-hidden shadow-xl">
        {bannerImages.map((img, idx) => (
          <div key={idx}>
            <div
              className="relative h-[450px] bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
              <div
                className="relative z-10 text-center text-white px-8 transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wide">
                  发现烘焙的美好
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-8">
                  与百万烘焙爱好者一起分享甜蜜
                </p>
                <Button
                  type="primary"
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/recipes')}
                  style={{
                    background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                    border: 'none',
                    height: 48,
                    paddingInline: 32,
                    borderRadius: 24,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  探索食谱
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <section
        className="mb-12 transition-all duration-700 delay-100"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <FireOutlined style={{ color: '#D2691E', fontSize: 22 }} />
          <h2 className="text-2xl font-bold m-0">分类导航</h2>
        </div>
        <Row gutter={[16, 16]}>
          {categories.map((cat, idx) => (
            <Col xs={12} sm={12} md={6} key={cat.key}>
              <Card
                hoverable
                className="h-full cursor-pointer overflow-hidden group"
                onClick={() => handleCategoryClick(cat.key)}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${150 + idx * 80}ms`,
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div
                  className={`bg-gradient-to-br ${cat.color} p-6 text-white text-center transition-transform duration-300 group-hover:scale-105`}
                >
                  <div className="text-5xl mb-3">{cat.icon}</div>
                  <div className="text-xl font-bold">{cat.label}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section
        className="mb-12 transition-all duration-700 delay-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FireOutlined style={{ color: '#D2691E', fontSize: 22 }} />
            <h2 className="text-2xl font-bold m-0">热门食谱</h2>
          </div>
          <Button type="link" onClick={() => navigate('/recipes')} style={{ color: '#D2691E' }}>
            查看全部 →
          </Button>
        </div>
        {loadingRecipes ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            {hotRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="flex-shrink-0 w-72"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${idx * 60}ms`,
                }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        className="mb-12 transition-all duration-700 delay-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <TeamOutlined style={{ color: '#D2691E', fontSize: 22 }} />
          <h2 className="text-2xl font-bold m-0">推荐达人</h2>
        </div>
        {loadingUsers ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-56">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            {topUsers.map((user, idx) => (
              <Card
                key={user.id}
                hoverable
                className="flex-shrink-0 w-56 transition-all duration-300 hover:-translate-y-1"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${idx * 60}ms`,
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <UserAvatar
                    src={user.avatar}
                    name={user.username}
                    size={72}
                    className="mb-3 cursor-pointer"
                  />
                  <h3
                    className="text-base font-semibold m-0 mb-1 cursor-pointer hover:text-amber-600 transition-colors"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    {user.username}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-1">{user.bio}</p>
                  <div className="flex items-center gap-1 mb-3 text-gray-500 text-sm">
                    <HeartOutlined style={{ color: '#D2691E' }} />
                    <span>{user.followersCount.toLocaleString()} 粉丝</span>
                  </div>
                  <Button
                    type={followingIds.has(user.id) ? 'default' : 'primary'}
                    icon={followingIds.has(user.id) ? <CheckOutlined /> : <PlusOutlined />}
                    size="small"
                    onClick={() => handleFollow(user)}
                    style={
                      followingIds.has(user.id)
                        ? {}
                        : {
                            background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                            border: 'none',
                          }
                    }
                  >
                    {followingIds.has(user.id) ? '已关注' : '关注'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section
        className="transition-all duration-700 delay-400"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <FireOutlined style={{ color: '#D2691E', fontSize: 22 }} />
          <h2 className="text-2xl font-bold m-0">实用工具</h2>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="h-full cursor-pointer overflow-hidden group"
              onClick={() => navigate('/calculator')}
              styles={{ body: { padding: 0 } }}
            >
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-white flex items-center gap-6 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <CalculatorOutlined style={{ fontSize: 40 }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 m-0">烘焙计算器</h3>
                  <p className="text-white/90 m-0">换算食材分量、模具尺寸、烘焙温度</p>
                  <Tag color="orange" className="mt-2 bg-white/20 border-none text-white">
                    立即使用
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="h-full cursor-pointer overflow-hidden group"
              onClick={() => navigate('/timer')}
              styles={{ body: { padding: 0 } }}
            >
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-8 text-white flex items-center gap-6 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <ClockCircleOutlined style={{ fontSize: 40 }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 m-0">烘焙计时器</h3>
                  <p className="text-white/90 m-0">精准控制醒发、烘焙、冷却时间</p>
                  <Tag color="red" className="mt-2 bg-white/20 border-none text-white">
                    立即使用
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
