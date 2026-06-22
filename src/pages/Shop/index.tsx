import { useState } from 'react';
import { Card, Button, Row, Col, Tabs, Tag, message } from 'antd';
import { ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  category: string;
}

const mockProducts: Product[] = [
  { id: '1', name: '高筋面粉 1kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', price: 19.9, sales: 2341, category: 'ingredient' },
  { id: '2', name: '无盐黄油 500g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', price: 35.0, sales: 1856, category: 'ingredient' },
  { id: '3', name: '电动打蛋器', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', price: 89.0, sales: 987, category: 'tool' },
  { id: '4', name: '戚风蛋糕模具 6寸', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', price: 45.0, sales: 1523, category: 'tool' },
  { id: '5', name: '家用台式烤箱 30L', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400', price: 599.0, sales: 432, category: 'appliance' },
  { id: '6', name: '一次性裱花袋 100只', image: 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400', price: 15.9, sales: 3245, category: 'packaging' },
  { id: '7', name: '低筋面粉 1kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', price: 18.9, sales: 2015, category: 'ingredient' },
  { id: '8', name: '硅胶刮刀套装', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', price: 29.9, sales: 1678, category: 'tool' },
  { id: '9', name: '糖粉 500g', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', price: 12.9, sales: 2876, category: 'ingredient' },
  { id: '10', name: '面包机 全自动', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400', price: 399.0, sales: 289, category: 'appliance' },
  { id: '11', name: '马芬蛋糕纸杯 50只', image: 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400', price: 9.9, sales: 4521, category: 'packaging' },
  { id: '12', name: '擀面杖 实木', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', price: 25.0, sales: 1234, category: 'tool' },
];

const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'tool', label: '烘焙工具' },
  { key: 'ingredient', label: '烘焙原料' },
  { key: 'packaging', label: '包装装饰' },
  { key: 'appliance', label: '厨房电器' },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? mockProducts
    : mockProducts.filter((p) => p.category === activeCategory);

  const handleBuy = () => {
    message.info('功能开发中，敬请期待');
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20 text-8xl flex items-center justify-center">
          🛒
        </div>
        <div className="relative z-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: '#D2691E', fontFamily: "'Noto Serif SC', serif" }}
          >
            精选烘焙好物
          </h1>
          <p className="text-amber-700 text-base sm:text-lg">
            专业烘焙师严选，品质有保障
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          items={categoryTabs}
          size="large"
          style={{ borderBottom: 'none' }}
        />
      </div>

      <Row gutter={[16, 16]}>
        {filteredProducts.map((product) => (
          <Col xs={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              className="h-full group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg rounded-2xl overflow-hidden"
              cover={
                <div className="relative">
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.image})` }}
                  />
                </div>
              }
              styles={{ body: { padding: '12px' } }}
            >
              <div className="flex flex-col gap-2">
                <h4 className="font-medium text-sm line-clamp-2 m-0 min-h-[40px]">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-bold text-lg">¥{product.price}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FireOutlined style={{ color: '#E8883D' }} />
                    {product.sales}
                  </span>
                </div>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="small"
                  onClick={handleBuy}
                  block
                  style={{ background: 'linear-gradient(135deg, #E8883D, #D2691E)', border: 'none' }}
                >
                  去购买
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
