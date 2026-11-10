# Your first OpMode

An **OpMode** is one program for your robot. Your code can hold many of
them, and the Driver Station lists them all. Before each match, the driver
picks one, presses INIT, then starts it. A teleop OpMode reads the
gamepads. An auto OpMode drives on its own.

On this page you write a teleop that runs an intake motor while you hold A
and shows what it's doing on the Driver Station screen. You write it twice,
once in each of the two OpMode styles, so you can read both kinds of code.

!!! note "Versions"

    Written for FTC SDK 12.0. The gamepad methods `aWasPressed()` and
    `aWasReleased()` need SDK 10.3 or later, and the trigger booleans like
    `left_trigger_pressed` need SDK 11.1 or later. Everything on this page
    works the same in OnBot Java and Android Studio.

Before you start, finish [Getting started](getting-started.md): you can
deploy code to your Control Hub, and you know how to make a robot
configuration. For this page, the configuration needs one motor named
`intake`. For the exercise at the end, add a servo named `claw`.

## What an OpMode is

An OpMode is a Java class with an annotation above it. The annotation puts
it on the Driver Station:

```java
@TeleOp(name = "Intake (LinearOpMode)", group = "Practice")
public class IntakeLinear extends LinearOpMode {
```

| Annotation | Where it shows up |
|---|---|
| `@TeleOp(name = "...")` | In the TeleOp list on the Driver Station |
| `@Autonomous(name = "...")` | In the Autonomous list |
| `@Disabled` | Hides the OpMode. The SDK samples have it: delete the line when you copy one. |

`name` is the text the driver sees. If you leave it out, the class name is
used. `group` is optional and sorts related OpModes together.

Every OpMode runs in three phases, one for each button on the Driver
Station:

| Driver presses | What happens |
|---|---|
| **INIT** | Your setup code runs: it finds the motors and servos and gets them ready. The robot shouldn't drive yet. |
| **PLAY** (the triangle) | The main part runs, over and over, until the end. |
| **STOP** (the square) | Your code stops, and the motors turn off. |

FTC Docs calls the triangle the **Start** button, and the SDK reference
(the Javadoc) calls it the **play** button. This course writes PLAY.

<!-- TODO diagram: a horizontal timeline of one OpMode run. Boxes left to right: "Pick the OpMode on the Driver Station", "INIT pressed: setup code runs once", "waiting for PLAY", "PLAY pressed: main loop runs over and over", "STOP pressed: code ends, motors stop". Under the INIT and PLAY boxes, show the matching LinearOpMode lines: "code before waitForStart()" and "while (opModeIsActive()) { ... }". -->

## Your first LinearOpMode

There are two styles of OpMode. Start with **LinearOpMode**: you write one
method, `runOpMode()`, and it runs from top to bottom, like an ordinary
Java program. FTC Docs, gm0 and REV's lessons all start with it too. (If
you learned Java from Learn Java for FTC in [Java basics](java-basics.md),
you've mostly seen the other style. It comes later on this page.)

Make a new Java class in the `teamcode` folder and name it `IntakeLinear`.
The file name must match the class name. Each project below works like a
small Android Studio window: click a file in the explorer to see its code.

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. The imports are also listed below
the window, for OnBot Java.

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
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
        // INIT: find the motor and set it up
        DcMotor intake =
                hardwareMap.get(DcMotor.class, "intake");
        intake.setDirection(DcMotor.Direction.FORWARD);
        intake.setZeroPowerBehavior(
                DcMotor.ZeroPowerBehavior.BRAKE);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        // Wait here until the driver presses PLAY
        waitForStart();

        // PLAY: repeat until the driver presses STOP
        while (opModeIsActive()) {
            double power;
            if (gamepad1.a) {
                power = 0.8;
            } else {
                power = 0;
            }
            intake.setPower(power);

            telemetry.addData("A held", gamepad1.a);
            telemetry.addData("Intake power", power);
            telemetry.update();
        }
    }
}
```

<div class="vscode__note" markdown>
**One method, top to bottom.** Everything before `waitForStart()` runs
when the driver presses INIT. The `while` loop runs over and over after
PLAY: each time round, it reads the A button, sets the motor, and sends
telemetry to the Driver Station.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.qualcomm.robotcore.hardware.DcMotor;
    ```

Build and deploy it, pick **Intake (LinearOpMode)** in the TeleOp list, and
try it.

### INIT, PLAY and STOP, step by step

1.  **The driver picks the OpMode.** Nothing runs on the robot yet.
2.  **INIT:** the SDK creates an `IntakeLinear` object, gives it the
    `hardwareMap` and the gamepads, and calls `runOpMode()`.
    `hardwareMap.get(...)` looks up the motor named `"intake"` in the robot
    configuration. The screen shows "Status: Ready". Then `waitForStart()`
    pauses the method.
