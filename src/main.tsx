import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#D2691E',
          borderRadius: 12,
          fontFamily: "'Noto Sans SC', sans-serif",
          colorInfo: '#D2691E',
        },
        components: {
          Button: {
            algorithm: true,
            borderRadius: 12,
          },
          Card: {
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
