# FTC Software teaching scheme: outline and page briefs

The FTC Software section mirrors the FRC Software section (`docs/frc/software/`):
curated links to the best free outside lessons where they exist, original pages
where they don't, and a page on how top teams structure their code. Unlike the
FRC section, each lesson page ends with a `## Try it` section: one or two
exercises plus a checkpoint ("You're done when ..."), so mentors can run it as
a course.

## Versions this draft is written against (as of November 2026)

Put the versions a page depends on in a short `!!! note "Versions"` admonition
near the top of that page, so they're easy to update each season.

| Thing | Version |
|---|---|
| Season | 2026–27, BIOBUZZ (kickoff 12 September 2026) |
| FTC SDK (FtcRobotController) | 12.0 (released 12 September 2026) |
| Android Studio | Narwhal 3 Feature Drop or later (needed since SDK 11.2; Gradle 9.1, AGP 8.13.2). Don't accept the AGP downgrade/upgrade prompts. |
| Java language level | Java 8 (1.8). No `var`, records, switch expressions, text blocks, `List.of`. |
| SolversLib (command-based) | 0.3.6 — `maven { url "https://repo.dairy.foundation/releases" }`, `implementation "org.solverslib:core:0.3.6"` |
| Pedro Pathing | 3.0.2 — `com.pedropathing:revhub:3.0.2`, `com.pedropathing:tuning:1.0.3`; Ivy `com.pedropathing.ivy:pedro:1.1.1` |
| Panels | `com.bylazar:fullpanels:1.0.20` |
| FTC Dashboard | `com.acmerobotics.dashboard:dashboard:0.6.0` |
| Road Runner (alternative) | core 1.0.1, ftc 0.1.25 |
| Sloth (hot reload) | 0.3.2 |

## Files, titles and nav

All under `docs/ftc/`. Nav titles are exactly the `# Title` of each page.

```
ftc/index.md                          FTC (section landing page)    [lead writes]
ftc/software/index.md                 Software (the learning path)  [lead writes]
ftc/software/getting-started.md       Getting started
ftc/software/java-basics.md           Java basics
ftc/software/first-opmode.md          Your first OpMode
ftc/software/mecanum-drive.md         Mecanum drive
ftc/software/first-autonomous.md      Your first autonomous
ftc/software/linear-to-command-based.md   LinearOpMode to command-based
ftc/software/mechanism-control.md     Mechanism control
ftc/software/sensors-and-vision.md    Sensors and vision
ftc/software/path-following.md        Path following
ftc/software/tools.md                 Developer tools
ftc/software/team-code/index.md       Team code styles
```

## The learning path (stages)

| Stage | Page | You can... when you're done | Sessions (about 2 h) |
|---|---|---|---|
| 0 | Getting started | deploy the SDK to a Control Hub from Android Studio and run TestHardware | 1 |
| 0 | Java basics | write classes, methods, loops and arrays in Java 8 | 4–6 (self-paced) |
| 1 | Your first OpMode | read a gamepad, drive motors and servos, and show telemetry, in both OpMode styles | 2 |
| 1 | Mecanum drive | drive a mecanum robot robot-centric, then field-centric with the IMU | 1–2 |
| 2 | Your first autonomous | run an auto by time, by encoder and with IMU turns, then rewrite it as a state machine | 2–3 |
| 3 | LinearOpMode to command-based | structure robot code as subsystems, commands and bindings with SolversLib | 2–3 |
| 4 | Mechanism control | hold a lift or arm at a position with your own PID + feedforward, and tune it live | 3–4 |
| 5 | Sensors and vision | use the IMU, color/distance sensors, Pinpoint odometry and AprilTags | 2–3 |
| 6 | Path following | tune Pedro Pathing and follow paths in auto | 3–4 |
| any | Developer tools | use Panels or FTC Dashboard, logcat and Sloth | as needed |
| after | Team code styles | read how top teams structure a whole robot | reading |

Blocks: one session at most, for absolute beginners, before Getting started.
OnBot Java is fine for Stage 1–2 if Android Studio isn't set up yet;
everything from Stage 3 on needs Android Studio (libraries).

## Page briefs

