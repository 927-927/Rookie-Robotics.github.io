# LinearOpMode to command-based

If you've written a `LinearOpMode`, you've written the loop yourself:
`while (opModeIsActive())`, and inside it your code reads the gamepad and
sets every motor. Command-based code runs in the same kind of loop, but you
stop writing what goes inside it. SolversLib's **command scheduler** runs in
the loop instead, and you tell it what to do once, when you press INIT.

FTC has no official command-based library. This course uses **SolversLib**,
the maintained version of the older FTCLib, run by FTC team 23511 Seattle
Solvers. It copies the design of WPILib, the FRC library, and keeps most of
its names. If you also program an FRC robot, the FRC page
[Time-based to command-based](../../frc/software/time-based-to-command-based.md)
explains the same scheduler for the roboRIO, and
[the names table](#wpilib-to-solverslib-names) below maps one to the other.

!!! note "Versions"

    Written for FTC SDK 12.0 and SolversLib 0.3.6 (September 2026).
    SolversLib needs Android Studio: it doesn't work in OnBot Java.
    SolversLib is still below version 1.0, so names can change between
    versions. Check its
    [changelog](https://docs.seattlesolvers.com/changelog) each summer.

## Who runs the loop

<!-- TODO diagram: two columns, in the style of docs/frc/assets/images/software/command-based-loop.svg. Left, "LinearOpMode": a while (opModeIsActive()) loop box holding three if statements (if A: set intake; if B: set claw; if timer done: stop) that all point at motors. Right, "Command-based": the same while loop holds only one line, run(), which points at the command scheduler box with four numbered steps: 1 subsystem periodic(), 2 check buttons, 3 run one step of each command, 4 start default commands. Both loops are labelled "every loop" (not "every 20 ms"). Caption: "Both run as fast as the hardware allows. The difference is who decides what happens inside the loop." -->

In a **LinearOpMode**, everything happens inside your `while` loop. Check
A, set the intake. Check B, set the claw. Watch an `ElapsedTime` to know
when to stop. Each new button or mechanism adds more `if`s to the same loop,
and nothing stops two of them from setting the same motor. In
[Your first autonomous](first-autonomous.md) you saw the other problem: one
`sleep()` or one long `while` stops everything else, so you had to write a
state machine by hand.

In **command-based** code, you don't write the loop. Your OpMode extends
`CommandOpMode`, a `LinearOpMode` from SolversLib that already has it.
Simplified, its `runOpMode()` looks like this:

```java
// Inside CommandOpMode (simplified). You don't write this.
public void runOpMode() {
    initialize();            // once, when you press INIT
    while (opModeInInit()) {
        initialize_loop();   // over and over, until PLAY
    }
    preRun();                // once, right after PLAY
    while (opModeIsActive()) {
        run();               // one scheduler loop
    }
    end();                   // once, after STOP
    reset();                 // clears the scheduler
}
```

`run()` has one line, the same line an FRC robot runs:

```java
CommandScheduler.getInstance().run();
```

Every loop, the scheduler does four things, in this order:

1.  **Runs each subsystem's `periodic()`**, for things that should always
    happen, like updating a sensor reading.
2.  **Checks every button binding**, and starts or cancels the commands
    bound to it.
3.  **Runs one step of every running command**, and ends any that are done.
4.  **Starts the default command** on any subsystem no command is using.

On an FRC robot this loop runs every 20&nbsp;ms. On an FTC robot there's no
fixed time: `CommandOpMode` starts the next loop as soon as the last one
ends, so how long a loop takes depends mostly on how much hardware your code
reads and writes.

You don't write this loop. You write the pieces it works with.

## The three pieces

<!-- TODO diagram: in the style of docs/frc/assets/images/software/command-based-pieces.svg. Three boxes: the A button binding (grey text: IntakeTeleOp.java) starts the intake.runIn() command with whenHeld; the command (grey text: Intake.java) requires the Intake subsystem (grey text: Intake.java), whose default command is intake.stop(). The command scheduler sits above them: it checks the binding, runs the command, and gives the subsystem to one command at a time. Caption: "The grey text at the bottom of each box is the file it's written in." -->

| Piece | What it is | Example |
|---|---|---|
| **Subsystem** | One part of the robot and the hardware it owns. Only its own commands touch its motors and servos. | `Intake`, which owns the intake motor |
| **Command** | One action. It *requires* the subsystems it uses. | `intake.runIn()`: run the intake motor at 80&nbsp;% |
| **Button binding** | A button (or any other true-or-false condition, called a **trigger**) and the command it starts or cancels. | `A` with `whenHeld(intake.runIn())`: run the intake while A is held |

Two rules keep everything in order:

- **One command per subsystem at a time.** When a new command needs a
  subsystem that's already in use, the scheduler interrupts the old command
  first. Two commands can never fight over the same motor.
- **When a subsystem is free, its default command runs.** For an intake,
  that's usually "stop".

## The simplest example

The intake runs while the driver holds A, and stops when they let go. Each
project below works like a small Android Studio window: click a file in the
explorer to see its code.

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. The motor's name, `"intake"`, must
match the name in the robot configuration on the Driver Station.

**LinearOpMode**, the way you wrote it in
[Your first OpMode](first-opmode.md). Everything is in one file:

<div class="vscode" markdown>
<div class="vscode__titlebar">LinearOpMode project</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="linear">IntakeLinear.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="linear" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeLinear.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Intake (LinearOpMode)")
public class IntakeLinear extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor motor =
                hardwareMap.get(DcMotor.class, "intake");

        waitForStart();

        while (opModeIsActive()) {
            if (gamepad1.a) {
                motor.setPower(0.8);
            } else {
                motor.setPower(0);
            }
        }
    }
}
```

<div class="vscode__note" markdown>
**Everything happens here.** Your `while` loop runs over and over after
PLAY, and your code checks the A button and sets the motor every time.
</div>
</div>
</div>
</div>
</div>
</div>

### Add SolversLib to your project

Before the command-based version builds, add SolversLib to the project.
Open `TeamCode/build.gradle`: the `build.gradle` inside the `TeamCode`
folder, not the one at the top of the project. Add the `repositories`
block above `dependencies`, and one line inside `dependencies`. Keep
everything that's already in the file:

```groovy
repositories {
    maven {
        url = "https://repo.dairy.foundation/releases"
    }
}

