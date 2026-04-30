---
name: pencil-code-constraints
description: Read gradient fill, gradient stroke, and vector-only icon frames from .pen designs with Pencil MCP and implement them accurately in frontend code. Use when generating frontend code (HTML/CSS, React, Vue, etc.) from .pen files, especially when a node has gradient background, gradient border, glassmorphism, translucent fill, layered fill/stroke, or a frame composed entirely of vectors. Also use these constraints when the user selects multiple .pen regions and the work is split into multiple tasks or agents.
---

# Pencil Code Generation Constraints

## When To Use

Use this skill when converting `.pen` designs to frontend code and any target node includes:

- `fill.type: gradient`
- multiple `fill` layers such as solid color + gradient overlay
- `stroke.fill.type: gradient`
- translucent card backgrounds, glass panels, or gradient outlines
- a `frame` whose children are all vector/path shapes that together form one icon

Use this skill for both single-region and multi-region design-to-code work. If the user selects multiple regions in one or more `.pen` files and you split the work into multiple tasks, checkpoints, or agents, every child task must follow this skill independently; the parent task's compliance does not cover the children.

Parent-child relationship in Pencil is the structural source of truth. Visual overlap, shared background region, or apparent grouping on the canvas must never be used as sufficient evidence for HTML re-parenting.

## Workflow

1. Use Pencil MCP `batch_get` to read the exact node `fill`, `stroke`, `cornerRadius`, and related child nodes before coding.
1. If the user selected multiple `.pen` regions and you plan to split implementation into multiple tasks or multiple agents, create one explicit subtask per selected region or tightly related region cluster before coding. Treat each subtask as an independent design-to-code run.
1. Before delegating a subtask to another task or agent, explicitly forward these constraints in the subtask instructions. Do not assume the child task will inherit them implicitly just because the parent task loaded this skill.
1. For multi-task / multi-agent execution, each child task MUST redo its own node reads, asset resolution, direct-child classification, parent verification, overlap verification, and final visual-risk checklist for the exact region it implements. Never rely on one shared global read done only by the parent task.
1. If multiple selected regions belong to different selected roots, do not merge them into one broad HTML implementation pass just to save time. Keep the analysis and constraint checks scoped per selected root, then compose the final deliverable only after each root-level subtask has passed its own checks.
1. If the design uses image assets, resolve them relative to the source `.pen` file's directory first. Treat the `.pen` directory as the only source of truth for local image existence; do not judge existence relative to the current working directory, workspace root, or any guessed asset folder.
1. When a node uses `fill.type: image`, read its exact `url` value and resolve the exact target file path from the `.pen` directory before doing anything else. Check the specific referenced filename first; do not rely on a broad `*.png` / `*.jpg` search to conclude that an asset is missing.
1. If a broad file search returns no results but the `.pen` data references a concrete image filename, treat that as an unresolved conflict, not proof that the asset is absent. Perform a second, exact-path verification before declaring the asset missing or switching to a fallback implementation.
1. If the selected root node or any key child node uses `fill.type: image`, you MUST output an explicit "image asset resolution result" before writing any HTML. This result must list each relevant node ID, the referenced asset path from the `.pen`, the resolved absolute path based on the `.pen` directory, whether that exact file exists, and which exact file path will be used in code. If this step is skipped, do not proceed to HTML generation.
1. Before converting any `x`/`y` to CSS positions, walk up the node tree and compute the final rendered coordinates using ALL parent offsets. Never use a child node's local `x`/`y` as if it were already relative to the selected root.
1. Before writing any HTML, list the selected root's direct children and classify each one as:

    - root-level sibling under the selected node
    - descendant of a specific child group/frame
    - visual decoration only

1. If two root-level siblings overlap on the canvas, explicitly calculate their vertical/horizontal overlap range before coding. Do not assume DOM order will preserve the visible stacking from Pencil.
1. For every visually overlapping text/image/group, verify its actual parent from the `.pen` tree. Never infer parentage from appearance, overlap, or background coverage alone.
1. Do not re-parent a node into a different HTML container unless the `.pen` parent-child relationship proves that structure.
1. If a node is a direct child of the selected root in Pencil, it must remain a direct child of the selected root in the generated HTML by default.
1. If overlapping root-level siblings must stay visually stacked in a specific order, preserve that stacking explicitly in frontend code with `z-index` and/or DOM order. Keeping the same coordinates is not sufficient.
1. If you believe a node must be re-parented for implementation reasons, explicitly write a short justification first:

    - original Pencil parent
    - proposed HTML parent
    - why the visual anchor, clipping, stacking, and coordinates remain unchanged

   If this justification is missing, do not re-parent.