3.  **PLAY:** `waitForStart()` returns, and the `while` loop starts. Each
    time round, `gamepad1.a` is `true` if A is held right now, so the motor
    gets 0.8 while A is held and 0 when it isn't. The loop runs many times a
    second.
4.  **STOP:** `opModeIsActive()` becomes `false`, so the loop ends,
    `runOpMode()` returns, and the OpMode is over. The motor turns off.

Four rules come out of this:

- **Get hardware inside `runOpMode()`.** `hardwareMap` isn't ready when the
  OpMode object is built, so `private DcMotor intake =
  hardwareMap.get(...);` as a field stops the OpMode with a
  `NullPointerException`.
- **The name must match the robot configuration exactly**, including
  capital letters. `"Intake"` won't find a motor named `intake`. If the
  name is wrong, the OpMode stops with an error saying it can't find the
  device.
- **Call `telemetry.update()`** after your `telemetry.addData(...)` lines.
  In a LinearOpMode, nothing appears on the Driver Station until you do.
  The screen refreshes a few times a second, not every loop.
- **Check `opModeIsActive()` in every loop.** A loop that doesn't check it
  doesn't notice when the driver presses STOP.

## Reading the gamepad

`gamepad1` is the first driver's gamepad and `gamepad2` is the second's.
Read them anywhere in your loop:

| Input | Code | Value |
|---|---|---|
| Left stick, up and down | `gamepad1.left_stick_y` | −1 pushed up, 1 pulled down |
| Left stick, left and right | `gamepad1.left_stick_x` | −1 left, 1 right |
| Right stick | `gamepad1.right_stick_x`, `gamepad1.right_stick_y` | The same as the left stick |
| Buttons | `gamepad1.a`, `b`, `x`, `y` | `true` while held |
| Bumpers and D-pad | `gamepad1.left_bumper`, `right_bumper`, `dpad_up`, `dpad_down`, ... | `true` while held |
| Triggers | `gamepad1.left_trigger`, `right_trigger` | 0 released, 1 pressed all the way |
| Triggers as buttons | `gamepad1.left_trigger_pressed`, `right_trigger_pressed` | `true` while pressed past a set point |

Watch out for `left_stick_y`: it's **negative when you push the stick up**.
To drive forward when you push up, use `-gamepad1.left_stick_y`.

PlayStation-style gamepads work too, and both names work for each button:
`cross` is `a`, `circle` is `b`, `square` is `x`, `triangle` is `y`, and
`options` is `start`.

### Doing something once per press

`gamepad1.a` is `true` for as long as A is held, and your loop runs many
times a second. So this adds much more than 1 for each press:

```java
if (gamepad1.a) {
    count = count + 1;   // adds 1 every loop while A is held
}
```

To do something once per press, use `gamepad1.aWasPressed()`. It's `true`
once when A goes down, then `false` until A is let go and pressed again.
`aWasReleased()` is the same for letting go. Every button has a pair,
including `leftBumperWasPressed()`, `dpadUpWasPressed()` and
`leftTriggerWasPressed()`.

Here's what each one gives when your code calls `aWasPressed()` once every
loop:

| Loop | The driver... | `gamepad1.a` | `gamepad1.aWasPressed()` |
|---|---|---|---|
| 1 | isn't touching A | `false` | `false` |
| 2 | presses A | `true` | `true` |
| 3 | keeps holding A | `true` | `false` |
| 4 | keeps holding A | `true` | `false` |
| 5 | lets go | `false` | `false` |
| 6 | presses A again | `true` | `true` |

!!! warning "Call `aWasPressed()` once per loop"

    `aWasPressed()` answers "was A pressed since the last time I asked?".
    Asking uses up the answer. If you call it twice in the same loop, the
    second call gives `false`:

    ```java
    if (gamepad1.aWasPressed()) {
        count = count + 1;
    }
    // Wrong: the call above already used up the press
    telemetry.addData("A pressed", gamepad1.aWasPressed());
    ```

    Call it once, save the answer in a variable, and use the variable:

    ```java
    boolean aPressed = gamepad1.aWasPressed();
    if (aPressed) {
        count = count + 1;
    }
    telemetry.addData("A pressed", aPressed);
    ```