dependencies {
    // This line is already in the file
    implementation project(':FtcRobotController')
    // Add this line
    implementation "org.solverslib:core:0.3.6"
}
```

Then click **Sync Now** in the bar at the top of the editor. If Android
Studio offers to upgrade or downgrade the Android Gradle Plugin, say no.

Or start from the
[SolversLib Quickstart](https://github.com/FTC-23511/SolversLib-Quickstart),
a copy of FtcRobotController 12.0 with SolversLib already added. It also
includes Pedro Pathing, Panels and FTC Dashboard, which you'll use later.
Its versions of those may be older than the ones the later pages use, so
check them when you get there.

### The command-based version

The same robot, command-based. Start with `Intake.java`, then
`IntakeTeleOp.java`:

<div class="vscode" markdown>
<div class="vscode__titlebar">command-based project</div>
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
package org.firstinspires.ftc.teamcode.subsystems;

public class Intake extends SubsystemBase {
    private final DcMotor motor;

    public Intake(HardwareMap hardwareMap) {
        motor = hardwareMap.get(DcMotor.class, "intake");
    }

    // Runs the intake in until something cancels it
    public Command runIn() {
        return run(() -> motor.setPower(0.8));
    }

    // Holds the intake still
    public Command stop() {
        return run(() -> motor.setPower(0));
    }
}
```

<div class="vscode__note" markdown>
**The subsystem and its commands.** The subsystem owns the motor and has a
method for each thing it can do. Each method returns a command, but doesn't
decide *when* it runs. `run(...)` makes a command that runs the code inside
once every loop, and requires this subsystem. The constructor gets the motor
from the `hardwareMap` the OpMode passes in.
</div>
</div>
<div class="vscode__pane" data-file="teleop" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Intake (command-based)")
public class IntakeTeleOp extends CommandOpMode {
    // Created in initialize(), not here
    private Intake intake;

