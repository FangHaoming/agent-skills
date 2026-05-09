# document-to-podcast-mcp

最小可用的 stdio MCP server，用于把 `document-to-podcast-api` 暴露为 MCP 工具。

## 当前能力

- `initialize`
- `notifications/initialized`
- `tools/list`
- `tools/call`

已接入的工具：

- `create_podcast_job`
- `get_podcast_job`
- `get_podcast_result`
- `list_podcast_jobs`
- `cancel_podcast_job`
- `preview_podcast_plan`

## 本地调试

### 1. 先构建两个应用

在仓库根目录执行：

```bash
yarn build:document-to-podcast-api
yarn build:document-to-podcast-mcp
```

### 2. 启动 API mock server

在 `apps/document-to-podcast-api` 完成构建后启动：

```bash
yarn run:document-to-podcast-api
```

默认监听 `http://localhost:4310`。

如果你想切换 `document-to-podcast-api` 的 provider，可在启动前设置环境变量。默认全部为 `stub`：

```bash
DOCUMENT_TO_PODCAST_PARSER_PROVIDER=stub \
DOCUMENT_TO_PODCAST_LLM_PROVIDER=stub \
DOCUMENT_TO_PODCAST_TTS_PROVIDER=stub \
DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=stub \
yarn run:document-to-podcast-api
```

### 2.1 切换到真实 HTTP provider 占位

当前已经预留两类真实 provider 形态：

- Parser: `text-url`
- LLM: `openai-compatible`
- TTS: `http`
- Storage: `local-file`

示例：

```bash
DOCUMENT_TO_PODCAST_PARSER_PROVIDER=text-url \
DOCUMENT_TO_PODCAST_PARSER_USER_AGENT=document-to-podcast-bot/0.0.1 \
DOCUMENT_TO_PODCAST_LLM_PROVIDER=openai-compatible \
DOCUMENT_TO_PODCAST_LLM_BASE_URL=https://your-llm-gateway.example.com/v1 \
DOCUMENT_TO_PODCAST_LLM_API_KEY=your_llm_key \
DOCUMENT_TO_PODCAST_LLM_MODEL=gpt-4.1-mini \
DOCUMENT_TO_PODCAST_TTS_PROVIDER=http \
DOCUMENT_TO_PODCAST_TTS_BASE_URL=https://your-tts-gateway.example.com/render \
DOCUMENT_TO_PODCAST_TTS_API_KEY=your_tts_key \
DOCUMENT_TO_PODCAST_TTS_VOICE=alloy \
DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=local-file \
DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR=/absolute/path/to/document-to-podcast-output \
yarn run:document-to-podcast-api
```

说明：

- `DOCUMENT_TO_PODCAST_PARSER_PROVIDER=text-url` 的行为：
  - `text` source: 直接使用 `content`
  - `url` source: `fetch` 网页并做基础正文清洗
  - `file` source: 当前支持 `.txt`、`.md`、`.json` 的 UTF-8 文本读取
  - 其他文件类型：返回明确降级说明，不做 PDF/OCR/二进制解析
- `DOCUMENT_TO_PODCAST_PARSER_USER_AGENT` 可选，用于某些网站需要自定义请求头时使用
- `DOCUMENT_TO_PODCAST_LLM_PROVIDER=openai-compatible` 会请求：
  - `POST {DOCUMENT_TO_PODCAST_LLM_BASE_URL}/chat/completions`
- `DOCUMENT_TO_PODCAST_TTS_PROVIDER=http` 会请求：
  - `POST {DOCUMENT_TO_PODCAST_TTS_BASE_URL}`
- `DOCUMENT_TO_PODCAST_STORAGE_PROVIDER=local-file` 会在 `DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR/{jobId}/` 下写入：
  - `{jobId}.json`
  - `{jobId}.md`
  - `{jobId}.audio.json`
  - 如果 TTS 返回真实音频字节，还会额外写出真实音频文件（文件名来自 `suggestedFileName`）
- 如果切到了真实 provider，但缺少对应 env，API 会直接报错
- 如果你当前只想稳定联调，依然可以把 `parser` 保持为 `stub`

### 3. 启动 MCP server（手工调试时）

在 `apps/document-to-podcast-mcp` 完成构建后启动：

```bash
yarn run:document-to-podcast-mcp
```

如果 API 地址不是默认值，可设置：

```bash
DOCUMENT_TO_PODCAST_API_URL=http://localhost:4310 node dist/index.js
```

## 接入 Cursor

### 1. 准备 `mcpServers` 配置

项目里已经提供示例文件：

- `apps/document-to-podcast-mcp/cursor.mcp.example.json`

把其中两个占位符替换成你本机真实路径：

- `__ABSOLUTE_PATH_TO_NODE__`
- `__ABSOLUTE_PATH_TO_REPO__`

在你当前机器上，`node` 的路径大概率类似：

```bash
/Users/fanghaoming/.nvm/versions/node/v18.20.8/bin/node
```

替换后会变成类似：

```json
{
  "mcpServers": {
    "document-to-podcast": {
      "type": "stdio",
      "command": "/Users/fanghaoming/.nvm/versions/node/v18.20.8/bin/node",
      "args": [
        "/Users/fanghaoming/Code/renderbus-fe-monorepo/apps/document-to-podcast-mcp/dist/index.js"
      ],
      "env": {
        "DOCUMENT_TO_PODCAST_API_URL": "http://localhost:4310"
      }
    }
  }
}
```

### 2. 合并到 Cursor 配置

把上面的 `document-to-podcast` 节点合并到你的：

```text
~/.cursor/mcp.json
```

注意：不要覆盖你已有的其他 `mcpServers`。

### 3. 启动顺序

推荐顺序：

1. 先构建 API 与 MCP
2. 启动 `document-to-podcast-api`
3. 保持 Cursor 正常打开
4. 让 Cursor 通过 `~/.cursor/mcp.json` 拉起 `document-to-podcast-mcp`

### 4. 验证方式

接入成功后，你应该能在 MCP 工具侧看到这些工具：

- `create_podcast_job`
- `get_podcast_job`
- `get_podcast_result`
- `list_podcast_jobs`
- `cancel_podcast_job`
- `preview_podcast_plan`

## 手工验证消息

该 server 使用标准 stdio + `Content-Length` framing。

### initialize

```text
Content-Length: <N>

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
```

### tools/list

```text
Content-Length: <N>

{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

### tools/call

```text
Content-Length: <N>

{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"preview_podcast_plan","arguments":{"sources":[{"type":"text","title":"AI Podcast","content":"AI 根据文档生成播客的实现方式"}],"config":{"language":"zh-CN","duration_minutes":8,"format":"dialogue","focus":"实现原理"}}}}
```

## 限制

- 当前未接入官方 MCP SDK
- 当前只覆盖最小方法集，不支持 resources、prompts、sampling
- `tools/call` 的结果依赖 `document-to-podcast-api` mock server
- `cursor.mcp.example.json` 是模板，不会自动修改你真实的 `~/.cursor/mcp.json`
