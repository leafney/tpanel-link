import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  message,
  Modal,
  Tooltip,
  Cascader,
  Select,
} from "antd";
import {
  LinkOutlined,
  SettingOutlined,
  SmileOutlined,
  FrownOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import "./App.css";

const { Title, Paragraph } = Typography;

function App() {
  // 页面信息
  const [pageInfo, setPageInfo] = useState({
    title: "",
    link: "",
    icon: "",
    desc: "",
    group: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false); // 新增状态
  const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [isApiUrlValid, setIsApiUrlValid] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [groupOptions, setGroupOptions] = useState<any[]>([]); // 新增分组数据状态

  const API_PATH = "/api/post/bookmark";
  const API_GROUP_PATH = "/api/post/groups"; // 定义分组API路径

  // 获取当前页面信息
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      setPageInfo({
        title: (tab.title || "").trim(),
        link: tab.url || "",
        icon: tab.favIconUrl || "",
        desc: "",
        group: "",
      });
    });

    // 初始化 apiUrl
    chrome.storage.sync.get(["apiUrl", "apiToken", "baseUrl"], (result) => {
      console.log(result);
      if (result.apiUrl) {
        setApiUrl(result.apiUrl);
      }
      if (result.apiToken) {
        setApiToken(result.apiToken);
      }
      if (result.baseUrl) {
        setBaseUrl(result.baseUrl);
        // 如果有baseUrl和apiToken，则获取分组数据
        if (result.baseUrl && result.apiToken) {
          fetchGroupOptions(result.baseUrl, result.apiToken);
        }
      }
    });
  }, []);

  // 获取分组数据
  const fetchGroupOptions = async (baseUrl: string, token: string) => {
    try {
      const fullGroupApiUrl = `${baseUrl}${API_GROUP_PATH}`;
      const response = await fetch(fullGroupApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data) {
          // 直接使用API返回的数据，不需要转换格式
          setGroupOptions(data.data);
        } else {
          console.error("获取分组数据失败:", data.msg || "未知错误");
        }
      } else {
        console.error("获取分组数据请求失败");
      }
    } catch (error) {
      console.error("获取分组数据出错:", error);
    }
  };

  // 提交数据
  const handleSubmit = async () => {
    if (!pageInfo.title.trim()) {
      setTitleError(true);
      message.error("请输入标题");
      return;
    }
    setTitleError(false);

    try {
      // 从 Chrome 存储中获取 API 地址
      const result = await chrome.storage.sync.get(["apiUrl", "apiToken"]);
      console.log(result);
      const apiUrl = result.apiUrl;
      const apiToken = result.apiToken;

      console.log(apiUrl);
      console.log(apiToken);

      if (!apiUrl || !apiToken) {
        message.error("请先在设置页面配置 BASE URL 和 API TOKEN");
        return;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiToken || "",
        },
        body: JSON.stringify({ ...pageInfo, tags: tags.join(",") }),
      });
      if (response.ok) {
        message.success("提交成功！", 1, () => {
          // 在成功消息显示后关闭窗口
          window.close();
        });
      } else {
        message.error("提交失败，请重试。");
      }
    } catch (error) {
      console.error("提交出错:", error);
      message.error("提交出错，请重试。");
    }
  };

  // 打开设置页面
  const handleConfigClick = () => {
    setIsApiUrlValid(false);
    setIsSettingModalVisible(true);
  };

  // 验证 API URL
  const validateApiUrl = async () => {
    if (!apiToken.trim()) {
      message.error("请输入 API TOKEN");
      return;
    }

    if (!baseUrl.trim()) {
      message.error("请输入基础 URL");
      return;
    }

    const fullApiUrl = `${baseUrl.trim()}${API_PATH}`;

    try {
      const response = await fetch(fullApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiToken || "",
        },
      });
      if (response.ok) {
        setIsApiUrlValid(true);
        setApiUrl(fullApiUrl); // 保存完整的 URL
        message.success("API URL 验证成功");

        // 验证成功后立即获取分组数据
        fetchGroupOptions(baseUrl.trim(), apiToken);
      } else {
        setIsApiUrlValid(false);
        message.error("API URL 验证失败");
      }
    } catch (error) {
      setIsApiUrlValid(false);
      console.error("API URL 验证失败:", error);
      message.error("API URL 验证失败");
    }
  };

  const handleSettingModalOk = () => {
    if (!apiToken.trim()) {
      message.error("请输入 API TOKEN");
      return;
    }

    if (!baseUrl.trim()) {
      message.error("请输入基础 URL");
      return;
    }

    if (!isApiUrlValid) {
      message.error("请先验证 API URL");
      return;
    }

    // 保存完整的 API URL 到 Chrome 存储
    chrome.storage.sync.set({ apiUrl, apiToken, baseUrl }, () => {
      message.success("API URL 和 API TOKEN 保存成功");

      // 保存设置后再次获取最新的分组数据
      fetchGroupOptions(baseUrl, apiToken);

      setIsSettingModalVisible(false);
    });
  };

  const handleSettingModalCancel = () => {
    setIsSettingModalVisible(false);
  };

  // 添加复制标题到描述的函数
  const copyTitleToDesc = () => {
    setPageInfo((prevState) => ({
      ...prevState,
      desc: prevState.title,
    }));
    message.success("标题已复制到描述");
  };

  return (
    <div className="xbox flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <img src="images/icon48.png" alt="Grape" className="w-5 h-5" />
            <Title level={4} className="text-center flex-grow">
              Grape
            </Title>
            <SettingOutlined
              className="text-xl cursor-pointer"
              onClick={handleConfigClick}
            />
          </div>
        }
        className="w-full max-w-full sm:max-w-3xl mx-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Paragraph className="mb-0 w-10">链接:</Paragraph>
            <div className="flex items-center space-x-2 flex-1 overflow-hidden">
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
            <div className="flex-1 flex items-center space-x-2">
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
              <Tooltip title="复制标题到描述">
                <Button
                  icon={<CopyOutlined />}
                  onClick={copyTitleToDesc}
                  className="flex-shrink-0"
                />
              </Tooltip>
            </div>
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
            <Paragraph className="mb-0 w-10">分组:</Paragraph>
            <Cascader
              value={pageInfo.group ? [pageInfo.group] : []}
              displayRender={(label) => {
                return label.join(" / ");
              }}
              onChange={(value) => {
                if (value && value.length > 0) {
                  // 获取最后一个选中的值作为 group
                  const selectedValue = value[value.length - 1].toString();
                  setPageInfo({
                    ...pageInfo,
                    group: selectedValue,
                  });
                } else {
                  setPageInfo({
                    ...pageInfo,
                    group: "",
                  });
                }
              }}
              placeholder="选择分组"
              className="flex-1"
              changeOnSelect // 允许选择任意级别
              options={groupOptions}
            />
          </div>
          <div className="flex space-x-4">
            <Paragraph className="mb-0 w-10">标签:</Paragraph>
            <Select
              mode="tags"
              value={tags}
              onChange={(values) => setTags(values)}
              placeholder="输入标签，按回车确认"
              className="flex-1"
              tokenSeparators={[",", " "]}
              allowClear
              dropdownStyle={{ display: "none" }}
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

      <Modal
        title="设置"
        open={isSettingModalVisible}
        onOk={handleSettingModalOk}
        onCancel={handleSettingModalCancel}
        okButtonProps={{ disabled: !isApiUrlValid }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Input
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="请输入 API Token"
            className="flex-grow"
          />
          <Paragraph className="mb-0 w-20 mt-2">ApiToken</Paragraph>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="请输入基础 URL（例如：http://127.0.0.1:8080）"
            className="flex-grow"
          />

          <Button
            onClick={validateApiUrl}
            icon={isApiUrlValid ? <SmileOutlined /> : <FrownOutlined />}
          >
            验证
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