    @Override
    public void initialize() {
        intake = new Intake(hardwareMap);
        GamepadEx driver = new GamepadEx(gamepad1);

        intake.setDefaultCommand(intake.stop());
        driver.getGamepadButton(GamepadKeys.Button.A)
                .whenHeld(intake.runIn());
    }
}
```

<div class="vscode__note" markdown>
**The OpMode and the bindings.** `initialize()` runs once, when you press
INIT. It creates the subsystems, sets their default commands and binds
buttons to commands, like an FRC `RobotContainer`. `whenHeld` starts
`runIn()` when A is pressed and cancels it when A is released.
`CommandOpMode` runs the scheduler every loop after PLAY, so there's no
`while` loop here.
</div>
</div>
</div>
</div>
</div>
</div>

There's no `if (gamepad1.a)` anywhere. The scheduler checks A for you,
every loop.

!!! warning "Create subsystems in `initialize()`"

    Don't write `private Intake intake = new Intake(hardwareMap);` as a
    field. Fields are set up when the OpMode object is built, and
    `hardwareMap` isn't ready yet then, so the OpMode stops with a
    `NullPointerException`. Create every subsystem inside `initialize()`,
    each time the OpMode runs.

??? info "The imports, if Alt+Enter offers more than one choice"

    SolversLib also has an old `com.seattlesolvers.solverslib.command.old`
    package, with some classes of the same names, like `Command` and
    `CommandOpMode`. Don't pick those. The imports for the two files are:

    ```java
    // Intake.java
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.HardwareMap;
    import com.seattlesolvers.solverslib.command.Command;
    import com.seattlesolvers.solverslib.command.SubsystemBase;

    // IntakeTeleOp.java
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.seattlesolvers.solverslib.command.CommandOpMode;
    import com.seattlesolvers.solverslib.gamepad.GamepadEx;
    import com.seattlesolvers.solverslib.gamepad.GamepadKeys;
    import org.firstinspires.ftc.teamcode.subsystems.Intake;
    ```

## Pressing A, loop by loop

<!-- TODO diagram: timeline over 11 loops, in the style of docs/frc/assets/images/software/command-based-timeline.svg. Top row "A button": held during loops 4 to 8. Middle row "Intake": stop() starts at the end of loop 1 and runs in loops 2 to 3, runIn() in loops 4 to 8, stop() starts again at the end of loop 9 and runs from loop 10. Bottom row "inside runIn()": initialize and execute in loop 4, execute in loops 5 to 8, end in loop 9. Caption: "The driver holds A for five loops. A real button press lasts many more." -->

Here's what the scheduler does when the driver holds A for five loops. A
real button press lasts many more loops; five keep the picture small.

1.  **Loop 1:** the first loop after PLAY. Nothing needs the Intake, so at
    the end of the loop (step 4) the scheduler starts its default command,
    `stop()`.
2.  **Loops 2–3:** every loop, `stop()` runs one step and holds the motor
    at 0.
3.  **Loop 4:** the scheduler checks the bindings and sees A go from
    released to held, so `whenHeld` starts `runIn()`. `runIn()` requires
    the Intake, which `stop()` is using, so the scheduler interrupts
    `stop()` first.
4.  **Loops 4–8:** every loop, the scheduler runs one step of `runIn()`,
    which sets the motor to 80&nbsp;%.
5.  **Loop 9:** A goes from held to released, so `whenHeld` cancels
    `runIn()`. The Intake is free, so at the end of the same loop the
    scheduler starts `stop()` again.
6.  **Loop 10 on:** `stop()` sets the motor to 0. Ending `runIn()` didn't
    change the motor, so for one loop it kept its last power.

!!! note "whenHeld or whileHeld?"

    SolversLib has two bindings for "while the button is held". Both cancel
    the command when you let go. `whenHeld` starts the command once, when
    you press the button. `whileHeld` tries to start it again every loop,
    so if the command ends while you're still holding the button, it
    starts again in the next loop.

    For `runIn()`, which never ends by itself, they do the same thing. They
    differ for a command that does end, like
    `intake.runIn().withTimeout(1000)`. With `whenHeld`, holding A runs the
    intake for one second, then `stop()` takes over until you press A
    again. With `whileHeld`, the intake keeps running as long as you hold
    A. `whenHeld` is the one that matches WPILib's `whileTrue`.

### Inside a command

The bottom row of the picture shows the parts of a command. Every command
has four, and the scheduler calls each one at a set time:

| Part | When the scheduler calls it |
|---|---|
| `initialize()` | Once, when the command starts |
| `execute()` | Every loop while it runs |
| `isFinished()` | Every loop, after `execute()`. Returning `true` ends the command. |
| `end(interrupted)` | Once, when it finishes or gets cancelled |

`run(...)` puts your code in `execute()` and never finishes by itself, so it
runs until a binding cancels it or another command interrupts it. A few
other ways to make a command cover most needs. `runOnce` and `startEnd` are
subsystem methods, like `run`, so you use them inside a subsystem. The rest
work anywhere, with any commands:

| Code | What the command does |
|---|---|
| `runOnce(() -> ...)` | Runs the code once, then finishes |
| `startEnd(() -> a, () -> b)` | Runs `a` when it starts and `b` when it ends. Like `run`, it never finishes by itself, so `b` runs when it's cancelled or interrupted. |
| `run(...).withTimeout(2000)` | Like `run(...)`, but ends after 2000&nbsp;ms. SolversLib times are in **milliseconds**, not seconds. |
| `first.andThen(second)` | Runs `first`, then `second` |
| `Commands.sequence(a, b, c)` | Runs `a`, then `b`, then `c`. This replaces the state machine from [Your first autonomous](first-autonomous.md). |
| `Commands.parallel(a, b)` | Runs `a` and `b` at the same time, and finishes when both are done. They must require different subsystems. |
| `Commands.waitMillis(500)` | Waits 500&nbsp;ms, then finishes. Put it between steps in a sequence. |

A command group, like a sequence, requires every subsystem its commands
use, for as long as the whole group runs.

## What's different on FTC

The scheduler, subsystems, commands and the two rules work the same as on
an FRC robot. What's around them is different:

| On an FRC robot | On an FTC robot |
|---|---|
| One robot program runs the whole time the robot is on. `robotPeriodic()` runs even while disabled. | Each OpMode is its own program, and nothing runs between OpModes. When an OpMode ends, `CommandOpMode` resets the scheduler. |
| Disabled, then enabled | INIT, then PLAY. The scheduler doesn't run during INIT. |
| `autonomousInit()` starts the auto | An `@Autonomous` OpMode schedules its auto in `preRun()` |
| The loop runs every 20&nbsp;ms | The loop runs as fast as the hardware reads allow |
| Dashboard values are sent for you | You call `telemetry.update()` yourself |
| Times are in seconds | Times are in milliseconds |
| Several controllers, by port number | Two gamepads, `gamepad1` and `gamepad2` |

### One OpMode, one program

Your teleop and each auto are separate classes, and each one sets up its
own subsystems, default commands and bindings in `initialize()`. When the
OpMode ends, `CommandOpMode` calls `reset()`, which throws away the
scheduler with everything in it, so nothing carries over to the next
OpMode. If teleop needs something from auto, like where the robot ended up,
keep it in a `static` field.

For a second driver, make a second `GamepadEx`:
`GamepadEx operator = new GamepadEx(gamepad2);`. PlayStation names work
too: `GamepadKeys.Button.CROSS` is the same button as `A`.

### INIT and PLAY

<!-- TODO diagram: a timeline of one CommandOpMode run. INIT pressed -> initialize() once -> initialize_loop() repeated (label: "scheduler not running") -> PLAY pressed -> preRun() once -> run() every loop (label: "scheduler running: periodic, bindings, commands, defaults") -> STOP -> end(), reset(). -->

`initialize()` runs when you press INIT, but the scheduler only starts
after PLAY. So during INIT, pressing A does nothing, and no default command
runs. To do something over and over during INIT, like showing telemetry or
letting the driver pick an alliance, override `initialize_loop()`. Call
`telemetry.update()` there too, or the telemetry won't show.

An auto schedules its routine in `preRun()`, which runs once, right after
PLAY:

```java
@Autonomous(name = "Intake auto")
public class IntakeAuto extends CommandOpMode {
    private Intake intake;

