import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { cn } from '@/utils';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: number | 'small' | 'default' | 'large';
  className?: string;
}

export default function UserAvatar({ src, name, size = 'default', className }: UserAvatarProps) {
  const getInitial = (n: string) => {
    if (!n) return '';
    return n.charAt(0).toUpperCase();
  };

  return (
    <Avatar
      src={src}
      size={size}
      icon={!src && !name ? <UserOutlined /> : undefined}
      className={cn('bg-gradient-to-br from-amber-400 to-orange-500', className)}
    >
      {!src && name ? getInitial(name) : null}
    </Avatar>
  );
}
