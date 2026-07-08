# agent-skills

这是一个用于收集、整理和沉淀 `agent skill` 的仓库。

仓库当前以 coding / agentic coding 场景为主，聚焦于把可复用的工作方式、约束协议、参考模板和示例材料整理成可直接分发和复用的 skill 资产。

## 仓库目标

- 统一沉淀可复用的 `agent skill`
- 为不同任务场景提供清晰的工作方式约束
- 将协议、模板、示例和辅助脚本集中管理
- 降低团队在多轮协作、复杂 coding 任务中的启动成本

## 当前内容

目前仓库主要收录 `.cursor/skills` 下的可复用 skill，包括：

- `frontend-semantic-dom`：前端语义化 DOM 结构约束 skill
- `open-code-review`：Alibaba Open Code Review / OCR 工作流 skill
- `pencil`：`Pencil` `.pen` 设计转前端代码相关 skill
- `sdd`：spec-driven / checkpoint-driven coding 相关 skill
- `weekly-report-formatter`：中文周报整理与格式化 skill

这些内容通常不只是单个提示词文件，而是一套可协作的 skill 结构，可能包含：

- `SKILL.md`：skill 主说明
- `README.md`：面向人的阅读入口
- `references/`：协议、模板、补充说明
- `examples/`：示例 spec、codemap 或其他参考材料
- `agents/`：面向特定 agent 的配置
- `scripts/`：辅助脚本

## 适用场景

这个仓库适合用于整理和维护如下类型的能力资产：

- 面向代码生成与修改的 agent skill
- 面向研发流程约束的协作协议
- 面向复杂任务的 spec / plan / review 模板
- 面向团队复用的最佳实践与示例

## 使用方式

如果你想查看某个 skill，通常可以从对应目录下的 `README.md` 或 `SKILL.md` 开始：

1. 先看该 skill 的 `README.md`，了解定位与使用方式
2. 再看 `SKILL.md`，确认具体约束与执行规则
3. 按需查看 `references/` 和 `examples/` 获取补充上下文

## 目录结构

```text
.
├── .cursor/
│   └── skills/
│       ├── frontend-semantic-dom/
│       ├── open-code-review/
│       ├── pencil/
│       ├── sdd/
│       └── weekly-report-formatter/
└── README.md
```

## 说明

这个仓库的定位是“skill collection / skill workspace”，用于持续积累可复用的 agent 能力，而不是单一项目的业务代码仓库。