### getting-started.md — Getting started (original + curated links)
What a programmer needs to know about the control system before writing code.
- The pieces: Control Hub (runs your code), Expansion Hub (more ports),
  Driver Hub / Driver Station (runs the Driver Station app, gamepads plug into
  it), the robot configuration (names each device; `hardwareMap` looks names
  up, case-sensitive). Link FTC Docs Control System Intro and Configuring
  Your Hardware.
- The three tools: Blocks, OnBot Java, Android Studio. Table: what each is,
  pros/cons, when to use. FTC Docs says start with Blocks; this curriculum
  uses OnBot Java at most for Stage 1–2, then Android Studio (needed for
  libraries like SolversLib and Pedro). Same Java API in OnBot Java and AS.
- Setting up Android Studio: Narwhal 3 Feature Drop or later; warn that the
  FTC Docs install page's Ladybug/JDK 17 caution is outdated; don't accept
  Gradle/AGP version prompts. Fork and clone FtcRobotController (link FTC
  Docs Fork and Clone page); where your code goes
  (`TeamCode/src/main/java/org/firstinspires/ftc/teamcode`).
- Deploying: USB-C cable + green Run button; wireless ADB
  (`adb connect 192.168.43.1:5555` on the Control Hub's Wi-Fi; note: on the
  robot Wi-Fi you lose internet).
- Keeping things updated: REV Hardware Client 2 (Control Hub OS, hub
  firmware, RC/DS apps); phone RCs need the original RHC.
- Before writing code: run the built-in TestHardware and TestGamepad
  utilities (SDK 11.2+, in the Driver Station's Utility menu) to check wiring.
- A short "What's next for the control system" note: Systemcore is legal from
  2027–28, the current system stays legal through at least 2030–31, and this
  course targets the Control Hub + FTC SDK.
- Try it: deploy the unchanged SDK, make a configuration with one motor, run
  TestHardware. Checkpoint.

### java-basics.md — Java basics (curated external, like FRC java-basics.md)
- Primary: **Learn Java for FTC** by Alan G. Smith (github.com/alan412/LearnJavaForFTC),
  free PDF + solutions, written for the FTC SDK (its examples were tested with
  SDK 11.2). It has no open license: link only, don't copy. It mostly uses
  iterative OpMode; mention that and that LinearOpMode is in its appendix.
  Try to fetch the PDF table of contents to list chapters; if you can't,
  describe it without a chapter list.
- Alternative: frcsoftware.org Stage 0 (the same lessons the FRC side of this
  site uses: link `../../frc/software/java-basics.md`). Its concepts are
  generic Java, but it's set up for WPILib VS Code, and one lesson uses
  `List.of`, which doesn't exist in FTC's Java 8: use `new ArrayList<>()` /
  `Arrays.asList`.
- Practice without a robot: Beta8397/virtual_robot simulator (has a
  ProgrammingBoard config matching Learn Java for FTC).
- An `!!! warning "Java 8"` admonition listing what's not available.
- Credit admonitions for each source with their licenses
  (frcsoftware: CC BY-NC-SA 4.0).

### first-opmode.md — Your first OpMode (original)
- What an OpMode is: one program you pick on the Driver Station; `@TeleOp` /
  `@Autonomous` (name, group); INIT, then PLAY (start), then STOP.
- LinearOpMode first: `runOpMode()`, `hardwareMap.get(DcMotor.class, "intake")`
  in `runOpMode` before `waitForStart()`, `while (opModeIsActive())`,
  `telemetry.addData` + `telemetry.update()` (required in LinearOpMode).
  Code window: one motor on gamepad A, telemetry.
- Gamepad: sticks (`left_stick_y` is negative when pushed up), buttons,
  triggers (`left_trigger` 0–1, `left_trigger_pressed` since 11.1); built-in
  edge detection `gamepad1.aWasPressed()` / `aWasReleased()` (SDK 10.3+), and
  the trap: each call consumes the event, so call it once per loop and store
  the result. Mention the older `Gamepad.copy()` previous/current pattern you'll
  see in older team code and gm0.
- Motors: `setPower(-1..1)`, `setDirection`, `setZeroPowerBehavior(BRAKE/FLOAT)`.
  Servos: `Servo.setPosition(0..1)`, `CRServo.setPower`.
- Iterative OpMode: `init`, `init_loop`, `start`, `loop`, `stop`; table of
  when each runs; same program written as an `OpMode`; telemetry updates
  automatically; never `sleep()` or a long `while` inside `loop()`.
- Comparison table LinearOpMode vs OpMode; which this course uses when.
- Try it: a toggle (press A to turn the intake on, press again to turn it off)
  with `aWasPressed()`, and a servo on two buttons. Checkpoint.

### mecanum-drive.md — Mecanum drive (original)
- How mecanum wheels move the robot (forward, strafe, turn), short.
- Robot-centric teleop: gm0's math (y = -left_stick_y, x = left_stick_x * 1.1,
  rx = right_stick_x, denominator = max(|y|+|x|+|rx|, 1), FL=(y+x+rx)/d,
  BL=(y-x+rx)/d, FR=(y-x-rx)/d, BR=(y+x-rx)/d), SDK 10.3+ motor names
  front_left_drive etc. The direction trap: SDK samples reverse the left side,
  gm0 reverses the right; test (push the stick forward, every wheel should
  spin forward) and flip.
