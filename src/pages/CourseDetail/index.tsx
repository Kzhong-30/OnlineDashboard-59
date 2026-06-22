import { useState, useEffect } from 'react';
import { Card, Button, Progress, Tag, Row, Col, Spin, Empty, message } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { courses as coursesApi } from '@/api';
import type { Course, Chapter } from '@/types';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { useAuthStore } from '@/store/authStore';

function formatPrice(price: number) {
  if (price === 0) return <Tag color="green">免费</Tag>;
  return <span className="text-orange-500 text-2xl font-bold">¥{price}</span>;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}小时` : `${h}小时${m}分钟`;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [playingChapter, setPlayingChapter] = useState<Chapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [recommendCourses, setRecommendCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [courseData, allCourses] = await Promise.all([
          coursesApi.getCourse(id),
          coursesApi.getCourses(),
        ]);
        setCourse(courseData);
        const currentProgress = courseData.progress || 0;
        setProgress(currentProgress);
        const completedCount = Math.floor((currentProgress / 100) * courseData.chapters.length);
        const completed = new Set<string>();
        for (let i = 0; i < completedCount; i++) {
          if (courseData.chapters[i]) {
            completed.add(courseData.chapters[i].id);
          }
        }
        setCompletedChapters(completed);
        const recommended = allCourses
          .filter((c) => c.id !== id)
          .slice(0, 6);
        setRecommendCourses(recommended);
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePurchase = () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setPurchased(true);
    message.success('购买成功！开始学习吧');
  };

  const handlePlayChapter = async (chapter: Chapter) => {
    if (!purchased && course && course.price > 0) {
      message.warning('请先购买课程');
      return;
    }
    setPlayingChapter(chapter);
    const newCompleted = new Set(completedChapters);
    newCompleted.add(chapter.id);
    setCompletedChapters(newCompleted);
    const newProgress = course
      ? Math.round((newCompleted.size / course.chapters.length) * 100)
      : 0;
    setProgress(newProgress);
    if (id && isAuthenticated) {
      try {
        await coursesApi.updateProgress(id, newProgress);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <Empty description="课程不存在" />;
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl overflow-hidden">
        <div
          className="h-64 sm:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${course.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {course.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <UserAvatar src={course.author.avatar} name={course.author.username} size="default" />
              <span>{course.author.username}</span>
            </div>
            <span className="text-amber-200">{course.chapters.length} 章节</span>
            <div className="flex items-center gap-2">
              {purchased || course.price === 0 ? (
                <Tag color="green">已购买</Tag>
              ) : (
                formatPrice(course.price)
              )}
            </div>
            {!purchased && course.price > 0 && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handlePurchase}
                size="large"
                style={{ background: 'linear-gradient(135deg, #E8883D, #D2691E)', border: 'none' }}
              >
                购买课程
              </Button>
            )}
          </div>
        </div>
      </div>

      {progress > 0 && (
        <Card className="rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">学习进度</span>
            <span className="text-amber-600 font-medium">{progress}%</span>
          </div>
          <Progress
            percent={progress}
            showInfo={false}
            strokeWidth={20}
            strokeColor={{ from: '#E8883D', to: '#D2691E' }}
            trailColor="#FFF3E0"
          />
        </Card>
      )}

      {playingChapter && (
        <Card className="rounded-2xl">
          <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-3">
            <div className="text-center text-white">
              <PlayCircleOutlined className="text-6xl mb-2" style={{ color: '#E8883D' }} />
              <p className="text-lg">{playingChapter.title}</p>
              <p className="text-gray-400 text-sm">{formatDuration(playingChapter.duration)}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold">正在播放：{playingChapter.title}</h3>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="课程简介" className="rounded-2xl">
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="讲师"
            className="rounded-2xl"
            styles={{ body: { padding: '24px', textAlign: 'center' } }}
          >
            <UserAvatar src={course.author.avatar} name={course.author.username} size={72} />
            <h4 className="mt-3 mb-1 text-lg font-semibold">{course.author.username}</h4>
            <p className="text-gray-500 text-sm mb-0">{course.author.bio}</p>
          </Card>
        </Col>
      </Row>

      <Card
        title={`章节目录（${completedChapters.size}/${course.chapters.length}）`}
        className="rounded-2xl"
      >
        <div className="space-y-3">
          {course.chapters.map((chapter, index) => {
            const isCompleted = completedChapters.has(chapter.id);
            const isPlaying = playingChapter?.id === chapter.id;
            return (
              <div
                key={chapter.id}
                onClick={() => handlePlayChapter(chapter)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  isPlaying
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-100 hover:border-orange-200 hover:bg-amber-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isCompleted ? <CheckCircleOutlined /> : <span>{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate m-0 ${isPlaying ? 'text-orange-600' : ''}`}>
                    {chapter.title}
                  </h4>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <ClockCircleOutlined />
                    <span>{formatDuration(chapter.duration)}</span>
                  </div>
                </div>
                <PlayCircleOutlined className="text-xl text-gray-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#D2691E' }}>
          推荐课程
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {recommendCourses.map((rc) => (
            <Card
              key={rc.id}
              hoverable
              onClick={() => navigate(`/courses/${rc.id}`)}
              className="flex-shrink-0 w-56 rounded-2xl overflow-hidden"
              cover={
                <div
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${rc.cover})` }}
                />
              }
              styles={{ body: { padding: '12px' } }}
            >
              <h4 className="font-medium line-clamp-1 m-0 mb-2">{rc.title}</h4>
              <div className="flex items-center justify-between">
                {formatPrice(rc.price)}
                <span className="text-xs text-gray-500">{rc.chapters.length}章</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
