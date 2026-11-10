# Mechanism control

Almost every mechanism on a robot either **spins** or **moves to a
position**. An intake roller or a flywheel spins: you care how fast it
turns, not where it stops. A lift or an arm moves to a position: it has to
stop at the right height and stay there, while gravity pulls it down. FRC
team 2910 splits its code the same way, into
[roller and servo subsystems](../../frc/software/command-based-styles/team-2910.md#the-kinds-of-base).

This page starts with the motor modes built into the FTC SDK. Then you
write your own PID and feedforward loop for a lift, as a SolversLib
subsystem like the ones in
[LinearOpMode to command-based](linear-to-command-based.md). Last, you make
the loop fast with bulk reads and tune it live from a laptop.

!!! note "Versions"

    Written for FTC SDK 12.0 and SolversLib 0.3.6. The gains and positions
    in the code are examples. Every mechanism needs its own, and this page
    shows how to find them.

## Two kinds of mechanism

<!-- TODO diagram: two columns, in the style of docs/frc/assets/images/software/team-2910-roller-servo.svg but with FTC parts. Left, "Spins": an intake roller pulling in a game piece, with a curved arrow and the label "speed or power, no end point". Right, "Moves to a position": a linear slide lift with a bottom hard stop and a top limit, a dashed line at the target height, a down arrow labelled "gravity" and an up arrow labelled "kG holds it up". Caption: "A roller cares how fast it turns. A lift cares where it stops." -->

| | Spins | Moves to a position |
|---|---|---|
| **Examples** | Intake roller, flywheel, conveyor | Lift, arm, turret |
| **What you control** | Power, or speed | Position |
| **Encoder** | Only if you control speed, like a flywheel | Always |
| **When it's not moving** | Coasts or brakes | Holds its position, even against gravity |
| **Limits** | None: it can spin forever | A bottom and a top it must never pass |
| **Built-in mode** | `RUN_WITHOUT_ENCODER` for power, `RUN_USING_ENCODER` with `setVelocity()` for speed | `RUN_TO_POSITION` |

## The built-in motor modes

Every motor has a **run mode**, which you set with `setMode(...)`. Two of
the four modes use the encoder to run a control loop on the hub for you:

| Run mode | What the hub does |
|---|---|
| `RUN_WITHOUT_ENCODER` | Sends the power you set, with no feedback. The encoder still counts. |
| `RUN_USING_ENCODER` | Runs a speed loop. You ask for a speed with `setVelocity()`. |
| `RUN_TO_POSITION` | Drives the motor to the target you set with `setTargetPosition()`, then holds it there, like a servo |
| `STOP_AND_RESET_ENCODER` | Stops the motor and sets the encoder count to 0 |

The two control loop modes need to know which motor they're controlling,
for example how fast it can turn. So in the robot configuration on the
Driver Station, set the correct motor type for each port. With the wrong
type, these modes don't behave the way you expect.

### A flywheel: setVelocity

To spin at a set speed, use `DcMotorEx`, a version of `DcMotor` with more
methods, and give `setVelocity()` a speed in encoder ticks per second:

```java
DcMotorEx flywheel =
        hardwareMap.get(DcMotorEx.class, "flywheel");
flywheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

flywheel.setVelocity(1500);   // ticks per second
double speed = flywheel.getVelocity();
```

The hub keeps adjusting the power to hold the speed, for example when a
game piece slows the wheel down. If the wheel is slow to get back up to
speed, you can change the speed loop's gains with
`setVelocityPIDFCoefficients(p, i, d, f)`.

### A lift: RUN_TO_POSITION

You used `RUN_TO_POSITION` to drive by encoder in
[Your first autonomous](first-autonomous.md). It works for a lift too,
with the same order of calls:

```java
// Once, at INIT: encoders don't reset by themselves
lift.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

// Each time you want a new height
lift.setTargetPosition(1500);                   // 1. target
lift.setMode(DcMotor.RunMode.RUN_TO_POSITION);  // 2. mode
lift.setPower(0.8);                             // 3. power
```

Set the target before the mode: the other way round gives an error. The
power is the top speed for the move, and it's always positive, because the
hub works out the direction itself. `isBusy()` is `true` while the motor
is still moving to the target.

### Why teams write their own

`RUN_TO_POSITION` is a good start, but most strong teams replace it:

- **It's slow to react.** gm0 says the hub's built-in loop runs 20 times a
  second. Your own loop can run several times faster.
- **It only has a P term for position.** The hub turns the position error
  into a speed, then runs its speed loop. For the position part, only the
  P gain is used.
- **It doesn't know about gravity.** A heavy lift sags below its target or
  bounces, because nothing adds the extra push needed just to hold it up.
- **You can't see inside it.** With your own loop, you can show every
  number on telemetry, graph it, and change it while the robot runs.

So you put the motor in `RUN_WITHOUT_ENCODER`, read the encoder yourself,
and work out the power in your own code, every loop. The encoder keeps
counting in this mode.

## Your own PID and feedforward

A control loop sets the motor power from two kinds of terms:

- **Feedback** looks at the **error**: how far the mechanism is from its
  **target**, or `target - position`. It pushes to make the error smaller.
  PID is feedback.
- **Feedforward** is power you already know the mechanism needs, whatever
  the error is. Holding a lift up against gravity takes about the same
  power at every height, so you add it all the time.

### PID

| Term | What it does | In code |
|---|---|---|
| **P**, proportional | Pushes harder the farther the mechanism is from the target | `kP * error` |
| **D**, derivative | Pushes against fast changes in the error, so the mechanism slows down as it gets close instead of overshooting | `kD * (error - lastError) / dt` |
| **I**, integral | Adds up the error over time, to close a small gap that P alone never closes | `kI * integral` |

Each term has a **gain**, like `kP`: a number you find by tuning. Most
lifts and arms need only P and D. Add I last, and only if you need it.

### Feedforward

| Term | Use it for | In code |
|---|---|---|
| **kG** | A lift. Gravity pulls it down with the same force at every height. | `kG` |
| **kCos** | An arm. Gravity pulls hardest when the arm is level, and not at all when it points straight up. | `kCos * Math.cos(angle)` |
| **kS** | Friction. A small push in the direction the mechanism needs to move, so a small error still moves it. | `kS * Math.signum(error)` |

For a lift, the whole loop adds up to:

```java
power = kP * error + kD * derivative + kG;
```

### A lift subsystem

The lift below moves to whatever its target says, and holds it there. The
control loop is in `periodic()`, which the scheduler runs every loop. The
commands only change the target. Start with `Lift.java`, then
`LiftTeleOp.java`.

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. The motor's name, `"lift"`, must
match the name in the robot configuration on the Driver Station.

<div class="vscode" markdown>
<div class="vscode__titlebar">lift project</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<div class="vscode__folder" style="--depth: 1">subsystems</div>
<button type="button" class="vscode__file is-active" style="--depth: 2" data-file="lift">Lift.java</button>
<button type="button" class="vscode__file" style="--depth: 1" data-file="teleop">LiftTeleOp.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="lift" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/subsystems/Lift.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode.subsystems;

public class Lift extends SubsystemBase {
    // Targets in encoder ticks. Measure your own lift.
    public static int LOW = 0;
    public static int HIGH = 1500;
    public static int TOLERANCE = 20;

    // Tune kG first, then kP, then kD
    public static double kG = 0.08;
    public static double kP = 0.005;
    public static double kD = 0.0002;

    private final DcMotorEx motor;
    private final ElapsedTime timer = new ElapsedTime();
    private int target = LOW;
    private int position = 0;
    private double lastError = 0;

    public Lift(HardwareMap hardwareMap) {
        motor = hardwareMap.get(DcMotorEx.class, "lift");
        motor.setZeroPowerBehavior(
                DcMotor.ZeroPowerBehavior.BRAKE);
        motor.setMode(
                DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        motor.setMode(
                DcMotor.RunMode.RUN_WITHOUT_ENCODER);
    }

    // The scheduler runs this every loop
    @Override
    public void periodic() {
        double dt = timer.seconds();
        timer.reset();

        position = motor.getCurrentPosition();
        double error = target - position;
        double derivative = 0;
        if (dt > 0) {
            derivative = (error - lastError) / dt;
        }
        lastError = error;

        double power = kP * error + kD * derivative + kG;
        motor.setPower(Range.clip(power, -1, 1));
    }

    // Sets a new target, and ends when the lift gets there
    public Command goTo(int ticks) {
        return runOnce(() -> target = ticks)
                .andThen(Commands.waitUntil(this::atTarget));
    }

    public boolean atTarget() {
        return Math.abs(target - position) < TOLERANCE;
    }

    public int getPosition() {
        return position;
    }

    public int getTarget() {
        return target;
    }
}
```

<div class="vscode__note" markdown>
**The loop lives in the subsystem.** The constructor sets the encoder to
0, so the lift must be all the way down when you press INIT. `periodic()`
reads the encoder once, works out the error and its rate of change, and
sets the power from P, D and kG. `dt` is the time since the last loop, in
seconds, so the D term doesn't depend on how fast the loop runs.
`goTo()` makes a command that
sets the target once, then waits until the lift is within `TOLERANCE`
ticks of it. Because it waits, you can put it in a sequence in auto, and
the next step starts when the lift has arrived.
</div>
</div>
<div class="vscode__pane" data-file="teleop" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/LiftTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Lift (command-based)")
public class LiftTeleOp extends CommandOpMode {
    private Lift lift;
    private final ElapsedTime loopTimer = new ElapsedTime();

    @Override
    public void initialize() {
        // Bulk reads on every hub (see below)
        CommandScheduler.getInstance().setBulkReading(
                hardwareMap, LynxModule.BulkCachingMode.AUTO);

        lift = new Lift(hardwareMap);
        GamepadEx driver = new GamepadEx(gamepad1);

        driver.getGamepadButton(GamepadKeys.Button.Y)
                .whenPressed(lift.goTo(Lift.HIGH));
        driver.getGamepadButton(GamepadKeys.Button.A)
                .whenPressed(lift.goTo(Lift.LOW));
    }

    @Override
    public void run() {
        super.run();   // one scheduler loop
        telemetry.addData("Target", lift.getTarget());
        telemetry.addData("Position", lift.getPosition());
        telemetry.addData("Loop ms",
                loopTimer.milliseconds());
        loopTimer.reset();
        telemetry.update();
    }
}
```

<div class="vscode__note" markdown>
**The OpMode only sets targets.** Y sends the lift to `HIGH` and A sends it
to `LOW`. The lift has no default command: when no command is using it,
`periodic()` keeps holding the last target. `run()` shows the target, the
position and how long each loop takes, in milliseconds.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports, if Alt+Enter offers more than one choice"

    Don't pick classes from `com.seattlesolvers.solverslib.command.old`.
    The imports for the two files are:

    ```java
    // Lift.java
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.DcMotorEx;
    import com.qualcomm.robotcore.hardware.HardwareMap;
    import com.qualcomm.robotcore.util.ElapsedTime;
    import com.qualcomm.robotcore.util.Range;
    import com.seattlesolvers.solverslib.command.Command;
    import com.seattlesolvers.solverslib.command.Commands;
    import com.seattlesolvers.solverslib.command.SubsystemBase;

    // LiftTeleOp.java
    import com.qualcomm.hardware.lynx.LynxModule;
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.qualcomm.robotcore.util.ElapsedTime;
    import com.seattlesolvers.solverslib.command.CommandOpMode;
    import com.seattlesolvers.solverslib.command.CommandScheduler;
    import com.seattlesolvers.solverslib.gamepad.GamepadEx;
    import com.seattlesolvers.solverslib.gamepad.GamepadKeys;
    import org.firstinspires.ftc.teamcode.subsystems.Lift;
    ```

!!! warning "Check the direction before you tune"

    A PID loop that pushes the wrong way drives the lift into its top as
    hard as it can. Before you run `LiftTeleOp`, run the motor with a small
    positive power, like 0.2, in a short test OpMode that shows
    `getCurrentPosition()` on telemetry. Check two things: the lift goes
    **up**, and the encoder count goes **up** as it rises.
    If positive power moves the lift down, add
    `motor.setDirection(DcMotor.Direction.REVERSE);` to the
    constructor and check both again. Keep a hand on the Driver Station's
    STOP button the first few times you run any new control loop.

### Pressing Y, loop by loop

<!-- TODO diagram: a timeline over about 12 loops. Top row "Y button": pressed in loop 3. Second row "target": 0 in loops 1 to 3 (it changes to 1500 during loop 3's binding step), 1500 after. Third row "position": a curve that rises from 0 starting in loop 4, slows down near 1500 and flattens out at loop 10. Fourth row "goTo(HIGH)": starts in loop 3, waits from loop 4, ends in loop 10 when the position is within TOLERANCE. Bottom row "periodic()": a mark in every loop, labelled "P + D + kG" all the way through, including after goTo ends. Caption: "The command ends, but periodic() keeps holding the lift." -->

Here's what happens when the driver presses Y with the lift at the
bottom:

1.  **Before:** the target is `LOW`, 0. Every loop, `periodic()` sees an
    error of 0, so the power is just kG, which holds the lift still.
2.  **The loop Y is pressed:** `periodic()` runs first, still with the old
    target. Then the scheduler checks the bindings and starts
    `goTo(HIGH)`. Its first part runs once and sets the target to 1500.
    Its second part, the wait, starts.
3.  **The next loops:** `periodic()` sees a big error, so P pushes the
    lift up hard. As the lift gets close, the error shrinks fast, so the
    D term pushes back and the lift slows down. Every loop, the wait
    checks `atTarget()`.
4.  **The lift arrives:** it's within 20 ticks of 1500, so the wait ends,
    and so does `goTo(HIGH)`.
5.  **After:** no command uses the lift, but `periodic()` still runs every
    loop with the target 1500. kG and a small P hold the lift at the top.

This is why the PID is in `periodic()` and not in the command. If the
command ran the loop, the lift would stop holding its height as soon as
the command ended.

### Tuning, step by step

Tune with the robot on its wheels, the lift free to move, and the gains
from the code as a starting point. Change one gain at a time.

1.  **kG.** Set `kP` and `kD` to 0. Raise `kG` until the lift stays where
    you put it by hand, at the bottom, the middle and the top. Too small
    and it slides down; too big and it creeps up.
2.  **kP.** Raise `kP` until the lift gets to `HIGH` quickly. It's fine if
    it overshoots and bounces a little.
3.  **kD.** Raise `kD` until the bounce goes away. If the motor starts to
    buzz or shake, `kD` is too big.
4.  **kI, only if you need it.** If the lift always stops a little short,
    add an `integral` field: `integral += error * dt` each loop, plus
    `kI * integral` in the power. Clamp it with `Range.clip` so it can't
    grow without limit, and set it back to 0 when the target changes.

Then set `HIGH` and `LOW` for your lift. Keep both a little inside its
real limits, so the loop never pushes it into a hard stop. A motor that
pushes against a hard stop all the time gets hot.

### An arm instead of a lift

An arm uses the same loop with kCos in place of kG. You need the arm's
angle, with 0 meaning level with the floor. Measure the encoder count
when the arm is level and how many ticks it turns per degree, then:

```java
// TICKS_PER_DEGREE is a double, like 2.5
double angle = Math.toRadians(
        (position - LEVEL_TICKS) / TICKS_PER_DEGREE);
double power = kP * error + kD * derivative
        + kCos * Math.cos(angle);
```

Tune `kCos` like `kG`, with the arm held level: that's where gravity pulls
hardest.

!!! tip "SolversLib has a PID class too"

    SolversLib's `PIDFController`, in
    `com.seattlesolvers.solverslib.controller`, does the P, I and D math
    for you: `calculate(position, target)` returns the power. Its F term
    is `kF * target`, which isn't a gravity term, so you'd still add kG
    yourself. Write the loop by hand first, so you know what such a class
    does inside.

## Loop time and bulk reads

A control loop can only react once per loop. If a loop takes 30&nbsp;ms,
the lift moves for 30&nbsp;ms on the old power before your code can correct
it. gm0 says many top teams get their loops up to 80 times a second, about
12&nbsp;ms per loop.

Most of a loop's time goes to talking to the hubs. Every encoder or sensor
read is a separate message to a hub, and you wait for each answer. A
**bulk read** gets every motor encoder and every non-I2C sensor on one hub
in one message. The SDK can do this for you, with a **bulk caching mode**
on each hub:

| Mode | What happens | Your job |
|---|---|---|
| `OFF` | Every read is its own message. This is the default. | Nothing, but loops are slow |
| `AUTO` | The first read does a bulk read and saves the values. Reading the same value again does a new bulk read. | Read each value only once per loop |
| `MANUAL` | Reads use the saved values until you clear them | Clear the saved values once per loop, or you read the same old values forever |

In plain SDK code, turn on `AUTO` for every hub once, in INIT:

```java
List<LynxModule> hubs = hardwareMap.getAll(LynxModule.class);
for (LynxModule hub : hubs) {
    hub.setBulkCachingMode(LynxModule.BulkCachingMode.AUTO);
}
```

For `MANUAL`, set that mode instead, and start every loop with
`hub.clearBulkCache()` for every hub.

In a `CommandOpMode`, SolversLib does this for you with the line in
`LiftTeleOp`:

```java
CommandScheduler.getInstance().setBulkReading(
        hardwareMap, LynxModule.BulkCachingMode.AUTO);
```

Pass `MANUAL` instead, and the scheduler clears the saved values at the end
of every loop, so you get the faster mode with no extra code. Either way,
do what `Lift` does: read each sensor once per loop in `periodic()`, keep
the value in a field, and use the field everywhere else, including in
telemetry.

Bulk reads don't cover I2C devices, like the IMU, color sensors and the
Pinpoint. Each read from one is a separate message, so read them only when
you need them.

To see the difference on your robot, watch the `Loop ms` line in
telemetry with bulk reads on and off, or run the SDK sample
[ConceptMotorBulkRead](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/ConceptMotorBulkRead.java),
which times all three modes.

## Tuning live

Tuning by changing a number, building and deploying again takes a minute
each time. A dashboard lets you change the gains from a laptop while the
OpMode runs. The gains in `Lift` are already `public static` fields, which
is what both dashboards need. Pick one:

- **Panels:** add `@Configurable` above `public class Lift`.
- **FTC Dashboard:** add `@Config` above `public class Lift`.

[Developer tools](tools.md) shows how to install each one and open it in a
browser. Both can also graph telemetry: graph the target and the position
together while you tune, and you'll see the overshoot and the bounce. For
that, `LiftTeleOp` has to send its telemetry to the dashboard too, with
`JoinedTelemetry` (Panels) or `MultipleTelemetry` (FTC Dashboard), as
Developer tools shows.

`periodic()` reads `kG`, `kP` and `kD` every loop, so a change takes effect
right away. `HIGH` and `LOW` are different: `initialize()` copies their
values into the `goTo()` commands when it makes the bindings. A new `HIGH`
only takes effect the next time you press INIT.

## Control theory reading

To understand why PID and feedforward work, and how to go further, read
**CTRL ALT FTC**, a free control theory course for FTC by team 22377, The
Sigmacorns.

[:octicons-arrow-right-24: Start CTRL ALT FTC on its site](https://www.ctrlaltftc.com/){ .md-button .md-button--primary }

These chapters cover what this page uses. Read them in order:

1.  [Why Control Theory is A Must Have](https://www.ctrlaltftc.com/introduction-to-controls)
2.  [Introduction to Open Loop Control](https://www.ctrlaltftc.com/introduction-to-open-loop-control)
3.  [Introduction to Closed Loop Control](https://www.ctrlaltftc.com/introduction-to-closed-loop-control)
4.  [The PID Controller](https://www.ctrlaltftc.com/the-pid-controller),
    with its pages on
    [the proportional term](https://www.ctrlaltftc.com/the-pid-controller/the-proportional-term),
    [the integral term](https://www.ctrlaltftc.com/the-pid-controller/the-integral-term)
    and
    [the derivative term](https://www.ctrlaltftc.com/the-pid-controller/the-derivative-term)
5.  [Tuning Methods of A PID Controller](https://www.ctrlaltftc.com/the-pid-controller/tuning-methods-of-a-pid-controller)
6.  [Improvements to the PID Controller](https://www.ctrlaltftc.com/the-pid-controller/practical-improvements-to-pid)
7.  [Feedforward Control](https://www.ctrlaltftc.com/feedforward-control)
8.  [FTC Motor Control](https://www.ctrlaltftc.com/practical-examples/ftc-motor-control)

When your lift works, its
[Motion Profiling](https://www.ctrlaltftc.com/advanced/motion-profiling)
chapter shows how to make it start and stop smoothly instead of jumping at
full power. The course also has chapters on the Homeostasis library. You
don't need it, because you've written the same kind of loop yourself.

!!! info "Credit"

    These lessons are by [CTRL ALT FTC](https://www.ctrlaltftc.com/), from
    FTC team 22377 The Sigmacorns
    ([GitHub](https://github.com/BenCaunt/CTRL-ALT-FTC)). The site doesn't
    state a license, so this site only links to them.

## Try it

1.  **Hold a lift (or an arm).** Build `Lift` and `LiftTeleOp` for your
    robot's lift, or change it into an arm with kCos. Check the direction,
    then tune kG, kP and kD in that order, live from Panels or FTC
    Dashboard if you have one installed.
2.  **Add a middle height and a nudge.** Add a `MID` target on B. Then give
    `Lift` a `nudge(int ticks)` command, made with `runOnce(...)`, that
    moves the target up or down by `ticks`, and bind dpad up and dpad down
    to `nudge(50)` and `nudge(-50)`. Clamp the target with `Range.clip` so
    a nudge can never send it below `LOW` or above `HIGH`.

You're done when the lift gets to each height in about a second, overshoots
by at most one small bounce, and then holds still with nobody touching
the controller. Telemetry should show your loop time, and turning bulk
reads off should make it bigger. You should also be able to explain why
the PID code is in `periodic()` and not in `goTo()`.

## Learn more

- gm0:
  [Control Loops](https://gm0.org/en/latest/docs/software/concepts/control-loops.html),
  for PID, feedforward and motion profiles,
  [Bulk Reads](https://gm0.org/en/latest/docs/software/tutorials/bulk-reads.html)
  and
  [Encoders](https://gm0.org/en/latest/docs/software/tutorials/encoders.html)
- FTC Docs:
  [Motor Modes and Encoders](https://ftc-docs.firstinspires.org/en/latest/tech_tips/tech-tips/tech-tip-motor-modes/tech-tip-motor-modes.html),
  on the run modes and why the motor type matters
- FTC SDK reference:
  [DcMotor.RunMode](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/com/qualcomm/robotcore/hardware/DcMotor.RunMode.html)
  and
  [DcMotorEx](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/com/qualcomm/robotcore/hardware/DcMotorEx.html)
- [Developer tools](tools.md): installing Panels or FTC Dashboard for live
  tuning and graphs
