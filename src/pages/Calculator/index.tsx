import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Radio,
  InputNumber,
  Select,
  Table,
  Row,
  Col,
  Typography,
  Divider,
  Input,
  Button,
  Space,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, MinusOutlined, CalculatorOutlined } from '@ant-design/icons';
import type { RecipeSummary, RecipeDetail, Ingredient } from '@/types';
import { recipes } from '@/api';
import { calculatePanScale, scaleIngredients, formatAmount } from '@/utils/bakingCalculator';
import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;

type PanShape = 'round' | 'square';

interface PanSettings {
  shape: PanShape;
  diameter?: number;
  side?: number;
  width?: number;
  height?: number;
}

const commonPanSizes = [
  { shape: 'round' as PanShape, size: '6寸 (15cm)', diameter: 15, servings: 4 },
  { shape: 'round' as PanShape, size: '8寸 (20cm)', diameter: 20, servings: 8 },
  { shape: 'round' as PanShape, size: '10寸 (25cm)', diameter: 25, servings: 12 },
  { shape: 'round' as PanShape, size: '12寸 (30cm)', diameter: 30, servings: 16 },
  { shape: 'square' as PanShape, size: '6寸 (15×15cm)', width: 15, height: 15, servings: 6 },
  { shape: 'square' as PanShape, size: '8寸 (20×20cm)', width: 20, height: 20, servings: 10 },
  { shape: 'square' as PanShape, size: '10寸 (25×25cm)', width: 25, height: 25, servings: 16 },
];

