# SDD Spec: weekly-report-formatter-status-reconciliation

## 0. Open Questions

- [x] 已在 skill 中明确“上一版周报 + 当前周报输入”的输入前提，并补充缺少上一版周报时的降级策略。
- [x] 已在 skill 中定义“最新上一份周报”的选择规则：优先按文件名中的日期/周次等显式时间信息判断，无法判断时退化到文件修改时间，仍无法唯一判定则提示用户确认。
- [x] 已补充显式歧义示例，约束目录中存在多个相近候选时必须先询问用户，而不是默认选取其中之一。
- [x] 已在 skill 中定义写回目录的目标文件名推断、默认新建文件、不覆盖历史周报，以及无法确定目标文件名时先询问用户的降级处理。
- [x] 已补充跨周补漏规则：上一版 `后续重点` / `下周工作计划` 中仍未闭环的事项，如果本轮没有明确关闭信号，至少要继承到新的 `后续重点` 或 `下周工作计划`，不能直接漏掉。

## 1. Requirements (Context)

- **Goal**: 继续完善 `weekly-report-formatter` skill，使其在用户引用周报目录并提供本周周报输入时，能够先在目录内识别“最新的上一份周报”，再与当前输入做跨周状态对比生成新的周报内容，并在生成后将结果写入该周报目录。
- **In-Scope**:
  - 更新 skill 规则，补充“目录内检索上一份周报”“候选周报选择顺序”“无法唯一判定时的降级策略”。
  - 保留并衔接已有“上一周报对照”“最新状态优先”“防漏项校验”逻辑。
  - 补充“上一版 `后续重点` / `下周工作计划` 的未闭环事项跨周继承”规则，避免延续事项在新周报中丢失。
  - 更新示例，覆盖至少一个“用户引用周报目录 + 输入本周内容，AI 先选出上一份周报再对比整理”的场景。
  - 继续补一个“目录内多个候选文件无法唯一判定时，必须提示用户确认”的歧义场景。
  - 增加“生成新周报后写回目录”的规则，明确目标文件命名、默认写入方式以及避免误覆盖历史周报的约束。
  - 更新示例，覆盖至少一个“生成完成后写入目录中的新周报文件”的场景。
  - 更新示例，覆盖至少一个“当前输入未重提，但上一版 `后续重点` / `下周工作计划` 中仍未闭环事项需要继续保留”的场景。
  - 明确“无遗漏”要求应体现在目录检索、上一周报选择、事项抽取、去重、归类和输出校验中。
- **Out-of-Scope**:
  - 不实现独立脚本或程序化工具，只定义 skill 在 agent 执行时应遵循的工作流规则。
  - 不改造其他 skill。
  - 不新增与当前需求无关的周报格式字段。

## 1.1 Context Sources

- Requirement Source: 当前对话中的用户需求：继续完善 `@.cursor/skills/weekly-report-formatter`，要求在引用周报目录并输入本周周报时，AI 按 skill 自动在目录里找出最新的上一份周报进行对比整理，并把新生成的周报写入周报目录。
- Design Refs: `无`
- Chat/Business Refs: `/Users/fanghaoming/Code/mine/agent-skills/.cursor/skills/weekly-report-formatter/SKILL.md`
- Extra Context: `/Users/fanghaoming/Code/mine/agent-skills/.cursor/skills/weekly-report-formatter/examples.md`

## 1.5 Codemap Used (Feature/Project Index)

- Codemap Mode: `feature`
- Codemap File: `无`
- Key Index:
  - Entry Points / Architecture Layers: 当前 feature 仅包含 `SKILL.md` 规则定义与 `examples.md` 示例说明两部分。
  - Core Logic / Cross-Module Flows: 规则文档定义输入处理、归类和输出模板；示例文档验证规则边界。
  - Dependencies / External Systems: 无外部依赖。

## 1.6 Context Bundle Snapshot (Lite/Standard)

- Bundle Level: `Lite`
- Bundle File: `无`
- Key Facts:
  - 现有 skill 已覆盖多来源材料去重、状态优先级、固定模板输出。
  - 现有 skill 已覆盖“上一版周报 + 当前输入”的跨周状态对比。
  - 现有 skill 已定义“当用户引用一个周报目录时，如何自动找出最新上一份周报”。
  - 现有 skill 已写明无法唯一判定时要提示用户确认，并已有歧义示例固化该行为。
  - 现有 skill 已定义“生成出的新周报如何写回目录、写到哪个文件、是否允许覆盖已有文件”。
  - 现有 skill 需要继续约束：上一版 `后续重点` / `下周工作计划` 中未闭环事项，不能因当前输入未重复提及就被漏掉。
- Open Questions:
  - 无

## 2. Research Findings

- 事实与约束:
  - 当前 `SKILL.md` 已覆盖目录引用、候选排序、无法唯一判定时提示用户确认的规则。
  - 当前示例已覆盖“目录引用后成功选出上一份周报”的正向路径，以及“目录中存在多个相近候选时先确认”的歧义路径。
  - 当前 `SKILL.md` 已覆盖“生成完成后写入目录”的动作边界，包括新文件名推断、避免覆盖和无法确定文件名时的降级策略。
  - 现有规则对“上一版 `后续重点` / `下周工作计划` 中未闭环事项的跨周继承”约束不足，容易出现事项在下一版周报中被遗漏的情况。
