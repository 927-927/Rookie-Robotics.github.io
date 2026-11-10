# Style guide for the FTC Software pages

The FTC pages must read like the existing FRC Software pages in `docs/frc/software/`
(read `docs/frc/software/index.md`, `java-basics.md` and
`time-based-to-command-based.md` before writing; they are the model).

## Voice

- Plain English for high-school rookies, many of whom read English as a second
  language (the site also has a Chinese version). Short sentences. One idea per
  sentence. Second person ("you").
- Concrete over abstract: name the method, the button, the file, the number.
- Say why, briefly, before or after the how.
- Contractions are fine (don't, it's, you'll). No hype words ("powerful",
  "seamless", "robust", "simply", "easily", "leverage", "dive in").
- Bold a key term the first time it's defined: the **command scheduler**.
- Wrap Markdown source at about 78 characters, like the FRC pages.
- Headings in sentence case. Page title is `# Title` matching the nav title.

## Page shapes

1. **Section index** (`index.md`): one short paragraph, then
   `<div class="grid cards" markdown>` cards. Each card:

   ```
   -   :material-ICON:{ .lg .middle } __Title__

       ---

       One or two sentences.

       [:octicons-arrow-right-24: Title](page.md)
   ```

   Icons must exist in Material Design Icons (e.g. `material-language-java`,
   `material-code-braces`, `material-file-tree-outline`, `material-swap-horizontal`,
   `material-sitemap-outline`, `material-compare-horizontal`, `material-chart-bell-curve`,
   `material-map-marker-path`, `material-camera-outline`, `material-tools`,
   `material-gamepad-variant-outline`, `material-robot-outline`, `material-school-outline`,
   `material-tune-vertical`, `material-flag-checkered`).

2. **Curated external course** (like `java-basics.md`): intro paragraph naming
   the course and what it teaches, a primary button
   `[:octicons-arrow-right-24: Start X on site](URL){ .md-button .md-button--primary }`,
   `## Lessons` with an ordered list of the course's lessons as links (in order),
   then a credit admonition:

   ```
   !!! info "Credit"

       These lessons are by [Site](URL) ... shared under [LICENSE](URL).
       This site only links to them.
   ```

3. **Original lesson** (like `time-based-to-command-based.md`): intro paragraphs,
   `##` sections, comparison tables, code windows, a step-by-step walkthrough
   ("Pressing A, loop by loop"), and a `## Learn more` list of links at the end.
   Optional opening `!!! quote "Why this page"` only if there's a real reason.

4. **Team code page** (like `command-based-styles/team-2910.md`): what's
   distinctive in one paragraph, an `!!! info "About the code on this page"`
   admonition naming the repo and its license (copyright line), then
   `## How the subsystems are organized`, `## How a command runs`,
   `### Compared with ...`, `## Learn more`.

## Components available (already styled site-wide)

- Admonitions: `!!! note`, `!!! tip`, `!!! warning`, `!!! info "Credit"`,
  collapsible `??? info "..."`. Body indented 4 spaces after a blank line.
- Tables (GitHub style).
- Tabs: `=== "Java"` blocks (pymdownx.tabbed) — use sparingly.
- Code blocks: ```` ```java linenums="1" ```` inside code windows, plain
  ```` ```java ```` elsewhere. Use 4-space indentation (Android Studio /
  FTC SDK style). Keep lines under about 60 characters inside code windows
  (they are narrow); wrap long calls over several lines.
- Non-breaking space before units: `80&nbsp;%`, `20&nbsp;ms`.
- **Code window** (a small VS Code-like file explorer; the script that powers it is
  loaded on every page). Copy this markup exactly; `data-file` on the button must
  match `data-file` on its pane; exactly one button has `is-active`; `--depth`
  indents the explorer tree:

  ```html
  <div class="vscode" markdown>
  <div class="vscode__titlebar">project name</div>
  <div class="vscode__body" markdown>
  <nav class="vscode__sidebar" aria-label="Files">
  <div class="vscode__heading">Explorer</div>
  <div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
  <div class="vscode__folder" style="--depth: 1">subsystems</div>
  <button type="button" class="vscode__file is-active" style="--depth: 2" data-file="intake">Intake.java</button>
  <button type="button" class="vscode__file" style="--depth: 1" data-file="teleop">IntakeTeleOp.java</button>
  </nav>
  <div class="vscode__editor" markdown>
  <div class="vscode__tabs"><span class="vscode__tab"></span></div>
  <div class="vscode__crumbs"></div>
  <div class="vscode__panes" markdown>
  <div class="vscode__pane" data-file="intake" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/subsystems/Intake.java" markdown>

  ```java linenums="1"
  ...code...
  ```

  <div class="vscode__note" markdown>
  **Bold lead.** One short paragraph explaining this file.
  </div>
  </div>
  <div class="vscode__pane" data-file="teleop" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeTeleOp.java" markdown>
  ...
  </div>
  </div>
  </div>
  </div>
  </div>
  ```

  `vscode vscode--wide` gives a wider window for long code.

## Diagrams and photos

Don't create images in this draft. Where a diagram would clearly help (the FRC
pages use one per major idea), leave an HTML comment on its own line where it
goes, describing it precisely enough for someone to draw it later:

```
<!-- TODO diagram: two columns. Left, LinearOpMode: your while loop ... -->
```

## Code

- Every code sample must be correct for the versions named on the page (FTC SDK
  and library versions from the research notes). Use the exact class, package
  and method names from the research. Don't invent APIs. If unsure of an API
  detail, use the simplest form you're sure of.
- Imports are left out of code windows, with one line before the first window:
  "Imports are left out. In Android Studio, click a name with a red underline
  and press Alt+Enter to add its import."
- Hardware names in `hardwareMap.get(...)` are strings like `"intake"`, and the
  page says they must match the robot configuration on the Driver Station.
- Default `TeamCode` package: `org.firstinspires.ftc.teamcode`.

## Links

- Link between FTC pages with relative `.md` paths (`../software/index.md`);
  every link must resolve, because the site builds with `mkdocs build --strict`.
- FRC pages live at `docs/frc/...`; from `docs/ftc/software/x.md`, the FRC
  command-based page is `../../frc/software/time-based-to-command-based.md`.
- External links: only URLs listed as verified in the research notes. No
  made-up URLs. Prefer official docs (ftc-docs.firstinspires.org), gm0.org and the
  library's own docs.

## Terms

OpMode, LinearOpMode, TeleOp, Autonomous (auto), Control Hub, Expansion Hub,
Driver Station, robot configuration, `hardwareMap`, gamepad, telemetry,
subsystem, command, scheduler, default command, trigger/binding, encoder,
odometry pod, IMU, AprilTag, path, follower. Write "teleop" and "auto" in
prose, `@TeleOp` / `@Autonomous` for the annotations.
