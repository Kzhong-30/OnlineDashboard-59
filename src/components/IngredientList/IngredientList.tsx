import { useState } from 'react';
import { Card, InputNumber, Row, Col, Divider } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import type { Ingredient } from '@/types';
import { scaleIngredients, formatAmount } from '@/utils';

interface IngredientListProps {
  ingredients: Ingredient[];
  originalServings: number;
}

export default function IngredientList({ ingredients, originalServings }: IngredientListProps) {
  const [servings, setServings] = useState(originalServings);

  const scaledIngredients = scaleIngredients(ingredients, originalServings, servings);

  return (
    <Card className="shadow-sm" styles={{ body: { padding: '24px' } }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0">
          <FireOutlined style={{ color: '#D2691E' }} />
          食材清单
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">份数：</span>
          <InputNumber
            min={1}
            max={50}
            value={servings}
            onChange={(v) => v && setServings(v)}
            size="small"
            style={{ width: 80 }}
          />
          <span className="text-gray-500 text-sm">人份</span>
        </div>
      </div>

      <Divider className="my-3" style={{ borderColor: '#FDEBC8' }} />

      <Row gutter={[16, 12]}>
        {scaledIngredients.map((ingredient) => (
          <Col xs={12} sm={12} md={8} key={ingredient.id}>
            <div className="flex items-center justify-between py-2 px-3 bg-amber-50/50 rounded-lg">
              <span className="text-gray-700">{ingredient.name}</span>
              <span className="font-medium text-amber-700">
                {formatAmount(ingredient.amount)} {ingredient.unit}
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
