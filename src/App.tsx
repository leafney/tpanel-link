import { useState, useEffect } from "react";
import { Card, Input, Button, Typography, message } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import "./App.css";

const { Title, Paragraph } = Typography;

function App() {
  const [pageInfo, setPageInfo] = useState({
    title: "",
    link: "",
    icon: "",
    desc: "",
  });
  const [tags, setTags] = useState("");
  const [titleError, setTitleError] = useState(false); // 新增状态

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      setPageInfo({
        title: tab.title || "",
        link: tab.url || "",
        icon: tab.favIconUrl || "",
        desc: "",
      });
    });
  }, []);

  const handleSubmit = async () => {
    if (!pageInfo.title.trim()) {
      setTitleError(true);
      message.error("请输入标题");
      return;
    }
    setTitleError(false);

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
    <div className="xbox flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card
        title={
          <Title level={4} className="text-center">
            Grape
          </Title>
        }
        className="w-full max-w-full sm:max-w-3xl mx-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Paragraph className="mb-0 w-10">链接:</Paragraph>
            <div className="flex items-center space-x-2 flex-1">
              <LinkOutlined />
              <a
                href={pageInfo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 truncate"
              >
                {pageInfo.title}
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Paragraph className="mb-0 w-10">图标:</Paragraph>
            <img src={pageInfo.icon} alt="图标" className="w-12 h-12" />
          </div>
          <div className="flex space-x-4">
            <Paragraph className="mb-0 w-10">标题:</Paragraph>
            <Input.TextArea
              value={pageInfo.title}
              onChange={(e) => {
                setPageInfo({ ...pageInfo, title: e.target.value });
                setTitleError(false);
              }}
              placeholder="编辑标题（必填）"
              className={`flex-1 ${titleError ? "border-red-500" : ""}`}
              autoSize={{ minRows: 2, maxRows: 5 }}
              status={titleError ? "error" : ""}
            />
          </div>
          <div className="flex space-x-4">
            <Paragraph className="mb-0 w-10">描述:</Paragraph>
            <Input.TextArea
              value={pageInfo.desc}
              onChange={(e) =>
                setPageInfo({ ...pageInfo, desc: e.target.value })
              }
              placeholder="编辑描述"
              className="flex-1 "
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </div>
          <div className="flex space-x-4">
            <Paragraph className="mb-0 w-10">标签:</Paragraph>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="输入标签，用逗号或空格分隔"
              className="flex-1 "
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="primary"
              onClick={handleSubmit}
              className="w-10/12 py-3 text-lg"
            >
              提交
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;
