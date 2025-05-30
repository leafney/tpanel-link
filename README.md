# tpanel-link

This project is the official browser extension for [TPanel](https://github.com/leafney/tpanel), designed for quickly adding browser bookmarks.

## build

```
bun install

bun run dev

bun run build
```

## 手动安装

由于插件尚未发布到Chrome商店，请按照以下步骤手动安装：

1. 访问GitHub Release页面下载最新版本的插件安装包
2. 解压下载的安装包到本地目录
3. 打开Chrome浏览器，访问 `chrome://extensions/` 或者依次选择浏览器的`菜单` -> `设置` -> `扩展程序`
4. 启用右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"按钮
6. 选择解压后的文件夹(通常包含manifest.json文件)
7. 插件将自动安装并出现在扩展列表中

---

## 配置说明

1. 先从 `tpanel` 管理后台中获取 `api token`
2. 打开插件设置页面，输入 `api token`
3. 填写 `tpanel` 地址
4. 点击 `验证` 按钮，如果提示 `验证成功`，则说明配置正确
5. 点击 `OK` 按钮，保存插件配置

---
