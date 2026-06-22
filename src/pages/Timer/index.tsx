import { useState, useEffect, useRef } from 'react';
import { Card, Typography, Button, Modal, Form, Input, InputNumber, Space, Row, Col, Tag, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, DeleteOutlined, PlusOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface TimerTask {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  temperature?: number;
  running: boolean;
  finished: boolean;
}

interface PresetTimer {
  name: string;
  temperature: number;
  minutes: number;
  icon: string;
  color: string;
}

const PRESETS: PresetTimer[] = [
  { name: '预热烤箱', temperature: 180, minutes: 10, icon: 'Fire', color: '#EF4444' },
  { name: '发酵', temperature: 35, minutes: 60, icon: 'Sun', color: '#F59E0B' },
  { name: '烤蛋糕', temperature: 160, minutes: 40, icon: 'Cake', color: '#EC4899' },
  { name: '烤面包', temperature: 200, minutes: 30, icon: 'Bread', color: '#D97706' },
  { name: '烤曲奇', temperature: 170, minutes: 15, icon: 'Cookie', color: '#92400E' },
];

const playBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      osc2.connect(gain);
      osc2.frequency.value = 880;
      osc2.start(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.5);
    }, 300);
  } catch {
    // ignore
  }
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
};

const CircleProgress: React.FC<{ percent: number; size?: number }> = ({ percent, size = 140 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F3D9B1" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#D2691E"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
};

export default function Timer() {
  const [tasks, setTasks] = useState<TimerTask[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTasks((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.running && t.remaining > 0) {
            changed = true;
            const newRemaining = t.remaining - 1;
            if (newRemaining === 0) {
              playBeep();
              message.success('计时完成：' + t.name);
              return { ...t, remaining: 0, running: false, finished: true };
            }
            return { ...t, remaining: newRemaining };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addTask = (name: string, minutes: number, seconds: number, temperature?: number) => {
    const duration = minutes * 60 + seconds;
    const newTask: TimerTask = {
      id: Date.now().toString(),
      name,
      duration,
      remaining: duration,
      temperature,
      running: false,
      finished: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleAddFromPreset = (preset: PresetTimer) => {
    addTask(preset.name, preset.minutes, 0, preset.temperature);
    message.success('已添加：' + preset.name);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      addTask(values.name, values.minutes || 0, values.seconds || 0, values.temperature);
      form.resetFields();
      setModalOpen(false);
      message.success('计时任务已添加');
    } catch {
      // ignore
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id && !t.finished ? { ...t, running: !t.running } : t)));
  };

  const resetTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, remaining: t.duration, running: false, finished: false } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Title level={2} style={{ color: '#D2691E', margin: 0 }}>
            烘焙计时器
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: '#D2691E', borderColor: '#D2691E' }}
          >
            添加计时任务
          </Button>
        </div>

        <Card
          title={<span style={{ color: '#8B4513' }}>预设模式</span>}
          className="mb-6 shadow-lg border-amber-100"
          style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
        >
          <Row gutter={[16, 16]}>
            {PRESETS.map((preset) => (
              <Col xs={12} sm={8} md={24 / 5} key={preset.name}>
                <Card
                  hoverable
                  onClick={() => handleAddFromPreset(preset)}
                  className="text-center cursor-pointer h-full"
                  style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8ED 100%)', borderColor: '#F3D9B1' }}
                  styles={{ body: { padding: 16 } }}
                >
                  <div className="text-3xl mb-2">{preset.icon}</div>
                  <div className="font-semibold text-amber-800 text-base">{preset.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <Tag color={preset.color} style={{ margin: 0 }}>
                      {preset.temperature}°C / {preset.minutes}分钟
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {tasks.length === 0 ? (
          <Card className="text-center py-16 border-amber-100" style={{ background: '#FFFBF5' }}>
            <div className="text-6xl mb-4">⏱️</div>
            <Text type="secondary" className="text-lg">
              暂无计时任务，点击上方预设或添加按钮开始
            </Text>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {tasks.map((task) => {
              const percent = task.duration > 0 ? ((task.duration - task.remaining) / task.duration) * 100 : 0;
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={task.id}>
                  <Card
                    className={task.finished ? 'animate-pulse shadow-lg border-red-300' : 'shadow-lg border-amber-100'}
                    style={{
                      background: task.finished
                        ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
                        : 'linear-gradient(135deg, #FFFBF5 0%, #FFF8ED 100%)',
                    }}
                    styles={{ body: { padding: 20 } }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-amber-800 text-lg">{task.name}</div>
                        {task.temperature && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <FireOutlined />
                            <span>{task.temperature}°C</span>
                          </div>
                        )}
                      </div>
                      {task.finished && <Tag color="red" className="text-xs">已完成</Tag>}
                    </div>

                    <div className="relative flex justify-center my-4">
                      <CircleProgress percent={percent} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-3xl font-bold tabular-nums"
                          style={{ color: task.finished ? '#DC2626' : '#D2691E' }}
                        >
                          {formatTime(task.remaining)}
                        </span>
                      </div>
                    </div>

                    <Space className="w-full justify-center">
                      <Button
                        type={task.running ? 'default' : 'primary'}
                        onClick={() => toggleTask(task.id)}
                        disabled={task.finished}
                        icon={task.running ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        style={!task.running ? { backgroundColor: '#D2691E', borderColor: '#D2691E' } : { borderColor: '#D9B382', color: '#8B4513' }}
                      >
                        {task.running ? '暂停' : '开始'}
                      </Button>
                      <Button icon={<ReloadOutlined />} onClick={() => resetTask(task.id)} style={{ borderColor: '#D9B382', color: '#8B4513' }}>
                        重置
                      </Button>
                      <Button danger icon={<DeleteOutlined />} onClick={() => deleteTask(task.id)}>
                        删除
                      </Button>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        <Modal
          title={<span style={{ color: '#D2691E' }}>添加计时任务</span>}
          open={modalOpen}
          onOk={handleModalOk}
          onCancel={() => setModalOpen(false)}
          okText="添加"
          cancelText="取消"
          okButtonProps={{ style: { backgroundColor: '#D2691E', borderColor: '#D2691E' } }}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
              <Input placeholder="例如：烤戚风蛋糕" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="minutes" label="分钟" rules={[{ required: true, message: '请输入分钟' }]}>
                  <InputNumber min={0} max={600} className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="seconds" label="秒" initialValue={0}>
                  <InputNumber min={0} max={59} className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="temperature" label="温度提醒 (°C，可选)">
              <InputNumber min={0} max={300} className="w-full" placeholder="例如：180" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
