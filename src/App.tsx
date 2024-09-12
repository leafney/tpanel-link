import { useState, useEffect } from "react";
import { Card, Input, Button, Typography, Space, message } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import "./App.css";

const { Title, Paragraph } = Typography;

function App() {
  const [pageInfo, setPageInfo] = useState({
    title: "",
    link: "",
    icon: "",
  });
  const [tags, setTags] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      setPageInfo({
        title: tab.title || "",
        link: tab.url || "",
        icon: tab.favIconUrl || "",
      });
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch("您的API地址", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...pageInfo, tags }),
      });
      if (response.ok) {
        message.success("提交成功！");
      } else {
        message.error("提交失败，请重试。");
      }
    } catch (error) {
      console.error("提交出错:", error);
      message.error("提交出错，请重试。");
    }
  };

  return (
    <Card title={<Title level={4}>Grape</Title>} style={{ width: 300 }}>
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <Paragraph>
          <LinkOutlined />{" "}
          <a href={pageInfo.link} target="_blank" rel="noopener noreferrer">
            访问链接
          </a>
        </Paragraph>
        <Paragraph>
          图标:{" "}
          <img src={pageInfo.icon} alt="网页图标" width="16" height="16" />
        </Paragraph>
        <Input
          value={pageInfo.title}
          onChange={(e) => setPageInfo({ ...pageInfo, title: e.target.value })}
          placeholder="编辑标题"
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="输入标签，用逗号或空格分隔"
        />
        <Button type="primary" onClick={handleSubmit} block>
          提交
        </Button>
      </Space>
    </Card>
  );
}

export default App;
