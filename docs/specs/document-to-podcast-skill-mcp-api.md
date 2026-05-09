# Document To Podcast Skill + MCP/API

## Context Sources
- 当前对话中已明确目标：生成一套可运行的 `Skill + MCP/API` 方案，并继续落成项目骨架
- 仓库现状：存在项目级 `.cursor/skills/` 与 `docs/specs/`；当前仓库下无自定义 `mcps/` 描述文件
- 根目录 `package.json` 使用 Yarn workspace，范围为 `apps/*` 与 `packages/*`

## Goal
在仓库内落一套可开工的“文档转播客”工程骨架，包括：

1. 项目级 Cursor Skill
2. MCP tool descriptors
3. Node API 服务骨架
4. Node MCP 服务骨架
5. 共享接口与类型定义

## In Scope
- 新建项目级 Skill：`document-to-podcast`
- 新建 spec 文档，记录架构、接口和实施计划
- 新建 MCP descriptor 目录与 6 个核心工具的 JSON 描述
- 新建 `apps/document-to-podcast-api` 骨架
- 新建 `apps/document-to-podcast-mcp` 骨架
- 在骨架中定义核心 DTO、状态机、结果模型与工具输入输出类型

## Out of Scope
- 不接入真实 LLM、TTS、存储、队列、数据库
- 不实现真实 PDF/URL 解析
- 不接入真实 MCP runtime 或发布配置
- 不跑通完整音频生成链路
- 不新增第三方依赖安装

---

## Research Findings

### 一、仓库落点
- 适合放文档与方案的路径：`docs/specs/`
- 适合放项目级 Skill 的路径：`.cursor/skills/<skill-name>/`
- 适合放 Node 服务骨架的路径：`apps/*`
- 当前仓库没有自定义 `mcps/` 描述文件，可直接建立新的 server descriptor 目录

### 二、推荐骨架结构

```text
docs/specs/document-to-podcast-skill-mcp-api.md
.cursor/skills/document-to-podcast/SKILL.md
.cursor/skills/document-to-podcast/reference.md
mcps/document-to-podcast/tools/create-podcast-job.json
mcps/document-to-podcast/tools/get-podcast-job.json
mcps/document-to-podcast/tools/get-podcast-result.json
mcps/document-to-podcast/tools/list-podcast-jobs.json
mcps/document-to-podcast/tools/cancel-podcast-job.json
mcps/document-to-podcast/tools/preview-podcast-plan.json
apps/document-to-podcast-api/package.json
apps/document-to-podcast-api/tsconfig.json
apps/document-to-podcast-api/src/index.ts
apps/document-to-podcast-api/src/contracts/podcast.ts
apps/document-to-podcast-api/src/contracts/http.ts
apps/document-to-podcast-api/src/modules/podcast/service.ts
apps/document-to-podcast-mcp/package.json
apps/document-to-podcast-mcp/tsconfig.json
apps/document-to-podcast-mcp/src/index.ts
apps/document-to-podcast-mcp/src/contracts.ts
apps/document-to-podcast-mcp/src/tool-handlers.ts
```

### 三、接口范围
- MCP 工具总数：6
- 后端 HTTP API 总数：5
- 核心对象：
  - `PodcastSource`
  - `PodcastConfig`
  - `PodcastJob`
  - `PodcastResult`
  - `PodcastPlanPreview`

### 四、状态机
- 任务状态：
  - `queued`
  - `processing`
  - `succeeded`
  - `failed`
  - `cancelled`
- 处理阶段：
  - `ingesting`
  - `extracting`
  - `planning`
  - `script_generating`
  - `tts_rendering`
  - `audio_merging`
  - `uploading`
  - `done`

---

## Open Questions
- 是否后续要把这两个新 `apps` 纳入真实 workspace 构建与发布流程
- 是否要在下一轮补 OpenAPI 文档与示例请求
- 是否要继续生成可直接运行的最小 mock server

---

## Iteration 2 Goal
将当前骨架升级为“可联调的 mock 流程”：

1. 创建任务后可自动模拟状态推进
2. 任务完成后可返回 mock 音频与文稿结果
3. 任务列表、状态查询、结果查询保持一致
4. MCP bridge 与新的 API 返回保持兼容

## Iteration 2 In Scope
- 更新 `apps/document-to-podcast-api/src/modules/podcast/service.ts`
- 更新 `apps/document-to-podcast-api/src/index.ts`
- 按需更新 `apps/document-to-podcast-api/src/contracts/http.ts`
- 按需更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 按需更新 `apps/document-to-podcast-mcp/src/tool-handlers.ts`

## Iteration 2 Out of Scope
- 仍不接入真实数据库、队列、LLM、TTS、对象存储
- 仍不安装第三方依赖
- 不新增新的 MCP tool descriptor

---

## Plan

### File Changes

#### 1. 新建 spec
- `docs/specs/document-to-podcast-skill-mcp-api.md`
  - 记录目标、范围、接口、文件清单、执行顺序

#### 2. 新建 Skill
- `.cursor/skills/document-to-podcast/SKILL.md`
  - 定义触发词、默认参数、交互规则、MCP 调用时机
- `.cursor/skills/document-to-podcast/reference.md`
  - 记录工具说明、默认值、状态反馈模板

#### 3. 新建 MCP descriptors
- `mcps/document-to-podcast/tools/create-podcast-job.json`
- `mcps/document-to-podcast/tools/get-podcast-job.json`
- `mcps/document-to-podcast/tools/get-podcast-result.json`
- `mcps/document-to-podcast/tools/list-podcast-jobs.json`
- `mcps/document-to-podcast/tools/cancel-podcast-job.json`
- `mcps/document-to-podcast/tools/preview-podcast-plan.json`

