import { Card, Tag, Rate, Space } from 'antd';
import { ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { RecipeSummary } from '@/types';
import { formatDuration } from '@/utils';
import UserAvatar from '@/components/UserAvatar/UserAvatar';

interface RecipeCardProps {
  recipe: RecipeSummary;
}

const categoryLabels: Record<string, string> = {
  bread: '面包',
  cake: '蛋糕',
  cookie: '饼干',
  dessert: '甜点',
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <Card
      hoverable
      cover={
        <div
          className="h-48 bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: `url(${recipe.cover})` }}
          onClick={handleClick}
        />
      }
      className="h-full group hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-xl"
      styles={{ body: { padding: '16px' } }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-lg font-semibold cursor-pointer hover:text-amber-600 transition-colors line-clamp-1 m-0"
            onClick={handleClick}
          >
            {recipe.title}
          </h3>
          <Tag color="orange" className="flex-shrink-0">
            {categoryLabels[recipe.category]}
          </Tag>
        </div>

        <Space size={16} wrap className="text-sm text-gray-500">
          <Rate disabled value={recipe.difficulty} count={5} className="text-xs" />
          <span className="flex items-center gap-1">
            <ClockCircleOutlined style={{ color: '#D2691E' }} />
            {formatDuration(recipe.duration)}
          </span>
          <span className="flex items-center gap-1">
            <HeartOutlined style={{ color: '#D2691E' }} />
            {recipe.likesCount}
          </span>
        </Space>

        <div className="flex items-center gap-2 pt-2 border-t border-amber-50">
          <UserAvatar src={recipe.author.avatar} name={recipe.author.username} size="small" />
          <span className="text-sm text-gray-600">{recipe.author.username}</span>
        </div>
      </div>
    </Card>
  );
}