- 风险与不确定项:
  - 如果不把上一版 `后续重点` / `下周工作计划` 纳入跨周补漏清单，延续事项可能因当前输入未重提而被错误遗漏。
  - 如果未区分“继承到后续重点”和“补进本周完成工作”，可能把没有新结果态的事项误判成已完成或进行中成果。

## 2.1 Next Actions

- 在 `SKILL.md` 中补充“上一版 `后续重点` / `下周工作计划` 的未闭环事项跨周继承”规则。
- 在 `examples.md` 中补一个“当前输入未重提，但上一版后续事项仍需保留”的示例。
- 自检新增规则与既有“当前输入优先”“不捏造成果”“默认写回目录”逻辑不冲突。

## 3. Innovate (Optional: Options & Decision)

### Skip (for small/simple tasks)

- Skipped: true
- Reason: 本次为单个 skill 文档与示例的小范围增强，无需做多方案架构取舍。

## 4. Plan (Contract)

### 4.1 File Changes

- `.cursor/skills/weekly-report-formatter/SKILL.md`: 补充“上一版 `后续重点` / `下周工作计划` 的未闭环事项跨周继承”规则，明确不能因当前输入未重提就直接漏掉。
- `.cursor/skills/weekly-report-formatter/examples.md`: 新增“延续事项补漏”的示例，验证从上一版后续事项继承到本周 `后续重点` / `下周工作计划` 的处理链路。

### 4.2 Signatures

- `weekly-report-formatter / SKILL.md`: 文档规则更新，无代码签名变更。
- `weekly-report-formatter / examples.md`: 示例文档更新，无代码签名变更。

### 4.3 Implementation Checklist

- [ ] 1. 在 `SKILL.md` 中补充跨周补漏规则，明确上一版 `后续重点` / `下周工作计划` 中未闭环事项的继承方式。
- [ ] 2. 明确边界：这类延续事项在缺少新的结果态时，应优先继承到本周 `后续重点` / `下周工作计划`，而不是误补进 `本周完成工作`。
- [ ] 3. 在 `examples.md` 中新增延续事项补漏示例，展示“上一版提到、当前输入未重提、但本周仍需保留”的完整处理链路。
- [ ] 4. 自检新增补漏规则与已有“当前输入优先”“不捏造成果”“目录写回”规则不冲突。

### 4.4 Spec Review Notes (Optional Advisory, Pre-Execute)

- Spec Review Matrix:

  | Check | Verdict | Evidence |
  | --- | --- | --- |
  | Requirement clarity & acceptance | PASS | 用户已明确提出跨周整理时不能漏掉上一版 `后续重点` / `下周工作计划` 中仍未闭环的事项 |
  | Plan executability | PASS | 仍只涉及两个文档文件，可拆为规则补充、补漏边界和示例固化三个原子步骤 |
  | Risk / rollback readiness | PARTIAL | 执行时需避免把没有新结果态的延续事项误补进 `本周完成工作` |

- Readiness Verdict: GO (Advisory)
- Risks & Suggestions: 执行时应明确“延续事项补漏”只继承到 `后续重点` / `下周工作计划`，不要凭空补造成果。
- Phase Reminders (for later sections): Execute 后补充补漏示例与自检结果。
- User Decision (if NO-GO): Proceed

## 5. Execute Log

- [x] Step 1: 已更新 `.cursor/skills/weekly-report-formatter/SKILL.md`，补充“上一版 `后续重点` / `下周工作计划` 中未闭环事项的跨周继承”规则，并明确无新结果态时应优先继承到新的 `后续重点` / `下周工作计划`。
- [x] Step 2: 已更新 `.cursor/skills/weekly-report-formatter/examples.md`，新增延续事项补漏示例，覆盖“当前输入未重提，但上一版后续事项不能直接漏掉”的场景。
- [x] Step 3: 已执行文档自检与 `ReadLints` 校验，确认新增补漏规则与已有“当前输入优先”“不捏造成果”“目录写回”规则不冲突。

## 6. Review Verdict

- Review Matrix (Mandatory):

  | Axis | Key Checks | Verdict | Evidence |
  | --- | --- | --- | --- |
  | Spec Quality & Requirement Completion | Goal/In-Scope/Acceptance 是否完整清晰；需求是否达成 | PASS | 本轮已补齐“上一版后续事项跨周补漏”的关键规则，并明确继承位置与边界 |
  | Spec-Code Fidelity | 文件、签名、checklist、行为是否与 Plan 一致 | PASS | 实际修改仅发生在 `SKILL.md` 与 `examples.md`，且与本轮 checklist 中的补漏规则与示例补充一致 |
  | Code Intrinsic Quality | 正确性、鲁棒性、可维护性、测试、关键风险 | PASS | 已明确“当前输入优先、无新结果态不补造成果、未闭环事项继续继承”的处理边界 |

- Overall Verdict: PASS
- Blocking Issues: 无
- Regression risk: Low
- Follow-ups: 如后续还要增强，可再补一个“上一版有多个后续事项，本周只关闭其中一部分”的精细对照示例。

## 7. Plan-Execution Diff

- Any deviation from plan: 本轮补充的是跨周补漏规则与示例，未偏离“提升跨周状态对照完整性”的目标。

## 8. Archive Record (Recommended at closure)

- 暂不填写
