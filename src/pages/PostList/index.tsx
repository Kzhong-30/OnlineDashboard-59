import { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Input, Row, Col, Pagination, Button, Space, Tag, Avatar, Modal, message, Empty } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { Post } from '@/types';
import { posts, posts as postsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime } from '@/utils';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

type TabKey = 'all' | 'following' | 'mine';

export default function PostList() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchText, setSearchText] = useState('');
  const [postList, setPostList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [detailModal, setDetailModal] = useState<{ open: boolean; post: Post | null }>({ open: false, post: null });

  const fetchPosts = async (page = 1, pageSize = 12) => {
    try {
      setLoading(true);
      const res = await posts.getPosts({
        page,
        limit: pageSize,
        keyword: searchText || undefined,
        filter: activeTab !== 'all' ? activeTab : undefined,
      });
      setPostList(res.posts);
      setPagination({ current: page, pageSize, total: res.total || 0 });
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, pagination.pageSize);
  }, [activeTab]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchPosts(1, pagination.pageSize);
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      if (currentlyLiked) {
        await postsApi.unlikePost(postId);
      } else {
        await postsApi.likePost(postId);
      }
      setPostList((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likesCount: currentlyLiked ? (p.likesCount || 0) - 1 : (p.likesCount || 0) + 1, isLiked: !currentlyLiked }
            : p
        )
      );
    } catch {
      message.error('操作失败');
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchPosts(page, pageSize);
  };

  const openDetail = (post: Post) => {
    setDetailModal({ open: true, post });
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'following', label: '我关注的' },
    { key: 'mine', label: '我的作品' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Title level={2} style={{ color: '#D2691E', margin: 0 }}>
            作品打卡
          </Title>
          <Space>
            <Search
              placeholder="搜索作品..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 280 }}
            />
            {isAuthenticated && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/posts/publish')}
                style={{ backgroundColor: '#D2691E', borderColor: '#D2691E' }}
              >
                发布作品
              </Button>
            )}
          </Space>
        </div>

        <Card
          className="mb-6 shadow border-amber-100"
          style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as TabKey)} items={tabItems} style={{ padding: '0 16px' }} />
        </Card>

        {postList.length === 0 && !loading ? (
          <Card className="py-16 border-amber-100" style={{ background: '#FFFBF5' }}>
            <Empty description="暂无作品，快去发布第一个吧～" />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {postList.map((post) => (
                <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                  <Card
                    hoverable
                    loading={loading}
                    className="h-full shadow-md border-amber-100 overflow-hidden cursor-pointer"
                    style={{ background: '#FFFBF5' }}
                    styles={{ body: { padding: 0 } }}
                    onClick={() => openDetail(post)}
                  >
                    <div className="relative">
                      <div
                        className="w-full h-48 bg-cover bg-center"
                        style={{ backgroundImage: 'url(' + (post.images?.[0] || 'https://picsum.photos/400/300') + ')' }}
                      />
                      {post.images && post.images.length > 1 && (
                        <Tag color="#D2691E" className="absolute top-2 right-2">
                          +{post.images.length - 1}
                        </Tag>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar size="small" src={post.author?.avatar} style={{ backgroundColor: '#F3D9B1' }}>
                          {post.author?.username?.[0] || 'U'}
                        </Avatar>
                        <Text strong className="text-sm text-amber-800">
                          {post.author?.username || '匿名用户'}
                        </Text>
                      </div>
                      <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-gray-600 mb-3" style={{ minHeight: 40 }}>
                        {post.content || '分享烘焙的快乐～'}
                      </Paragraph>
                      {post.recipe && (
                        <div className="rounded px-2 py-1 mb-3 text-xs flex items-center gap-1" style={{ background: '#FFF4E0', color: '#8B4513' }}>
                          <span className="w-4 h-4 rounded bg-cover bg-center flex-shrink-0" style={{ backgroundImage: 'url(' + post.recipe.cover + ')' }} />
                          <span className="truncate">{post.recipe.title}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <Space>
                          <Button
                            type="text"
                            size="small"
                            icon={post.isLiked ? <HeartFilled style={{ color: '#EF4444' }} /> : <HeartOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id, post.isLiked || false);
                            }}
                            style={{ color: post.isLiked ? '#EF4444' : '#8B4513', padding: 0 }}
                          >
                            {post.likesCount || 0}
                          </Button>
                          <Button type="text" size="small" icon={<MessageOutlined />} onClick={(e) => e.stopPropagation()} style={{ color: '#8B4513', padding: 0 }}>
                            {post.commentsCount || 0}
                          </Button>
                        </Space>
                        <Text type="secondary" className="text-xs">
                          {formatRelativeTime(post.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="flex justify-center mt-8">
              <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={handlePageChange} showSizeChanger={false} />
            </div>
          </>
        )}

        <Modal
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false, post: null })}
          footer={null}
          width={720}
          title={detailModal.post ? <span style={{ color: '#D2691E' }}>作品详情</span> : ''}
        >
          {detailModal.post && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar size={48} src={detailModal.post.author?.avatar} style={{ backgroundColor: '#F3D9B1' }}>
                  {detailModal.post.author?.username?.[0] || 'U'}
                </Avatar>
                <div>
                  <div className="font-semibold text-amber-800">{detailModal.post.author?.username || '匿名用户'}</div>
                  <div className="text-xs text-gray-400">{formatRelativeTime(detailModal.post.createdAt)}</div>
                </div>
              </div>
              {detailModal.post.images && detailModal.post.images.length > 0 && (
                <div className="mb-4">
                  <img src={detailModal.post.images[0]} alt="作品" className="w-full rounded-lg max-h-96 object-cover" />
                </div>
              )}
              <Paragraph className="text-gray-700 whitespace-pre-wrap">
                {detailModal.post.content || '分享烘焙的快乐～'}
              </Paragraph>
              {detailModal.post.recipe && (
                <Card
                  size="small"
                  className="mb-4 border-amber-100"
                  style={{ background: '#FFF8ED', cursor: 'pointer' }}
                  onClick={() => navigate('/recipes/' + detailModal.post!.recipe!.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-cover bg-center flex-shrink-0" style={{ backgroundImage: 'url(' + detailModal.post.recipe.cover + ')' }} />
                    <div>
                      <div className="font-semibold text-amber-800 text-sm">{detailModal.post.recipe.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <EyeOutlined /> 点击查看食谱
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-amber-100">
                <Button
                  type="text"
                  icon={detailModal.post.isLiked ? <HeartFilled style={{ color: '#EF4444' }} /> : <HeartOutlined />}
                  onClick={() => {
                    handleLike(detailModal.post!.id, detailModal.post!.isLiked || false);
                    setDetailModal((prev) => ({
                      ...prev,
                      post: prev.post ? { ...prev.post, isLiked: !prev.post.isLiked, likesCount: (prev.post.likesCount || 0) + (prev.post.isLiked ? -1 : 1) } : null,
                    }));
                  }}
                  style={{ color: detailModal.post.isLiked ? '#EF4444' : '#8B4513' }}
                >
                  {detailModal.post.likesCount || 0} 点赞
                </Button>
                <Button type="text" icon={<MessageOutlined />} style={{ color: '#8B4513' }}>
                  {detailModal.post.commentsCount || 0} 评论
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