#### 4. 新建 API 服务骨架
- `apps/document-to-podcast-api/package.json`
- `apps/document-to-podcast-api/tsconfig.json`
- `apps/document-to-podcast-api/src/index.ts`
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/contracts/http.ts`
- `apps/document-to-podcast-api/src/modules/podcast/service.ts`

#### 5. 新建 MCP 服务骨架
- `apps/document-to-podcast-mcp/package.json`
- `apps/document-to-podcast-mcp/tsconfig.json`
- `apps/document-to-podcast-mcp/src/index.ts`
- `apps/document-to-podcast-mcp/src/contracts.ts`
- `apps/document-to-podcast-mcp/src/tool-handlers.ts`

### Signatures

#### MCP tool names
- `create_podcast_job(input)`
- `get_podcast_job(input)`
- `get_podcast_result(input)`
- `list_podcast_jobs(input)`
- `cancel_podcast_job(input)`
- `preview_podcast_plan(input)`

#### HTTP endpoints
- `POST /api/podcast-jobs`
- `GET /api/podcast-jobs/:jobId`
- `GET /api/podcast-jobs/:jobId/result`
- `GET /api/podcast-jobs`
- `POST /api/podcast-jobs/:jobId/cancel`

### Checklist
- [x] 落盘首版 spec
- [x] 创建 `document-to-podcast` Skill
- [x] 创建 `mcps/document-to-podcast/tools/*.json`
- [x] 创建 `apps/document-to-podcast-api` 骨架
- [x] 创建 `apps/document-to-podcast-mcp` 骨架
- [x] 自检关键文件结构与命名

---

## Risks
- 当前仅创建骨架，不安装依赖，后续若要真正运行仍需补 runtime 和 package manager 步骤
- `mcps/` 目录是本仓库内自定义约定，后续若要接入 Cursor 真实 MCP，需要额外做 server 注册
- 若后续决定复用现有外部服务，接口字段可能需要再次收敛

## Execute Log

### 已创建文件
- `.cursor/skills/document-to-podcast/SKILL.md`
- `.cursor/skills/document-to-podcast/reference.md`
- `mcps/document-to-podcast/tools/create-podcast-job.json`
- `mcps/document-to-podcast/tools/get-podcast-job.json`
- `mcps/document-to-podcast/tools/get-podcast-result.json`
- `mcps/document-to-podcast/tools/list-podcast-jobs.json`
- `mcps/document-to-podcast/tools/cancel-podcast-job.json`
- `mcps/document-to-podcast/tools/preview-podcast-plan.json`
- `apps/document-to-podcast-api/package.json`
- `apps/document-to-podcast-api/tsconfig.json`
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/contracts/http.ts`
- `apps/document-to-podcast-api/src/modules/podcast/service.ts`
- `apps/document-to-podcast-api/src/index.ts`
- `apps/document-to-podcast-mcp/package.json`
- `apps/document-to-podcast-mcp/tsconfig.json`
- `apps/document-to-podcast-mcp/src/contracts.ts`
- `apps/document-to-podcast-mcp/src/tool-handlers.ts`
- `apps/document-to-podcast-mcp/src/index.ts`

### 实现说明
- Skill 层已定义触发词、默认参数、任务创建/查询/取消流程
- MCP descriptor 已覆盖 6 个核心工具
- API 骨架已提供 5 个 HTTP endpoint 的最小路由形态与内存态 `PodcastService`
- MCP 骨架已提供 API bridge 形式的工具处理器与统一 `invokeTool()` 入口

## Validation

### 静态检查
- 已读取关键文件进行人工自检
- `ReadLints` 检查以下路径，未发现新增问题：
  - `.cursor/skills/document-to-podcast`
  - `apps/document-to-podcast-api`
  - `apps/document-to-podcast-mcp`

### 当前限制
- 尚未安装依赖或执行 `tsc`
- 仍为 mock skeleton，未接入真实 MCP runtime、数据库、队列、TTS、LLM 与对象存储

## Next Action
建议下一轮从以下 3 项中选 1 项继续：

1. 为 API 补 `OpenAPI` 文档与示例请求
2. 为 API 与 MCP 增加真正可运行的 mock data 流程
3. 接入真实 MCP server runtime 与本地调试入口

---

## Iteration 2 Plan

### File Changes

#### 1. 强化 `PodcastService`
- 增加内存态 mock lifecycle
- 为新任务分配阶段推进时间线
- 让 `getJob()` 时按时间推进到：
  - `queued`
  - `processing`
  - `succeeded`
- 在完成态自动注入 mock `result`

#### 2. 强化 API 返回
- 在 `src/index.ts` 中保持现有 endpoint 不变
- 补强错误响应与状态流转一致性
- 保证 `cancel` 后不会再继续推进

#### 3. 收敛类型定义
- 在 `contracts/podcast.ts` 中补充 transcript 或 mock metadata 字段（如需要）
- 在 `contracts/http.ts` 中保证 result/preview/list 的结构明确

#### 4. 调整 MCP bridge
- 让 `tool-handlers.ts` 对新的 mock API 结果结构保持兼容
- 继续保持 snake_case -> camelCase 的 config 转换

### Checklist
- [x] 设计 mock 生命周期与阶段推进规则
- [x] 实现 API service 的自动状态推进
- [x] 实现完成态 mock result 生成
- [x] 确认取消后的状态冻结
- [x] 适配 MCP bridge
- [x] 自检并更新 spec

### Risks
- 如果把状态推进做成“查询时推进”，不同查询频率会影响用户看到的进度节奏
- 如果 mock result 结构后续与真实后端差异过大，未来接真实服务时仍需再收敛

### Approval Status
`Iteration 2 Execute 完成，等待下一轮决策`

## Iteration 2 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/modules/podcast/service.ts`
- `apps/document-to-podcast-api/src/index.ts`
- `apps/document-to-podcast-mcp/src/tool-handlers.ts`

### 具体改动
- 在 `PodcastService` 中增加内存态 `MockPodcastJobRecord`
- 引入固定时间线 `MOCK_TIMELINE`，让任务随查询自然推进为：
  - `queued`
  - `processing`
  - `succeeded`
- 任务完成后自动生成 mock `audio` 与 `transcript` 链接
- `cancelJob()` 现在会冻结任务，避免后续继续推进
- `previewPlan()` 按 `format` 和 `focus` 生成更贴近配置的预览提纲
- `GET /api/podcast-jobs/:jobId/result` 在任务存在但结果未完成时返回 `409`
- MCP bridge 的错误处理会解析 JSON 响应体，向上抛出更完整的错误细节

## Iteration 2 Validation

### 静态检查
- `ReadLints` 已检查以下文件，未发现新增问题：
  - `apps/document-to-podcast-api/src/index.ts`
  - `apps/document-to-podcast-api/src/modules/podcast/service.ts`
  - `apps/document-to-podcast-mcp/src/tool-handlers.ts`

### 当前能力
- 现在可以 mock 出“创建任务 -> 查询进度 -> 完成拿结果”的基本联调链路
- mock 生命周期由查询时驱动，不依赖定时器或后台 worker

### 当前限制
- 任务推进是基于查询时间推导，不代表真实异步执行模型
- 结果仍为 mock URL，不会落真实文件
- 还没有接入真实 MCP runtime，也没有补启动说明与端到端示例

---

## Iteration 3 Goal
将 `apps/document-to-podcast-mcp` 从“工具调用桥接层骨架”升级为“可注册、可本地调试的最小 MCP stdio server”：

1. 提供最小 `initialize`
2. 提供 `tools/list`
3. 提供 `tools/call`
4. 复用已有 `tool-handlers.ts`
5. 提供本地调试与手工验证入口

## Iteration 3 Research Findings

### 一、当前仓库依赖现状
- 仓库中未检索到 `@modelcontextprotocol/sdk`
- 也未检索到现成的 `McpServer`、`ServerStdioTransport` 或 MCP runtime 封装
- 因此本轮不依赖第三方 SDK，优先采用原生 Node `stdin/stdout` 实现最小 JSON-RPC / MCP 兼容层

### 二、推荐实现边界
- 支持最小方法集：
  - `initialize`
  - `notifications/initialized`
  - `tools/list`
  - `tools/call`
- 先不实现：
  - resources
  - prompts
  - sampling
  - roots
  - logging extensions

## Iteration 3 In Scope
- 更新 `apps/document-to-podcast-mcp/src/index.ts`
- 视需要新增 `apps/document-to-podcast-mcp/src/protocol.ts`
- 视需要新增 `apps/document-to-podcast-mcp/src/tool-registry.ts`
- 更新 `apps/document-to-podcast-mcp/package.json` 中的脚本
- 补本地调试说明文件

## Iteration 3 Out of Scope
- 不安装第三方 MCP SDK
- 不新增真实 Cursor MCP 注册配置
- 不接入认证、resources、prompts
- 不处理并发、取消、streaming 等高级协议能力

## Iteration 3 Plan

### File Changes

#### 1. 实现最小 stdio 协议层
- 在 `apps/document-to-podcast-mcp/src/index.ts` 中处理 stdin 输入与 stdout 输出
- 支持按行读取 JSON 消息
- 解析 `id`、`method`、`params`
- 回写 JSON-RPC 风格响应

#### 2. 实现 MCP 方法分发
- `initialize`：返回 server info 与 capabilities
- `tools/list`：返回 6 个工具定义
- `tools/call`：将调用路由到现有 `tool-handlers.ts`
- `notifications/initialized`：忽略但不报错

#### 3. 工具注册表
- 将工具元信息集中建模，避免 `mcps/document-to-podcast/tools/*.json` 与运行时代码完全脱钩
- 若必要，创建 `tool-registry.ts` 统一维护：
  - tool name
  - description
  - input schema

#### 4. 本地调试入口
- 在 `package.json` 增加更明确的脚本名，如 `start` / `dev`
- 新增最小 README 或调试说明，告诉后续如何：
  - 启动 API mock server
  - 启动 MCP stdio server
  - 手工发送 `initialize` / `tools/list` / `tools/call`

### Checklist
- [x] 设计最小 MCP 消息结构
- [x] 实现 stdio 消息读取与响应
- [x] 实现 `initialize`
- [x] 实现 `tools/list`
- [x] 实现 `tools/call`
- [x] 补本地调试说明
- [x] 自检并更新 spec

### Risks
- 手写最小 MCP runtime 只能覆盖基础联调，未必完整匹配所有客户端细节
- 如果后续改为官方 SDK，`index.ts` 可能需要再次重构

### Approval Status
`Iteration 3 Execute 完成，等待下一轮决策`

## Iteration 3 Execute Log

### 已更新文件
- `apps/document-to-podcast-mcp/src/index.ts`
- `apps/document-to-podcast-mcp/src/protocol.ts`
- `apps/document-to-podcast-mcp/src/tool-registry.ts`
- `apps/document-to-podcast-mcp/package.json`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- 将 `document-to-podcast-mcp` 从打印工具名的骨架升级为最小 stdio MCP server
- 使用 `Content-Length` framing 实现 `stdin/stdout` 消息收发
- 支持最小方法集：
  - `initialize`
  - `notifications/initialized`
  - `tools/list`
  - `tools/call`
- 将工具元信息集中收口到 `tool-registry.ts`
- `tools/call` 复用既有 `tool-handlers.ts` 调用 API mock server
- 为本地联调补充 `README.md`
- 在 `package.json` 中增加 `start` 脚本

## Iteration 3 Validation

### 静态检查
- `ReadLints` 已检查以下文件，未发现新增问题：
  - `apps/document-to-podcast-mcp/src/index.ts`
  - `apps/document-to-podcast-mcp/src/protocol.ts`
  - `apps/document-to-podcast-mcp/src/tool-registry.ts`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- 当前已具备“最小可注册 MCP server”的核心形态
- 可通过 stdio 接收 MCP 请求并返回工具列表与工具调用结果
- 可复用前一轮已完成的 API mock 生命周期

### 当前限制
- 仍未接官方 MCP SDK
- 仅实现基础方法，不含 resources、prompts、sampling 等扩展能力
- 尚未补 Cursor 侧真实注册配置文件

---

## Iteration 4 Goal
补齐“Cursor 侧本地注册 + 启动联调”这最后一段，让当前仓库内的 `document-to-podcast-api` 和 `document-to-podcast-mcp` 更接近真实可接入状态：

1. 提供可直接参考的 `~/.cursor/mcp.json` 注册模板
2. 补充本地启动顺序与命令
3. 视情况补项目内脚本，减少手工启动成本
4. 让后续把该 MCP 接入 Cursor 的路径清晰可执行

## Iteration 4 Research Findings

### 一、用户本机真实 MCP 配置形态
从 `~/.cursor/mcp.json` 可确认当前环境主要使用：

- 顶层字段：`mcpServers`
- 常见注册方式：`stdio`
- 关键字段：
  - `type`
  - `command`
  - `args`
  - `env`

示例形态已确认类似：

```json
{
  "mcpServers": {
    "some-server": {
      "type": "stdio",
      "command": "/path/to/npm-or-node",
      "args": ["..."],
      "env": {}
    }
  }
}
```

### 二、推荐本轮边界
- 不直接修改用户真实的 `~/.cursor/mcp.json`
- 在仓库内提供：
  - 模板文件
  - 启动说明
  - 可复用脚本
- 由用户自行决定是否把模板合并进真实 Cursor 配置

## Iteration 4 In Scope
- 更新 `apps/document-to-podcast-mcp/README.md`
- 视需要新增 `apps/document-to-podcast-mcp/cursor.mcp.example.json`
- 视需要更新根目录 `package.json`，补便捷脚本
- 视需要新增 `scripts/document-to-podcast/*.sh` 或 `.js` 辅助脚本

## Iteration 4 Out of Scope
- 不直接写入 `~/.cursor/mcp.json`
- 不自动启动长期进程
- 不接入 PM2、Docker、system service 等守护方案
- 不安装额外依赖

## Iteration 4 Plan

### File Changes

#### 1. 提供 Cursor 注册模板
- 新增示例文件，内容贴近当前用户机器上的 `mcpServers` 结构
- 模板中包含：
  - server name
  - `type: "stdio"`
  - `command`
  - `args`
  - `env.DOCUMENT_TO_PODCAST_API_URL`

#### 2. 补本地启动说明
- 在 `README.md` 中说明：
  - 先构建 API
  - 再构建 MCP
  - 先启动 API
  - 再由 Cursor 通过 `mcp.json` 拉起 MCP

#### 3. 增加便捷脚本
- 如有必要，在根目录 `package.json` 加：
  - `run:document-to-podcast-api`
  - `run:document-to-podcast-mcp`
- 目标是让本地调试命令更短

#### 4. 可选辅助脚本
- 若纯 README 不够清晰，可新增简单脚本，输出：
  - 本地示例 `mcpServers` 片段
  - 启动前检查项

### Checklist
- [x] 提供 Cursor `mcpServers` 模板文件
- [x] 更新本地注册说明
- [x] 视需要增加根脚本
- [x] 自检并更新 spec

### Risks
- 不同用户机器的 Node 路径不同，模板仍需按本机路径替换
- 若后续改为官方 SDK 或改用 `npx` 启动，模板命令也要同步调整

### Approval Status
`Iteration 4 Execute 完成，等待下一轮决策`

## Iteration 4 Execute Log

### 已更新文件
- `apps/document-to-podcast-mcp/cursor.mcp.example.json`
- `apps/document-to-podcast-mcp/README.md`
- `apps/document-to-podcast-api/package.json`
- `package.json`

### 具体改动
- 新增 `cursor.mcp.example.json`，提供贴近 `~/.cursor/mcp.json` 的 `mcpServers` 模板
- 在 `README.md` 中补充：
  - 构建顺序
  - 启动 API 的命令
  - 启动 MCP 的命令
  - 如何把模板合并到 `~/.cursor/mcp.json`
  - 在当前机器上的 Node 路径示例
- 给 `document-to-podcast-api` 增加 `start` 脚本
- 在根目录 `package.json` 增加：
  - `run:document-to-podcast-api`
  - `run:document-to-podcast-mcp`
  - `build:document-to-podcast-api`
  - `build:document-to-podcast-mcp`

## Iteration 4 Validation

### 静态检查
- `ReadLints` 已检查以下文件，未发现新增问题：
  - `package.json`
  - `apps/document-to-podcast-api/package.json`
  - `apps/document-to-podcast-mcp/README.md`
  - `apps/document-to-podcast-mcp/cursor.mcp.example.json`

### 当前能力
- 当前仓库内已经具备：
  - Skill
  - MCP descriptors
  - API mock server
  - 最小 stdio MCP server
  - Cursor 本地注册模板
  - 本地构建与运行脚本

### 当前限制
- 仍需用户手动把模板合并到真实 `~/.cursor/mcp.json`
- 仍未执行真实 build / 运行验证
- 仍未接入官方 MCP SDK 与真实音频生成链路

---

## Iteration 5 Goal
把当前 `document-to-podcast-api` 从“纯 mock 生命周期服务”推进到“面向真实实现的可插拔编排层”：

1. 抽离文档解析接口
2. 抽离 LLM 脚本生成接口
3. 抽离 TTS 渲染接口
4. 抽离结果存储接口
5. 保留默认 stub provider，使当前服务无需真实密钥也能继续运行

## Iteration 5 Research Findings

### 一、当前问题
- `PodcastService` 同时承担：
  - 任务状态管理
  - mock 生命周期推进
  - mock result 生成
- 真实文档解析 / LLM / TTS 一旦接入，当前结构会很快失控

### 二、推荐拆层
推荐拆成以下层次：

1. `pipeline`
   - 编排任务状态推进
   - 组合 parser / llm / tts / storage

2. `providers/parser`
   - `DocumentParser`
   - 负责把 file/url/text 统一成可消费文本

3. `providers/llm`
   - `ScriptGenerator`
   - 负责把文档摘要或全文转成结构化播客脚本

4. `providers/tts`
   - `AudioRenderer`
   - 负责把结构化脚本转成音频资源

5. `providers/storage`
   - `ArtifactStorage`
   - 负责保存 transcript / audio 并生成 URL

### 三、实现策略
- 先不接入真实三方 SDK
- 先定义 provider interface 与 stub adapter
- 通过环境变量切换 provider 类型，如：
  - `DOCUMENT_TO_PODCAST_PARSER_PROVIDER=stub`
  - `DOCUMENT_TO_PODCAST_LLM_PROVIDER=stub`
  - `DOCUMENT_TO_PODCAST_TTS_PROVIDER=stub`
  - `DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=stub`
- 先让 pipeline 跑通真实接口形态，但底层仍用 stub 返回假数据

## Iteration 5 In Scope
- 更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 视需要更新 `apps/document-to-podcast-api/src/contracts/http.ts`
- 新增 `apps/document-to-podcast-api/src/providers/parser/*`
- 新增 `apps/document-to-podcast-api/src/providers/llm/*`
- 新增 `apps/document-to-podcast-api/src/providers/tts/*`
- 新增 `apps/document-to-podcast-api/src/providers/storage/*`
- 新增 `apps/document-to-podcast-api/src/pipeline/*`
- 更新 `apps/document-to-podcast-api/src/modules/podcast/service.ts`
- 视需要新增 `apps/document-to-podcast-api/src/config.ts`

## Iteration 5 Out of Scope
- 不安装新的第三方依赖
- 不接真实 OpenAI / Anthropic / Gemini / ElevenLabs / Azure SDK
- 不做真实 PDF/OCR/网页正文抽取
- 不接对象存储
- 不引入数据库或任务队列

## Iteration 5 Plan

### File Changes

#### 1. provider interface
- 新增 parser / llm / tts / storage 四类 provider 的接口定义
- 每类先提供 `stub` 实现

#### 2. pipeline 编排层
- 新增 `generatePodcastArtifacts()` 一类的编排方法
- 顺序大致为：
  - parse sources
  - generate script
  - render audio
  - store artifacts
  - produce `PodcastResult`

#### 3. service 重构
- `PodcastService` 继续保留任务管理职责
- 真实结果生成改为调用 pipeline，而不是直接内联构造 mock result
- 当前时间线 mock 保留，但完成态 result 来源改成 provider pipeline

#### 4. 配置层
- 新增 provider 选择逻辑
- 默认全部走 `stub`
- 为未来接真实 provider 预留 env key

### Checklist
- [x] 设计 parser / llm / tts / storage 接口
- [x] 提供默认 stub provider
- [x] 新增 pipeline 编排层
- [x] 重构 `PodcastService` 接到 pipeline
- [x] 保持现有 HTTP API 兼容
- [x] 自检并更新 spec

### Risks
- 如果接口抽象过早过深，可能导致当前 mock 服务结构变复杂
- 若后续真实 provider 与当前接口差异很大，仍可能需要再次收敛

### Approval Status
`Iteration 5 Execute 完成，等待下一轮决策`

## Iteration 5 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/config.ts`
- `apps/document-to-podcast-api/src/providers/parser/types.ts`
- `apps/document-to-podcast-api/src/providers/parser/stub-parser.ts`
- `apps/document-to-podcast-api/src/providers/parser/index.ts`
- `apps/document-to-podcast-api/src/providers/llm/types.ts`
- `apps/document-to-podcast-api/src/providers/llm/stub-script-generator.ts`
- `apps/document-to-podcast-api/src/providers/llm/index.ts`
- `apps/document-to-podcast-api/src/providers/tts/types.ts`
- `apps/document-to-podcast-api/src/providers/tts/stub-audio-renderer.ts`
- `apps/document-to-podcast-api/src/providers/tts/index.ts`
- `apps/document-to-podcast-api/src/providers/storage/types.ts`
- `apps/document-to-podcast-api/src/providers/storage/stub-artifact-storage.ts`
- `apps/document-to-podcast-api/src/providers/storage/index.ts`
- `apps/document-to-podcast-api/src/pipeline/generate-podcast-artifacts.ts`
- `apps/document-to-podcast-api/src/modules/podcast/service.ts`

### 具体改动
- 新增 `config.ts`，通过环境变量选择 provider，当前默认全部为 `stub`
- 为 parser / llm / tts / storage 四层分别增加 interface 与 stub 实现
- 新增 `generatePodcastArtifacts()` pipeline，按真实实现顺序编排：
  - parse sources
  - generate script
  - render audio
  - store artifacts
- `PodcastResult` 增加：
  - `audio.mimeType`
  - `transcriptContent`
- `PodcastService` 不再内联拼装 mock result，而是在创建任务时启动 artifact pipeline
- 当前时间线 mock 仍然保留，但完成态结果来源已切换到 provider pipeline

## Iteration 5 Validation

### 静态检查
- `ReadLints` 已检查以下路径，未发现新增问题：
  - `apps/document-to-podcast-api/src/config.ts`
  - `apps/document-to-podcast-api/src/providers`
  - `apps/document-to-podcast-api/src/pipeline`
  - `apps/document-to-podcast-api/src/modules/podcast/service.ts`
  - `apps/document-to-podcast-api/src/contracts/podcast.ts`

### 当前能力
- 当前服务已从“纯 mock 结果构造”升级为“可插拔 provider 编排”
- 后续接真实 parser / LLM / TTS / storage 时，优先替换 provider 层即可
- 不改 HTTP API 也能继续往真实实现推进

### 当前限制
- 当前 provider 仍全部为 stub
- 还没有接真实文档抽取、真实脚本生成或真实音频渲染
- 也还没有把 provider 配置暴露到 README 或运行说明里

---

## Iteration 6 Goal
在现有 provider 抽象之上，补上“可替换真实服务”的 HTTP 型 adapter，占位未来的真实接入：

1. 为 LLM 提供 `openai-compatible` HTTP adapter
2. 为 TTS 提供 `http` 型远端 adapter
3. 保持 `stub` 为默认 provider
4. 补运行说明中的 provider 环境变量和最小请求约定

## Iteration 6 Research Findings

### 一、为什么优先做 HTTP adapter
- 当前仓库没有第三方 SDK
- Node 18+ 自带 `fetch`，适合先用 HTTP 方式打通“真实 provider 形态”
- 先做 HTTP adapter，可以在不绑定具体厂商 SDK 的情况下把接口边界稳定下来

### 二、推荐 provider 形态

#### LLM
- provider kind：`openai-compatible`
- 使用环境变量：
  - `DOCUMENT_TO_PODCAST_LLM_PROVIDER=openai-compatible`
  - `DOCUMENT_TO_PODCAST_LLM_BASE_URL`
  - `DOCUMENT_TO_PODCAST_LLM_API_KEY`
  - `DOCUMENT_TO_PODCAST_LLM_MODEL`
- 默认走 chat/completions 风格 JSON 协议

#### TTS
- provider kind：`http`
- 使用环境变量：
  - `DOCUMENT_TO_PODCAST_TTS_PROVIDER=http`
  - `DOCUMENT_TO_PODCAST_TTS_BASE_URL`
  - `DOCUMENT_TO_PODCAST_TTS_API_KEY`
  - `DOCUMENT_TO_PODCAST_TTS_VOICE`
- 先约定返回 JSON metadata，不直接处理二进制音频流

### 三、实现边界
- 本轮只做 adapter 与配置占位
- 若缺少 env，adapter 应明确抛错
- 仍不接真实厂商 SDK
- parser 与 storage 继续保持 stub

## Iteration 6 In Scope
- 更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 更新 `apps/document-to-podcast-api/src/config.ts`
- 更新 `apps/document-to-podcast-api/src/providers/llm/index.ts`
- 新增 `apps/document-to-podcast-api/src/providers/llm/openai-compatible-script-generator.ts`
- 更新 `apps/document-to-podcast-api/src/providers/tts/index.ts`
- 新增 `apps/document-to-podcast-api/src/providers/tts/http-audio-renderer.ts`
- 更新 `apps/document-to-podcast-mcp/README.md`

## Iteration 6 Out of Scope
- 不安装 OpenAI / ElevenLabs / Azure SDK
- 不做真实 parser 与 storage 接入
- 不处理重试、限流、熔断、超时治理
- 不处理音频二进制上传/下载

## Iteration 6 Plan

### File Changes

#### 1. 扩展 provider kind
- 为 `LlmProviderKind` 增加 `openai-compatible`
- 为 `TtsProviderKind` 增加 `http`

#### 2. LLM adapter
- 新增 `openai-compatible-script-generator.ts`
- 输入：
  - parsed documents
  - config
- 输出：
  - `PodcastTranscript`
- 请求方式：
  - `POST {baseUrl}/chat/completions`
  - `Authorization: Bearer <apiKey>`

#### 3. TTS adapter
- 新增 `http-audio-renderer.ts`
- 输入：
  - transcript
  - config
- 输出：
  - duration / mimeType / suggestedFileName
- 请求方式：
  - `POST {baseUrl}`
  - header 带 API key

#### 4. README 配置说明
- 补充 `.env`/环境变量示例
- 说明默认是 `stub`
- 说明切换到真实 provider 的最小配置项

### Checklist
- [x] 扩展 provider kind 与配置读取
- [x] 实现 `openai-compatible` LLM adapter
- [x] 实现 `http` TTS adapter
- [x] 保持 `stub` 默认行为不变
- [x] 更新 README 的 provider 配置说明
- [x] 自检并更新 spec

### Risks
- 不同 openai-compatible 服务返回结构可能存在细微差异
- TTS provider 若真实返回二进制流，本轮约定的 JSON metadata 还需要后续再收敛

### Approval Status
`Iteration 6 Execute 完成，等待下一轮决策`

## Iteration 6 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/config.ts`
- `apps/document-to-podcast-api/tsconfig.json`
- `apps/document-to-podcast-api/src/providers/llm/openai-compatible-script-generator.ts`
- `apps/document-to-podcast-api/src/providers/llm/index.ts`
- `apps/document-to-podcast-api/src/providers/tts/http-audio-renderer.ts`
- `apps/document-to-podcast-api/src/providers/tts/index.ts`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- 为 `LlmProviderKind` 增加 `openai-compatible`
- 为 `TtsProviderKind` 增加 `http`
- `config.ts` 新增以下环境变量读取：
  - `DOCUMENT_TO_PODCAST_LLM_BASE_URL`
  - `DOCUMENT_TO_PODCAST_LLM_API_KEY`
  - `DOCUMENT_TO_PODCAST_LLM_MODEL`
  - `DOCUMENT_TO_PODCAST_TTS_BASE_URL`
  - `DOCUMENT_TO_PODCAST_TTS_API_KEY`
  - `DOCUMENT_TO_PODCAST_TTS_VOICE`
- `tsconfig.json` 增加 `DOM` lib，确保 `fetch` 有类型支持
- 新增 `openai-compatible-script-generator.ts`：
  - 调用 `POST {baseUrl}/chat/completions`
  - 要求返回 JSON 结构的播客脚本
  - 解析为 `PodcastTranscript`
- 新增 `http-audio-renderer.ts`：
  - 调用 `POST {ttsBaseUrl}`
  - 期望远端返回 JSON metadata
  - 产出 `durationSeconds` / `mimeType` / `suggestedFileName`
- `README.md` 已补充 provider 切换说明和环境变量示例

## Iteration 6 Validation

### 静态检查
- `ReadLints` 已检查以下路径，未发现新增问题：
  - `apps/document-to-podcast-api/src/contracts/podcast.ts`
  - `apps/document-to-podcast-api/src/config.ts`
  - `apps/document-to-podcast-api/src/providers/llm`
  - `apps/document-to-podcast-api/src/providers/tts`
  - `apps/document-to-podcast-api/tsconfig.json`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- 当前 LLM provider 已支持：
  - `stub`
  - `openai-compatible`
- 当前 TTS provider 已支持：
  - `stub`
  - `http`
- 保持默认 `stub` 的同时，已经能切换到 HTTP 形态的真实服务占位

### 当前限制
- `openai-compatible` adapter 依赖对方返回可解析的 JSON 文本
- `http` TTS adapter 当前只约定 JSON metadata，不处理音频流与真实文件上传
- parser 与 storage 仍然只有 `stub`

---

## Iteration 7 Goal
为 storage 层补一个真正可落本地文件的 adapter，把当前“纯 URL 占位”推进到“有真实本地产物路径”的形态：

1. 提供 `local-file` storage provider
2. 将 transcript JSON 与 Markdown 落到本地目录
3. 为 audio 至少落一个 metadata 或占位文件
4. 返回 `file://` 或绝对路径风格的本地结果地址

## Iteration 7 Research Findings

### 一、为什么优先做 local-file storage
- 当前 LLM/TTS 已经有 HTTP 形态 adapter，但最终结果仍是 mock URL
- 本地文件落盘能立刻提升“可见性”和“可验证性”
- 不需要对象存储或数据库，就能把结果链路往真实形态推进一大步

### 二、推荐实现边界
- 新 provider kind：`local-file`
- 通过环境变量指定输出目录，例如：
  - `DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=local-file`
  - `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR=/absolute/path/to/output`
- transcript 至少生成：
  - `${jobId}.json`
  - `${jobId}.md`
- audio 先生成：
  - `${jobId}.audio.json` 或 `${jobId}.mp3.placeholder`
- 先不真的写入音频二进制

## Iteration 7 In Scope
- 更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 更新 `apps/document-to-podcast-api/src/config.ts`
- 更新 `apps/document-to-podcast-api/src/providers/storage/index.ts`
- 新增 `apps/document-to-podcast-api/src/providers/storage/local-file-artifact-storage.ts`
- 视需要更新 `apps/document-to-podcast-api/src/providers/storage/types.ts`
- 更新 `apps/document-to-podcast-mcp/README.md`

## Iteration 7 Out of Scope
- 不接对象存储
- 不写真实音频二进制
- 不增加文件清理策略、配额策略、版本归档策略
- 不做跨进程锁或并发写保护

## Iteration 7 Plan

### File Changes

#### 1. 扩展 storage provider kind
- 为 `StorageProviderKind` 增加 `local-file`
- `config.ts` 增加：
  - `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR`

#### 2. local-file adapter
- 新增 `local-file-artifact-storage.ts`
- 负责：
  - 创建输出目录
  - 写 transcript JSON
  - 写 transcript Markdown
  - 写 audio metadata/placeholder

#### 3. 返回值约定
- `StoreArtifactsOutput` 仍保持现有字段
- 但返回值改为本地路径或 `file://` URL

#### 4. README 配置说明
- 补 `local-file` provider 的示例启动命令
- 说明哪些文件会被写到哪里

### Checklist
- [x] 扩展 `StorageProviderKind` 与配置读取
- [x] 实现 `local-file` storage adapter
- [x] 保持 `stub` 默认行为不变
- [x] 更新 README 的 storage 配置说明
- [x] 自检并更新 spec

### Risks
- 本地路径格式在不同操作系统上的表示方式可能不同
- 未来如果要输出真实音频二进制，当前 placeholder 文件命名可能需要调整

### Approval Status
`Iteration 7 Execute 完成，等待下一轮决策`

## Iteration 7 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/config.ts`
- `apps/document-to-podcast-api/src/providers/storage/local-file-artifact-storage.ts`
- `apps/document-to-podcast-api/src/providers/storage/index.ts`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- 为 `StorageProviderKind` 增加 `local-file`
- `config.ts` 新增 `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR`
- 新增 `local-file-artifact-storage.ts`，负责：
  - 创建 `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR/{jobId}/`
  - 写入 `{jobId}.json`
  - 写入 `{jobId}.md`
  - 写入 `{jobId}.audio.json`
- storage 返回值改为 `file://` URL
- `README.md` 已补 `local-file` provider 的启动示例与输出说明

## Iteration 7 Validation

### 静态检查
- `ReadLints` 已检查以下路径，未发现新增问题：
  - `apps/document-to-podcast-api/src/contracts/podcast.ts`
  - `apps/document-to-podcast-api/src/config.ts`
  - `apps/document-to-podcast-api/src/providers/storage`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- storage 当前已支持：
  - `stub`
  - `local-file`
- 现在可以在本地真实落盘 transcript 和 audio metadata placeholder
- 结果链路已经不再局限于纯 mock URL

### 当前限制
- audio 目前仍然只落 metadata/placeholder，不写真实二进制
- 本地文件路径仍需用户自行管理和清理
- parser 仍只有 `stub`

---

## Iteration 8 Goal
为 parser 层补一个“半真实”的 adapter，优先支持 `text` 与 `url` 两类来源：

1. `text` 直通
2. `url` 真实抓取并做基础正文清洗
3. `file` 继续安全降级，不碰 PDF/OCR
4. 补 parser 的环境变量说明

## Iteration 8 Research Findings

### 一、为什么先做 text/url
- 这是最容易落地且不需要额外依赖的一段
- Node 18+ 自带 `fetch`
- 不碰 PDF/OCR，能显著降低复杂度

### 二、推荐 provider 形态
- provider kind：`text-url`
- 可选环境变量：
  - `DOCUMENT_TO_PODCAST_PARSER_PROVIDER=text-url`
  - `DOCUMENT_TO_PODCAST_PARSER_USER_AGENT`

### 三、实现边界
- `text` source：直接使用 `content`
- `url` source：
  - `fetch` HTML
  - 移除 `script/style/noscript`
  - 粗粒度 strip HTML 标签
  - 解码少量常见 HTML entity
- `file` source：保留占位文本，不做真实抽取

## Iteration 8 In Scope
- 更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 更新 `apps/document-to-podcast-api/src/config.ts`
- 新增 `apps/document-to-podcast-api/src/providers/parser/text-url-document-parser.ts`
- 更新 `apps/document-to-podcast-api/src/providers/parser/index.ts`
- 更新 `apps/document-to-podcast-mcp/README.md`

## Iteration 8 Out of Scope
- 不做 PDF / DOCX / OCR 解析
- 不做复杂正文抽取算法
- 不处理 robots / anti-bot / cookie / 登录态页面
- 不做多语言网页正文质量优化

## Iteration 8 Plan

### Checklist
- [x] 扩展 parser provider kind 与配置读取
- [x] 实现 `text-url` parser adapter
- [x] 保持 `stub` 默认行为不变
- [x] 更新 README 的 parser 配置说明
- [x] 自检并更新 spec

### Risks
- 基础 HTML 清洗策略对复杂网页的正文提取质量有限
- 某些站点可能需要额外请求头、cookie 或反爬处理

### Approval Status
`Iteration 8 Execute 完成，等待下一轮决策`

## Iteration 8 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/contracts/podcast.ts`
- `apps/document-to-podcast-api/src/config.ts`
- `apps/document-to-podcast-api/src/providers/parser/text-url-document-parser.ts`
- `apps/document-to-podcast-api/src/providers/parser/index.ts`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- 为 `ParserProviderKind` 增加 `text-url`
- `config.ts` 新增 `DOCUMENT_TO_PODCAST_PARSER_USER_AGENT`
- 新增 `text-url-document-parser.ts`：
  - `text` 直接返回用户内容
  - `url` 使用 `fetch` 抓取网页
  - 进行基础 HTML 清洗和常见 entity 解码
  - `file` 继续返回占位文本
- `parser/index.ts` 已把 `text-url` 接进 provider 工厂
- `README.md` 已补 parser provider 的配置示例与行为说明

## Iteration 8 Validation

### 静态检查
- `ReadLints` 已检查以下路径，未发现新增问题：
  - `apps/document-to-podcast-api/src/contracts/podcast.ts`
  - `apps/document-to-podcast-api/src/config.ts`
  - `apps/document-to-podcast-api/src/providers/parser`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- parser 当前已支持：
  - `stub`
  - `text-url`
- 现在整条链路已经能在 `text` / `url` 输入上走到“真实解析 + LLM/TTS/storage provider 编排”

### 当前限制
- `url` 解析仍是基础清洗，不是专业正文提取
- `file` 仍未接真实解析
- 复杂网页、登录页、反爬页面的结果质量不可保证

---

## Iteration 9 Goal
为 parser 层补“本地文本文件”的真实解析能力，优先覆盖低风险文本文件：

1. 支持 `.txt`
2. 支持 `.md`
3. 支持 `.json`
4. 对其他文件类型明确降级或报错

## Iteration 9 Research Findings

### 一、为什么先做文本文件
- 相比 PDF/OCR，文本文件解析简单且稳定
- 不需要新增外部依赖
- 能让 `file` 输入第一次真正进入“真实解析”路径

### 二、推荐实现边界
- 继续复用现有 `text-url` parser，扩展其 `file` 分支
- 仅支持以下扩展名：
  - `.txt`
  - `.md`
  - `.json`
- 行为约定：
  - `.txt` / `.md`：按 UTF-8 读取原文
  - `.json`：按 UTF-8 读取后做 pretty stringify 或保留文本
  - 其他扩展名：返回明确占位文本或错误说明

## Iteration 9 In Scope
- 更新 `apps/document-to-podcast-api/src/providers/parser/text-url-document-parser.ts`
- 视需要更新 `apps/document-to-podcast-api/src/config.ts`
- 更新 `apps/document-to-podcast-mcp/README.md`

## Iteration 9 Out of Scope
- 不做 PDF / DOCX / OCR
- 不做二进制文件解析
- 不做字符集自动探测
- 不做超大文件分块策略

## Iteration 9 Plan

### Checklist
- [x] 为 `file` source 增加 `.txt/.md/.json` 读取
- [x] 对不支持扩展名给出明确降级说明
- [x] 保持 `text` / `url` 现有能力不退化
- [x] 更新 README 的 file parser 说明
- [x] 自检并更新 spec

### Risks
- 若文件不是 UTF-8，当前读取策略可能出现乱码
- 大 JSON 文件直接全文读取，后续可能需要限长或摘要策略

### Approval Status
`Iteration 9 Execute 完成，等待下一轮决策`

## Iteration 9 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/providers/parser/text-url-document-parser.ts`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- `text-url-document-parser.ts` 的 `file` 分支已支持：
  - `.txt`
  - `.md`
  - `.json`
- `.txt` / `.md`：按 UTF-8 直接读取
- `.json`：优先 `JSON.parse + JSON.stringify(2)`，失败时回退为原始文本
- 其他扩展名：返回明确降级说明，不做二进制文件解析
- `README.md` 已同步更新 file parser 的支持范围与行为说明

## Iteration 9 Validation

### 静态检查
- `ReadLints` 已检查以下文件，未发现新增问题：
  - `apps/document-to-podcast-api/src/providers/parser/text-url-document-parser.ts`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- parser 当前已支持：
  - `stub`
  - `text-url`
- 在 `text-url` 模式下，输入来源已覆盖：
  - `text`
  - `url`
  - `.txt/.md/.json` 文件

### 当前限制
- 仍未支持 PDF / DOCX / OCR
- 文件读取默认按 UTF-8 处理
- 超大 JSON 文件目前没有做裁剪、摘要或分块策略

---

## Iteration 10 Goal
把 `TTS -> storage` 这段从“metadata 占位”推进到“真实音频文件落盘”：

1. 扩展 `RenderAudioOutput`，允许承载音频字节或 base64
2. 让 `http` TTS adapter 支持解析真实音频返回
3. 让 `local-file` storage 写出真实音频文件
4. 保留 metadata 回退路径，避免破坏现有联调

## Iteration 10 Research Findings

### 一、当前问题
- `http-audio-renderer.ts` 只返回：
  - `durationSeconds`
  - `mimeType`
  - `suggestedFileName`
- `local-file-artifact-storage.ts` 只写：
  - transcript JSON
  - transcript Markdown
  - `audio.json`
- 结果链路仍缺少真实音频文件

### 二、推荐实现边界
- 在 `RenderAudioOutput` 中增加可选字段：
  - `audioBase64?: string`
  - `audioBuffer?: Buffer`
- `http` TTS adapter 支持两种响应形态：
  1. JSON metadata + `audioBase64`
  2. 直接返回二进制音频流
- `local-file` storage 优先写真实音频文件；没有字节时再回退到 metadata

## Iteration 10 In Scope
- 更新 `apps/document-to-podcast-api/src/providers/tts/types.ts`
- 更新 `apps/document-to-podcast-api/src/providers/tts/http-audio-renderer.ts`
- 更新 `apps/document-to-podcast-api/src/providers/storage/local-file-artifact-storage.ts`
- 视需要更新 `apps/document-to-podcast-api/src/contracts/podcast.ts`
- 更新 `apps/document-to-podcast-mcp/README.md`

## Iteration 10 Out of Scope
- 不做音频转码
- 不做多格式导出
- 不做大文件分片上传
- 不做真实播放器预览

## Iteration 10 Plan

### Checklist
- [x] 扩展 `RenderAudioOutput` 支持音频字节
- [x] 让 `http` TTS adapter 支持 JSON/base64 或二进制响应
- [x] 让 `local-file` storage 写真实音频文件
- [x] 保留 metadata 回退逻辑
- [x] 更新 README 的音频落盘说明
- [x] 自检并更新 spec

### Risks
- 不同 TTS 服务返回的二进制或 JSON 结构差异较大
- 若返回 base64 音频，文件体积会比原始二进制更大

### Approval Status
`Iteration 10 Execute 完成，等待下一轮决策`

## Iteration 10 Execute Log

### 已更新文件
- `apps/document-to-podcast-api/src/providers/tts/types.ts`
- `apps/document-to-podcast-api/src/providers/tts/http-audio-renderer.ts`
- `apps/document-to-podcast-api/src/providers/storage/local-file-artifact-storage.ts`
- `apps/document-to-podcast-mcp/README.md`

### 具体改动
- `RenderAudioOutput` 新增：
  - `audioBase64?: string`
  - `audioBytes?: Uint8Array`
- `http-audio-renderer.ts` 现在支持两种返回形态：
  - `application/json`，并从 `audioBase64` 解码音频字节
  - 非 JSON 响应，直接把响应体作为音频字节读取
- `local-file-artifact-storage.ts` 现在会：
  - 始终写 transcript JSON / Markdown
  - 始终写 `audio.json` metadata
  - 若存在 `audioBytes`，额外写出真实音频文件
  - `audioUrl` 优先返回真实音频文件的 `file://` URL
- `README.md` 已补充“如果 TTS 返回真实音频字节，会额外写出真实音频文件”的说明

## Iteration 10 Validation

### 静态检查
- `ReadLints` 已检查以下路径，未发现新增问题：
  - `apps/document-to-podcast-api/src/providers/tts/types.ts`
  - `apps/document-to-podcast-api/src/providers/tts/http-audio-renderer.ts`
  - `apps/document-to-podcast-api/src/providers/storage/local-file-artifact-storage.ts`
  - `apps/document-to-podcast-mcp/README.md`

### 当前能力
- 当前 `http` TTS provider 已能承接：
  - JSON + base64 音频
  - 直接二进制音频流
- 当前 `local-file` storage 已能把真实音频字节落到本地文件
- 结果链路已从“音频 metadata 占位”推进到“可写真实音频文件”

### 当前限制
- 仍未做音频转码、格式协商和多格式输出
- 远端 TTS 若返回非常规 JSON 结构，当前 adapter 仍需后续按服务细化

---

## Iteration 11 Goal
执行一次“尽量真实”的端到端联调验证，确认当前链路是否能从输入一路走到本地产物输出：

1. 构建 API 与 MCP
2. 用真实 provider 或可替代配置启动 API
3. 运行最小样例任务
4. 验证 transcript / audio 文件是否成功落盘
5. 记录联调阻塞点与后续修复建议

## Iteration 11 Research Findings

### 一、当前联调前提
- 当前仓库已经具备：
  - parser: `stub` / `text-url`
  - llm: `stub` / `openai-compatible`
  - tts: `stub` / `http`
  - storage: `stub` / `local-file`
- 只要满足：
  - API 能启动
  - provider env 完整
  - LLM/TTS 接口兼容当前约定
  就可以尝试真实联调

### 二、联调最小路径
优先选择最低风险路径：

1. 输入来源：
   - `text`
   - 或本地 `.txt` / `.md`
2. provider 组合：
   - parser: `text-url`
   - llm: `openai-compatible` 或 `stub`
   - tts: `http` 或 `stub`
   - storage: `local-file`
3. 输出验证：
   - `${jobId}.json`
   - `${jobId}.md`
   - `${jobId}.audio.json`
   - 若 provider 返回音频字节，则验证真实音频文件

### 三、可能阻塞点
- 当前未确认用户是否已经具备可用的 LLM/TTS 网关地址与密钥
- 若真实 TTS 返回格式与当前约定不一致，可能需要小修 adapter
- 若 TypeScript 构建首次失败，可能需补 Node/TS 兼容修正

## Iteration 11 In Scope
- 运行构建命令
- 启动本地 API
- 视需要启动 MCP server
- 使用最小样例发起真实或半真实任务
- 检查输出目录与返回结果
- 将验证结论回写 spec

## Iteration 11 Out of Scope
- 不做大规模稳定性测试
- 不做性能压测
- 不做多 provider 对比测试
- 不做生产部署

## Iteration 11 Plan

### Execution Steps

#### 1. 构建
- `yarn build:document-to-podcast-api`
- `yarn build:document-to-podcast-mcp`

#### 2. 启动 API
- 使用一组明确 env 启动：
  - `DOCUMENT_TO_PODCAST_PARSER_PROVIDER`
  - `DOCUMENT_TO_PODCAST_LLM_PROVIDER`
  - `DOCUMENT_TO_PODCAST_TTS_PROVIDER`
  - `DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=local-file`
  - `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR`
- 若缺真实 LLM/TTS 配置，则至少先跑：
  - parser=`text-url`
  - llm=`stub`
  - tts=`stub`
  - storage=`local-file`

#### 3. 发起样例任务
- 优先使用 `text` 输入，避免外部变量过多
- 若第一轮成功，再试 `.txt` 文件或 `url` 输入

#### 4. 验证结果
- 校验 HTTP 返回
- 校验 job 状态推进
- 校验本地输出文件是否存在
- 若有真实音频字节，校验音频文件已写出

### Checklist
- [x] 构建 API 与 MCP
- [x] 启动 API
- [x] 发起最小样例任务
- [x] 验证 job 状态与结果
- [x] 验证本地输出文件
- [x] 回写 spec

### Open Questions
- 用户是否已经有可用的 LLM/TTS 接口地址与 API key
- 本轮是否先接受 `stub llm + stub tts + local-file` 的“半真实联调”

### Risks
- 若真实 provider 未配置，本轮可能只能完成半真实联调
- 启动长进程后如需反复重跑，需注意端口占用与进程清理

### Approval Status
`Iteration 11 Execute 完成，等待下一轮决策`

## Iteration 11 Execute Log

### 构建结果
- `yarn build:document-to-podcast-api`
  - 首次失败，定位为 `local-file-artifact-storage.ts` 中 `audioBytes` 类型收窄不充分
  - 修复后再次构建通过
- `yarn build:document-to-podcast-mcp`
  - 直接构建通过

### 启动配置
本轮使用“半真实联调”配置启动 API：

- `DOCUMENT_TO_PODCAST_PARSER_PROVIDER=text-url`
- `DOCUMENT_TO_PODCAST_LLM_PROVIDER=stub`
- `DOCUMENT_TO_PODCAST_TTS_PROVIDER=stub`
- `DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=local-file`
- `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR=/Users/fanghaoming/Code/renderbus-fe-monorepo/.tmp/document-to-podcast-output`

### 样例任务
- 输入类型：`text`
- 标题：`hello-podcast`
- 样例 focus：`测试联调链路`
- duration：`1` 分钟

### 联调结果
- 创建任务成功，返回 `queued`
- 首次状态查询返回 `processing / extracting`
- 后续状态查询返回 `succeeded / done`
- `GET /api/podcast-jobs/:jobId/result` 返回 `200`
- 本地输出目录成功生成：
  - `{jobId}.json`
  - `{jobId}.md`
  - `{jobId}.audio.json`

### 已验证产物
- Markdown 产物内容可读，章节与台词结构正确
- `audio.json` 包含：
  - `durationSeconds`
  - `mimeType`
  - `suggestedFileName`

## Iteration 11 Validation

### 验证结论
- 当前链路已完成一次**半真实联调**：
  - parser：真实 provider 形态
  - storage：真实本地落盘
  - llm / tts：stub
- 任务流、状态推进、结果查询与产物落盘整体可用

### 当前阻塞点
- 本轮未使用真实 LLM/TTS provider，因此没有生成真实音频文件
- 当前输出目录只生成 `audio.json`，符合 `stub tts` 预期

### 下一步建议
- 若用户具备真实 LLM/TTS 网关地址与 key，下一轮优先验证：
  - `llm=openai-compatible`
  - `tts=http`
  - `storage=local-file`
- 这样可继续验证真实 transcript 与真实音频文件落盘

## Phase Status
| Phase | Status |
|-------|--------|
| Research | ✅ 完成 |
| Plan | ✅ 完成 |
| Execute | ✅ 完成 |
| Review | ✅ 完成基础自检 |

## Approval Status
`Execute 完成，骨架已落地并完成基础自检`
