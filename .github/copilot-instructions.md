## 快速背景（供 AI 代理）

这是一个“纯前端”的移动 Web 原型仓库（静态 HTML/CSS/JS）。没有后端服务：页面通过相对路径互相引用并由 `assets/scripts.js` 提供多数交互逻辑。主要目标是为农饮水运维场景提供原型交互与展示。

## 关键结构（大图）

- 页面：顶层为多个独立静态页面（例如 `登录.html`, `index.html`, `home/`, `monitor/`, `operation/` 等）。
- 公共资源：`assets/` 包含 `scripts.js`（页面行为与全局函数）、样式文件和第三方 libs（`assets/libs/`）。
- 组件：`components/` 放置可复用的片段（例如 `tab-bar.html`, `bottom-nav.html`），直接以 HTML 片段方式引入到页面。
- 文档：项目说明在根 `README.md`，样式/开发约定在 `.clinerules/project-development-guidelines.md`。

为什么重要：任何功能改动通常需要同时调整对应 HTML（结构/类名）、CSS 类与 `assets/scripts.js` 中的交互函数（例如 `showPage`, `activateTab`）。

## 明确的约定与模式（可直接遵循）

- 页面切换与 ID 约定：`assets/scripts.js` 使用页面 id（例如 `home-page`）和函数 `showPage(pageId)` 管理可见性。添加新页面时，保持对应 DOM id 与脚本调用一致。
- 导航：底部导航组件使用 `components/tab-bar.html` 的 `ios-nav-item` / `data-page` 属性进行映射；脚本通过 `data-page` 值决定跳转（请参见 `handleNavClick` 中的 switch 映射）。若新增路由/页面，请同时更新该 switch 映射或相应跳转逻辑。
- 样式类：项目里常见交互隐藏/显示用 `.hidden`；导航项活跃用 `.active`（`tab-item` / `ios-nav-item`）。保持这些类的语义一致可让全局脚本正确工作。
- 图标库：项目统一使用 Bootstrap Icons / Font Awesome（见 `assets/libs/`），新增图标请复用已有库，不要引入不必要的外部图标包。
- 资源引用：全部使用相对路径。不要改变文件层级；若必须移动文件，请同步更新所有引用。

## 常见改动示例（如何安全修改）

- 新建页面 `monitor/new-page.html`：
  1. 在页面中使用与脚本一致的容器 id（例如 `<div id="new-page" class="hidden">`）。
  2. 若该页面应可由底部导航访问，编辑 `components/tab-bar.html`，添加对应 `ios-nav-item` 并在 `handleNavClick` 中加入跳转分支或将跳转逻辑改为基于文件名的映射。
  3. 如涉及行为（列表/筛选/表单），将交互代码放入 `assets/scripts.js`（或以小模块形式引入并在 DOMContentLoaded 注册）。

## 调试与本地验证步骤

1. 运行方式：无需构建，直接在浏览器中打开 `登录.html`（或 `index.html`）进行手动检查。移动视图可用浏览器的响应式模拟器测试。  
2. 控制台：检查开发者控制台（Console）是否存在脚本错误（常见因类名变更或 id 不匹配造成）。  
3. 资源路径：若页面静态资源加载失败，优先检查相对路径与文件是否存在（常见移动文件后忘记更新引用）。

## 代码风格与约束（从项目规则中提炼）

- 采用原生 DOM API（避免引入大型框架）。  
- 保持响应式设计和 iOS 风格的视觉一致性（参见 `components/tab-bar.html` 的样式约定）。  
- 尽量复用 `assets/scripts.js` 中已有函数（`showPage`, `goBack`, `activateTab`, `initReportSwitching` 等），新增函数时保持全局命名不会与现有函数冲突。

## 重要文件参考（快速跳转）

- 项目总览：`README.md`  
- 开发约定：`.clinerules/project-development-guidelines.md`  
- 全局脚本：`assets/scripts.js`  
- 组件示例：`components/tab-bar.html`、`components/bottom-nav.html`  
- 监控与告警页面集合：`monitor/`（包含多页面示例与样式模式）

## 合并策略（如果该文件已存在）

1. 保留已有条目（高优先级信息），在不冲突处插入新的“关键结构”和“约定”段落。  
2. 若仓库已有本地风格或 agent 指令（例如自定义 AGENT.md），提取其中的明确规则并保持引用（不要覆写作者声明性的文本）。

## 最后 — 需要你确认的点

- 是否希望我把更多 UI/样式细节（如具体 CSS 变量、常用 class 列表）加入到该文件？  
- 是否存在私有的运行/测试脚本（CI 或本地工具）没有包含在仓库根目录？若有，请指示其路径以便补充运行与调试部分。

请审阅该草稿并指出需补充或删除的部分，我会据此迭代更新。