    @Override
    public void initialize() {
        intake = new Intake(hardwareMap);
        intake.setDefaultCommand(intake.stop());
    }

    @Override
    public void preRun() {
        schedule(Commands.sequence(
                Commands.waitMillis(500),
                intake.runIn().withTimeout(2000)
        ));
    }
}
```

The auto waits half a second, then runs the intake for two seconds. Then
the sequence is done, the Intake is free, and its default command `stop()`
stops the motor.

Don't schedule the auto in `initialize()`. Scheduling a command calls its
`initialize()` right away, so the first step would start during INIT: a
servo could move before PLAY, and a wait would start counting early.

### Telemetry

`CommandOpMode` is a `LinearOpMode`, so telemetry only shows up when you
call `telemetry.update()`. Override `run()`, keep the scheduler loop with
`super.run()`, and add your telemetry after it. For example, give `Intake`
a method that reads the motor's power:

```java
// In Intake.java
public double getPower() {
    return motor.getPower();
}
```

Then, in `IntakeTeleOp.java`:

```java
@Override
public void run() {
    super.run();   // one scheduler loop
    telemetry.addData("Intake power", intake.getPower());
    telemetry.update();
}
```

If you forget `super.run()`, the scheduler stops running and nothing
moves.

### Loop time and bulk reads

Every hardware read takes time, so a loop that reads many encoders and
sensors gets slow. A **bulk read** reads every motor encoder and sensor on
a hub (except I2C sensors) at once. SolversLib can turn bulk reads on for
every hub with one line in `initialize()`:

```java
CommandScheduler.getInstance().setBulkReading(
        hardwareMap, LynxModule.BulkCachingMode.AUTO);
