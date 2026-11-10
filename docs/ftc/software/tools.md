# Developer tools

Telemetry on the Driver Hub shows a few lines of text. As your code grows,
you'll want more: graphs of a value over time, numbers you can change while
the robot runs, a record of what happened before a crash, and deploys that
don't take a minute. This page covers a tool for each. You don't need them
all at once. Set up Git on day one, learn to read logs at your first crash,
and add a dashboard when you start tuning in
[Mechanism control](mechanism-control.md).

!!! note "Versions"

    Written for FTC SDK 12.0 with Panels (`fullpanels` 1.0.20, November
    2026), FTC Dashboard 0.6.0 (May 2026) and Sloth 0.3.2 (September 2026).
    All three are libraries that you add through Gradle, so this page
    assumes Android Studio, not OnBot Java.

## Pick one dashboard

A **dashboard** is a web page that the Control Hub serves while the Robot
Controller app runs. You open it in a browser on a laptop connected to the
robot's Wi-Fi. The two that FTC teams use do the same main jobs:

<!-- TODO diagram: a laptop browser window showing a dashboard with three panels: a telemetry list ("position: 0.50"), a line graph of a lift's target and position over time, and a "live variables" box with "position = 0.5" in an editable field. A Wi-Fi arrow connects the laptop to a Control Hub (label: "your OpMode runs here"). Two arrows on the Wi-Fi link: Control Hub to laptop "telemetry, every loop"; laptop to Control Hub "new value for position". Caption: "The dashboard reads telemetry from your OpMode and writes new values into its public static fields." -->

- **Telemetry and graphs.** The same telemetry as the Driver Hub, plus a
  graph of any number over time. A graph shows at a glance whether a lift
  overshoots its target.
- **Live variables.** Mark a field `public static` in a class with the
  dashboard's annotation, and you can change it from the browser while the
  OpMode runs. No rebuild, no redeploy. This is how teams tune PID gains.
- **Field view.** Draw the robot's position on a picture of the field.
- **Extras.** A camera stream, buttons to start and stop OpModes, and a
  view of the gamepads.