1. When a visual element is inside `group`/`frame` wrappers, preserve that local structure unless you have proven that flattening it will not change visible bounds, anchor points, decorative offsets, or text alignment.
1. If a node depends on explicit `x`/`y` for its visual anchor and its parent is not genuinely controlling it via flow layout, default to absolute-position reconstruction. Do not rewrite it into normal flow, flex alignment, margin pushing, baseline tricks, or inferred bottom anchoring unless you have proven the rendered anchor point is unchanged.
1. If a group's visible pill/card/tag background comes from an inner `rectangle`/`frame` child whose `x` is not `0`, treat that child background as the visual origin. Do not move that background onto the HTML wrapper at `left: 0` unless you also preserve wrapper bounds, decorative dots, and recompute every sibling icon/text offset relative to the new origin.
1. Treat node `fill` and `stroke` as separate visual layers. Do not merge them into one rough CSS approximation.
1. Treat `effect.type: background_blur` as backdrop processing only. Do not invent extra `box-shadow`, glow, elevation, or highlight layers unless the node also has an explicit visible shadow/stroke/effect in Pencil.
1. If the node has multiple `fill` entries, map them in order:

    - solid fill -> `background-color`
    - gradient fill -> `background-image` or layered `background`

1. If the node itself has a gradient `stroke`, implement it as an independent border layer. Default approach:

    - use `::before`
    - keep `border-radius: inherit`
    - use `padding` equal to stroke thickness
    - use mask to hollow out the center so only the border ring remains

1. Convert Pencil gradient data carefully:

    - use the exact color stops and positions
    - preserve opacity from 8-digit hex values
    - convert rotation to the closest CSS gradient angle instead of replacing it with a guessed direction
    - remember that Pencil gradient rotation uses `0deg = up` and positive CCW, while CSS gradients use a different angle direction; do not reuse the Pencil rotation number unchanged in CSS
1. If a node has a solid non-gradient `stroke` with `align: inside`, implement it as a precise inside border layer on that same node or a same-bounds pseudo-element. Do not approximate it with a glow, blur, outer border, or screenshot-guessed shadow.

1. If a text node uses a fixed text box in Pencil (`textGrowth: fixed-width` or `fixed-width-height`, or explicit `width`/`height` are present), preserve that text box in the generated frontend code first. Do not replace it with guessed responsive widths, `text-wrap: balance`, or viewport-based font sizing unless the task explicitly asks for responsive adaptation.
1. If a `frame` is only an icon wrapper and its children are all vector/path nodes, build one standalone `.svg` file instead of recreating each child as separate frontend code fragments.
1. For vector-only frames:

    - preserve the frame `width`, `height`, and clipping area as the SVG `viewBox`
    - convert each vector/path to an SVG `<path>`
    - preserve stroke thickness, color, linecap, and linejoin
    - reference the SVG from the target frontend code instead of expanding the vectors into many spans/divs

1. Keep decorative inner content above the pseudo border by setting `position: relative` and `z-index` as needed.
1. After coding, verify that the gradient background and gradient border are both visible and not swallowed by other background layers.
1. Before converting a `group` of text/path nodes into semantic frontend structure, decide whether it is truly safe to flatten:

    - if sibling text nodes have different fills, sizes, or explicit `x`/`y`, preserve them as separate positioned nodes
    - if a centered title group is positioned as a whole in Pencil, preserve the group-level centering instead of rewriting it as left-aligned inline flow
    - if a price block uses separate currency/value nodes, preserve their relative offsets instead of replacing them with flex baseline alignment
    - if a decorative node such as a line, badge, icon wrapper, corner marker, background rect, image, or label uses explicit `x`/`y`, preserve that anchored placement instead of reconstructing it with margins in normal flow

