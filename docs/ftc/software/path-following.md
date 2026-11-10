# Path following

In [Your first autonomous](first-autonomous.md), the robot drove one move at
a time: forward by encoder, stop, turn with the IMU, stop. A **path
follower** drives the robot along a whole **path** instead, straight or
curved, and can turn the robot while it drives. Every loop, it checks
where the robot really is and corrects, so a bump or a slipping wheel
doesn't throw the auto off.

A path follower has two parts. The **localizer** answers "where am I?",
from odometry like the Pinpoint on
[Sensors and vision](sensors-and-vision.md). The **follower** compares that
with where the path says the robot should be, and sets the drive motor
powers to close the gap.

<!-- TODO diagram: a loop of three boxes, labelled "every loop". "Localizer" (Pinpoint, pods) -> "where the robot is: x, y, heading" -> "Follower" (compares with the path, drawn as a curved dashed line from a start pose to an end pose with the robot slightly off it) -> "drive powers" -> "Drivetrain" (four mecanum wheels) -> the robot moves, back to the Localizer. Caption: "The follower corrects the robot every loop, using what the localizer measures." -->

This course uses **Pedro Pathing**, and you learn it from the Pedro
Pathing docs. They walk you through installing it, tuning it for your
robot, and writing your first autonomous with it.

