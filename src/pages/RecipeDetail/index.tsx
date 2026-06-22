import { useEffect, useState } from 'react';
import {
  Button,
  Rate,
  Tag,
  Card,
  Skeleton,
  Row,
  Col,
  Divider,
  message,
  Avatar,
  Tooltip,
  Input,
  Empty,
} from 'antd';
import {
  HeartFilled,
  HeartOutlined,
  StarFilled,
  StarOutlined,
  ShareAltOutlined,
  PlusOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FireOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { recipes, posts, users } from '@/api';
import { useAuthStore } from '@/store/authStore';
import IngredientList from '@/components/IngredientList/IngredientList';
import StepCard from '@/components/StepCard/StepCard';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { formatDuration, formatRelativeTime } from '@/utils';
import type { RecipeDetail as RecipeDetailType, Post, Comment } from '@/types';

const categoryLabels: Record<string, string> = {
  bread: '面包',
  cake: '蛋糕',
  cookie: '饼干',
  dessert: '甜点',
};

const sampleWorks: Post[] = [
  {
    id: 'w1',
    images: ['https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400&h=400&fit=crop'],
    content: '跟着做超成功！',
    author: {
      id: 'a1',
      username: '甜甜圈小姐',
      email: 'a1@t.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 100,
      followingCount: 50,
      recipesCount: 5,
      postsCount: 12,
    },
    likesCount: 128,
    commentsCount: 8,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'w2',
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop'],
    content: '第一次做就成功啦~',
    author: {
      id: 'a2',
      username: '面包新人',
      email: 'a2@t.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 50,
      followingCount: 30,
      recipesCount: 2,
      postsCount: 6,
    },
    likesCount: 89,
    commentsCount: 5,
    createdAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 'w3',
    images: ['https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=400&fit=crop'],
    content: '家人都爱吃！',
    author: {
      id: 'a3',
      username: '烘焙妈妈',
      email: 'a3@t.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 200,
      followingCount: 80,
      recipesCount: 15,
      postsCount: 30,
    },
    likesCount: 210,
    commentsCount: 15,
    createdAt: '2024-01-13T10:00:00Z',
  },
  {
    id: 'w4',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop'],
    content: '口感非常好',
    author: {
      id: 'a4',
      username: '甜品控',
      email: 'a4@t.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 300,
      followingCount: 100,
      recipesCount: 20,
      postsCount: 40,
    },
    likesCount: 156,
    commentsCount: 10,
    createdAt: '2024-01-12T10:00:00Z',
  },
];

const sampleComments: Comment[] = [
  {
    id: 'c1',
    content: '配方太棒了，第一次做就成功了！请问可以用玉米油代替黄油吗？',
    author: {
      id: 'u1',
      username: '小烘焙爱好者',
      email: 'u1@t.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 0,
      followingCount: 0,
      recipesCount: 0,
      postsCount: 0,
    },
    createdAt: '2024-01-16T08:30:00Z',
  },
  {
    id: 'c2',
    content: '跟着步骤做的成品超松软，收藏了下次再做～',
    author: {
      id: 'u2',
      username: '厨房小白',
      email: 'u2@t.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 0,
      followingCount: 0,
      recipesCount: 0,
      postsCount: 0,
    },
    createdAt: '2024-01-15T15:20:00Z',
  },
  {
    id: 'c3',
    content: '请问烤箱温度需要根据实际调整吗？我家烤箱偏小',
    author: {
      id: 'u3',
      username: '新手妈妈',
      email: 'u3@t.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
      bio: '',
      followersCount: 0,
      followingCount: 0,
      recipesCount: 0,
      postsCount: 0,
    },
    createdAt: '2024-01-14T09:45:00Z',
  },
];

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [works, setWorks] = useState<Post[]>(sampleWorks);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await recipes.getRecipe(id);
        setRecipe(data);
        setIsLiked(data.isLiked);
        setIsFavorited(data.isFavorited);
        setLikesCount(data.likesCount);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
      } finally {
        setLoading(false);
      }
      try {
        const res = await posts.getPosts({ recipeId: id, limit: 8 });
        if (res.posts && res.posts.length > 0) {
          setWorks(res.posts);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      if (isLiked) {
        await recipes.unlikeRecipe(id);
        setLikesCount((c) => c - 1);
      } else {
        await recipes.likeRecipe(id);
        setLikesCount((c) => c + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
      message.error('操作失败');
    }
  };

  const handleFavorite = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      if (isFavorited) {
        await recipes.unfavoriteRecipe(id);
        message.success('已取消收藏');
      } else {
        await recipes.favoriteRecipe(id);
        message.success('收藏成功');
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error(err);
      message.error('操作失败');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    } else {
      message.success('分享功能');
    }
  };

  const handleFollowAuthor = async () => {
    if (!recipe) return;
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      if (isFollowing) {
        await users.unfollowUser(recipe.author.id);
        message.success(`已取消关注 ${recipe.author.username}`);
      } else {
        await users.followUser(recipe.author.id);
        message.success(`已关注 ${recipe.author.username}`);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
      message.error('操作失败');
    }
  };

  const handleSubmitComment = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (!commentInput.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    setSubmittingComment(true);
    try {
      message.success('评论发布成功');
      setCommentInput('');
    } catch (err) {
      console.error(err);
      message.error('评论失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="py-12 text-center">
        <Empty description="食谱不存在或已删除" />
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/recipes')}>
          返回食谱列表
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg">
        <div
          className="h-80 md:h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Tag color="orange" style={{ margin: 0 }}>
              {categoryLabels[recipe.category]}
            </Tag>
            <Rate disabled value={recipe.difficulty} count={5} className="text-sm" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{recipe.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => navigate(`/profile/${recipe.author.id}`)}
            >
              <UserAvatar src={recipe.author.avatar} name={recipe.author.username} size="small" />
              <span>{recipe.author.username}</span>
            </div>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined />
              {formatDuration(recipe.duration)}
            </span>
            <span className="flex items-center gap-1">
              <TeamOutlined />
              {recipe.servings || 4}人份
            </span>
          </div>
        </div>
      </div>

      <Card className="mb-6 shadow-sm" styles={{ body: { padding: '20px 24px' } }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => navigate(`/profile/${recipe.author.id}`)}
            >
              <UserAvatar src={recipe.author.avatar} name={recipe.author.username} size={48} />
              <div>
                <div className="font-semibold text-gray-800">{recipe.author.username}</div>
                <div className="text-xs text-gray-500">
                  {recipe.author.followersCount} 粉丝 · {recipe.author.recipesCount} 食谱
                </div>
              </div>
            </div>
            <Button
              type={isFollowing ? 'default' : 'primary'}
              icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
              onClick={handleFollowAuthor}
              style={
                isFollowing
                  ? {}
                  : {
                      background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                      border: 'none',
                    }
              }
            >
              {isFollowing ? '已关注' : '关注'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Tooltip title={isLiked ? '取消点赞' : '点赞'}>
              <Button
                icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleLike}
                danger={isLiked}
              >
                {likesCount}
              </Button>
            </Tooltip>
            <Tooltip title={isFavorited ? '取消收藏' : '收藏'}>
              <Button
                icon={isFavorited ? <StarFilled style={{ color: '#FAAD14' }} /> : <StarOutlined />}
                onClick={handleFavorite}
              >
                收藏
              </Button>
            </Tooltip>
            <Tooltip title="分享">
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                分享
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {recipe.description && (
        <Card className="mb-6 shadow-sm" styles={{ body: { padding: '20px 24px' } }}>
          <p className="text-gray-700 leading-relaxed m-0 text-base">{recipe.description}</p>
        </Card>
      )}

      <Card className="mb-6 shadow-sm" styles={{ body: { padding: '24px' } }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0 mb-5">
          <FireOutlined style={{ color: '#D2691E' }} />
          烘焙参数
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <FireOutlined style={{ fontSize: 22, color: '#D2691E' }} />
              </div>
              <div>
                <div className="text-xs text-gray-500">烘焙温度</div>
                <div className="text-xl font-bold text-gray-800">{recipe.temperature}°C</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <ClockCircleOutlined style={{ fontSize: 22, color: '#D2691E' }} />
              </div>
              <div>
                <div className="text-xs text-gray-500">烘焙时间</div>
                <div className="text-xl font-bold text-gray-800">
                  {formatDuration(recipe.bakingTime)}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Rate disabled value={recipe.difficulty} count={1} className="text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500">难度等级</div>
                <div className="text-xl font-bold text-gray-800">
                  <Rate disabled value={recipe.difficulty} count={5} className="text-xs" />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TeamOutlined style={{ fontSize: 22, color: '#D2691E' }} />
              </div>
              <div>
                <div className="text-xs text-gray-500">份量</div>
                <div className="text-xl font-bold text-gray-800">{recipe.servings || 4}人份</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <div className="mb-6">
        <IngredientList ingredients={recipe.ingredients} originalServings={recipe.servings || 4} />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0 mb-5">
          <FireOutlined style={{ color: '#D2691E' }} />
          制作步骤
        </h3>
        <div className="relative">
          <div
            className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-200 via-orange-300 to-amber-200"
            style={{ zIndex: 0 }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {recipe.steps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      </div>

      <Card className="mb-6 shadow-sm" styles={{ body: { padding: '20px 24px' } }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold flex items-center gap-2 m-0">
            <FireOutlined style={{ color: '#D2691E' }} />
            关联作品墙
          </h3>
          <Button
            type="link"
            onClick={() => navigate(`/posts/publish?recipeId=${recipe.id}`)}
            style={{ color: '#D2691E' }}
          >
            发布我的作品 →
          </Button>
        </div>
        {works.length === 0 ? (
          <Empty description="暂无作品，快来做第一个打卡的人吧~" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {works.map((work) => (
              <div
                key={work.id}
                className="flex-shrink-0 w-48 cursor-pointer group"
                onClick={() => navigate(`/posts`)}
              >
                <div className="w-48 h-48 rounded-xl overflow-hidden mb-3">
                  <img
                    src={work.images[0]}
                    alt={work.content}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Avatar size={24} src={work.author.avatar} />
                  <span className="text-sm text-gray-700 truncate">{work.author.username}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 m-0">{work.content}</p>
                <div className="text-xs text-gray-400 mt-1">
                  <HeartOutlined className="mr-1" />
                  {work.likesCount} · {formatRelativeTime(work.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="shadow-sm" styles={{ body: { padding: '20px 24px' } }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0 mb-5">
          <FireOutlined style={{ color: '#D2691E' }} />
          评论 ({comments.length})
        </h3>

        <div className="flex gap-3 mb-6">
          <Input.TextArea
            placeholder="写下你的看法..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={3}
            maxLength={500}
            showCount
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submittingComment}
            onClick={handleSubmitComment}
            style={{
              background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
              border: 'none',
              alignSelf: 'flex-end',
            }}
          >
            发布
          </Button>
        </div>

        <Divider style={{ margin: '8px 0 20px' }} />

        <div className="space-y-5">
          {comments.length === 0 ? (
            <Empty description="暂无评论" />
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar src={comment.author.avatar} name={comment.author.username} size={40} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{comment.author.username}</span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 m-0 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
