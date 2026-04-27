# Pencil `.pen` 转前端代码 Skill

## 1. 这个 skill 是做什么的

这个 skill 用于把 `Pencil` 的 `.pen` 文件转成更适合前端落地的输入，帮助 AI 先完成设计语义整理、组件映射和页面拆分，再进入代码生成。

它适合这些场景：

- 用户提供 `.pen` 文件，希望生成前端页面或组件
- 用户希望把 `Pencil` 设计结构映射到现有 React 组件库
- 用户需要 AI 先做设计节点分析，再生成可维护代码
- 用户希望避免 AI 直接根据设计结果生成大量匿名 `div`

## 2. 核心理念

`.pen` 最适合拿来生成“组件树和布局骨架”，不适合单独作为最终业务代码输入。更稳的做法是：

- `.pen` 提供设计结构
- 项目源码提供组件约束
- AI 负责做映射、拆分和组装

## 3. 核心原则

### 3.1 先做语义化设计，再做代码生成

如果 `.pen` 里只有视觉信息，AI 很容易生成一堆 `div`；如果有明确的节点命名、层级和上下文，AI 才能更稳定地映射到业务组件。

优先保留的信息包括：

- 节点 `name`
- 层级结构
- `context`
- 文本内容
- 图标名

### 3.2 优先使用布局语义，不要依赖绝对定位

对 AI 最友好的设计输入是：

- `layout`
- `gap`
- `padding`
- `alignItems`
- `justifyContent`

而不是：

- `x`
- `y`
- `top`
- `left`

### 3.3 先映射到现有组件库，再生成页面

如果项目已经有 `Button`、`Table`、`Form`、`Layout`、`RemoteSelect`、`Empty`、`Pagination` 等组件，应该先让 AI 判断：

- 哪些设计节点对应现有组件
- 哪些只是容器
- 哪些才需要新建组件

### 3.4 大页面拆块生成，不要一次生成整个 `.pen`

像大型页面设计，优先这样处理：

1. 先只提取目标 `frame`
2. 再拆成 `Header`、`Sidebar`、`FilterBar`、`TableArea`、`Modal`
3. 逐块分析和生成
4. 最后再组装页面

### 3.5 明确输出约束，比设计稿本身更重要

给 AI 的约束至少要包括：

- 技术栈：`React + TypeScript`
- 样式方案：`CSS Modules` / `Tailwind` / `styled-components` / `less`
- 组件库：`Ant Design` 或内部组件
- 路由、请求、状态管理约定
- 文件落点：页面、子组件、hooks、types 分别放哪里
- 是否允许新建基础组件

### 3.6 颜色、间距、字号优先映射 token

最佳做法不是让 AI 在代码里到处散落具体值，而是要求它：

- 优先复用现有 design token
- 没有 token 再退回具体值
- 不要凭空发明新的 token 名称

### 3.7 先产出映射分析，再产出代码

推荐拆成两步：

1. 先输出组件映射、拆分方案、数据流和交互假设
2. 确认后再生成代码

## 4. 推荐工作流

### 4.1 预处理 `.pen`

不要直接喂原始大文件，先抽出当前页面的核心结构，重点保留：

- `type`
- `name`
- `context`
- `layout`
- `gap`
- `padding`
- `alignItems`
- `justifyContent`
- `fill`
- `stroke`
- `cornerRadius`
- 文本内容
- 图标名

弱化或移除：

- 纯坐标信息
- 与布局无关的噪声字段
- 不重要的装饰节点

### 4.2 让 AI 先做“设计节点 -> 项目组件”映射

例如：

- `顶部栏` -> `PageHeader`
- `侧边导航-展开` -> `SideNav`
- `menu_sub` -> `NavItem`
- 筛选区 -> `Form + RemoteSelect + Button`
- 表格区 -> `Table + Empty / Pagination`

### 4.3 先生成页面骨架

先让 AI 输出：

- 页面组件结构
- 子组件拆分
- mock 数据接口
- props 设计

### 4.4 再生成可落地代码

要求 AI：

- 优先复用现有组件
- 不要发明新的基础样式体系
- 样式只做必要补足
- 交互逻辑和展示逻辑分离

### 4.5 最后做一次对照审查

让 AI 检查：

- 是否有重复封装
- 是否绕开了现有组件
- 是否把设计稿中的展示文本写死
- 是否缺少 `loading` / `empty` / `error` 态
- 是否考虑响应式和滚动区域

## 5. 参考材料

- `SKILL.md`：供 agent 自动触发和执行的主说明
- `references/prompt-template.md`：可直接复用的提示词模板