export default function Calculator() {
  const { isAuthenticated } = useAuthStore();
  const [recipeList, setRecipeList] = useState<RecipeSummary[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>();
  const [recipeDetail, setRecipeDetail] = useState<RecipeDetail | null>(null);
  const [manualIngredients, setManualIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', amount: 0, unit: 'g' },
  ]);

  const [originalPan, setOriginalPan] = useState<PanSettings>({
    shape: 'round',
    diameter: 20,
  });
  const [targetPan, setTargetPan] = useState<PanSettings>({
    shape: 'round',
    diameter: 15,
  });
  const [originalServings, setOriginalServings] = useState<number>(8);
  const [targetServings, setTargetServings] = useState<number>(4);

  const [fahrenheit, setFahrenheit] = useState<number | null>(350);
  const [celsius, setCelsius] = useState<number | null>(180);
  const [grams, setGrams] = useState<number | null>(100);
  const [ounces, setOunces] = useState<number | null>(3.53);
  const [ml, setMl] = useState<number | null>(240);
  const [cups, setCups] = useState<number | null>(1);

  useEffect(() => {
    if (isAuthenticated) {
      recipes.getRecipes({ limit: 50 }).then((res) => {
        setRecipeList(res.recipes);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedRecipeId) {
      recipes.getRecipe(selectedRecipeId).then((res) => {
        setRecipeDetail(res);
        if (res.servings) {
          setOriginalServings(res.servings);
        }
      }).catch(() => {
        message.error('加载食谱失败');
      });
    } else {
      setRecipeDetail(null);
    }
  }, [selectedRecipeId]);

  const panScale = useMemo(() => {
    try {
      return calculatePanScale(
        {
          diameter: originalPan.shape === 'round' ? originalPan.diameter : undefined,
          side: originalPan.shape === 'square' ? originalPan.side : undefined,
          width: originalPan.shape === 'square' ? originalPan.width : undefined,
          height: originalPan.shape === 'square' ? originalPan.height : undefined,
        },
        {
          diameter: targetPan.shape === 'round' ? targetPan.diameter : undefined,
          side: targetPan.shape === 'square' ? targetPan.side : undefined,
          width: targetPan.shape === 'square' ? targetPan.width : undefined,
          height: targetPan.shape === 'square' ? targetPan.height : undefined,
        },
        originalPan.shape
      );
    } catch {
      return 1;
    }
  }, [originalPan, targetPan]);

  const servingScale = useMemo(() => {
    if (originalServings <= 0 || targetServings <= 0) return 1;
    return targetServings / originalServings;
  }, [originalServings, targetServings]);

  const totalScale = panScale * servingScale;

  const currentIngredients: Ingredient[] = useMemo(() => {
    if (recipeDetail) {
      return recipeDetail.ingredients;
    }
    return manualIngredients.filter((i) => i.name.trim() !== '');
  }, [recipeDetail, manualIngredients]);

  const scaledIngredients = useMemo(() => {
    if (currentIngredients.length === 0) return [];
    try {
      return scaleIngredients(currentIngredients, 1, totalScale);
    } catch {
      return currentIngredients;
    }
  }, [currentIngredients, totalScale]);

  const addManualIngredient = () => {
    setManualIngredients([
      ...manualIngredients,
      { id: String(Date.now()), name: '', amount: 0, unit: 'g' },
    ]);
  };

  const removeManualIngredient = (id: string) => {
    setManualIngredients(manualIngredients.filter((i) => i.id !== id));
  };

  const updateManualIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setManualIngredients(
      manualIngredients.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const ingredientColumns = [
    {
      title: '食材名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Ingredient) => (
        recipeDetail ? (
          <span>{record.name}</span>
        ) : (
          <Input
            value={record.name}
            onChange={(e) => updateManualIngredient(record.id, 'name', e.target.value)}
            placeholder="食材名称"
            className="w-full"
          />
        )
      ),
    },
    {
      title: '原用量',
      key: 'original',
      width: 160,
      render: (_: unknown, record: Ingredient) => (
        recipeDetail ? (
          <span>{formatAmount(record.amount)} {record.unit}</span>
        ) : (
          <Space.Compact>
            <InputNumber
              value={record.amount}
              onChange={(val) => updateManualIngredient(record.id, 'amount', val ?? 0)}
              min={0}
              step={0.5}
              className="w-20"
            />
            <Select
              value={record.unit}
              onChange={(val) => updateManualIngredient(record.id, 'unit', val)}
              className="w-16"
            >
              <Option value="g">g</Option>
              <Option value="ml">ml</Option>
              <Option value="个">个</Option>
              <Option value="勺">勺</Option>
              <Option value="杯">杯</Option>
            </Select>
          </Space.Compact>
        )
      ),
    },
    {
      title: '换算后用量',
      key: 'scaled',
      width: 140,
      render: (_: unknown, _record: Ingredient, index: number) => {
        const scaled = scaledIngredients[index];
        return (
          <Text strong style={{ color: '#D2691E' }}>
            {scaled ? `${formatAmount(scaled.amount)} ${scaled.unit}` : '-'}
          </Text>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_: unknown, record: Ingredient) =>
        !recipeDetail && manualIngredients.length > 1 ? (
          <Button
            type="text"
            danger
            icon={<MinusOutlined />}
            onClick={() => removeManualIngredient(record.id)}
          />
        ) : null,
    },
  ];

  useEffect(() => {
    if (fahrenheit !== null) {
      setCelsius(Number(((fahrenheit - 32) * 5 / 9).toFixed(1)));
    }
  }, [fahrenheit]);

  useEffect(() => {
    if (celsius !== null) {
      setFahrenheit(Number((celsius * 9 / 5 + 32).toFixed(1)));
    }
  }, [celsius]);

  useEffect(() => {
    if (grams !== null) {
      setOunces(Number((grams / 28.35).toFixed(2)));
    }
  }, [grams]);

  useEffect(() => {
    if (ounces !== null) {
      setGrams(Number((ounces * 28.35).toFixed(1)));
    }
  }, [ounces]);

  useEffect(() => {
    if (ml !== null) {
      setCups(Number((ml / 240).toFixed(2)));
    }
  }, [ml]);

  useEffect(() => {
    if (cups !== null) {
      setMl(Number((cups * 240).toFixed(1)));
    }
  }, [cups]);

  const panTableColumns = [
    {
      title: '模具',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '形状',
      key: 'shape',
      render: (_: unknown, record: typeof commonPanSizes[0]) => (
        <Tag color={record.shape === 'round' ? 'orange' : 'gold'}>
          {record.shape === 'round' ? '圆形' : '方形'}
        </Tag>
      ),
    },
    {
      title: '参考份量',
      dataIndex: 'servings',
      key: 'servings',
      render: (val: number) => `${val}人份`,
    },
  ];

  const renderPanInputs = (pan: PanSettings, setPan: (p: PanSettings) => void, label: string) => (
    <div className="space-y-3">
      <Text strong className="block text-base">{label}</Text>
      <Radio.Group
        value={pan.shape}
        onChange={(e) =>
          setPan({
            shape: e.target.value,
            ...(e.target.value === 'round' ? { diameter: 20 } : { width: 20, height: 20 }),
          })
        }
      >
        <Radio value="round">圆形</Radio>
        <Radio value="square">方形</Radio>
      </Radio.Group>
      {pan.shape === 'round' ? (
        <Space.Compact>
          <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-l">直径</Text>
          <InputNumber
            value={pan.diameter}
            onChange={(val) => setPan({ ...pan, diameter: val ?? 0 })}
            min={1}
            max={60}
            className="w-24"
          />
          <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-r">cm</Text>
        </Space.Compact>
      ) : (
        <Space>
          <Space.Compact>
            <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-l">长</Text>
            <InputNumber
              value={pan.width}
              onChange={(val) => setPan({ ...pan, width: val ?? 0 })}
              min={1}
              max={60}
              className="w-20"
            />
            <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-r">cm</Text>
          </Space.Compact>
          <Space.Compact>
            <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-l">宽</Text>
            <InputNumber
              value={pan.height}
              onChange={(val) => setPan({ ...pan, height: val ?? 0 })}
              min={1}
              max={60}
              className="w-20"
            />
            <Text className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-r">cm</Text>
          </Space.Compact>
        </Space>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <CalculatorOutlined style={{ fontSize: 32, color: '#D2691E' }} />
          <Title level={2} style={{ color: '#D2691E', margin: 0 }}>
            烘焙计算器
          </Title>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={15}>
            <Card
              className="shadow-lg border-amber-100"
              style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
              styles={{ body: { padding: 24 } }}
            >
              <Title level={4} style={{ color: '#8B4513', marginTop: 0 }}>
                配方用量换算
              </Title>

              <div className="space-y-6">
                <div>
                  <Text strong className="block mb-2">配方来源</Text>
                  <Select
                    placeholder="选择已有食谱，或手动输入食材"
                    allowClear
                    value={selectedRecipeId}
                    onChange={setSelectedRecipeId}
                    className="w-full"
                    showSearch
                    optionFilterProp="label"
                  >
                    {recipeList.map((r) => (
                      <Option key={r.id} value={r.id} label={r.title}>
                        {r.title}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    {renderPanInputs(originalPan, setOriginalPan, '原模具设置')}
                  </Col>
                  <Col xs={24} sm={12}>
                    {renderPanInputs(targetPan, setTargetPan, '目标模具设置')}
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={12}>
                    <div className="space-y-2">
                      <Text strong>原份数</Text>
                      <InputNumber
                        min={1}
                        max={100}
                        value={originalServings}
                        onChange={(val) => setOriginalServings(val ?? 1)}
                        className="w-full"
                        addonAfter="人份"
                      />
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="space-y-2">
                      <Text strong>目标份数</Text>
                      <InputNumber
                        min={1}
                        max={100}
                        value={targetServings}
                        onChange={(val) => setTargetServings(val ?? 1)}
                        className="w-full"
                        addonAfter="人份"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                  <Row gutter={16} align="middle">
                    <Col xs={8}>
                      <Text className="text-gray-600">模具换算比例</Text>
                      <div className="text-xl font-bold text-amber-700">×{panScale.toFixed(2)}</div>
                    </Col>
                    <Col xs={8}>
                      <Text className="text-gray-600">份数换算比例</Text>
                      <div className="text-xl font-bold text-amber-700">×{servingScale.toFixed(2)}</div>
                    </Col>
                    <Col xs={8}>
                      <Text className="text-gray-600">总换算比例</Text>
                      <div className="text-2xl font-bold text-orange-600">×{totalScale.toFixed(2)}</div>
                    </Col>
                  </Row>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Text strong className="text-base">食材列表</Text>
                    {!recipeDetail && (
                      <Button
                        type="primary"
                        ghost
                        icon={<PlusOutlined />}
                        onClick={addManualIngredient}
                        style={{ borderColor: '#D2691E', color: '#D2691E' }}
                      >
                        添加食材
                      </Button>
                    )}
                  </div>
                  <Table
                    dataSource={recipeDetail ? currentIngredients : manualIngredients}
                    columns={ingredientColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    bordered
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={9} className="space-y-6">
            <Card
              className="shadow-lg border-amber-100"
              style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Title level={4} style={{ color: '#8B4513', marginTop: 0 }}>
                温度换算
              </Title>
              <div className="space-y-4">
                <Row gutter={8} align="middle">
                  <Col span={10}>
                    <InputNumber
                      value={fahrenheit}
                      onChange={(value) => setFahrenheit(Number(value) || null)}
                      className="w-full"
                      addonAfter="°F"
                    />
                  </Col>
                  <Col span={4} className="text-center text-gray-400 text-xl">↔</Col>
                  <Col span={10}>
                    <InputNumber
                      value={celsius}
                      onChange={(value) => setCelsius(Number(value) || null)}
                      className="w-full"
                      addonAfter="°C"
                    />
                  </Col>
                </Row>
                <div className="p-3 bg-amber-50 rounded text-sm text-gray-600">
                  <div>常用温度参考：</div>
                  <div>• 预热烤箱：180°C = 350°F</div>
                  <div>• 高温烘烤：200°C = 390°F</div>
                  <div>• 低温慢烤：150°C = 300°F</div>
                </div>
              </div>
            </Card>

            <Card
              className="shadow-lg border-amber-100"
              style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Title level={4} style={{ color: '#8B4513', marginTop: 0 }}>
                重量/体积换算
              </Title>
              <div className="space-y-4">
                <Row gutter={8} align="middle">
                  <Col span={10}>
                    <InputNumber
                      value={grams}
                      onChange={(value) => setGrams(Number(value) || null)}
                      className="w-full"
                      addonAfter="g"
                    />
                  </Col>
                  <Col span={4} className="text-center text-gray-400 text-xl">↔</Col>
                  <Col span={10}>
                    <InputNumber
                      value={ounces}
                      onChange={(value) => setOunces(Number(value) || null)}
                      className="w-full"
                      addonAfter="oz"
                    />
                  </Col>
                </Row>
                <Row gutter={8} align="middle">
                  <Col span={10}>
                    <InputNumber
                      value={ml}
                      onChange={(value) => setMl(Number(value) || null)}
                      className="w-full"
                      addonAfter="ml"
                    />
                  </Col>
                  <Col span={4} className="text-center text-gray-400 text-xl">↔</Col>
                  <Col span={10}>
                    <InputNumber
                      value={cups}
                      onChange={(value) => setCups(Number(value) || null)}
                      className="w-full"
                      addonAfter="杯"
                    />
                  </Col>
                </Row>
              </div>
              <Divider style={{ borderColor: '#F3D9B1', margin: '16px 0' }} />
              <div className="text-sm text-gray-600 space-y-1">
                <div className="font-semibold text-amber-700 mb-2">常用换算参考：</div>
                <div>1 杯面粉 ≈ 120g</div>
                <div>1 杯糖 ≈ 200g</div>
                <div>1 杯黄油 ≈ 227g</div>
                <div>1 大勺 (tbsp) ≈ 15ml</div>
                <div>1 小勺 (tsp) ≈ 5ml</div>
              </div>
            </Card>

            <Card
              className="shadow-lg border-amber-100"
              style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Title level={4} style={{ color: '#8B4513', marginTop: 0 }}>
                常见模具尺寸对照
              </Title>
              <Table
                dataSource={commonPanSizes}
                columns={panTableColumns}
                rowKey="size"
                pagination={false}
                size="small"
                bordered
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