```

[Mechanism control](mechanism-control.md) explains bulk reads, how to
measure your loop time, and the faster `MANUAL` mode.

## WPILib to SolversLib names

If you know WPILib's command-based code, most names carry over. The button
bindings use WPILib's older names.

| WPILib (FRC) | SolversLib (FTC) |
|---|---|
| `TimedRobot` and `Robot.java` | One `CommandOpMode` class per OpMode |
| `robotPeriodic()` calls `CommandScheduler.getInstance().run()` | `CommandOpMode` already calls it, every loop after PLAY |
| `RobotContainer` constructor | `initialize()` |
| `autonomousInit()` schedules the auto | `preRun()` schedules the auto |
| `extends SubsystemBase`, `setDefaultCommand(...)` | The same |
| `run`, `runOnce`, `startEnd`, `andThen`, `alongWith` | The same |
| `Commands.sequence`, `Commands.parallel`, `Commands.race` | The same |
| `new CommandXboxController(0)` | `new GamepadEx(gamepad1)` |
| `driver.a()` | `driver.getGamepadButton(GamepadKeys.Button.A)` |
| `whileTrue(...)` | `whenHeld(...)` |
| `onTrue(...)` | `whenPressed(...)` |
| `onFalse(...)` | `whenReleased(...)` |
| `toggleOnTrue(...)` | `toggleWhenPressed(...)` |
| `new Trigger(() -> ...).onTrue(...)` | `new Trigger(() -> ...).whenActive(...)` |
| `new Trigger(() -> ...).whileTrue(...)` | `new Trigger(() -> ...).whileActiveOnce(...)` |
| `withTimeout(2)`: 2 seconds | `withTimeout(2000)`: 2000 milliseconds |
| `Commands.waitSeconds(1)` | `Commands.waitMillis(1000)` |
| `until(condition)` | `interruptOn(condition)` |
| `new PWMSparkMax(0)` in a field | `hardwareMap.get(DcMotor.class, "intake")` in the subsystem's constructor |

## Other frameworks you'll see

When you read other teams' code or older tutorials, you'll meet other
command libraries. The ideas are the same; the names are not.

### FTCLib

FTCLib is the library SolversLib was copied from. Its last release, 2.1.1,
came out in February 2023 and was built for FTC SDK 7.1. There has been no
release since.
Older team code and tutorials still use it. Its class names are the same
as SolversLib's, but older code makes commands with classes, like
`new RunCommand(() -> ..., intake)`, instead of `intake.run(...)`.
SolversLib has those classes too. To move FTCLib code over, change
`com.arcrobotics.ftclib` to `com.seattlesolvers.solverslib` in the imports,
and don't install both libraries. FTCLib's old docs website now sends you
to an unrelated site, so don't follow links to it. The code is on
[GitHub](https://github.com/FTCLib/FTCLib).

### NextFTC

[NextFTC](https://nextftc.dev/) is a command library written in Kotlin
that also supports Java. Version 1 (1.1.0) is stable, but its Pedro Pathing
extension still uses Pedro 2. Version 2 (0.3.0, October 2026) is built on
Ivy and uses WPILib's newer names: `onTrue`, `whileTrue` and `toggleOnTrue`,
a `Mechanism` for a subsystem and a `NextRobot` for the `RobotContainer`.
It isn't at 1.0 yet and parts of its docs still say "coming soon", so this
course doesn't use it this season.

### Ivy

[Ivy](https://pedropathing.com/docs/ivy) is the command library from the
Pedro Pathing team, and Pedro's guide uses it to follow paths (see
[Path following](path-following.md)). It has a scheduler and commands, but
no subsystem class, no button bindings and no default commands: you call
`Scheduler.execute()` in your own loop. A command can require any object,
and when two commands need the same one, Ivy compares their priorities. It
can also queue or pause a command instead of cancelling it. You don't need
Ivy to use Pedro with SolversLib, which has its own
[Pedro commands](https://docs.seattlesolvers.com/pedro-pathing/pedro-commands)
in an extra library, `org.solverslib:pedroPathing:0.3.6`.

## Try it

1.  **Add a claw.** Add a second subsystem, `Claw`, that owns a `Servo`
    named `"claw"` in the robot configuration. Give it `open()` and
    `close()` commands made with `runOnce(...)`: a servo holds its
    position, so setting it once is enough. Find the two positions
    (between 0 and 1) by testing on your robot. In `IntakeTeleOp`, bind
    `GamepadKeys.Button.RIGHT_BUMPER` to `open()` and
    `GamepadKeys.Button.LEFT_BUMPER` to `close()` with `whenPressed`. The
    claw doesn't need a default command.
2.  **Write a sequential auto.** Make an `@Autonomous` `CommandOpMode` that,
    in `preRun()`, schedules one `Commands.sequence(...)`: close the claw,
    wait 1000&nbsp;ms, run the intake for 2 seconds, then open the claw.

You're done when holding A runs the intake and letting go stops it, the
bumpers open and close the claw even while the intake runs, and your auto
does its four steps in order, with nothing moving until you press PLAY.
You should also be able to explain, loop by loop, why the intake stops
when you let go of A: what cancels `runIn()`, and when `stop()` starts.

## Learn more

- SolversLib docs:
  [Command System](https://docs.seattlesolvers.com/command-base/command-system),
  [Subsystems](https://docs.seattlesolvers.com/command-base/command-system/subsystems),
  [Command Groups](https://docs.seattlesolvers.com/command-base/command-system/command-groups),
  [Command Scheduler](https://docs.seattlesolvers.com/command-base/command-system/command-scheduler),
  [Binding Commands to Triggers](https://docs.seattlesolvers.com/command-base/command-system/binding-commands-to-triggers)
  and
  [Robot and CommandOpMode](https://docs.seattlesolvers.com/command-base/command-system/robot-and-commandopmode).
  Parts of the docs come from FTCLib and have small mistakes. If an example
  doesn't build, check the class in the
  [SolversLib source](https://github.com/FTC-23511/SolversLib).
- [SolversLib Quickstart](https://github.com/FTC-23511/SolversLib-Quickstart):
  a ready-made project with SolversLib, Pedro Pathing and the dashboards
- The FRC page
  [Time-based to command-based](../../frc/software/time-based-to-command-based.md),
  for the same scheduler on an FRC robot
