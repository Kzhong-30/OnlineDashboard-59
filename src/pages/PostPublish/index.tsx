import { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Select, Button, Upload, message, Space } from 'antd';
import { PlusOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { RecipeSummary } from '@/types';
import { recipes, posts } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function PostPublish() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [recipeList, setRecipeList] = useState<RecipeSummary[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    recipes.getRecipes({ limit: 100 }).then((res) => {
      setRecipeList(res.recipes);
    }).catch(() => {});
  }, [isAuthenticated]);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过 10MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.warning('请至少上传一张图片');
        return;
      }
      setSubmitting(true);
      const imageUrls = fileList.map((f) => f.url || f.response?.url || 'https://picsum.photos/600/400');
      await posts.createPost({
        images: imageUrls,
        content: values.content,
        recipeId: values.recipeId,
      });
      message.success('发布成功!');
      navigate('/posts');
    } catch (err) {
      if ((err as { errorFields?: unknown[] }).errorFields) {
        return;
      }
      message.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined style={{ color: '#D2691E' }} />
      <div style={{ marginTop: 8, color: '#D2691E' }}>上传图片</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Title level={2} style={{ color: '#D2691E', margin: 0 }}>
            发布作品打卡
          </Title>
        </div>
        <Card
          className="shadow-lg border-amber-100"
          style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8ED 100%)' }}
          styles={{ body: { padding: 32 } }}
        >
          <Form form={form} layout="vertical" className="space-y-6">
            <Form.Item
              name="images"
              label={<Text strong className="text-base text-amber-800">作品图片</Text>}
              rules={[{ required: true, message: '请上传作品图片' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                multiple
                accept="image/*"
                iconRender={() => <UploadOutlined style={{ color: '#D2691E' }} />}
              >
                {fileList.length >= 9 ? null : uploadButton}
              </Upload>
              <div className="text-xs text-gray-400 mt-2">最多上传9张图片，支持拖拽上传</div>
            </Form.Item>

            <Form.Item
              name="recipeId"
              label={<Text strong className="text-base text-amber-800">关联食谱 (可选)</Text>}
            >
              <Select
                placeholder="选择关联的食谱，方便其他用户查看"
                allowClear
                showSearch
                optionFilterProp="label"
                className="w-full"
              >
                {recipeList.map((recipe) => (
                  <Option key={recipe.id} value={recipe.id} label={recipe.title}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: 'url(' + recipe.cover + ')' }}
                      />
                      <span>{recipe.title}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="content"
              label={<Text strong className="text-base text-amber-800">烘焙心得</Text>}
              rules={[{ required: true, message: '请分享你的烘焙心得' }]}
            >
              <TextArea
                rows={6}
                placeholder="记录你的烘焙心得、遇到的问题、改进的地方..."
                className="resize-none"
                style={{ borderColor: '#F3D9B1', borderRadius: 8 }}
              />
            </Form.Item>

            <div className="flex justify-end pt-4 border-t border-amber-100">
              <Space>
                <Button
                  size="large"
                  onClick={() => navigate(-1)}
                  style={{ borderColor: '#D9B382', color: '#8B4513' }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={handleSubmit}
                  style={{ backgroundColor: '#D2691E', borderColor: '#D2691E' }}
                >
                  发布作品
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