- Field-centric: the IMU (universal IMU interface, `RevHubOrientationOnRobot`),
  rotate (x, y) by −heading, reset yaw on a button (options).
- Link gm0 Mecanum TeleOp and the SDK samples BasicOmniOpMode_Linear and
  RobotTeleopMecanumFieldRelativeDrive.
- Try it + checkpoint.

### first-autonomous.md — Your first autonomous (original)
- By time (SDK sample RobotAutoDriveByTime_Linear idea): drive, `sleep()`, stop.
  Why it's unreliable (battery voltage).
- By encoder: ticks per revolution and per inch (look up your motor),
  `STOP_AND_RESET_ENCODER` (encoders don't reset on their own), then
  `setTargetPosition` FIRST, then `RUN_TO_POSITION`, then unsigned
  `setPower`, then loop on `isBusy()` with a timeout. Code window.
- Turning with the IMU (idea of RobotAutoDriveByGyro_Linear): turn until the
  yaw is within a tolerance, with a simple proportional power.
- Why blocking code stops working: while the robot drives you can't run the
  lift. Finite state machines: an `enum` of states and a `switch` in an
  iterative OpMode's `loop()`, with `ElapsedTime`. Code window. Link gm0 Finite
  State Machines. This leads into command-based.
- Try it + checkpoint.

### linear-to-command-based.md — LinearOpMode to command-based (original, the centerpiece)
Mirror `docs/frc/software/time-based-to-command-based.md` section by section
(read it closely), with SolversLib 0.3.6:
- Intro: in a LinearOpMode you write the loop yourself; with command-based,
  SolversLib's **command scheduler** runs in the loop instead.
  Link the FRC page for students who'll do both.
- Who runs the loop: `CommandOpMode` (extends LinearOpMode) runs
  `CommandScheduler.getInstance().run()` every loop after PLAY. The four steps,
  in order (subsystem `periodic()`, poll triggers/buttons, run one step of every
  command and end finished ones, schedule default commands). No fixed 20 ms:
  the loop runs as fast as hardware reads allow.
  `<!-- TODO diagram -->` reuse idea of FRC command-based-loop.svg.
- The three pieces table: Subsystem, Command, Trigger/button binding, with
  FTC examples. The two rules (one command per subsystem at a time; default
  command when free).
- The simplest example: LinearOpMode intake (A held = 0.8, else 0) in a code
  window; then the SolversLib version: `subsystems/Intake.java` (extends
  `SubsystemBase`, motor from `hardwareMap` in the constructor, `runIn()` and
  `stop()` returning `run(() -> ...)`) and `IntakeTeleOp.java` (extends
  `CommandOpMode`, `initialize()` creates subsystems, sets the default command,
  binds `new GamepadEx(gamepad1).getGamepadButton(GamepadKeys.Button.A).whenHeld(intake.runIn())`).
  Note `whenHeld` = WPILib `whileTrue` (cancel on release, no re-schedule);
  `whileHeld` re-schedules a finished command while held.
  Create subsystems inside `initialize()`, not as field initializers,
  because `hardwareMap` isn't ready when the OpMode object is built.
  Installing SolversLib: the two gradle lines (in `build.dependencies.gradle`)
  or start from the SolversLib Quickstart.
- Pressing A, loop by loop (same structure as the FRC page).
- Inside a command: initialize/execute/isFinished/end table; ways to make a
  command (`run`, `runOnce`, `startEnd`, `withTimeout(ms)` — milliseconds!,
  `andThen`, `Commands.sequence/parallel`, `Commands.waitMillis`).
- FTC vs FRC differences table: no `robotPeriodic` / each OpMode is its own
  program and the scheduler resets when the OpMode ends; INIT phase: the
  scheduler doesn't run during INIT (no default commands or bindings until
  PLAY); schedule an auto routine in `preRun()` (0.3.5+), not `initialize()`;
  telemetry needs `telemetry.update()` (override `run()`: `super.run();
  telemetry.update();`); waits in ms; two gamepads; bulk reads.
