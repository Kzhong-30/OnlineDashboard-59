import { useState } from 'react';
import {
  Steps,
  Button,
  Form,
  Input,
  Select,
  Rate,
  InputNumber,
  Card,
  Upload,
  Row,
  Col,
  Tag,
  message,
  Space,
  Image,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  LeftOutlined,
  SendOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recipes } from '@/api';
import { useAuthStore } from '@/store/authStore';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { formatDuration } from '@/utils';
import type { RecipeCategory, Ingredient, Step } from '@/types';

const { TextArea } = Input;
const { Step } = Steps;

const categoryOptions = [
  { value: 'bread', label: '🍞 面包' },
  { value: 'cake', label: '🎂 蛋糕' },
  { value: 'cookie', label: '🍪 饼干' },
  { value: 'dessert', label: '🍮 甜点' },
];

const categoryLabels: Record<string, string> = {
  bread: '面包',
  cake: '蛋糕',
  cookie: '饼干',
  dessert: '甜点',
};

const unitOptions = [
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: '个', label: '个' },
  { value: '勺', label: '勺' },
  { value: '适量', label: '适量' },
];

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop';

const DEFAULT_STEP_IMAGE =
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop';

interface FormIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface FormStep {
  id: string;
  order: number;
  description: string;
  image?: string;
  temperature?: number;
  duration?: number;
}