1. When Pencil already gives explicit `x`/`y` for any node type, prefer `top`/`left` reconstruction from those coordinates. Do not back-solve with guessed `bottom`, `margin-top`, line-height compensation, baseline alignment, or flex distribution unless the design itself is flow-based.
1. If a horizontal text `group` is composed of multiple sibling text nodes with explicit `x` offsets and no parent flex layout, preserve the group as a positioned wrapper and preserve each text node's own `left` offset. Do not normalize it into `display: flex`, guessed `gap`, `justify-content`, or evenly distributed navigation items unless you have proven that every child `x` and the group's final width remain identical.
1. If Pencil reports a text node or text group snapshot height that is larger than its `fontSize`, preserve that rendered text box height in frontend code. Do not collapse it to `line-height: 1`, `font-size`-equal height, or another guessed compact line box just because the text appears visually single-line.
1. If a text node's content contains meaningful repeated spaces, preserve them exactly. Use strategies such as `white-space: pre`, separate positioned text nodes, or another exact reconstruction approach. Do not collapse multi-space content into normal frontend-rendered whitespace.
1. If a text `group` is visually composed by multiple sibling text nodes with explicit offsets, preserve the group and each child text node as separate absolutely positioned elements unless you have proven that merging them will preserve alignment, spacing, and color runs.
1. If a `group` contains children with explicit `x`/`y`, default to preserving the group as an absolutely positioned wrapper and keep those children positioned inside it. Do not rewrite that structure into `flex`, `inline`, or other normal-flow HTML unless you explicitly explain why the visual anchor points, centering, and inter-child offsets remain identical.
1. If a `group` has no explicit width/height in Pencil, compute its HTML wrapper box from the true bounds of all visible children, including each child's own `x`/`y` offset. Do not guess the wrapper size from one child node's width/height alone.
1. Do not replace explicit child `y` offsets inside a positioned text/image group with guessed vertical centering via `line-height`, `display: flex`, or baseline alignment. Preserve the original child coordinates unless you have proven the rendered relationship is identical.
1. If a button/tag/pill node contains text and icon children with explicit `x`/`y`, preserve those children as positioned nodes by default. Do not collapse them into centered native button text, flex centering, or a pseudo-element icon unless you have proven the label and icon anchors remain identical.
1. If you add helper DOM nodes to represent a Pencil child background, border, or decoration layer, make sure later text/icon selectors target only the intended content nodes. Do not let broad descendant selectors accidentally style those helper layers and shift their anchors.
1. If a node is an `ellipse` with gradient fill and gradient stroke, treat it as a high-risk reconstruction target. Default to exact standalone SVG reconstruction, not CSS. You may only use CSS after writing an explicit justification that proves all of the following remain visually identical to Pencil:

    - ellipse silhouette, not a rounded-rectangle approximation
    - gradient fill direction and stop positions
    - stroke thickness and `stroke.align`
    - separation between fill and stroke layers
1. If the generated HTML/CSS uses `vw`, `vh`, `clamp()`, `@media`, or any other responsive adaptation, first prove that the user explicitly asked for responsiveness. If the user did not ask for responsiveness, treat those constructs as disallowed and keep the reconstruction fixed to the Pencil geometry.
1. If the deliverable is a standalone HTML document, verify document uniqueness after every major write or rewrite. Search the output file for `<!DOCTYPE html>`, `<html`, `</html>`, `<head`, `</head>`, `<body`, and `</body>` and confirm each appears exactly once in the final file.
1. If a standalone HTML file contains more than one document prolog/root pair, treat that as a blocking failure, not a cosmetic issue. Do not continue visual tuning on top of a duplicated file. First remove the duplicated trailing document(s) and restore the file to one complete HTML document before any further edits.
1. When rewriting a long HTML file, never assume a tool replaced the old contents just because the beginning of the file looks correct. Explicitly validate that no second `<!DOCTYPE html>` or second closing `</html>` remains later in the file.
1. Before finalizing, compare the generated frontend output against the selected Pencil root and check these failure-prone areas explicitly:

    - title/subtitle/button text box width and wrapping
    - centered title groups that may drift left after being rewritten as inline/flex content
    - split-color text runs that may lose local fill colors after being merged into one text node
    - currency/value combinations that may drift vertically after being converted to flex/baseline layout
    - any anchored decorative element such as a rule, path, badge, label, icon wrapper, background rect, or image that may shift after being converted from absolute coordinates to margin-based flow
    - parent-offset-affected badges/cards/tags
    - decorative dot/icon positions inside cards
    - multi-run paragraph groups whose line breaks and inline highlight positions depend on explicit child offsets
    - any element whose visible background starts at an inner child offset rather than the wrapper origin
    - title badges where the icon and adjacent text must remain visually center-aligned as one positioned unit
    - split text groups like `享受    折` + `5` whose spacing depends on literal spaces plus sibling node offsets
    - ellipse pills whose gradient fill and gradient stroke may drift when approximated with generic rounded div CSS
    - visually overlapping nodes that may have been mounted under the wrong HTML parent
    - text/image groups that may be clipped because they were placed inside a container with `overflow: hidden` despite being root-level siblings in Pencil

