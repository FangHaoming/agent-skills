---
name: open-code-review
description: Use when the user asks to set up, configure, run, interpret, or integrate Alibaba Open Code Review / OCR / ocr CLI for AI code reviews, repository scans, project review rules, GitHub or GitLab CI review automation, or high-confidence review-and-fix workflows across projects.
metadata:
  homepage: https://github.com/alibaba/open-code-review
  source-article: https://mp.weixin.qq.com/s/WSicyyMEIXnNVDoWuz0jrw
---

# Open Code Review

Use this skill to run or set up Alibaba Open Code Review (`ocr`) as a deterministic CLI-backed AI code review workflow.

The core principle is: let the CLI handle deterministic review mechanics such as diff collection, file filtering, rule matching, batching, JSON output, and line placement; let the agent handle project understanding, result triage, user communication, and carefully scoped fixes.

## When To Use

Use this skill when the user asks for:

- Open Code Review, OCR, `ocr review`, or `ocr scan`.
- AI code review with lower noise than a plain conversational review.
- Reviewing current changes, a commit, a branch diff, or a pull/merge request.
- Auditing a whole repository or directory before migration/refactor.
- Creating or tuning `.opencodereview/rule.json`.
- Adding GitHub Actions or GitLab CI automation around `ocr`.
- Reviewing OCR output and applying high-confidence fixes.

Do not use it for a normal human-style code review unless the user specifically asks for Open Code Review or OCR.

## First Checks

Work from the target repository root unless the user provides `--repo`.

```bash
git rev-parse --show-toplevel
command -v ocr || true
ocr version || true
ocr llm test || true
```

If `ocr` is missing, install it only when setup or OCR use is part of the task:

```bash
npm install -g @alibaba-group/open-code-review
```

Alternative macOS/Linux binary install:

```bash
curl -fsSL https://raw.githubusercontent.com/alibaba/open-code-review/main/install.sh | sh
```

Open Code Review requires Git 2.41+ for diff generation, code search, and repository operations.

If `ocr llm test` fails, guide the user to configure a model endpoint. Before giving concrete LLM configuration commands or editing CI/local config, confirm whether the user's provider is OpenAI-compatible or a non-OpenAI-compatible provider. Do not assume OpenAI-compatible defaults when the provider is unknown. Never invent, expose, or hardcode API keys.

Ask a concise clarification such as:

```text
你的 LLM 服务是 OpenAI 兼容接口（base URL + API key + model）还是其他类型的提供商/API？
```

For OpenAI-compatible providers, common environment-variable configuration for CI or temporary shell sessions:

```bash
export OCR_LLM_URL="<provider-url>"
export OCR_LLM_AUTH_TOKEN="<api-key>"
export OCR_LLM_MODEL="<model>"
```

For non-OpenAI-compatible providers, inspect the current `ocr` documentation or `ocr config` help for the supported adapter/config shape before suggesting exact settings.

Persistent config can also be set with `ocr config` if the user wants local setup; still confirm the provider type first.

## Review Workflow

Before running a review, inspect the git state and infer useful background from the task, issue, branch name, commit message, or user-provided requirements.

```bash
git status --short
git diff --stat
```

Use `--preview` first for large or ambiguous changes:

```bash
ocr review --preview
```

Default working-copy review:

```bash
ocr review --audience agent --background "<brief requirement or intent>"
```

Branch comparison:

```bash
ocr review --audience agent --from <base-ref> --to <head-ref> --background "<brief requirement or intent>"
```

Single commit:

```bash
ocr review --audience agent --commit <sha> --background "<brief requirement or intent>"
```

Machine-readable output for scripts or deeper parsing:

```bash
ocr review --format json --audience agent --background "<brief requirement or intent>"
```

If rate limits or provider errors appear, reduce concurrency:

```bash
ocr review --audience agent --concurrency 2 --timeout 20 --background "<brief requirement or intent>"
```

## Full Repository Scan

Use `ocr scan` when the user wants to audit existing code rather than only a diff.

Preview first:

```bash
ocr scan --preview
```

Scan a focused path:

```bash
ocr scan --path <dir-or-file> --audience agent --background "<audit focus>"
```

Control cost for large repositories:

```bash
ocr scan --path <dir> --max-tokens-budget 500000 --audience agent
```

Fast scan when the user wants a quick pass:

```bash
ocr scan --path <dir> --no-plan --no-dedup --no-summary --audience agent
```

Use `--exclude` for generated code, vendored code, build output, snapshots, or other low-value paths.

## Result Handling

Treat OCR output as review evidence, not an automatic truth source.

For every reported issue:

- Verify the relevant code before claiming it is a real bug.
- Prioritize concrete correctness, security, data loss, race conditions, broken API contracts, and production-impacting behavior.
- Drop low-confidence style-only or speculative comments unless the user asked for exhaustive cleanup.
- Keep file and line references precise.
- If fixing issues, make the smallest coherent edits and run targeted tests or checks.

Report in this order:

1. High-confidence findings and fixes.
2. Findings deliberately ignored as false positives or low value.
3. Commands run and validation status.
4. Remaining risks or follow-up checks.

## Project Rules

Use `.opencodereview/rule.json` for project-specific review rules that should travel with the repository.

Use `~/.opencodereview/rule.json` for personal rules that should apply across projects.

Rule precedence is:

1. CLI `--rule <path>`.
2. Project `.opencodereview/rule.json`.
3. User `~/.opencodereview/rule.json`.
4. Built-in rules.

Basic project rule file:

```json
{
  "rules": [
    {
      "path": "**/*.{ts,tsx}",
      "rule": "Check React hooks correctness, XSS risks, unsafe HTML injection, async race conditions, and strict equality."
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "Check SQL injection risks, wrong parameter binding, missing closing tags, and unsafe dynamic SQL."
    }
  ]
}
```

Rules should be narrow and testable. Prefer concrete project invariants over broad advice. If rules become long, split by file type or subsystem. Overly broad rule files reduce instruction following.

When tuning rules:

```bash
ocr rules check <file>
```

Use `include` and `exclude` when the project needs to review test files, skip generated code, or scope special reviews.

## CI Integration

For CI, prefer JSON and quiet agent output:

```bash
ocr review --from "origin/$BASE_BRANCH" --to "origin/$HEAD_BRANCH" --format json --audience agent
```

Store model configuration in CI secrets or variables, commonly:

```bash
OCR_LLM_URL
OCR_LLM_AUTH_TOKEN
OCR_LLM_MODEL
```

For GitHub Actions or GitLab CI, use the examples from the official repository as the starting point, then adapt only repository names, secret names, branch refs, and comment-posting permissions.

Official references:

- https://github.com/alibaba/open-code-review
- https://github.com/alibaba/open-code-review/tree/main/examples
- https://github.com/alibaba/open-code-review/tree/main/internal/config/rules/rule_docs

## Design Notes

Prefer OCR over a plain prompt-only review when determinism matters:

- Large diffs where files can be missed.
- Need for structured JSON output.
- Need for line-level comments.
- Need for repeatable CI behavior.
- Need for project or user rule matching.

Prefer a normal manual review when:

- The user only wants architectural feedback without running tools.
- The repository cannot run external LLM calls.
- The task is about code explanation, not review.
- The user wants a very narrow inspection that can be answered directly from the code.
