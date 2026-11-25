# 极简现代毛玻璃个人导航 (Glassmorphism Bento Navigation)

> 基于纯静态 HTML / CSS / ES6+ 重构打造的现代毛玻璃 Bento 风格个人导航工作台，预编译静态样式、零构建依赖、开箱即用。

---

## ✨ 核心特性

- 💎 **毛玻璃 Bento 视觉风格**：采用半透明磨砂玻璃卡片（`backdrop-blur`）、微光边框、柔和环境光晕与大圆角紧凑卡片设计，支持深邃暗色与清新明亮主题（首屏同步初始化零闪烁，支持状态记忆）。
- 📦 **书签与站点全配置化**：通过 `links.json` 集中管理站点标题、页脚文案、搜索引擎、公开分类书签与私密密文。
- 🔒 **金融级 AES-256-GCM 密码学私密分类（防 F12 审查）**：
  - 私密分类书签在数据文件中**仅以密文形式存储**，源码及 `links.json` 中绝不暴露任何明文网址或标题；
  - 采用 PBKDF2（100,000 次加盐迭代）与原生 `Web Crypto API` AES-256-GCM 在内存中端到端解密；
  - 离开/切换标签页超过 3 分钟后自动重新上锁防窥屏，解锁弹窗支持 `Esc`、焦点锁定与点击遮罩快捷关闭；
  - 加密生成功能已剥离至独立离线页面 `crypto-tool.html`，保障主站零负担运行。
- 💬 **双路独立一言（Hitokoto）系统**：
  - **侧边栏副标题**：支持在 `links.json` 自定义固定文本；留空 `""` 时默认调用短句一言（默认 `maxLength: 12`），契合窄侧栏不折行；
  - **搜索框下方**：独立请求完整一言名言（默认不限字数），两处互不重复、各自点击独立刷新，并内置离线优雅降级。
- 🔍 **多引擎聚合 + 即时本地模糊搜索**：
  - 内置 **Google、Bing、GitHub、B站、Z-Library** 5 大搜索引擎，自动记住上次选择；
  - 输入关键词秒级过滤全部分类书签卡片，空分类自动隐藏；无匹配时提供回车直达当前搜索引擎的空状态引导；
  - 全局快捷键：按 `/` 或 `Cmd/Ctrl + K` 瞬间聚焦搜索框，按 `Esc` 快速清空并失焦。
- 🧭 **侧边栏收缩、精准滚动跟随与移动端适配**：
  - 桌面端支持收起为 68px 迷你图标栏并记住状态，采用 `requestAnimationFrame` 节流滚动跟随（ScrollSpy）与点击平滑定位；
  - 移动端支持抽屉式菜单、顶栏主题切换、PWA（`manifest.json` + `sw.js` 离线缓存）添加到主屏幕。
- ⚡ **极致静态性能**：
  - 预编译精简静态 `tailwind.min.css`（约 29 KB），无浏览器端运行时 CSS 编译脚本；
  - 书签图标开启 `loading="lazy"` 懒加载与异步解码，图标加载失败自动降级为确定性多彩渐变首字母徽标；卡片悬停支持一键复制网址。

---

## 📁 目录结构

```text
glass-nav/
├── index.html            # 主页面（毛玻璃 Bento 布局与零闪烁主题初始化）
├── crypto-tool.html      # 独立离线加密生成器页面（站长专用）
├── links.json            # 站点配置、一言参数、搜索引擎、书签与加密密文
├── manifest.json         # PWA 添加到主屏幕配置清单
├── sw.js                 # PWA Service Worker 离线缓存脚本
├── package.json          # Tailwind CSS 重编译与本地维护脚本（非运行时依赖）
├── scripts/
│   ├── encrypt-vault.js  # 离线命令行加密辅助脚本
│   ├── validate-links.js # links.json 结构与链接安全性校验脚本
│   ├── tailwind.config.js# Tailwind CSS 扫描与暗色模式配置
│   └── tailwind.input.css# Tailwind CSS 编译入口
└── assets/
    ├── css/
    │   ├── tailwind.min.css # 预编译静态 Tailwind CSS
    │   └── style.css        # 毛玻璃质感、主题变量、侧栏收起与高亮样式
    ├── images/
    │   ├── favicon.jpg      # 站点图标与个人主页书签图标
    │   ├── icon-192.png     # PWA 192x192 图标
    │   └── icon-512.png     # PWA 512x512 图标
    └── js/
        ├── crypto-vault.js  # 共享 Web Crypto AES-256-GCM 加解密模块
        └── app.js           # 核心逻辑：搜索、双路一言、滚动跟随、局部刷新
```

---

## 🛠️ 如何配置与维护

### 1. 修改站点信息、副标题与双路一言
打开 `links.json` 顶部的 `site` 节点即可按需调整：
```json
"site": {
  "title": "个人导航",
  "subtitle": "",
  "hitokoto": {
    "sidebar": {
      "maxLength": 12,
      "types": ["d", "i", "k"]
    },
    "hero": {
      "maxLength": null,
      "types": []
    }
  },
  "footerText": "© 2026 loverorien",
  "author": "Emma"
}
```
- **`subtitle`**：填写任意文字（如 `"探索数字世界"`）将固定显示该副标题；留空 `""` 则启用侧边栏一言。
- **`hitokoto.sidebar` / `hitokoto.hero`**：分别控制侧边栏与搜索框下方一言的 `maxLength`（最大字数，`null` 为不限制）和 `types` 句子分类（`d` 文学、`i` 诗词、`k` 哲学、`a` 动画、`b` 漫画、`c` 游戏、`e` 原创、`h` 影视、`j` 网易云等，空数组 `[]` 表示全部分类）。

### 2. 修改普通书签与分类
打开 `links.json`，在 `categories` 数组中直接增加或修改分类与书签对象即可：
```json
{
  "title": "网站名称",
  "url": "https://example.com",
  "description": "网站简介描述",
  "icon": "图标路径或URL（留空则自动生成首字母彩色徽标）"
}
```

### 3. 更新或更换私密分类与密码
您有两种简单方式来加密并更新 `links.json` 中的 `encryptedVault.crypto`：

#### 方式 A：使用独立离线工具页 `crypto-tool.html`（推荐）
1. 在浏览器中直接打开本地或已部署的 `crypto-tool.html`（纯本地计算，不会卡顿主站）；
2. 输入您自设的解锁密码，在下方填写或一键格式化私密书签 JSON 数组；
3. 点击 **「一键计算生成加密密文 (AES-256-GCM)」**；
4. 点击 **「整段复制结果」**，将生成的 `"crypto": { ... }` 整段替换掉 `links.json` 中的 `"crypto": { ... }` 节点即可。

#### 方式 B：通过命令行运行加密脚本
在终端中执行：
```bash
node scripts/encrypt-vault.js "您的自定义密码"
```
终端将自动打印出带有 `"crypto": { ... }` 的完整节点，直接复制整段替换至 `links.json` 即可。

---

## 🌐 部署指南

本项目为纯静态零构建项目（无 `node_modules` 打包步骤）：

- **Cloudflare Pages / Vercel**：连接 GitHub 仓库，Build Command 留空，Output Directory 填 `.` 或根目录即可秒级部署。
- **GitHub Pages**：进入仓库 `Settings` -> `Pages` -> `Source` 选择 `main` 分支根目录保存即可。
- **Nginx / 虚拟主机**：将目录内的全部文件直接上传至网站根目录即可。