| | Panels | FTC Dashboard |
|---|---|---|
| **Made by** | Lazar ([ftcontrol](https://github.com/ftcontrol/ftcontrol-panels)) | ACME Robotics ([acmerobotics](https://github.com/acmerobotics/ftc-dashboard)) |
| **Version** | `fullpanels` 1.0.20 (November 2026) | 0.6.0 (May 2026) |
| **Open it at** | `http://192.168.43.1:8001` | `http://192.168.43.1:8080/dash` |
| **Live variables** | `@Configurable` on the class | `@Config` on the class |
| **Often used with** | Pedro Pathing | Road Runner, which needs it |
| **License** | "Other" on GitHub: read it before you copy its code | MIT |

If you'll follow this course to [Path following](path-following.md) with
Pedro Pathing, pick **Panels**. If your team already uses Road Runner, you
already have **FTC Dashboard**. Either way, pick one and stay with it. This
course hasn't tested running both at once.

### Tuning a value live

A first job for a dashboard: finding the exact positions where a claw is
open and closed. Instead of changing a number, redeploying and trying again,
you type numbers into the browser and watch the servo move.

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. The servo's name, `"claw"`, must
match the name in the robot configuration on the Driver Station. Both files
do the same thing: click each one to compare.

<div class="vscode" markdown>
<div class="vscode__titlebar">dashboard tuning</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="panels">ServoTunerPanels.java</button>
<button type="button" class="vscode__file" style="--depth: 1" data-file="dashboard">ServoTunerDashboard.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="panels" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/ServoTunerPanels.java" markdown>

```java linenums="1"
@Configurable
@TeleOp(name = "Servo Tuner (Panels)", group = "Tools")
public class ServoTunerPanels extends LinearOpMode {
    // Change this from Panels while the OpMode runs
    public static double position = 0.5;

    @Override
    public void runOpMode() {
        Servo claw = hardwareMap.get(Servo.class, "claw");

        // Sends telemetry to the Driver Hub and to Panels
        Telemetry both = new JoinedTelemetry(
                PanelsTelemetry.INSTANCE.getFtcTelemetry(),
                telemetry);

        waitForStart();
        while (opModeIsActive()) {
            claw.setPosition(position);  // every loop
            both.addData("position", position);
            both.update();
        }
    }
}
```

<div class="vscode__note" markdown>
**Panels.** `@Configurable` tells Panels to show the class's
`public static` fields, so `position` appears in its Configurables view.
`JoinedTelemetry` sends each line to both the Driver Hub and Panels, and
`both.update()` sends them. Panels is a Kotlin library, so from Java you
reach its telemetry through `PanelsTelemetry.INSTANCE`.
</div>
</div>
<div class="vscode__pane" data-file="dashboard" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/ServoTunerDashboard.java" markdown>

```java linenums="1"
@Config
@TeleOp(name = "Servo Tuner (Dashboard)", group = "Tools")
public class ServoTunerDashboard extends LinearOpMode {
    // Change this from FTC Dashboard while the OpMode runs
    public static double position = 0.5;

    @Override
    public void runOpMode() {
        Servo claw = hardwareMap.get(Servo.class, "claw");

        // Sends telemetry to the Driver Hub and the dashboard
        Telemetry both = new MultipleTelemetry(
                telemetry,
                FtcDashboard.getInstance().getTelemetry());

        waitForStart();
        while (opModeIsActive()) {
            claw.setPosition(position);  // every loop
            both.addData("position", position);
            both.update();
        }
    }
}
```

<div class="vscode__note" markdown>
**FTC Dashboard.** `@Config` tells FTC Dashboard to show the class's
`public static` fields in its Configuration view. They must not be `final`.
`MultipleTelemetry` sends each line to both the Driver Hub and the
dashboard, and `both.update()` sends them.
</div>
</div>
</div>
</div>
</div>
</div>

Three things to know about live variables:

1.  **Read the field every loop**, as line 18 does. If you copy it into
    another variable before the loop, or pass it into a constructor, the
    copy never sees the new value.
2.  **Changes only last until the app restarts.** The dashboard changes the
    value in the Control Hub's memory, not in your code. When you've found
    a good number, write it into your code.
3.  **The servo moves as soon as you press PLAY.** Start from a value you
    know is safe, and change it in small steps, so the claw doesn't crash
    into the robot.

Any number you send as telemetry can also be shown as a graph, in either
dashboard. [Mechanism control](mechanism-control.md) uses live variables
like these to tune a lift's PID.

!!! warning "Not during matches"

    Don't connect to a dashboard during a match. FTC Dashboard's
    [Competition Use](https://acmerobotics.github.io/ftc-dashboard/competition)
    page explains why and how to turn it off. Check the current Competition
    Manual for the rules.

??? note "Gradle lines for the dashboards"

    Open `build.dependencies.gradle`, at the top level of the project. Add
    the lines for the dashboard you picked, then click **Sync Now**. Panels
    also needs the Dairy repository, because since SDK 12 it uses parts of
    Sloth to scan your code.

    ```groovy
    repositories {
        mavenCentral()
        google() // already here

        // Panels: both of these
        maven { url = "https://mymaven.bylazar.com/releases" }
        maven { url = "https://repo.dairy.foundation/releases" }

        // FTC Dashboard
        maven { url = "https://maven.brott.dev/" }
    }

    dependencies {
        // ... the org.firstinspires.ftc lines already here ...

        // Panels: fullpanels, or single plugins, never both
        implementation "com.bylazar:fullpanels:1.0.20"

        // FTC Dashboard
        implementation "com.acmerobotics.dashboard:dashboard:0.6.0"
    }
    ```

    `fullpanels` has every official Panels plugin. You can install single
    plugins instead, but don't mix the two: you'd get the same classes
    twice. Before you update Panels, read its changelog and do a clean
    build. If you use Sloth, read [its section](#sloth-deploy-in-seconds)
    first.

## Logs

Telemetry shows what's happening now, on a small screen. When an OpMode
crashes, or something happens too fast to read, you need the **log**: a
file where the Robot Controller app writes what it's doing, with your own
messages mixed in.

When an OpMode crashes, the Driver Station shows a short error message. The
full story is in the Robot Controller log, `/sdcard/ftcRobotControllerLog.txt`
on the Control Hub (sometimes with a digit added to its name).

To add your own messages, call `RobotLog.d(...)`. It works like
`String.format`: `%d` for whole numbers, `%.2f` for decimals. Start each
message with a word you can search for. Here `target` is an `int` and
`lift` is a `DcMotor`:

```java
RobotLog.d("TEAM lift target %d, position %d",
        target, lift.getCurrentPosition());
```

There are two ways to read the log:

- **Live, in Logcat.** Connect to the Control Hub over USB-C or Wi-Fi (adb),
  and open Android Studio's **Logcat** window (**View > Tool Windows >
  Logcat**). It shows every line as it's written. Type your word, `TEAM`,
  into its search box to hide everything else.
- **Afterwards, as a file.** With adb connected, this copies the log into
  the folder your terminal is in:

    ```text
    adb pull /sdcard/ftcRobotControllerLog.txt
    ```

The log keeps everything, even after the OpMode ends. A `RobotLog.d` line
at each step of an auto tells you exactly where it went wrong.

## Sloth: deploy in seconds

A normal deploy rebuilds and reinstalls the whole Robot Controller app,
which takes a while. **Sloth**, from the Dairy Foundation, sends only your
changed TeamCode instead, in 2 seconds or less. It's for teams that are
comfortable with Gradle; skip it until then.

How it behaves:

- **Only TeamCode reloads**: classes in the `org.firstinspires.ftc.teamcode`
  package and the packages inside it.
- **Changes apply when the running OpMode ends**, so it's safe to deploy
  while the robot runs something.
- **Changes survive restarts and power cycles.**
- **Some changes still need a full install** with the green **Run** button:
  adding or updating a library, editing Gradle files, and changing files
  outside TeamCode. If you hot reload one of these, code that builds can
  still fail on the robot.

To set it up:

1.  Add the Gradle lines below to `TeamCode/build.gradle`, sync, and do one
    normal install.
2.  In Android Studio, open **Edit Configurations**, add a new **Gradle**
    configuration and give it the task `deploySloth`. Android Studio won't
    autocomplete the name; type it in full. Save.
3.  Edit the **TeamCode** configuration. Add a Gradle task that runs before
    launch, with the task `removeSlothRemote` and the Gradle project
    `:TeamCode`. Move it to the top of the list and save.
4.  From now on, run `deploySloth` to deploy.

If you use a dashboard with Sloth:

- **FTC Dashboard:** Sloth's README says to install its own build,
  `com.acmerobotics.slothboard:dashboard:0.3.2+0.6.0`, instead of the
  normal one.
- **Panels:** Panels' docs say its normal `com.bylazar` packages now work
  with Sloth. Sloth's README still lists an older `com.bylazar.sloth`
  build; follow the Panels docs.

!!! warning "Old Sloth code on the robot"

    If the robot once had Sloth's Load plugin and your project no longer
    does, the old hot-reloaded code on the robot can keep replacing every
    new install. Sloth's README says this is common for teams moving to
    Pedro Pathing 3 or NextFTC v2 this season. With adb connected, delete
    the old code:

    ```text
    adb shell rm -rf /storage/emulated/0/FIRST/dairy/sloth/*
    ```

??? note "Gradle lines for Sloth"

    All of these go in `TeamCode/build.gradle`, not
    `build.dependencies.gradle`. This is the setup for teams that don't use
    other Dairy libraries; Sloth's README covers the other case.

    At the very top of the file:

    ```groovy
    buildscript {
        repositories {
            mavenCentral()
            google()
            maven {
                url "https://repo.dairy.foundation/releases"
            }
        }
        dependencies {
            classpath "dev.frozenmilk:Load:0.3.2"
        }
    }
    ```

    After the existing `apply plugin:` line:

    ```groovy
    apply plugin: 'dev.frozenmilk.sinister.sloth.load'
    ```

    Above the `dependencies` block, and inside it:

    ```groovy
    repositories {
        maven {
            url = "https://repo.dairy.foundation/releases"
        }
    }

    dependencies {
        implementation project(':FtcRobotController') // already here
        implementation("dev.frozenmilk.sinister:Sloth:0.3.2")
    }
    ```

## Git and GitHub

In [Getting started](getting-started.md) you forked FtcRobotController.
That fork is your team's code repository. **Git** keeps every saved
version of your code, and **GitHub** keeps a copy online. A few habits
make them work for you:

- **Commit every time something works**, with a message that says what
  changed: "Intake runs while A is held", not "update".
- **Push at the end of every session**, so a lost laptop doesn't lose your
  code.
- **Pull before you start**, so you work on the latest code.
- **Commit before every competition**, so you can always get back to the
  code that was on the robot.
- **Pull in each new SDK version** from FIRST's repository when it comes
  out. FTC Docs'
  [Fork and Clone from GitHub](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/fork_and_clone_github_repository/Fork-and-Clone-From-GitHub.html)
  shows the commands.

Android Studio has Git built in: its **Git** menu can commit, push and
pull. To learn Git itself, do frcsoftware.org's
[Git - Uploading Code](https://frcsoftware.org/learning-course/stage0/git/)
lesson, the same one the FRC [Java basics](../../frc/software/java-basics.md)
page uses. It's written for FRC, but Git works the same for FTC code.

## AdvantageScope (explore)

[AdvantageScope](https://docs.advantagescope.org/whats-new/) is a data
viewer from FRC. Its 2026 version added **experimental** FTC support: FTC
fields and robot models, FTC coordinates, Road Runner log files and live
data from FTC Dashboard. Its docs warn teams to be careful relying on it
during the season, and full FTC support is planned for when Systemcore
arrives in 2027–28. Try it if you're curious, but don't build on it this
season.

## Try it

1.  **Tune a servo live.** Install one dashboard (Panels if you'll follow
    this course to Pedro Pathing). Run the matching servo tuner above and
    find your claw's open and closed positions from the browser. Write
    both numbers into your code.
2.  **Log an auto.** Add a `RobotLog.d` line at each step of the auto you
    wrote in [Your first autonomous](first-autonomous.md). Run it and find
    your lines in Logcat.
3.  **Commit and push** your work to your team's fork on GitHub.

You're done when you can change a number in the browser and see the robot
react without redeploying, you can find your own log lines in Logcat, and
your team's code is on GitHub with commit messages that say what changed.

## Learn more

- Panels: the [docs](https://panels.bylazar.com/) and the
  [Java quickstart](https://github.com/ftcontrol/Panels-Quickstart-Java)
- FTC Dashboard: the [docs](https://acmerobotics.github.io/ftc-dashboard/)
  and its [features](https://acmerobotics.github.io/ftc-dashboard/features)
  page, which also shows the field view
- FTC Docs:
  [Using Log Files to Troubleshoot](https://ftc-docs.firstinspires.org/en/latest/control_system_troubleshooting/using_log_files/using-log-files.html)
- gm0:
  [Using Android Studio](https://gm0.org/en/latest/docs/software/getting-started/using-android-studio.html),
  which covers Logcat
- [Sloth](https://github.com/Dairy-Foundation/Sloth) on GitHub, and the
  [Dairy Templates](https://github.com/Dairy-Foundation/Templates), which
  include a project template with Sloth already set up
- AdvantageScope's
  [live sources](https://docs.advantagescope.org/overview/live-sources/),
  for connecting it to FTC Dashboard