??? info "The older way: `Gamepad.copy()`"

    These methods are new in SDK 10.3. Older team code, and gm0's
    [Gamepad Usage](https://gm0.org/en/latest/docs/software/tutorials/gamepad.html)
    page, keep a copy of the gamepad from the last loop and compare:

    ```java
    Gamepad current = new Gamepad();
    Gamepad previous = new Gamepad();

    waitForStart();
    while (opModeIsActive()) {
        previous.copy(current);   // last loop's buttons
        current.copy(gamepad1);   // this loop's buttons

        if (current.a && !previous.a) {
            count = count + 1;    // A just went down
        }
    }
    ```

    It does the same job as `aWasPressed()`. You don't need it in new
    code, but now you can read it.

## Motors and servos

You get every device the same way: `hardwareMap.get(Type.class, "name")`,
with the type and the name from the robot configuration.

### Motors

| Code | What it does |
|---|---|
| `motor.setPower(0.8)` | Runs the motor at 80&nbsp;% power. Power goes from −1 (full backward) to 1 (full forward). 0 stops it. |
| `motor.setDirection(DcMotor.Direction.REVERSE)` | Swaps which way is forward. Use it so a positive power does the useful thing: the intake pulls in, the robot drives forward. |
| `motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE)` | At power 0, the motor resists being turned, so the mechanism stops quickly. `FLOAT` lets it coast instead. |
| `motor.getPower()` | The power you last set |

### Servos

A **servo** turns to a position and holds it. Use the `Servo` type:

```java
Servo claw = hardwareMap.get(Servo.class, "claw");
claw.setPosition(0.3);
```

The position goes from 0 to 1, as a fraction of how far the servo can turn.
The servo moves there and stays there, so setting it once is enough.
`claw.getPosition()` gives back the position you last set, not where the
servo really is.

A **continuous rotation servo** spins like a small motor. Set its type to
continuous rotation servo in the robot configuration, then use the
`CRServo` type and `setPower`, from −1 to 1:

```java
CRServo spinner = hardwareMap.get(CRServo.class, "spinner");
spinner.setPower(gamepad1.right_trigger);
```

## The other style: OpMode

The other style is called **OpMode** (also "iterative OpMode"). You don't
write the loop. Instead, you fill in methods, and the SDK calls them at the
right time:

| Method | When the SDK calls it | Do you need it? |
|---|---|---|
| `init()` | Once, when the driver presses INIT | Yes |
| `init_loop()` | Over and over after `init()`, until PLAY | No |
| `start()` | Once, when the driver presses PLAY | No |
| `loop()` | Over and over after PLAY, until STOP | Yes |
| `stop()` | Once, when the driver presses STOP | No |

Here's the same intake teleop in this style:

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="iterative">IntakeIterative.java</button>
<button type="button" class="vscode__file" style="--depth: 1" data-file="linear">IntakeLinear.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="iterative" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeIterative.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Intake (OpMode)")
public class IntakeIterative extends OpMode {
    // Set in init(), used in loop()
    private DcMotor intake;

    @Override
    public void init() {
        intake = hardwareMap.get(DcMotor.class, "intake");
        intake.setDirection(DcMotor.Direction.FORWARD);
        intake.setZeroPowerBehavior(
                DcMotor.ZeroPowerBehavior.BRAKE);
    }

    @Override
    public void init_loop() {
        telemetry.addData("Status", "Ready");
    }

    @Override
    public void loop() {
        double power;
        if (gamepad1.a) {
            power = 0.8;
        } else {
            power = 0;
        }
        intake.setPower(power);

        telemetry.addData("A held", gamepad1.a);
        telemetry.addData("Intake power", power);
    }
}
```

<div class="vscode__note" markdown>
**The SDK runs the loop.** `init()` finds the motor once. The SDK calls
`init_loop()` over and over until PLAY, then `loop()` over and over until
STOP. The motor is a field, so `loop()` can use what `init()` set up. There's
no `waitForStart()`, no `while` and no `telemetry.update()`.
</div>
</div>
<div class="vscode__pane" data-file="linear" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeLinear.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Intake (LinearOpMode)")
public class IntakeLinear extends LinearOpMode {
    @Override
    public void runOpMode() {
        // INIT: find the motor and set it up
        DcMotor intake =
                hardwareMap.get(DcMotor.class, "intake");
        intake.setDirection(DcMotor.Direction.FORWARD);
        intake.setZeroPowerBehavior(
                DcMotor.ZeroPowerBehavior.BRAKE);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        // Wait here until the driver presses PLAY
        waitForStart();

        // PLAY: repeat until the driver presses STOP
        while (opModeIsActive()) {
            double power;
            if (gamepad1.a) {
                power = 0.8;
            } else {
                power = 0;
            }
            intake.setPower(power);

            telemetry.addData("A held", gamepad1.a);
            telemetry.addData("Intake power", power);
            telemetry.update();
        }
    }
}
```

<div class="vscode__note" markdown>
The LinearOpMode version from above, to compare. The code inside the
`while` loop is the same as the code inside `loop()`.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.eventloop.opmode.OpMode;
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.qualcomm.robotcore.hardware.DcMotor;
    ```

    `IntakeIterative` needs `OpMode`, and `IntakeLinear` needs
    `LinearOpMode`.

Two rules are different in this style:

- **Telemetry is sent for you** after every `init_loop()` and `loop()`. You
  don't call `telemetry.update()`.
- **Never wait inside `loop()`.** `loop()` must finish quickly so the SDK
  can call it again. The SDK sends telemetry between calls, and your code
  only reacts to the gamepad when `loop()` runs, so a `loop()` that waits
  makes the whole robot slow to react. `OpMode` has no `sleep()`. Don't
  add one with `Thread.sleep()`, and don't put a long `while` loop inside
  `loop()`. To wait, use a timer and check it each time `loop()` runs.
  [Your first autonomous](first-autonomous.md) shows how.

## LinearOpMode or OpMode?

| | LinearOpMode | OpMode |
|---|---|---|
| You write | `runOpMode()`, top to bottom, with your own `while` loop | `init()`, `loop()` and the other methods. The SDK runs the loop. |
| Waiting for PLAY | `waitForStart()` | The SDK calls `start()`, then `loop()` |
| Telemetry | You call `telemetry.update()` | Sent for you after each `loop()` |
| Waiting | `sleep(1000)` waits one second, and nothing else runs meanwhile | Never wait. Check a timer each loop instead. |
| Good for | First programs and step-by-step autos | State machines, where the robot does several things at once |

Both run about as fast, and gm0 calls the choice a matter of preference.
This course uses LinearOpMode on this page, in
[Mecanum drive](mecanum-drive.md) and for the first autos. The state
machine in [Your first autonomous](first-autonomous.md) uses OpMode. From
[LinearOpMode to command-based](linear-to-command-based.md) on, you use
SolversLib's `CommandOpMode`, which is a LinearOpMode that runs the loop
for you.

## Try it

1.  **An intake toggle.** Change `IntakeLinear` so one press of A turns the
    intake on, and the next press turns it off. Keep a `boolean intakeOn`
    outside the loop, and flip it with `intakeOn = !intakeOn;` when
    `gamepad1.aWasPressed()` is `true`. Show `intakeOn` in telemetry.
2.  **A claw on two buttons.** Add a servo named `claw` to the robot
    configuration. Make the right bumper open the claw and the left bumper
    close it. Start with positions close to 0.5, like 0.4 and 0.6, and move
    them a little at a time until the claw opens and closes fully without
    pushing against its own frame.

You're done when one press of A starts the intake and it keeps running
after you let go, the next press stops it, and the bumpers open and close
the claw while the intake runs. You should also be able to explain why
`if (gamepad1.a) { intakeOn = !intakeOn; }` makes the intake flicker
instead of toggling. For extra practice, write the toggle in the OpMode
style too.

## Learn more

- FTC Docs: Creating and Running an OpMode, in
  [Android Studio](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/creating_op_modes/Creating-and-Running-an-Op-Mode-%28Android-Studio%29.html)
  or
  [OnBot Java](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/onbot_java/creating_op_modes/Creating-and-Running-an-Op-Mode-%28OnBot-Java%29.html),
  and
  [Running Your OpMode](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/blocks/running_op_modes/Running-Your-Op-Mode.html)
- gm0:
  [LinearOpMode vs OpMode](https://gm0.org/en/latest/docs/software/getting-started/linear-opmode-vs-opmode.html),
  [Reading and Writing to Hardware](https://gm0.org/en/latest/docs/software/getting-started/common-hardware-components.html),
  [Gamepad Usage](https://gm0.org/en/latest/docs/software/tutorials/gamepad.html)
  and
  [Using Telemetry](https://gm0.org/en/latest/docs/software/tutorials/using-telemetry.html)
- The SDK samples
  [BasicOpMode_Linear](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOpMode_Linear.java),
  [BasicOpMode_Iterative](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOpMode_Iterative.java)
  and
  [ConceptGamepadEdgeDetection](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/ConceptGamepadEdgeDetection.java).
  In Android Studio, they're also in your project, in the
  `FtcRobotController` module.
- The SDK reference (Javadoc) for
  [Gamepad](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/com/qualcomm/robotcore/hardware/Gamepad.html),
  [LinearOpMode](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/com/qualcomm/robotcore/eventloop/opmode/LinearOpMode.html),
  [OpMode](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/com/qualcomm/robotcore/eventloop/opmode/OpMode.html)
  and
  [Telemetry](https://javadoc.io/static/org.firstinspires.ftc/RobotCore/12.0.0/org/firstinspires/ftc/robotcore/external/Telemetry.html)