export default function RecipePublish() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('bread');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState<string>(DEFAULT_COVER);

  const [servings, setServings] = useState<number>(4);
  const [ingredients, setIngredients] = useState<FormIngredient[]>([
    { id: 'ing-1', name: '高筋面粉', amount: 300, unit: 'g' },
    { id: 'ing-2', name: '酵母', amount: 5, unit: 'g' },
    { id: 'ing-3', name: '细砂糖', amount: 30, unit: 'g' },
    { id: 'ing-4', name: '盐', amount: 5, unit: 'g' },
    { id: 'ing-5', name: '温水', amount: 180, unit: 'ml' },
    { id: 'ing-6', name: '黄油', amount: 30, unit: 'g' },
  ]);

  const [steps, setSteps] = useState<FormStep[]>([
    {
      id: 'step-1',
      order: 1,
      description: '将温水（约35°C）与酵母、细砂糖混合，静置5分钟至表面起泡活化。',
      temperature: 35,
      duration: 5,
      image: DEFAULT_STEP_IMAGE,
    },
    {
      id: 'step-2',
      order: 2,
      description: '将高筋面粉、盐混合过筛，加入活化好的酵母水，揉成光滑面团。',
      duration: 15,
    },
    {
      id: 'step-3',
      order: 3,
      description: '加入软化的黄油，继续揉至面团能拉出薄而有韧性的手套膜。',
      duration: 20,
    },
    {
      id: 'step-4',
      order: 4,
      description: '面团放入盆中，盖保鲜膜，放置温暖处发酵至2倍大（约1小时）。',
      duration: 60,
    },
  ]);

  const [totalDuration, setTotalDuration] = useState<number>(180);
  const [bakingTemp, setBakingTemp] = useState<number>(180);
  const [bakingTime, setBakingTime] = useState<number>(30);

  const beforeUpload = (file: File, type: 'cover' | 'step', stepId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === 'cover') {
        setCoverUrl(url);
      } else if (type === 'step' && stepId) {
        setSteps((prev) =>
          prev.map((s) => (s.id === stepId ? { ...s, image: url } : s))
        );
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}`, name: '', amount: 0, unit: 'g' },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof FormIngredient, value: unknown) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        order: prev.length + 1,
        description: '',
      },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  const updateStep = (id: string, field: keyof FormStep, value: unknown) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const validateStep1 = async (): Promise<boolean> => {
    try {
      await form1.validateFields();
      return true;
    } catch {
      return false;
    }
  };

  const validateStep2 = (): boolean => {
    const valid = ingredients.filter((i) => i.name.trim()).length > 0;
    if (!valid) {
      message.warning('请至少添加一种食材');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const valid = steps.filter((s) => s.description.trim()).length > 0;
    if (!valid) {
      message.warning('请至少添加一个制作步骤');
      return false;
    }
    return true;
  };

  const next = async () => {
    if (currentStep === 0) {
      const ok = await validateStep1();
      if (!ok) return;
    } else if (currentStep === 1) {
      if (!validateStep2()) return;
    } else if (currentStep === 2) {
      if (!validateStep3()) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalIngredients: Ingredient[] = ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({
          id: i.id,
          name: i.name,
          amount: i.unit === '适量' ? 1 : i.amount,
          unit: i.unit,
        }));

      const finalSteps: Step[] = steps
        .filter((s) => s.description.trim())
        .map((s, idx) => ({
          id: s.id,
          order: idx + 1,
          description: s.description,
          image: s.image,
          temperature: s.temperature,
          duration: s.duration,
        }));

      const payload = {
        title,
        category,
        difficulty,
        description,
        cover: coverUrl,
        servings,
        ingredients: finalIngredients,
        steps: finalSteps,
        temperature: bakingTemp,
        bakingTime,
        duration: totalDuration,
      };

      const res = await recipes.createRecipe(payload);
      message.success('食谱发布成功！');
      setTimeout(() => navigate(`/recipes/${res.id}`), 800);
    } catch (err) {
      console.error(err);
      message.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <Form form={form1} layout="vertical">
      <Row gutter={[16, 0]}>
        <Col xs={24} md={14}>
          <Form.Item
            label="食谱标题"
            name="title"
            rules={[{ required: true, message: '请输入食谱标题' }]}
          >
            <Input
              placeholder="例如：松软北海道吐司"
              size="large"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              size="large"
              options={categoryOptions}
              value={category}
              onChange={(v: RecipeCategory) => setCategory(v)}
            />
          </Form.Item>

          <Form.Item label="难度" name="difficulty">
            <Rate
              count={5}
              value={difficulty}
              onChange={(v) => setDifficulty(v as 1 | 2 | 3 | 4 | 5)}
              style={{ fontSize: 28 }}
            />
          </Form.Item>

          <Form.Item label="食谱描述" name="description">
            <TextArea
              rows={5}
              placeholder="简单介绍一下这道菜的特点、风味、适合场合..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={10}>
          <Form.Item label="封面图" name="cover">
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
                <Image
                  src={coverUrl}
                  alt="封面预览"
                  width="100%"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  preview={false}
                />
              </div>
              <Upload
                beforeUpload={(file) => beforeUpload(file, 'cover')}
                accept="image/*"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  上传封面图
                </Button>
              </Upload>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const renderStep2 = () => (
    <Form form={form2} layout="vertical">
      <Form.Item label="默认份数">
        <div className="flex items-center gap-2 mb-4">
          <InputNumber
            min={1}
            max={50}
            value={servings}
            onChange={(v) => v && setServings(v)}
            size="large"
          />
          <span className="text-gray-600">人份</span>
        </div>
      </Form.Item>

      <div className="space-y-3 mb-6">
        {ingredients.map((ing, idx) => (
          <Row gutter={[8, 8]} align="middle" key={ing.id}>
            <Col xs={2} className="text-center text-gray-500 font-medium">
              {idx + 1}.
            </Col>
            <Col xs={10} sm={11} md={12}>
              <Input
                placeholder="食材名称"
                value={ing.name}
                onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
              />
            </Col>
            <Col xs={5} sm={5} md={4}>
              <InputNumber
                placeholder="数量"
                min={0}
                value={ing.unit === '适量' ? 0 : ing.amount}
                onChange={(v) => updateIngredient(ing.id, 'amount', v ?? 0)}
                style={{ width: '100%' }}
                disabled={ing.unit === '适量'}
              />
            </Col>
            <Col xs={5} sm={5} md={5}>
              <Select
                value={ing.unit}
                onChange={(v) => updateIngredient(ing.id, 'unit', v)}
                options={unitOptions}
              />
            </Col>
            <Col xs={2} className="text-center">
              {ingredients.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeIngredient(ing.id)}
                />
              )}
            </Col>
          </Row>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addIngredient}
        block
        style={{ borderColor: '#D2691E', color: '#D2691E' }}
      >
        添加食材
      </Button>
    </Form>
  );

  const renderStep3 = () => (
    <Form form={form3} layout="vertical">
      <div className="space-y-5 mb-6">
        {steps.map((s) => (
          <Card
            key={s.id}
            className="shadow-sm"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                  }}
                >
                  {s.order}
                </div>
                <h4 className="m-0 font-semibold text-gray-800">第 {s.order} 步</h4>
              </div>
              {steps.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeStep(s.id)}
                />
              )}
            </div>

            <TextArea
              rows={3}
              placeholder="描述这一步需要做什么..."
              value={s.description}
              onChange={(e) => updateStep(s.id, 'description', e.target.value)}
              showCount
              maxLength={500}
              className="mb-4"
            />

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={14}>
                <div className="flex gap-4 items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">步骤图片</div>
                    <div className="flex gap-3 items-center">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-amber-200 bg-amber-50 flex-shrink-0">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt="步骤预览"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            无图
                          </div>
                        )}
                      </div>
                      <Upload
                        beforeUpload={(file) => beforeUpload(file, 'step', s.id)}
                        accept="image/*"
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="small">
                          上传
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={5}>
                <div className="text-sm text-gray-500 mb-1">温度 (°C)</div>
                <InputNumber
                  min={0}
                  max={300}
                  placeholder="可选"
                  value={s.temperature}
                  onChange={(v) => updateStep(s.id, 'temperature', v ?? undefined)}
                  style={{ width: '100%' }}
                  addonBefore={<FireOutlined />}
                />
              </Col>
              <Col xs={12} md={5}>
                <div className="text-sm text-gray-500 mb-1">耗时 (分钟)</div>
                <InputNumber
                  min={0}
                  placeholder="可选"
                  value={s.duration}
                  onChange={(v) => updateStep(s.id, 'duration', v ?? undefined)}
                  style={{ width: '100%' }}
                  addonBefore={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addStep}
        block
        style={{ borderColor: '#D2691E', color: '#D2691E' }}
      >
        添加步骤
      </Button>
    </Form>
  );

  const renderStep4 = () => (
    <Form form={form4} layout="vertical">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="h-full shadow-sm">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <ClockCircleOutlined style={{ fontSize: 32, color: '#D2691E' }} />
              </div>
              <div className="text-sm text-gray-500 mb-2">总耗时</div>
              <InputNumber
                min={1}
                max={1440}
                value={totalDuration}
                onChange={(v) => v && setTotalDuration(v)}
                size="large"
                style={{ width: 140 }}
                addonAfter="分钟"
              />
              <div className="text-xs text-gray-400 mt-2">
                约 {formatDuration(totalDuration)}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="h-full shadow-sm">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <FireOutlined style={{ fontSize: 32, color: '#D2691E' }} />
              </div>
              <div className="text-sm text-gray-500 mb-2">烘焙温度</div>
              <InputNumber
                min={0}
                max={300}
                value={bakingTemp}
                onChange={(v) => v !== null && setBakingTemp(v)}
                size="large"
                style={{ width: 140 }}
                addonAfter="°C"
              />
              <div className="text-xs text-gray-400 mt-2">根据烤箱特性适当调整</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="h-full shadow-sm">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                <FireOutlined style={{ fontSize: 32, color: '#D2691E' }} />
              </div>
              <div className="text-sm text-gray-500 mb-2">烘焙时间</div>
              <InputNumber
                min={1}
                max={600}
                value={bakingTime}
                onChange={(v) => v && setBakingTime(v)}
                size="large"
                style={{ width: 140 }}
                addonAfter="分钟"
              />
              <div className="text-xs text-gray-400 mt-2">约 {formatDuration(bakingTime)}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </Form>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <Card className="shadow-sm" styles={{ body: { padding: '24px' } }}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={coverUrl}
                alt="封面"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Tag color="orange">{categoryLabels[category]}</Tag>
              <Rate disabled value={difficulty} count={5} className="text-sm" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{title || '未填写标题'}</h2>
            <div className="flex items-center gap-3 mb-4">
              {user && (
                <>
                  <UserAvatar src={user.avatar} name={user.username} size={36} />
                  <span className="text-gray-700 font-medium">{user.username}</span>
                </>
              )}
            </div>
            {description ? (
              <p className="text-gray-600 leading-relaxed m-0">{description}</p>
            ) : (
              <p className="text-gray-400 italic m-0">暂无描述</p>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6}>
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined style={{ color: '#D2691E' }} />
                  <span>总耗时 {formatDuration(totalDuration)}</span>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="flex items-center gap-2 text-gray-600">
                  <FireOutlined style={{ color: '#D2691E' }} />
                  <span>烘焙 {bakingTemp}°C</span>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="flex items-center gap-2 text-gray-600">
                  <FireOutlined style={{ color: '#D2691E' }} />
                  <span>{formatDuration(bakingTime)}</span>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="flex items-center gap-2 text-gray-600">
                  <TeamOutlined style={{ color: '#D2691E' }} />
                  <span>{servings}人份</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm" styles={{ body: { padding: '24px' } }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0 mb-4">
          <FireOutlined style={{ color: '#D2691E' }} />
          食材清单 ({servings}人份)
        </h3>
        <Row gutter={[16, 12]}>
          {ingredients
            .filter((i) => i.name.trim())
            .map((ing) => (
              <Col xs={12} sm={8} md={6} key={ing.id}>
                <div className="flex items-center justify-between py-2 px-3 bg-amber-50/50 rounded-lg">
                  <span className="text-gray-700">{ing.name}</span>
                  <span className="font-medium text-amber-700">
                    {ing.unit === '适量' ? '适量' : `${ing.amount} ${ing.unit}`}
                  </span>
                </div>
              </Col>
            ))}
        </Row>
      </Card>

      <Card className="shadow-sm" styles={{ body: { padding: '24px' } }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 m-0 mb-5">
          <FireOutlined style={{ color: '#D2691E' }} />
          制作步骤
        </h3>
        <div className="space-y-4">
          {steps
            .filter((s) => s.description.trim())
            .map((s, idx) => (
              <div key={s.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                      boxShadow: '0 4px 12px rgba(210, 105, 30, 0.3)',
                    }}
                  >
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.temperature !== undefined && (
                      <Tag icon={<FireOutlined />} color="red">
                        {s.temperature}°C
                      </Tag>
                    )}
                    {s.duration !== undefined && (
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        {formatDuration(s.duration)}
                      </Tag>
                    )}
                  </div>
                  <p className="text-gray-700 m-0 leading-relaxed">{s.description}</p>
                  {s.image && (
                    <div className="mt-3">
                      <img
                        src={s.image}
                        alt={`步骤${idx + 1}`}
                        className="max-w-sm w-full h-auto rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      case 4:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 m-0">发布食谱</h1>
          <p className="text-gray-500 m-0">分享你的美味配方，让更多人尝到幸福的味道</p>
        </div>

        <Card className="mb-6 shadow-sm" styles={{ body: { padding: '24px' } }}>
          <Steps
            current={currentStep}
            responsive
            items={[
              { title: '基本信息', description: '标题、分类、封面' },
              { title: '食材清单', description: '食材、用量' },
              { title: '制作步骤', description: '步骤、图片' },
              { title: '烘焙参数', description: '温度、时间' },
              { title: '预览发布', description: '确认并发布' },
            ]}
          />
        </Card>

        <Card className="mb-6 shadow-sm" styles={{ body: { padding: '28px' } }}>
          {renderStepContent()}
        </Card>

        <div className="flex justify-between">
          <Space>
            {currentStep > 0 && (
              <Button
                icon={<LeftOutlined />}
                size="large"
                onClick={prev}
              >
                上一步
              </Button>
            )}
            <Button size="large" onClick={() => navigate(-1)}>
              取消
            </Button>
          </Space>
          {currentStep < 4 ? (
            <Button
              type="primary"
              size="large"
              onClick={next}
              style={{
                background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                border: 'none',
              }}
            >
              下一步
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              style={{
                background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                border: 'none',
              }}
            >
              发布食谱
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
