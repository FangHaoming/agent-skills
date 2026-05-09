# Document To Podcast Reference

## Source 结构

```json
{
  "type": "file | url | text",
  "path": "/absolute/path/to/file.pdf",
  "url": "https://example.com/article",
  "title": "补充说明",
  "content": "纯文本内容"
}
```

说明：

- `file` 需要 `path`
- `url` 需要 `url`
- `text` 需要 `content`，可选 `title`

## Config 结构

```json
{
  "language": "zh-CN",
  "duration_minutes": 8,
  "format": "dialogue",
  "audience": "frontend-engineers",
  "tone": "technical-but-clear",
  "focus": "实现原理、主流方案、优缺点",
  "speaker_count": 2,
  "include_intro": true,
  "include_outro": true
}
```

## MCP 工具

### `create_podcast_job`
- 用途：创建异步播客生成任务

### `get_podcast_job`
- 用途：查询单个任务状态和阶段

### `get_podcast_result`
- 用途：获取完成后的音频、文稿与摘要

### `list_podcast_jobs`
- 用途：在用户没给 `job_id` 时查最近任务

### `cancel_podcast_job`
- 用途：取消未完成任务

### `preview_podcast_plan`
- 用途：只生成播客结构提纲，不渲染音频

## 状态术语

- `queued`：已入队，尚未开始
- `processing`：执行中
- `succeeded`：完成
- `failed`：失败
- `cancelled`：已取消

## 阶段术语

- `ingesting`
- `extracting`
- `planning`
- `script_generating`
- `tts_rendering`
- `audio_merging`
- `uploading`
- `done`

## 推荐反馈模板

### 创建成功

```text
播客任务已提交。
当前配置：中文、8 分钟、双人对谈、技术讲解风格。
如果你愿意，我可以稍后继续帮你查看进度。
```

### 处理中

```text
任务还在处理中，当前阶段是 script_generating，进度 38%。
```

### 已完成

```text
播客已生成完成。
我拿到了音频链接、文稿链接和摘要，可以继续发给你。
```

### 失败

```text
任务生成失败，失败阶段是 tts_rendering。
建议检查输入文档内容是否足够，或改用较短时长重新提交。
```