## Default CSS Patterns

### Gradient background from node fill

```css
.card {
  background-color: rgba(0, 0, 0, 0.5);
  background-image: linear-gradient(
    42.43deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(0, 72, 38, 0.2) 50%,
    rgba(20, 203, 117, 0.2) 100%
  );
}
```

### Gradient border from node stroke

```css
.card {
  position: relative;
  isolation: isolate;
  border-radius: 10px;
}

.card::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), #14cb75);
  pointer-events: none;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

## Rules

- Do not ignore the node's own `stroke` when it is gradient-based.
- Do not generate visible CSS from a Pencil `stroke.fill` whose `enabled` value is `false`.
- Do not replace layered Pencil fills with a single guessed CSS gradient.
- Prefer exact `fill`/`stroke` reconstruction over visual approximation when the `.pen` data is available.
- Do not convert `background_blur` into guessed `box-shadow`, fake glass elevation, or decorative inner highlights. Map it to `backdrop-filter` / background blur behavior only unless Pencil explicitly includes a visible shadow effect.
- Do not add `box-shadow` just because a node is translucent, blurred, or looks like glass in the screenshot. A CSS shadow must come from explicit Pencil evidence such as `effect.type: shadow`, or another clearly visible and enabled layer that truly maps to shadow-like rendering.
- Do not normalize a card/tag/group whose visible background starts at an inner child offset (for example `rectangle.x = 17`) into a same-size wrapper background while keeping sibling icon/text `left` values unchanged.
- Do not copy a Pencil gradient `rotation` value directly into CSS `linear-gradient(...)` without converting between the two angle systems first.
- Do not start writing HTML for any node tree containing image fills until you have produced the image asset resolution result and decided which local files will be referenced.
- Do not treat a failed broad file search such as `*.png` or `*.jpg` as sufficient evidence that a referenced image asset is missing.
- Do not declare an image asset missing until you have resolved the node's exact `fill.type: image.url` against the `.pen` file's directory and checked that exact target path.
- Do not use the workspace root, current shell directory, or a guessed asset folder as the base for resolving `.pen` image paths; always use the source `.pen` file's directory.
- If a gradient belongs to a child node, implement it on that child, not on the parent.
- If a frame is only composed of vectors and represents one icon/illustration, export it as one standalone SVG file.
- If the effect is too complex for plain CSS, explain the fallback and then use the closest layered CSS implementation inside the target frontend stack.
- Do not flatten nested `group` / `frame` positioning without adding parent offsets back into the final coordinates.
- Do not convert explicitly positioned nodes into normal-flow layout primitives unless you have verified that the anchor point remains identical after reconstruction.
- Do not rewrite a `group` with explicit-position children into `flex`, `inline`, or other normal flow unless you have a written justification that the visual anchors are unchanged.
- Do not convert a fixed Pencil text box into a generic responsive text block unless the user explicitly asks for responsiveness.
- Do not invent media queries, `vw` font sizes, or auto-balancing text wrapping for a design-to-code task whose goal is visual fidelity.
- Do not use `vw`, `vh`, `clamp()`, `@media`, container queries, or similar responsive constructs unless the user explicitly requested responsive adaptation.
- Do not rewrite a horizontally positioned multi-text group into `display: flex` with guessed `gap`, `space-between`, or distributed nav items when Pencil already provides explicit child `x` offsets.
- Do not shrink a single-line Pencil text/group height to `font-size` or `line-height: 1` when the snapshot layout reports a taller rendered text box.
- Do not assume image assets need to be recreated from scratch when a corresponding file already exists in the same directory as the `.pen`; resolve and reuse the local asset first.
- Do not assume repeated cards share one template if their inner background rect, dot, icon, or label offsets differ.
- If one card's visible background is a child rectangle while another card is a full image fill on the wrapper, preserve that difference instead of normalizing them into one structure.
- Do not rewrite a centered title `group` as a left-aligned inline/flex row without preserving the original group width and placement.
- Do not merge sibling text nodes into one sentence if Pencil uses separate nodes for local color, spacing, or line-break control.
- Do not replace explicitly positioned currency/value text pairs with generic flex/baseline alignment.
- Do not collapse a positioned text/image `group` into a fixed-height wrapper that vertically aligns text with `line-height` if Pencil uses explicit child `y` offsets.
- Do not convert a positioned button/pill's child label and child icon into browser-native centered button content unless the original child `x`/`y` anchors are preserved exactly.
- Do not replace an explicit inside stroke with `box-shadow`, default `border`, or another border-like approximation unless you have verified that the stroke thickness, alignment, and corner fit are identical to Pencil.
- Do not use broad selectors such as `.card span` or `.card img` after introducing helper background/border nodes if those selectors would also match the helper nodes and override their intended positioning.
- Do not size a `group` wrapper from a single child's width/height when the visible bounds actually depend on child offsets such as `y: 6` plus child height.
- Do not infer vertical text placement from `bottom` or guessed margins when Pencil already provides exact `y`.
- Do not convert an absolutely positioned path/line into a normal-flow divider with margins unless its visual anchor is unchanged; apply the same rule to rectangles, ellipses, images, labels, badges, and other decorative anchored nodes.
- Do not collapse literal multi-space Pencil text into normal whitespace when that spacing participates in the composition.
- Do not merge a multi-node text composition into one semantic phrase if the original uses separate text nodes for alignment, overlap, or local offsets.
- Do not approximate an ellipse's gradient fill and gradient stroke with a generic pill div unless you have verified that the approximation matches the Pencil result; otherwise use SVG.
- For `ellipse` + gradient `fill` + gradient `stroke`, do not use one HTML box with `border`, `padding-box`, `border-box`, layered `background`, or similar CSS tricks as the primary implementation. Export one standalone SVG file unless you have written a justification proving that CSS is equivalent.
- Never re-parent nodes based on visual appearance alone. The Pencil parent-child tree is the source of truth; overlapping a card/background does not mean the node belongs inside that container.
- Do not move a root-level sibling into a visually related background/card container just because it appears on top of that area.
- Do not assume that a text group belongs to the nearest image/background frame. Verify the actual Pencil parent node first.
- Treat parent-child relationship as source-of-truth structure; visual overlap is only presentation, not hierarchy.
- Do not assume that two overlapping root-level siblings will render in the correct visual order by default in HTML. When Pencil shows one sibling floating above another section/card/frame, preserve that order explicitly with stacking rules.
- Do not let a later DOM sibling cover an earlier overlapping sibling just because both use absolute positioning. Verify the intended stacking relationship from Pencil before finalizing.
- Before placing a node inside any HTML container with `overflow: hidden`, verify that the node is actually a child of that container in Pencil. Otherwise keep it outside.
- If a node would disappear, clip, or shift after being attached to a different parent, that re-parenting is invalid and must be reverted.
- Do not leave multiple `<!DOCTYPE html>`, `<html>`, `<head>`, or `<body>` blocks in a standalone HTML deliverable. The final output must contain exactly one full document root.
- Do not split a multi-region `.pen` implementation into multiple tasks or agents unless every child task is explicitly instructed to follow this skill.
- Do not treat a parent task's Pencil reads, image checks, or layout analysis as sufficient evidence for a child task. Each child task must independently verify the exact region it implements.
- Do not let one child task implement HTML for another child task's selected root without rerunning the relevant checks for that root.
- Do not merge multiple selected roots into one "combined section" implementation if doing so would skip per-root child classification, overlap checks, or parent verification.

## Common Failure Modes

- Wrong badge/card position because only the child node's `x`/`y` was used and ancestor offsets were ignored.
- Wrong text width or line breaks because a fixed Pencil text box was rewritten as percentage width plus `clamp()` / `vw`.
- Wrong decorative alignment because a card/group was flattened and the dot/icon offset was re-anchored to the wrong box.
- Icon or label `left` becomes too large because the visible background really starts at an inner child offset such as `x: 17`, but the HTML moved that background to the wrapper origin and kept the old sibling offsets.
- Gradient direction is flipped or skewed because the implementation copied Pencil's `rotation` number directly into CSS without converting between the two gradient angle systems.
- Wrong visual length because the generated background was attached to the wrapper, while the Pencil background actually belonged to an inner rectangle with its own offset and size.
- Wrong title centering because a positioned title `group` was rewritten as intrinsic-width inline content.
- Wrong local text color because multiple Pencil text nodes were merged into one frontend text node with one shared color.
- Wrong amount typography because a currency symbol and numeric value were aligned by flex/baseline instead of by their original relative offsets.
- Wrong badge/title alignment because a positioned text-image group was rebuilt as a fixed-height box and the text was vertically aligned with `line-height` instead of preserving the original child `y`.
- Wrong button/tag alignment because a positioned label + icon pair was rewritten as centered native button text plus a pseudo icon, so the original child anchors drifted horizontally.
- Border hugs the wrong curve or sits on the wrong side because a Pencil `stroke.align: inside` edge was approximated with a generic CSS border or shadow instead of an exact inside border layer.
- Background or border helper layers drift because a broad descendant selector meant for content nodes also matched the helper node and overwrote its `top`/`left` positioning.
- Wrong label height because the implementation used `bottom`/margin guessing instead of the text node's explicit `y`.
- Wrong divider position because an absolute Pencil path was rebuilt as a margin-based block element in normal flow.
- Wrong decorative placement because an explicitly positioned rectangle, image, badge, or icon wrapper was rewritten into ordinary flow layout.
- Wrong paragraph composition because a multi-node text group with explicit child offsets was collapsed into a centered paragraph with `<br>` and inline spans.
- Wrong title baseline because a fixed-position Pencil text node was rewritten with generic `line-height` assumptions instead of preserving its text box and visual baseline.
- Wrong nav/text-row width because a positioned multi-text group was rebuilt as `flex` with a guessed gap, changing the original child `x` offsets even though the visual order stayed the same.
- Wrong nav/text-row height because a Pencil text group with rendered height larger than `fontSize` was collapsed to `line-height: 1` or another compact browser line box.
- Wrong price/discount composition because literal spaces inside a Pencil text node were collapsed before combining it with a separately positioned numeric node.
- Wrong gradient pill appearance because an ellipse with gradient fill and gradient stroke was approximated as a rounded rectangle instead of being reconstructed as an ellipse or SVG.
- Wrong stroke placement because an `outside` gradient stroke was collapsed into a centered CSS border or a `border-box` background trick.
- Wrong placement because a root-level text/group was incorrectly mounted inside a nearby card/background container.
- Element disappears because it was re-parented into a container with `overflow: hidden` even though Pencil placed it as a sibling outside that container.
- Coordinates are numerically correct but still render wrong because the HTML parent is different from the Pencil parent.
- A text block looks visually associated with a card, but is actually a sibling of the card in Pencil; re-parenting causes double-offset errors.
- A floating nav/tab/title bar overlaps the next section in Pencil, but the generated HTML keeps the coordinates without preserving stacking order, so the later section covers its lower part.
- Two overlapping root-level siblings render in the wrong order because DOM order was left implicit and no `z-index` was assigned.
- A blurred translucent nav/card gets extra `box-shadow` in HTML even though Pencil only defines `background_blur` plus fills, causing the generated result to look heavier than the design.
- A disabled Pencil stroke is still turned into a visible CSS edge, inner highlight, or fake shadow line because the implementation ignored `enabled: false`.
- A long HTML rewrite silently appends a second full document to the file, so the result contains multiple `<!DOCTYPE html>` declarations and duplicated `<html>/<body>` trees even though the first screenful looks correct.
- A parent task correctly follows the `.pen` constraints, but one or more child tasks / agents skip them because the instructions did not explicitly restate the skill requirements.
- Multiple selected regions are implemented in parallel, but one child task reuses another child task's asset resolution or parent-structure assumptions instead of validating its own selected root.

## Pre-Commit Checklist

- Have I computed final absolute coordinates from the selected root by accumulating parent offsets?
- Have I preserved fixed text boxes and avoided speculative responsive behavior?
- Have I preserved centered text groups as groups rather than accidentally left-aligning them in inline/flex flow?
- Have I kept separate Pencil text nodes separate wherever local colors, spacing, or line breaks depend on node-level offsets?
- Have I produced an explicit image asset resolution result for every relevant `fill.type: image` node before writing HTML?
- Have I resolved every `fill.type: image.url` against the source `.pen` file's directory, rather than against the workspace root or current shell directory?
- Have I checked each referenced image by its exact filename/path instead of inferring absence from one broad file search result?
- Have I used explicit `top`/`left` from Pencil for text/path placement instead of estimating with `bottom`, margins, or baseline tricks?
- If a text row/group was explicitly positioned in Pencil, have I preserved each child text node's `x` offset instead of replacing the row with `flex` + guessed `gap`?
- If Pencil snapshot/layout reports a text or text-group height, have I preserved that rendered height instead of forcing `line-height: 1` or `font-size`-equal height?
- Have I treated every explicitly anchored decorative node as absolute by default unless the parent layout truly controls it?
- Have I avoided rewriting any `group` with explicit-position children into normal flow without a written justification?
- Have I checked whether each card/tag background belongs to the wrapper or to an inner child node?
- If a card/tag/group background starts at an inner child offset, have I preserved that offset or recomputed sibling icon/text coordinates against the new visual origin instead of copying the old `left` values?
- Have I preserved left/right placement of decorative dots, icons, and edge markers?
- Have I converted every Pencil gradient `rotation` into the CSS angle system instead of reusing the raw number directly?
- Have I resolved required image assets from the `.pen` file's directory before introducing placeholders or guessed paths?
- If I split the work into multiple tasks or agents, have I ensured that every child task independently followed this skill instead of assuming parent-level compliance was enough?
- Have I avoided `vw`, `vh`, `clamp()`, `@media`, or other responsive constructs unless the user explicitly asked for responsive behavior?
- Have I visually compared the generated frontend output with the Pencil selection for text box length, card position, and local ornament alignment?
- If a `group` had no explicit size in Pencil, did I compute its wrapper bounds from all visible children instead of guessing from one child or a text line box?
- Have I avoided using `line-height`, flex centering, or baseline tricks to replace explicit child `y` offsets inside positioned text/image groups?
- If a button/tag/pill uses explicit-position text/icon children in Pencil, have I preserved those child anchors instead of relying on native button centering or pseudo-element placement?
- If a stroke is `align: inside`, have I implemented it as an exact inside border layer and verified that its corner fit matches the Pencil node?
- If I introduced helper nodes for background/border reconstruction, have I verified that broad descendant selectors do not also style those helper nodes?
- Have I preserved literal spaces and sibling-node offsets for any split discount / amount / badge text composition?
- Have I avoided rewriting a multi-node positioned text group into one semantic inline sentence?
- Have I verified whether any ellipse with gradient fill + stroke should be reconstructed as SVG instead of approximate CSS?
- If I used CSS instead of SVG for an ellipse with gradient fill + stroke, have I written an explicit justification covering silhouette, gradient direction, layer separation, and `stroke.align` equivalence?
- Have I listed the selected root's direct children and preserved that first-level hierarchy in HTML?
- Have I verified every major text/image/group node's actual Pencil parent instead of inferring it from visual overlap?
- Have I avoided mounting root-level siblings inside decorative/background containers?
- If any root-level siblings overlap, have I verified which one should visually sit on top and encoded that with `z-index` and/or DOM order?
- If I generated any `box-shadow`, can I point to the exact Pencil evidence for it instead of a screenshot-based guess?
- Have I avoided turning `background_blur` or a disabled `stroke` into extra CSS shadows/highlights that are not explicitly present in Pencil?
- Before using any clipping container (`overflow: hidden`), have I confirmed that all children inside it are true descendants in Pencil?
- If I changed any parent-child relationship, did I write an explicit justification and verify that clipping, stacking, and offsets remain identical?
- If the deliverable is a standalone HTML file, have I verified that `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, `</body>`, and `</html>` each appear exactly once?

## Output Expectation

When reporting completion, explicitly mention:

- which node `fill` was mapped to background
- which node `stroke` was mapped to border
- whether any image asset was resolved from the `.pen` directory and how it was referenced in code
- whether a vector-only frame was implemented as a standalone SVG
- whether the implementation is exact reconstruction or a fallback approximation
- if the work was split into multiple tasks or agents, whether every child task independently followed this skill and which selected root(s) each child task covered