- WPILib ↔ SolversLib names table (SubsystemBase, CommandScheduler,
  `RobotContainer` constructor → `initialize()`, `CommandXboxController` →
  `GamepadEx`, `whileTrue` → `whenHeld`, `onTrue` → `whenPressed`, `onFalse` →
  `whenReleased`, `toggleOnTrue` → `toggleWhenPressed`, `withTimeout(2)` s →
  `withTimeout(2000)` ms).
- Other frameworks you'll see: FTCLib (SolversLib's parent, unmaintained
  since 2023 — read old code, rename `com.arcrobotics.ftclib` →
  `com.seattlesolvers.solverslib`; don't link docs.ftclib.org, it now redirects
  to an unrelated site); NextFTC (v1 stable, v2 pre-1.0 built on Ivy, uses
  modern WPILib names); Ivy (Pedro's scheduler, no subsystems/triggers/defaults,
  priorities). One short paragraph each.
- Try it + checkpoint (add a second subsystem, e.g. a claw servo with
  open/close on bumpers; a sequential auto command).
- Learn more: SolversLib docs pages (command system, subsystems, command
  groups, scheduler, binding, CommandOpMode), the SolversLib Quickstart, the
  FRC page.

### mechanism-control.md — Mechanism control (original + curated reading)
- The two kinds: things that spin (intake, flywheel: velocity) and things
  that move to a position (lift, arm: position). Same split as the FRC 2910
  page's roller/servo (link `../../frc/software/command-based-styles/team-2910.md`).
- Built-in: RunModes table (RUN_WITHOUT_ENCODER, RUN_USING_ENCODER,
  RUN_TO_POSITION, STOP_AND_RESET_ENCODER); `DcMotorEx.setVelocity(ticks/s)`
  for a flywheel; RUN_TO_POSITION for a lift, with its call order; set the
  correct motor type in the configuration. The built-in loop runs at about
  20 Hz (gm0).
- Your own PID + feedforward: why teams write their own (faster loop,
  gravity feedforward, control). RUN_WITHOUT_ENCODER (the encoder still
  counts). P, then D, then I (maybe never), kG for a lift, kCos·cos(angle)
  for an arm, kS. Code window: a lift subsystem in SolversLib with a PID
  step in `periodic()` and commands that set the target (ties back to
  command-based). SolversLib has a `PIDFController` class — only use it if
  the research confirms its API; otherwise write the PID by hand.
- Loop time and bulk reads: `LynxModule.BulkCachingMode.AUTO` for every hub
  (`hardwareMap.getAll(LynxModule.class)`), MANUAL + `clearBulkCache()` once
  per loop for advanced; measure loop time with `ElapsedTime`.
- Tuning live: `public static` fields + `@Configurable` (Panels) or `@Config`
  (FTC Dashboard); link Developer tools.
- Curated reading list: CTRL ALT FTC chapters (intro, open/closed loop, PID
  terms, tuning, practical improvements, feedforward, FTC motor control),
  gm0 Control Loops. Credit/licence notes (CTRL ALT FTC's licence isn't stated:
  link only).
- Try it + checkpoint.

### sensors-and-vision.md — Sensors and vision (original + curated)
- IMU: BHI260AP (hubs from September 2022) vs BNO055, universal IMU interface,
  `RevHubOrientationOnRobot(LogoFacingDirection, UsbFacingDirection)`,
  `getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES)`, `resetYaw()` only
  when level. Expansion Hubs after December 2021 have no IMU.
