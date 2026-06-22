import { useEffect, useState } from 'react';
import { Tabs, Select, Input, Row, Col, Pagination, Skeleton, Empty, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { recipes } from '@/api';
import RecipeCard from '@/components/RecipeCard/RecipeCard';
import type { RecipeSummary, RecipeCategory } from '@/types';

const categoryItems = [
  { key: '', label: '全部' },
  { key: 'bread', label: '🍞 面包' },
  { key: 'cake', label: '🎂 蛋糕' },
  { key: 'cookie', label: '🍪 饼干' },
  { key: 'dessert', label: '🍮 甜点' },
];

const difficultyOptions = [
  { value: '', label: '全部难度' },
  { value: 'easy', label: '简单 (1-2星)' },
  { value: 'medium', label: '中等 (3星)' },
  { value: 'hard', label: '困难 (4-5星)' },
];

const timeOptions = [
  { value: '', label: '全部耗时' },
  { value: '30', label: '30分钟内' },
  { value: '60', label: '1小时内' },
  { value: '120', label: '2小时内' },
  { value: 'more', label: '2小时以上' },
];

const PAGE_SIZE = 12;

export default function RecipeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [recipeList, setRecipeList] = useState<RecipeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const activeCategory = (searchParams.get('category') as RecipeCategory | '') || '';
  const activeDifficulty = searchParams.get('difficulty') || '';
  const activeTime = searchParams.get('time') || '';
  const searchKeyword = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params: {
          category?: RecipeCategory;
          difficulty?: 1 | 2 | 3 | 4 | 5;
          time?: number;
          search?: string;
          page: number;
          limit: number;
        } = {
          page: currentPage,
          limit: PAGE_SIZE,
        };
        if (activeCategory) params.category = activeCategory;
        if (searchKeyword) params.search = searchKeyword;
        if (activeTime) {
          if (activeTime === 'more') {
            params.time = 9999;
          } else {
            params.time = parseInt(activeTime, 10);
          }
        }

        const res = await recipes.getRecipes(params);
        setRecipeList(res.recipes);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setRecipeList([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [activeCategory, activeDifficulty, activeTime, searchKeyword, currentPage]);

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (patch.page === undefined) {
      next.set('page', '1');
    }
    setSearchParams(next);
    navigate({ search: next.toString() }, { replace: true });
  };

  const handleCategoryChange = (key: string) => {
    updateParams({ category: key || undefined, page: 1 });
  };

  const handleDifficultyChange = (value: string) => {
    updateParams({ difficulty: value, page: 1 });
  };

  const handleTimeChange = (value: string) => {
    updateParams({ time: value, page: 1 });
  };

  const handleSearch = (value: string) => {
    updateParams({ search: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  return (
    <div className="py-6">
      <Card className="mb-6 shadow-sm" styles={{ body: { padding: '20px 24px' } }}>
        <div className="flex flex-col gap-4">
          <Tabs
            activeKey={activeCategory}
            onChange={handleCategoryChange}
            items={categoryItems}
            size="large"
            style={{ marginBottom: 0 }}
          />
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={activeDifficulty || undefined}
              onChange={handleDifficultyChange}
              options={difficultyOptions}
              style={{ width: 160 }}
              placeholder="选择难度"
              allowClear
            />
            <Select
              value={activeTime || undefined}
              onChange={handleTimeChange}
              options={timeOptions}
              style={{ width: 160 }}
              placeholder="选择耗时"
              allowClear
            />
            <Input.Search
              placeholder="搜索食谱名称、食材..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              defaultValue={searchKeyword}
              style={{ width: 320, maxWidth: '100%' }}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-gray-600">
          共找到 <span className="font-semibold" style={{ color: '#D2691E' }}>{total}</span> 个食谱
        </span>
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} xl={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : recipeList.length === 0 ? (
        <Card className="py-12">
          <Empty description="没有找到符合条件的食谱，换个条件试试吧~" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {recipeList.map((recipe) => (
            <Col xs={24} sm={12} md={8} xl={6} key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </Col>
          ))}
        </Row>
      )}

      {total > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(t) => `共 ${t} 条`}
          />
        </div>
      )}
    </div>
  );
}
