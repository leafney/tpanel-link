import React, { useState, useEffect } from "react";
import { Input, Button, message, Card, Typography } from "antd";

const { Title } = Typography;

const Setting: React.FC = () => {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // 从 Chrome 存储中获取保存的 API 地址
    chrome.storage.sync.get(["apiUrl"], (result) => {
      if (result.apiUrl) {
        setApiUrl(result.apiUrl);
      }
    });
  }, []);

  const handleSubmit = () => {
    if (!apiUrl.trim()) {
      message.error("请输入 API 地址");
      return;
    }

    // 保存 API 地址到 Chrome 存储
    chrome.storage.sync.set({ apiUrl }, () => {
      message.success("API 地址保存成功");
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <Title level={3} className="text-center mb-6">
          配置
        </Title>
        <div className="space-y-4">
          <Input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="请输入 API 地址"
          />
          <Button type="primary" onClick={handleSubmit} block>
            确认
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Setting;