- Color and distance sensors: `NormalizedColorSensor`, `setGain`,
  `getNormalizedColors`; `DistanceSensor.getDistance(DistanceUnit.CM)`;
  touch sensor as `TouchSensor` or `DigitalChannel`.
- Odometry and the goBILDA Pinpoint: what odometry pods are, two- vs three-wheel,
  the Pinpoint (SDK driver `GoBildaPinpointDriver` since 10.3, V2 since 11.1),
  I2C port other than 0, offsets, `update()` every loop, `getPosition()` →
  `Pose2D`. Exercise: push the robot around and watch x/y/heading.
  Coordinate frames: Pedro uses its own frame, not the FTC field frame.
- Vision: VisionPortal + AprilTag processor (`easyCreateWithDefaults`),
  SDK 12 breaking change (every detection is `AprilTagSingleDetection` or
  `AprilTagClusterDetection`; check with `instanceof` and cast; old tutorials
  and AI-generated code won't compile), BIOBUZZ tags move so use them for
  aiming (range/bearing), not field localization. Color processors
  (Predominant Color, Color Blob Locator). Limelight 3A (optional):
  `Limelight3A`, `pipelineSwitch`, `start()`, `getLatestResult().isValid()`,
  `getTx()`.
- Learn more: FTC Docs IMU, AprilTag section, AprilTag clusters tech tip,
  Color Processing; Limelight docs; gm0 Odometry.
- Try it + checkpoint.

### path-following.md — Path following (curated external, like FRC complex-command-based.md)
- What a path follower does (localizer → where am I, follower → drive along a
  path, correcting). Prerequisite gate: a holonomic drive (mecanum/swerve) and
  a localizer you've verified by push tests (Sensors and vision page).
- Pedro Pathing 3 as the default this season (actively released, Quickstart
  on SDK 12, AutoTune web tuner at http://192.168.43.1:10158, Pinpoint support,
  most of the community). Doesn't work in OnBot Java or Blocks.
  Primary button to the Pedro docs. "Lessons" ordered list of the Pedro
  docs pages: prerequisites, installation, tuning (drivetrain, localization
  for your localizer, Foresight), then the guide (setting up auto, pose
  creation, path creation, path following, auto usage, teleop usage).
- A minimal example: Pedro uses Ivy for path following in its guide; show the
  shape of an auto (follower.update() every loop, follow a path, wait until
  !isBusy(), next). Only use API names verified in the research; mark the
  code "check against the Pedro docs for your version".
- Road Runner 1.0 as the alternative (docs rr.brott.dev, MeepMeep), slower
  maintenance (quickstart still on SDK 11.0.0). Don't use both.
- Credit/licence admonition (Pedro BSD-3; docs: link only).

### tools.md — Developer tools (original + curated)
- Pick one dashboard: Panels (by Lazar, fullpanels 1.0.20, http://192.168.43.1:8001,
  pairs with Pedro) or FTC Dashboard (acmerobotics, 0.6.0, MIT,
  http://192.168.43.1:8080/dash, Road Runner uses it). Telemetry graphs,
  live-tunable variables, field view.
- Logs: `RobotLog.d(...)`, logcat in Android Studio, `/sdcard/ftcRobotControllerLog.txt`.
- Sloth hot reload (0.3.2): deploys TeamCode in about 2 seconds; library or
  Gradle changes still need a full install. Advanced.
- Git and GitHub for your team's code (fork FtcRobotController, commit
  often); link the FRC Java basics' frcsoftware Git lesson.
- AdvantageScope: experimental FTC support (optional, explore).
- Install lines in a collapsible `??? note "Gradle lines"`.

### team-code/index.md — Team code styles (like FRC command-based-styles/index.md)
Built from the team-code research: 3 featured teams in the `item-list` layout
(without photos unless the research found a usable photo with credit; if no
photos, use plain `## Team NNNN` sections), each with team name, robot/season,
what's distinctive in their structure, framework, repo link, licence, and
"Deep dive coming soon." Plus a short "What to look for when you read team code"
list.