[:octicons-arrow-right-24: Start Pedro Pathing on pedropathing.com](https://pedropathing.com/docs/pathing){ .md-button .md-button--primary }

!!! note "Versions"

    Written for Pedro Pathing 3.0.2 (`com.pedropathing:revhub:3.0.2` and
    `com.pedropathing:tuning:1.0.3`) on FTC SDK 12.0, with SolversLib
    0.3.6. Pedro 3 is a full rewrite of Pedro 2, so videos, tutorials and
    team code made for Pedro 2, such as anything using `PathChain`, won't
    work with it. Check that what you read is for Pedro 3.

## Before you start

Pedro Pathing needs three things. Don't start tuning without them:

- **A holonomic drivetrain**, one that can drive sideways. Pedro supports
  mecanum and swerve. If you have a mecanum drive, it should already
  drive well in teleop, from [Mecanum drive](mecanum-drive.md).
- **A localizer you've checked.** Pedro supports the Pinpoint, the
  OctoQuad, the SparkFun OTOS, and two-wheel, three-wheel, and
  three-wheel + IMU odometry pods. Do the push tests on
  [Sensors and vision](sensors-and-vision.md#try-it) first. A follower
  can't drive better than its localizer measures.
- **Android Studio.** Pedro doesn't work in OnBot Java or Blocks.

## Why Pedro Pathing

- **It's kept up to date.** Pedro 3.0.0 came out in September 2026 and
  3.0.2 in October, and its Quickstart project already uses FTC SDK 12.0.
- **Tuning is guided.** Pedro's **AutoTune** is a web page that runs on
  the robot, at `http://192.168.43.1:10158` while your laptop is on the
  robot's Wi-Fi. It takes you through each tuning step: in some, the robot
  drives itself, and in others you push it. Then it works out the numbers
  and gives you the code to paste into your Constants file.
- **It supports the Pinpoint**, with its own Pinpoint tuner.
- **It has a large community.** Its Discord has over 4,000 members, so
  help is easy to find.

## Lessons

Do the lessons in order. Lessons 1 to 3 set up Pedro and tune it for your
robot. Lessons 4 to 9, Pedro's guide, show how to write autos and teleops
with it.

1.  [Prerequisites](https://pedropathing.com/docs/pathing/prerequisites)
2.  [Installation](https://pedropathing.com/docs/pathing/installation):
    start from the Quickstart, or add Pedro to your own project
3.  [Tuning](https://pedropathing.com/docs/pathing/tuning), with AutoTune,
    in this order:
    1.  [Drivetrain: Mecanum](https://pedropathing.com/docs/pathing/tuning/drivetrain/mecanum)
    2.  [Localization](https://pedropathing.com/docs/pathing/tuning/localization),
        then the page for your localizer, like
        [Pinpoint](https://pedropathing.com/docs/pathing/tuning/localization/pinpoint)
    3.  [Foresight](https://pedropathing.com/docs/pathing/tuning/foresight),
        Pedro's path following algorithm
    4.  [Constants](https://pedropathing.com/docs/pathing/tuning/constants),
        where the tuned numbers go
    5.  [Test](https://pedropathing.com/docs/pathing/tuning/test), to check
        the whole follower
4.  [Setting Up Your Autonomous](https://pedropathing.com/docs/pathing/guide/setting-up-auto)
5.  [Creating a Pose](https://pedropathing.com/docs/pathing/guide/pose-creation)
6.  [Creating a Path](https://pedropathing.com/docs/pathing/guide/path-creation)
7.  [Following a Path](https://pedropathing.com/docs/pathing/guide/path-following)
8.  [Autonomous Usage](https://pedropathing.com/docs/pathing/guide/auto-usage)
9.  [TeleOp Usage](https://pedropathing.com/docs/pathing/guide/teleop-usage)

When something goes wrong, see
[Troubleshooting](https://pedropathing.com/docs/pathing/faq) and
[Debugging](https://pedropathing.com/docs/pathing/guide/debugging). Pedro
uses its own field coordinates, not FTC's; its
[Coordinates](https://pedropathing.com/docs/pathing/reference/coordinates)
page explains them. To draw a path and see its numbers before you drive
it, use the [Pedro Visualizer](https://visualizer.pedropathing.com/).

!!! tip "Pedro's guide uses Ivy. This course uses SolversLib."

    Lessons 7 and 8 follow paths with **Ivy**, the command library from the
    Pedro team. Read them for the ideas. You don't need Ivy if you use
    SolversLib from
    [LinearOpMode to command-based](linear-to-command-based.md): SolversLib
    has its own command for following a path, shown below.

## What the code looks like

The Quickstart's `pedro/Constants.java` has a `create(hardwareMap)` method.
After tuning, it builds your **Follower** from the three parts you tuned:
the drivetrain, the localizer and Foresight. The
[Constants](https://pedropathing.com/docs/pathing/tuning/constants) lesson
shows what it looks like. After that, an auto needs only a few calls:

| Call | What it does |
|---|---|
| `follower.setPose(startPose)` | Tells the follower where the robot starts. It must match where you really put the robot. |
| `follower.follow(path)` | Starts following a path |
| `follower.update()` | Reads the localizer and sets the drive powers. Call it **every loop**, or nothing moves. |
| `follower.isBusy()` | `true` until the robot has reached the end of the path and settled there, or a short timeout has passed |

A pose is made with a `PoseFactory`: `p.of(x, y, heading)`, in inches and,
with `PoseFactory.degrees()`, degrees. `line(start, end)` makes a straight
path, and `.linear(start, end)` turns the robot from the start heading to
the end heading along the way. When a path ends, the follower keeps
holding the robot at its end pose until you give it something else to do.

Here's the same two-path auto twice: once as a plain `OpMode` with a step
counter, the way you wrote state machines in
[Your first autonomous](first-autonomous.md), and once with SolversLib
commands. The plain one shows what the commands do for you.

<div class="vscode" markdown>
<div class="vscode__titlebar">pedro autos</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<div class="vscode__folder" style="--depth: 1">autos</div>
<button type="button" class="vscode__file is-active" style="--depth: 2" data-file="plain">TwoPathAuto.java</button>
<button type="button" class="vscode__file" style="--depth: 2" data-file="commands">TwoPathCommandAuto.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="plain" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/autos/TwoPathAuto.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode.autos;

@Autonomous(name = "Two paths (plain)")
public class TwoPathAuto extends OpMode {
    // Pedro coordinates: inches and degrees
    private final PoseFactory p = PoseFactory.degrees();
    private final Pose startPose = p.of(24, 24, 0);
    private final Pose scorePose = p.of(48, 48, 90);
    private final Pose parkPose = p.of(72, 48, 90);

    private Follower follower;
    private int step = 0;

    @Override
    public void init() {
        follower = Constants.create(hardwareMap);
        follower.setPose(startPose);
        follower.update();
    }

    @Override
    public void start() {
        follower.follow(line(startPose, scorePose)
                .linear(startPose, scorePose));
        step = 1;
    }

    @Override
    public void loop() {
        follower.update();   // every loop, first

        if (step == 1 && !follower.isBusy()) {
            // At scorePose. Score here, then park.
            follower.follow(line(scorePose, parkPose)
                    .linear(scorePose, parkPose));
            step = 2;
        } else if (step == 2 && !follower.isBusy()) {
            step = 3;   // parked
        }

        telemetry.addData("Step", step);
        telemetry.addData("X", follower.pose().x());
        telemetry.addData("Y", follower.pose().y());
    }
}
```

<div class="vscode__note" markdown>
**The loop you'd write yourself.** `start()` starts the first path.
Every loop, `update()` drives the robot along it, and the `if`s check
`isBusy()` to know when the robot has arrived, then start the next path.
Each new step, like scoring, means another number for `step` and another
`if`.
</div>
</div>
<div class="vscode__pane" data-file="commands" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/autos/TwoPathCommandAuto.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode.autos;

@Autonomous(name = "Two paths (command-based)")
public class TwoPathCommandAuto extends CommandOpMode {
    private final PoseFactory p = PoseFactory.degrees();
    private final Pose startPose = p.of(24, 24, 0);
    private final Pose scorePose = p.of(48, 48, 90);
    private final Pose parkPose = p.of(72, 48, 90);

    private Follower follower;

    @Override
    public void initialize() {
        follower = Constants.create(hardwareMap);
        follower.setPose(startPose);
        follower.update();
    }

    @Override
    public void preRun() {
        schedule(Commands.sequence(
                new FollowPathCommand(follower,
                        line(startPose, scorePose)
                                .linear(startPose, scorePose)),
                // Mechanism commands go here
                new FollowPathCommand(follower,
                        line(scorePose, parkPose)
                                .linear(scorePose, parkPose))
        ));
    }

    @Override
    public void run() {
        super.run();         // one scheduler loop
        follower.update();   // every loop
        telemetry.addData("X", follower.pose().x());
        telemetry.addData("Y", follower.pose().y());
        telemetry.update();
    }
}
```

<div class="vscode__note" markdown>
**The same auto as commands.** `FollowPathCommand` starts its path when it
starts, and ends when `isBusy()` turns `false`. So `Commands.sequence(...)`
starts the second path as soon as the robot has arrived at the first
pose. To score in between, put a command like `lift.goTo(Lift.HIGH)`, from
[Mechanism control](mechanism-control.md), between the two paths.
`run()` still calls `follower.update()` every loop.
</div>
</div>
</div>
</div>
</div>
</div>

Check this code against the Pedro docs for your version: Pedro's names
changed a lot between versions 2 and 3, and may change again.

??? info "The imports and Gradle lines"

    `line` is a static import. If Alt+Enter doesn't find it, type the first
    line yourself:

    ```java
    import static com.pedropathing.api.Paths.line;

    import com.pedropathing.api.PoseFactory;
    import com.pedropathing.follower.Follower;
    import com.pedropathing.math.Pose;
    import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
    import com.qualcomm.robotcore.eventloop.opmode.OpMode;
    import org.firstinspires.ftc.teamcode.pedro.Constants;

    // TwoPathCommandAuto.java also needs these, instead of OpMode
    import com.seattlesolvers.solverslib.command.CommandOpMode;
    import com.seattlesolvers.solverslib.command.Commands;
    import com.seattlesolvers.solverslib.pedroCommand.FollowPathCommand;
    ```

    The Pedro Quickstart already has Pedro. To add it to your own project,
    the Installation lesson adds these lines to the `repositories` and
    `dependencies` blocks in `build.dependencies.gradle`, then copies the
    Quickstart's `pedro` folder into your `teamcode` folder. The version
    numbers here are the ones the Quickstart uses now:

    ```groovy
    repositories {
        maven { url = "https://repo.dairy.foundation/releases/" }
    }

    dependencies {
        implementation "com.pedropathing:revhub:3.0.2"
        implementation "com.pedropathing:tuning:1.0.3"
    }
    ```

    `FollowPathCommand` is in a separate SolversLib library. Add it next to
    the SolversLib line from
    [LinearOpMode to command-based](linear-to-command-based.md#add-solverslib-to-your-project):

    ```groovy
    implementation "org.solverslib:pedroPathing:0.3.6"
    ```

    The SolversLib Quickstart comes with an older Pedro 3 version. If you
    started from it, change the Pedro version numbers to the ones above.

## Road Runner, the alternative

**Road Runner** is the other path library you'll see in FTC team code.
Version 1.0 (core 1.0.1, ftc 0.1.25) works and is well documented at
[rr.brott.dev](https://rr.brott.dev/docs/v1-0/installation/), with
[its own tuning steps](https://rr.brott.dev/docs/v1-0/tuning/) and
[MeepMeep](https://rr.brott.dev/docs/meepmeep/), a tool for previewing
paths on your computer. It works with tank drives as well as mecanum, and
it uses FTC Dashboard. But it's updated less often now: its
[quickstart](https://github.com/acmerobotics/road-runner-quickstart) was
last updated in October 2025 and still uses FTC SDK 11.0. Pick one library
for the season, and don't install both.

!!! info "Credit"

    These lessons are by the Pedro Pathing team, in the
    [Pedro Pathing docs](https://pedropathing.com/docs/pathing). The
    library is open source under the BSD 3-Clause license
    ([GitHub](https://github.com/Pedro-Pathing/PedroPathing)). This site
    only links to the docs.

## Try it

1.  **Tune Pedro.** Do lessons 1 to 3. In AutoTune's Tests procedure, run
    the Line Test and the Curved Test. Then run the Hold Test and push the
    robot gently: it should push back to where it was.
2.  **Write your auto.** Make `TwoPathCommandAuto` with poses for your
    field, drawn in the Pedro Visualizer first. Between the two paths, add
    a command from one of your subsystems, like the lift from
    [Mechanism control](mechanism-control.md).

You're done when the robot drives the Line Test back and forth without
drifting off the line, and your auto runs three times in a row from the
same start and ends within about an inch of `parkPose` each time, with
the mechanism moving between the paths. You should also be able to point
to the lines in `TwoPathAuto` that `FollowPathCommand` does for you.

## Learn more

- Pedro Pathing:
  [What's new with Pedro 3](https://pedropathing.com/docs/pathing/pedro3),
  for anyone coming from Pedro 2, and the
  [Quickstart](https://github.com/Pedro-Pathing/Quickstart) on GitHub
- Ivy: the [Ivy docs](https://pedropathing.com/docs/ivy), if you want to
  use the command library from Pedro's guide
- SolversLib:
  [Pedro commands](https://docs.seattlesolvers.com/pedro-pathing/pedro-commands),
  including commands to hold a point and to turn
- Road Runner:
  [Installation](https://rr.brott.dev/docs/v1-0/installation/) and
  [Tuning](https://rr.brott.dev/docs/v1-0/tuning/), if your team picks it
  instead
