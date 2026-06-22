import { useState, useEffect } from 'react';
import { Input, Tabs, Card, Progress, Tag, Row, Col, Spin, Empty } from 'antd';
import { SearchOutlined, PlayCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { courses as coursesApi } from '@/api';
import type { Course } from '@/types';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { useAuthStore } from '@/store/authStore';

const { Search } = Input;

const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'beginner', label: '入门' },
  { key: 'intermediate', label: '进阶' },
  { key: 'master', label: '大师课' },
];

function formatPrice(price: number) {
  if (price === 0) return <Tag color="green">免费</Tag>;
  return <span className="text-orange-500 font-bold">¥{price}</span>;
}

export default function CourseList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await coursesApi.getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterCourses(activeCategory, value);
  };

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    filterCourses(key, searchText);
  };

  const filterCourses = (category: string, search: string) => {
    let result = courses;
    if (category !== 'all') {
      result = result.filter((c) => {
        if (category === 'beginner') return c.price <= 50 || c.chapters.length <= 5;
        if (category === 'intermediate') return c.price > 50 && c.price <= 200;
        if (category === 'master') return c.price > 200 || c.chapters.length > 15;
        return true;
      });
    }
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerSearch) ||
          c.description.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredCourses(result);
  };

  const handleCourseClick = (id: string) => {
    navigate(`/courses/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20 text-8xl flex items-center justify-center">
          👨‍🍳
        </div>
        <div className="relative z-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
          >
            跟着大师学烘焙
          </h1>
          <p className="text-amber-700 mb-6 text-base sm:text-lg">
            从零开始，系统学习专业烘焙技巧
          </p>
          <div className="max-w-xl">
            <Search
              placeholder="搜索课程..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Tabs
          activeKey={activeCategory}
          onChange={handleCategoryChange}
          items={categoryTabs}
          size="large"
          style={{ borderBottom: 'none' }}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <Empty description="暂无相关课程" />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredCourses.map((course) => (
            <Col xs={24} sm={12} lg={8} key={course.id}>
              <Card
                hoverable
                onClick={() => handleCourseClick(course.id)}
                cover={
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${course.cover})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 right-3">
                      {formatPrice(course.price)}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
                      <BookOutlined />
                      <span>{course.chapters.length} 章节</span>
                    </div>
                  </div>
                }
                className="h-full group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl rounded-2xl overflow-hidden"
                styles={{ body: { padding: '16px' } }}
              >
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-lg font-semibold cursor-pointer hover:text-amber-600 transition-colors line-clamp-1 m-0"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <UserAvatar src={course.author.avatar} name={course.author.username} size="small" />
                    <span className="text-sm text-gray-600">{course.author.username}</span>
                  </div>

                  {isAuthenticated && course.progress !== undefined && course.progress > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <PlayCircleOutlined />
                          学习进度
                        </span>
                        <span className="text-xs text-amber-600 font-medium">{course.progress}%</span>
                      </div>
                      <Progress
                        percent={course.progress}
                        showInfo={false}
                        size="small"
                        strokeColor={{ from: '#E8883D', to: '#D2691E' }}
                        trailColor="#FFF3E0"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
