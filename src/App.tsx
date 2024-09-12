import { useState, useEffect } from "react";
import "./App.css";

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
        alert("提交成功！");
      } else {
        alert("提交失败，请重试。");
      }
    } catch (error) {
      console.error("提交出错:", error);
      alert("提交出错，请重试。");
    }
  };

  return (
    <div className="App" style={{ width: "300px", padding: "10px" }}>
      <h2>当前网页信息</h2>
      <p>标题: {pageInfo.title}</p>
      <p>链接: {pageInfo.link}</p>
      <p>
        图标: <img src={pageInfo.icon} alt="网页图标" width="16" height="16" />
      </p>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="输入标签，用逗号分隔"
      />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}

export default App;
