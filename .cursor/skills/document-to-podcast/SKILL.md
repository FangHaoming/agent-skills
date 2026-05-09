---
name: document-to-podcast
description: 将文档、网页或文本转换为播客生成任务。用于“生成播客”“文档转播客”“PDF 转播客”“把文章做成播客”“podcast from document”“audio overview”等场景；负责补齐参数、调用 MCP 工具、解释异步状态，并在完成后返回音频与文稿结果。
---

# Document To Podcast

## 适用场景

当用户有以下任一意图时使用本 skill：

- 让 AI 根据文档生成播客
- 把 PDF、网页、文章、Markdown 或纯文本做成播客
- 先预览播客提纲，再决定是否生成音频
- 查询播客生成进度、取消任务、查看最终结果

如果用户只是想了解“怎么实现文档转播客”，而不是要实际生成任务，不使用本 skill。

## 默认行为

如果用户没有明确指定，使用以下默认值：

- 语言：`zh-CN`
- 时长：`8` 分钟
- 形式：`dialogue`
- 角色数：`2`
- 风格：`technical-but-clear`
- 开场与结尾：开启

## 参数收集

优先从用户输入中提取以下参数；缺失时只追问真正必要的部分：

1. 来源：文件路径、URL 或纯文本
2. 语言：如 `zh-CN`、`en-US`
3. 时长：分钟数
4. 形式：`dialogue` / `monologue` / `debate` / `brief`
5. 受众：如 `frontend-engineers`
6. 风格：如 `technical-but-clear`
7. 重点：如“突出实现原理和主流方案”

若用户先想看适合怎么讲，先调用 `preview_podcast_plan`。

## 工具选择

### 1. 创建任务

当需求已足够明确时，调用：

- `create_podcast_job`

### 2. 查询状态

用户问“做好了吗”“进度如何”“刚才那个播客怎么样了”时：

1. 若缺少任务 ID，先调用 `list_podcast_jobs`
2. 再调用 `get_podcast_job`
3. 若状态为 `succeeded`，补调用 `get_podcast_result`

### 3. 预览提纲

用户说“先给我看看怎么讲”“先出提纲”“先别生成音频”时，调用：

- `preview_podcast_plan`

### 4. 取消任务

用户明确说取消时，调用：

- `cancel_podcast_job`

## 状态反馈约束

- 只有状态为 `succeeded` 才能说“已完成”
- `queued` 或 `processing` 只能表达为“已提交”或“处理中”
- 若任务失败，要返回失败阶段和错误摘要

## 输出偏好

创建任务后，优先向用户说明：

1. 已提交
2. 当前配置摘要
3. 可继续查看进度

完成后，优先返回：

1. 音频地址
2. 文稿地址
3. 简短摘要

## 参考

- 详细参数与工具说明：见 [reference.md](reference.md)
