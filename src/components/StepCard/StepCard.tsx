import { Card, Tag, Badge } from 'antd';
import { FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Step } from '@/types';
import { formatDuration } from '@/utils';

interface StepCardProps {
  step: Step;
}

export default function StepCard({ step }: StepCardProps) {
  return (
    <Card className="mb-4 shadow-sm" styles={{ body: { padding: '20px' } }}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Badge
            count={step.order}
            showZero
            style={{
              backgroundColor: '#D2691E',
              minWidth: 36,
              height: 36,
              fontSize: 16,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(210, 105, 30, 0.3)',
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {step.temperature !== undefined && (
              <Tag
                icon={<FireOutlined />}
                color="red"
                className="text-sm px-3 py-1 rounded-full"
              >
                {step.temperature}°C
              </Tag>
            )}
            {step.duration !== undefined && (
              <Tag
                icon={<ClockCircleOutlined />}
                color="orange"
                className="text-sm px-3 py-1 rounded-full"
              >
                {formatDuration(step.duration)}
              </Tag>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed text-base mb-3">{step.description}</p>

          {step.image && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img
                src={step.image}
                alt={`步骤${step.order}`}
                className="w-full h-auto max-h-72 object-cover rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
