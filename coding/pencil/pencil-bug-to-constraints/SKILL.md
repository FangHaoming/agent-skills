---
name: pencil-bug-to-constraints
description: Investigate mismatches between `.pen` designs and generated frontend code using Pencil MCP, identify the exact generation-stage root cause, and update `pencil-code-constraints` to prevent recurrence. Use when the user points out a visual/code error from a selected `.pen` node and wants the cause analyzed, the constraint skill improved, or the workflow hardened against similar mistakes. Especially use when the user says phrases like `排查原因`, `记录到skill`, `修改skill`, `避免后面再犯错误`, `这个在html中不对`, `生成的代码错误`, or asks to turn a `.pen -> code` bug into a reusable rule.
---

# Pencil Bug To Constraints

Use this skill when a user says the generated HTML/CSS/React from a `.pen` design is wrong, points at a selected Pencil node, and wants:

- the root cause analyzed
- the generation-stage mistake explained
- `pencil-code-constraints` updated so the mistake does not recur

Common trigger phrases include:

- `排查原因`
- `记录到skill`
- `修改skill`
- `避免后面再犯错误`
- `生成的代码错误`
- `这个在html中不对`
- `把这个问题补进 skill`
- `写成一个新的skill`

## Core Goal

Turn a concrete `.pen -> code` mistake into a reusable constraint.

Do not stop at fixing the current code. Extract the generalizable failure pattern and write it back into `pencil-code-constraints`.

## Required Inputs

You usually have all or most of these from the user context:

- current `.pen` file path
- selected node IDs
- generated code file, often `index.html`
- screenshot or user description of what looks wrong

If any of these are missing and the task depends on them, ask for the missing piece.

## Must Follow

1. Never read `.pen` files directly with normal file tools. Use Pencil MCP tools only.
2. Load the selected node and any necessary parent/sibling nodes with Pencil MCP before reasoning about the bug.
3. Compare Pencil structure and generated code structure separately:
   - node tree / parent-child relationship
   - coordinates and bounds
   - fills / stroke / effects
   - stacking / clipping / wrapper sizing
   - text box sizing and child offsets
4. Explain the cause as a generation-stage mistake, not only as a code diff.
5. When the mistake is reusable, update `pencil-code-constraints` in the most relevant sections:
   - `Workflow`
   - `Rules`
   - `Common Failure Modes`
   - `Pre-Commit Checklist`
6. Keep the new constraint general. It should prevent a class of bugs, not only this one exact node.

## Investigation Workflow

1. Read the selected Pencil node with `batch_get`.
2. If layout depends on nearby structure, also read:
   - parent node
   - overlapping siblings
   - key children involved in the bug
3. Get a Pencil screenshot for the selected node if the visual relationship matters.
4. Read the generated code around the affected area.
5. Classify the bug into one or more buckets:
   - wrong parent / re-parenting
   - missing parent offsets
   - wrong stacking order
   - clipping / overflow mistake
   - invented shadows / borders / effects
   - fixed-height wrapper guessed from child size
   - `line-height` / flex alignment replacing explicit child offsets
   - disabled Pencil layer rendered as visible CSS
   - responsive behavior invented without request
6. State the root cause in this format:
   - what Pencil actually says
   - what the generated code did instead
   - why that transformation is invalid
7. Decide whether the bug reveals a missing or weak constraint in `pencil-code-constraints`.
8. Update the constraint skill.
9. Verify the new wording appears in the right sections and is reusable.

## Root Cause Template

Use short, explicit language:

- `Pencil truth`: what the node tree / coordinates / effects actually are
- `Generated transformation`: what the HTML/CSS changed or inferred
- `Why invalid`: why that breaks fidelity
- `Constraint to add`: the reusable rule that would have blocked the mistake

## What To Add To `pencil-code-constraints`

Prefer adding the same insight at multiple levels when appropriate:

- `Workflow`: what must be checked before coding
- `Rules`: what must never be inferred or invented
- `Common Failure Modes`: how this bug typically appears
- `Pre-Commit Checklist`: what to verify before completion

Examples of good reusable constraints:

- overlapping root-level siblings need explicit stacking preservation
- `background_blur` must not become guessed `box-shadow`
- disabled stroke must not generate visible CSS
- group wrapper bounds must include child offsets
- explicit child `y` offsets must not be replaced with `line-height`

## Output Expectations

When reporting back to the user:

1. Identify the concrete cause in the current code.
2. Explain which generation-step assumption was wrong.
3. Say whether `pencil-code-constraints` was updated.
4. Briefly summarize what was added to the skill.

## Anti-Patterns

- Do not only say “the CSS is wrong” without tracing it back to Pencil data.
- Do not patch code first and only then search for a reason.
- Do not write a node-specific one-off rule when the underlying bug is more general.
- Do not infer `.pen` structure from screenshot alone when MCP data is available.
- Do not update `pencil-code-constraints` with vague advice like “be more careful with alignment”.

## Completion Check

- Did I inspect the relevant Pencil nodes with MCP?
- Did I compare Pencil truth vs generated transformation?
- Did I name the generation-stage mistake clearly?
- Did I update `pencil-code-constraints` with a reusable rule?
- Did I verify the new rule was written into the appropriate sections?
