# Your first autonomous

In auto, nobody touches the gamepad. The robot runs a list of steps on its
own: drive forward, turn, drive again. This page builds the same short auto
three ways, each more accurate than the last: by time, by encoder, and with
IMU turns. Then it rewrites the auto as a **state machine**, so the robot
can do two things at once. That's the idea command-based code is built on.

!!! note "Versions"

    Written for FTC SDK 12.0. The code works the same in OnBot Java and
    Android Studio.

The robot is the mecanum robot from [Mecanum drive](mecanum-drive.md): four
drive motors named `front_left_drive`, `front_right_drive`,
`back_left_drive` and `back_right_drive`, and the IMU named `imu`. Use the
motor directions you found on that page. The state machine at the end also
uses the `intake` motor from [Your first OpMode](first-opmode.md).

An auto is an OpMode with `@Autonomous` instead of `@TeleOp`, so it shows
up in the Autonomous list on the Driver Station. When it runs, the Driver
Station counts down 30 seconds and then stops it.

## By time

The simplest auto sets the motor powers, waits, and sets new powers.
`sleep(1500)` pauses `runOpMode()` for 1500 milliseconds. The motors keep
the power you gave them while your code waits.

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. The imports are also listed below
each window.

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="time">AutoByTime.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="time" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AutoByTime.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "Auto by time")
public class AutoByTime extends LinearOpMode {
    private DcMotor frontLeft, frontRight, backLeft, backRight;

    @Override
    public void runOpMode() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        // Drive forward for 1.5 seconds
        setDrivePower(0.5, 0.5);
        sleep(1500);

        // Turn left for 0.8 seconds
        setDrivePower(-0.4, 0.4);
        sleep(800);

        // Stop
        setDrivePower(0, 0);
    }

    // Left wheels get one power, right wheels the other
    private void setDrivePower(double left, double right) {
        frontLeft.setPower(left);
        backLeft.setPower(left);
        frontRight.setPower(right);
        backRight.setPower(right);
    }
}
```

<div class="vscode__note" markdown>
**Drive, wait, stop.** After PLAY, the code sets the powers and sleeps,
twice, then stops the wheels. `setDrivePower` is a helper method, so each
step is one line. Left wheels backward and right wheels forward turns the
robot left.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.hardware.DcMotor;
    ```

If the driver presses STOP, `sleep()` ends early. The SDK sample
`RobotAutoDriveByTime_Linear` does the same thing with a `while` loop and a
timer instead of `sleep()`, so it can show telemetry while it waits.

Run it three times from the same spot and mark where the robot stops each
time. It probably won't be the same spot. The same power doesn't always
give the same speed: a freshly charged battery drives the robot farther in
1.5 seconds than a tired one, and the wheels slip differently on different
floors. To drive a set distance, measure the distance.

!!! tip "Pick the teleop for after auto"

    Add `preselectTeleOp` to the annotation:

    ```java
    @Autonomous(name = "Auto by time",
            preselectTeleOp = "Mecanum (field-centric)")
    ```

    When the driver selects this auto, the Driver Station preselects that
    teleop. When the auto ends by itself or by the 30-second timer, the
    Driver Station loads the teleop, so the driver doesn't have to find
    it in the list. Pressing STOP during auto cancels this, and the driver
    still presses INIT and PLAY for teleop. The text must match the
    teleop's `name` exactly. See FTC Docs,
    [Automatically Loading a Driver Controlled Op Mode](https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/auto_load_opmode/auto-load-opmode.html).

## By encoder

An **encoder** counts how far a motor's shaft has turned, in **ticks**
(also called counts). Most FTC motors have one built in. Plug its cable
into the encoder port with the same number as the motor's port on the hub.

To turn ticks into inches, you need three numbers:

- **Ticks per revolution** of the motor's output shaft. Look it up on the
  motor's product page. For example, the SDK sample
  `RobotAutoDriveByGyro_Linear` uses 537.7 for a goBILDA 312 RPM Yellow
  Jacket.
- **Gear reduction** between the motor and the wheel: 1 if the wheel is on
  the motor shaft, 2 if a 12-tooth gear on the motor drives a 24-tooth
  gear on the wheel.
- **Wheel diameter.** Measure it.

Then:

```java
TICKS_PER_INCH = TICKS_PER_REV * GEAR_REDUCTION
        / (WHEEL_DIAMETER_IN * Math.PI);
```

With 537.7 ticks, no gearing and 4-inch wheels, that's about 42.8 ticks per
inch, so 24 inches is about 1027 ticks. Also set the right motor type for
each motor in the robot configuration: the built-in encoder modes depend on
it.

### Run modes

Each motor has a **run mode** that says what `setPower` means:

| Run mode | What the motor does |
|---|---|
| `RUN_WITHOUT_ENCODER` | `setPower` sets the power directly. The encoder still counts. |
| `RUN_USING_ENCODER` | `setPower` sets a speed, and the hub uses the encoder to hold it |
| `RUN_TO_POSITION` | The hub drives the motor to a target position and holds it there |
| `STOP_AND_RESET_ENCODER` | Stops the motor and sets its count to 0 |

`RUN_TO_POSITION` needs five steps, in this order. Each one is a common bug
when it's missing or out of order:

1.  **`STOP_AND_RESET_ENCODER`, once, in INIT.** Encoders don't reset to 0
    when an OpMode starts. They keep counting from the last run.
2.  **`setTargetPosition(...)` first.** Setting `RUN_TO_POSITION` before
    you've set a target is an error.
3.  **Then `setMode(DcMotor.RunMode.RUN_TO_POSITION)`.**
4.  **Then `setPower(...)`, always positive.** The hub picks the direction
    from the target, so use `Math.abs(power)`. To drive backward, give a
    negative distance, not a negative power.
5.  **Wait while `isBusy()`, with a timeout.** `isBusy()` is `true` while
    the motor is still moving to its target. The timeout stops the robot
    from waiting forever if a wheel gets stuck.

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="encoder">AutoByEncoder.java</button>
<button type="button" class="vscode__file" style="--depth: 1" data-file="time">AutoByTime.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="encoder" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AutoByEncoder.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "Auto by encoder")
public class AutoByEncoder extends LinearOpMode {
    // Look these up for YOUR motors and wheels
    static final double TICKS_PER_REV = 537.7;
    static final double GEAR_REDUCTION = 1.0;
    static final double WHEEL_DIAMETER_IN = 4.0;
    static final double TICKS_PER_INCH =
            TICKS_PER_REV * GEAR_REDUCTION
                    / (WHEEL_DIAMETER_IN * Math.PI);

    private DcMotor frontLeft, frontRight, backLeft, backRight;
    private DcMotor[] wheels;

    @Override
    public void runOpMode() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        wheels = new DcMotor[] {
                frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
            // 1. Encoders don't reset by themselves
            wheel.setMode(
                    DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        }

        waitForStart();

        driveInches(24, 0.5, 3.0);   // forward 24 inches
        driveInches(-12, 0.5, 2.0);  // back 12 inches
    }

    private void driveInches(double inches, double power,
                             double timeoutSeconds) {
        int ticks = (int) Math.round(inches * TICKS_PER_INCH);

        for (DcMotor wheel : wheels) {
            // 2. The target first
            wheel.setTargetPosition(
                    wheel.getCurrentPosition() + ticks);
            // 3. Then the mode
            wheel.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            // 4. Then the power, always positive
            wheel.setPower(Math.abs(power));
        }

        // 5. Wait until a wheel arrives or time runs out
        ElapsedTime timer = new ElapsedTime();
        while (opModeIsActive()
                && timer.seconds() < timeoutSeconds
                && driveBusy()) {
            telemetry.addData("Target",
                    frontLeft.getTargetPosition());
            telemetry.addData("Front left",
                    frontLeft.getCurrentPosition());
            telemetry.update();
        }

        // Stop, and go back to driving by power
        for (DcMotor wheel : wheels) {
            wheel.setPower(0);
            wheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        }
    }

    // True while all four wheels are still moving
    private boolean driveBusy() {
        return frontLeft.isBusy() && frontRight.isBusy()
                && backLeft.isBusy() && backRight.isBusy();
    }
}
```

<div class="vscode__note" markdown>
**Drive by distance.** `driveInches` turns inches into ticks, gives every
wheel a target that many ticks from where it is now, and waits until the
wheels get there. The numbered comments match the five steps above.
</div>
</div>
<div class="vscode__pane" data-file="time" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AutoByTime.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "Auto by time")
public class AutoByTime extends LinearOpMode {
    private DcMotor frontLeft, frontRight, backLeft, backRight;

    @Override
    public void runOpMode() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        // Drive forward for 1.5 seconds
        setDrivePower(0.5, 0.5);
        sleep(1500);

        // Turn left for 0.8 seconds
        setDrivePower(-0.4, 0.4);
        sleep(800);

        // Stop
        setDrivePower(0, 0);
    }

    // Left wheels get one power, right wheels the other
    private void setDrivePower(double left, double right) {
        frontLeft.setPower(left);
        backLeft.setPower(left);
        frontRight.setPower(right);
        backRight.setPower(right);
    }
}
```

<div class="vscode__note" markdown>
The time-based version from above, to compare.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.util.ElapsedTime;
    ```

An **`ElapsedTime`** is a stopwatch. It starts when you create it, and
`timer.seconds()` gives the seconds since then. `timer.reset()` starts it
again from 0.

`driveBusy()` is `true` only while all four wheels are busy, so the loop
ends as soon as any wheel reaches its target, like in the SDK sample
`RobotAutoDriveByEncoder_Linear`. To wait for all four, change `&&` to
`||` in `driveBusy()`. The timeout still protects you.

## Turning with the IMU

Encoders work well for driving straight. Turns are less exact, because the
wheels slip a little differently in every turn. The IMU measures the
heading directly, so the robot can turn until the heading is right.

A **proportional** turn sets the turning power from how far the robot
still has to turn, the **error**:

- `error = target − heading`. A positive error means turn left, because
  the heading goes up when the robot turns left.
- `turn power = error × TURN_KP`, limited to `MAX_TURN`. Far from the
  target, the robot turns fast. Close to it, it turns slowly, so it
  doesn't swing past.
- Stop when the error is smaller than a **tolerance**, like 2°, or when
  time runs out.

The heading goes from −180° to 180°, so the error needs one fix. Say the
robot is at −170° and the target is 170°. `170 − (−170)` is 340°: almost a
full turn to the left. But the short way is 20° to the right. So when the
error is more than 180°, subtract 360°, and when it's −180° or less, add
360°: `340 − 360 = −20`.

`AutoWithTurns` is `AutoByEncoder` with a different path and the
highlighted lines added:

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file" style="--depth: 1" data-file="encoder">AutoByEncoder.java</button>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="turns">AutoWithTurns.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="turns" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AutoWithTurns.java" markdown>

```java linenums="1" hl_lines="13-16 20 45-51 54 57-59 101-146"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "Auto with turns")
public class AutoWithTurns extends LinearOpMode {
    // Look these up for YOUR motors and wheels
    static final double TICKS_PER_REV = 537.7;
    static final double GEAR_REDUCTION = 1.0;
    static final double WHEEL_DIAMETER_IN = 4.0;
    static final double TICKS_PER_INCH =
            TICKS_PER_REV * GEAR_REDUCTION
                    / (WHEEL_DIAMETER_IN * Math.PI);

    // Tune these on your robot
    static final double TURN_KP = 0.02;
    static final double MAX_TURN = 0.4;
    static final double HEADING_TOLERANCE = 2.0;

    private DcMotor frontLeft, frontRight, backLeft, backRight;
    private DcMotor[] wheels;
    private IMU imu;

    @Override
    public void runOpMode() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        wheels = new DcMotor[] {
                frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
            // 1. Encoders don't reset by themselves
            wheel.setMode(
                    DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        }

        imu = hardwareMap.get(IMU.class, "imu");
        RevHubOrientationOnRobot.LogoFacingDirection logo =
                RevHubOrientationOnRobot.LogoFacingDirection.UP;
        RevHubOrientationOnRobot.UsbFacingDirection usb =
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD;
        imu.initialize(new IMU.Parameters(
                new RevHubOrientationOnRobot(logo, usb)));

        waitForStart();
        imu.resetYaw();   // heading 0 = the way the robot starts

        driveInches(24, 0.5, 3.0);   // forward 24 inches
        turnToHeading(90, 2.0);      // face 90 degrees left
        driveInches(12, 0.5, 2.0);   // forward 12 inches
        turnToHeading(0, 2.0);       // face the start heading
    }

    private void driveInches(double inches, double power,
                             double timeoutSeconds) {
        int ticks = (int) Math.round(inches * TICKS_PER_INCH);

        for (DcMotor wheel : wheels) {
            // 2. The target first
            wheel.setTargetPosition(
                    wheel.getCurrentPosition() + ticks);
            // 3. Then the mode
            wheel.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            // 4. Then the power, always positive
            wheel.setPower(Math.abs(power));
        }

        // 5. Wait until a wheel arrives or time runs out
        ElapsedTime timer = new ElapsedTime();
        while (opModeIsActive()
                && timer.seconds() < timeoutSeconds
                && driveBusy()) {
            telemetry.addData("Target",
                    frontLeft.getTargetPosition());
            telemetry.addData("Front left",
                    frontLeft.getCurrentPosition());
            telemetry.update();
        }

        // Stop, and go back to driving by power
        for (DcMotor wheel : wheels) {
            wheel.setPower(0);
            wheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        }
    }

    // True while all four wheels are still moving
    private boolean driveBusy() {
        return frontLeft.isBusy() && frontRight.isBusy()
                && backLeft.isBusy() && backRight.isBusy();
    }

    private void turnToHeading(double targetDegrees,
                               double timeoutSeconds) {
        ElapsedTime timer = new ElapsedTime();
        while (opModeIsActive()
                && timer.seconds() < timeoutSeconds) {
            double error = headingError(targetDegrees);
            if (Math.abs(error) < HEADING_TOLERANCE) {
                break;   // close enough
            }
            // Fast when far away, slow when close
            double turn = Range.clip(
                    error * TURN_KP, -MAX_TURN, MAX_TURN);
            // A positive turn is to the left
            setDrivePower(-turn, turn);

            telemetry.addData("Target", targetDegrees);
            telemetry.addData("Heading", "%.1f", getHeading());
            telemetry.update();
        }
        setDrivePower(0, 0);
    }

    // How far to turn, the short way round: -180 to 180
    private double headingError(double targetDegrees) {
        double error = targetDegrees - getHeading();
        while (error > 180) {
            error -= 360;
        }
        while (error <= -180) {
            error += 360;
        }
        return error;
    }

    private double getHeading() {
        return imu.getRobotYawPitchRollAngles()
                .getYaw(AngleUnit.DEGREES);
    }

    // Left wheels get one power, right wheels the other
    private void setDrivePower(double left, double right) {
        frontLeft.setPower(left);
        backLeft.setPower(left);
        frontRight.setPower(right);
        backRight.setPower(right);
    }
}
```

<div class="vscode__note" markdown>
**Drive, then turn by the IMU.** The new lines set up the IMU, reset the
heading right after PLAY, and add `turnToHeading`, which turns the robot
until its heading is within 2° of the target, or until time runs out.
</div>
</div>
<div class="vscode__pane" data-file="encoder" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AutoByEncoder.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "Auto by encoder")
public class AutoByEncoder extends LinearOpMode {
    // Look these up for YOUR motors and wheels
    static final double TICKS_PER_REV = 537.7;
    static final double GEAR_REDUCTION = 1.0;
    static final double WHEEL_DIAMETER_IN = 4.0;
    static final double TICKS_PER_INCH =
            TICKS_PER_REV * GEAR_REDUCTION
                    / (WHEEL_DIAMETER_IN * Math.PI);

    private DcMotor frontLeft, frontRight, backLeft, backRight;
    private DcMotor[] wheels;

    @Override
    public void runOpMode() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        wheels = new DcMotor[] {
                frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
            // 1. Encoders don't reset by themselves
            wheel.setMode(
                    DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        }

        waitForStart();

        driveInches(24, 0.5, 3.0);   // forward 24 inches
        driveInches(-12, 0.5, 2.0);  // back 12 inches
    }

    private void driveInches(double inches, double power,
                             double timeoutSeconds) {
        int ticks = (int) Math.round(inches * TICKS_PER_INCH);

        for (DcMotor wheel : wheels) {
            // 2. The target first
            wheel.setTargetPosition(
                    wheel.getCurrentPosition() + ticks);
            // 3. Then the mode
            wheel.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            // 4. Then the power, always positive
            wheel.setPower(Math.abs(power));
        }

        // 5. Wait until a wheel arrives or time runs out
        ElapsedTime timer = new ElapsedTime();
        while (opModeIsActive()
                && timer.seconds() < timeoutSeconds
                && driveBusy()) {
            telemetry.addData("Target",
                    frontLeft.getTargetPosition());
            telemetry.addData("Front left",
                    frontLeft.getCurrentPosition());
            telemetry.update();
        }

        // Stop, and go back to driving by power
        for (DcMotor wheel : wheels) {
            wheel.setPower(0);
            wheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        }
    }

    // True while all four wheels are still moving
    private boolean driveBusy() {
        return frontLeft.isBusy() && frontRight.isBusy()
                && backLeft.isBusy() && backRight.isBusy();
    }
}
```

<div class="vscode__note" markdown>
The encoder version from above, to compare.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
    import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.IMU;
    import com.qualcomm.robotcore.util.ElapsedTime;
    import com.qualcomm.robotcore.util.Range;
    import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
    ```

A few things to know about it:

- **`imu.resetYaw()` runs right after PLAY**, while the robot is still
  and flat on the floor, so heading 0 is the way the robot starts. The
  heading carries over into teleop. If your robot starts auto facing away
  from the drivers, field-centric drive is ready to go. If it doesn't,
  the driver presses options at the start of teleop.
- **Turning uses `setPower`**, so `driveInches` switches the wheels out of
  `RUN_TO_POSITION` when it finishes.
- **Tune `TURN_KP` on your robot.** If the robot stops short of the target
  and the timeout ends the turn, raise it. If the robot swings past the
  target and back, lower it, or lower `MAX_TURN`.

## Why blocking code stops working

`sleep()`, `driveInches()` and `turnToHeading()` are **blocking**: they
don't return until their move is done. While one of them runs, nothing
else in your code runs.

That's fine while the robot only does one thing at a time. Now say the
intake should run for the first 1.5 seconds of auto, while the robot
drives. `driveInches()` is stuck in its `while` loop, so the code that
should stop the intake doesn't run until the drive is finished. You'd
have to copy the intake check into the loop in `driveInches()`, and into
the one in `turnToHeading()`, and into every other loop you write. Teleop
has the same problem: a `sleep()` to wait for a claw freezes the
drivetrain, because the drive code doesn't run while the program sleeps.

## State machines

A **finite state machine** solves this. The robot is always in exactly one
**state**, like "driving forward" or "turning". Each time round the loop,
the code checks whether it's time to move to the next state, and then
moves on. Nothing waits.

In Java:

- An **`enum`** lists the states: `DRIVE_FORWARD`, `PAUSE`, `TURN_LEFT`,
  `DONE`.
- A field remembers the current state, so it survives from one `loop()` to
  the next.
- A **`switch`** in `loop()` runs the code for the current state only.
- An **`ElapsedTime`** replaces `sleep()`: reset it when a state starts,
  and check `seconds()` each loop.

This kind of code fits an iterative `OpMode` best, because the SDK already
calls `loop()` over and over for you.

<!-- TODO diagram: a state diagram. Four boxes in a row joined by arrows: DRIVE_FORWARD --"a wheel arrives, or 3 s"--> PAUSE --"0.5 s"--> TURN_LEFT --"heading within 2° of 90°, or 2 s"--> DONE. Below it, a separate small machine for the intake: "Intake on" --"1.5 s after PLAY"--> "Intake off". Caption: "Two state machines in one loop(): the drive and the intake each move on when their own condition is true." -->

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="fsm">StateMachineAuto.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="fsm" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/StateMachineAuto.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@Autonomous(name = "State machine auto")
public class StateMachineAuto extends OpMode {
    // The drive's steps, in order
    private enum Step { DRIVE_FORWARD, PAUSE, TURN_LEFT, DONE }

    // The same numbers as in AutoWithTurns
    static final double TICKS_PER_INCH =
            537.7 * 1.0 / (4.0 * Math.PI);
    static final double TURN_KP = 0.02;
    static final double MAX_TURN = 0.4;

    private DcMotor frontLeft, frontRight, backLeft, backRight;
    private DcMotor[] wheels;
    private DcMotor intake;
    private IMU imu;

    // Fields keep their values from one loop() to the next
    private Step step = Step.DRIVE_FORWARD;
    private final ElapsedTime stepTimer = new ElapsedTime();
    private final ElapsedTime intakeTimer = new ElapsedTime();

    @Override
    public void init() {
        frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");
        intake = hardwareMap.get(DcMotor.class, "intake");
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        wheels = new DcMotor[] {
                frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
            wheel.setMode(
                    DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        }

        imu = hardwareMap.get(IMU.class, "imu");
        RevHubOrientationOnRobot.LogoFacingDirection logo =
                RevHubOrientationOnRobot.LogoFacingDirection.UP;
        RevHubOrientationOnRobot.UsbFacingDirection usb =
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD;
        imu.initialize(new IMU.Parameters(
                new RevHubOrientationOnRobot(logo, usb)));
    }

    @Override
    public void start() {
        imu.resetYaw();
        // Start the first step and the intake together
        startDrive(24);
        stepTimer.reset();
        intake.setPower(0.8);
        intakeTimer.reset();
    }

    @Override
    public void loop() {
        switch (step) {
            case DRIVE_FORWARD:
                // Done when a wheel arrives, or after 3 s
                if (!driveBusy() || stepTimer.seconds() > 3) {
                    stopDrive();
                    step = Step.PAUSE;
                    stepTimer.reset();
                }
                break;

            case PAUSE:
                if (stepTimer.seconds() > 0.5) {
                    step = Step.TURN_LEFT;
                    stepTimer.reset();
                }
                break;

            case TURN_LEFT:
                double error = headingError(90);
                if (Math.abs(error) < 2
                        || stepTimer.seconds() > 2) {
                    setDrivePower(0, 0);
                    step = Step.DONE;
                } else {
                    double turn = Range.clip(
                            error * TURN_KP, -MAX_TURN, MAX_TURN);
                    setDrivePower(-turn, turn);
                }
                break;

            case DONE:
                break;
        }

        // A second job, checked every loop,
        // whatever step the drive is on
        if (intakeTimer.seconds() > 1.5) {
            intake.setPower(0);
        }

        telemetry.addData("Step", step);
        telemetry.addData("Heading", "%.1f", getHeading());
    }

    private void startDrive(double inches) {
        int ticks = (int) Math.round(inches * TICKS_PER_INCH);
        for (DcMotor wheel : wheels) {
            wheel.setTargetPosition(
                    wheel.getCurrentPosition() + ticks);
            wheel.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            wheel.setPower(0.5);
        }
    }

    private void stopDrive() {
        for (DcMotor wheel : wheels) {
            wheel.setPower(0);
            wheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        }
    }

    private boolean driveBusy() {
        return frontLeft.isBusy() && frontRight.isBusy()
                && backLeft.isBusy() && backRight.isBusy();
    }

    private double headingError(double targetDegrees) {
        double error = targetDegrees - getHeading();
        while (error > 180) {
            error -= 360;
        }
        while (error <= -180) {
            error += 360;
        }
        return error;
    }

    private double getHeading() {
        return imu.getRobotYawPitchRollAngles()
                .getYaw(AngleUnit.DEGREES);
    }

    private void setDrivePower(double left, double right) {
        frontLeft.setPower(left);
        backLeft.setPower(left);
        frontRight.setPower(right);
        backRight.setPower(right);
    }
}
```

<div class="vscode__note" markdown>
**Nothing waits.** `start()` starts the first drive step and the intake.
Each call to `loop()` runs one short check for the drive's current step,
then checks the intake's timer, then returns. The drive moves to its next
step when a wheel arrives or a timer runs out, and the intake stops at
1.5 seconds, whatever the drive is doing.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
    import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
    import com.qualcomm.robotcore.eventloop.opmode.OpMode;
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.IMU;
    import com.qualcomm.robotcore.util.ElapsedTime;
    import com.qualcomm.robotcore.util.Range;
    import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
    ```

### The first seconds, loop by loop

1.  **PLAY:** `start()` runs once. It resets the heading, gives the wheels
    their targets for 24 inches, turns the intake on, and resets both
    timers. `step` is `DRIVE_FORWARD`.
2.  **Each loop while the robot drives:** the `switch` goes to
    `DRIVE_FORWARD`. The wheels are still busy and the timer is under 3
    seconds, so nothing changes. Then the intake check runs, and the
    telemetry. `loop()` returns, and the SDK calls it again.
3.  **A wheel reaches its target:** `DRIVE_FORWARD` stops the wheels,
    changes `step` to `PAUSE` and resets `stepTimer`. From the next loop
    on, the `switch` goes to `PAUSE`.
4.  **Half a second later:** `PAUSE` changes `step` to `TURN_LEFT`. Each
    loop, `TURN_LEFT` sets the turning power from the heading error.
5.  **The heading is within 2° of 90°:** `TURN_LEFT` stops the wheels and
    changes `step` to `DONE`. `loop()` keeps running until auto ends, but
    only the telemetry changes.
6.  **Meanwhile, 1.5 seconds after PLAY:** the intake check turns the
    intake off, whether the drive is still driving, paused or turning.

The intake check is a second, tiny state machine: on until 1.5 seconds,
then off. A robot with a lift, a claw and an intake has one for each, all
in the same `loop()`.

!!! note "Don't turn every auto into a state machine"

    gm0's
    [Finite State Machines](https://gm0.org/en/latest/docs/software/concepts/finite-state-machines.html)
    page warns against one giant `switch` for an auto that only ever does
    one thing at a time. For that, a LinearOpMode with methods like
    `driveInches()` is easier to read. State machines pay off when two or
    more things must happen at once.

## Toward command-based

Two state machines in one `loop()` are fine. Five are hard to read: each
mechanism's states, timers and checks are mixed in with all the others,
and nothing stops two of them from setting the same motor.

Command-based code keeps the same idea, a loop that never waits, but does
the bookkeeping for you. Each mechanism becomes a **subsystem** with its
own code, and each step becomes a **command**. Instead of an `enum` and a
`switch`, you write `Commands.sequence(...)` to run steps one after
another, and `Commands.parallel(...)` to run them at the same time.
[LinearOpMode to command-based](linear-to-command-based.md) shows how,
with the SolversLib library.

## Try it

1.  **Measure your autos.** Run `AutoByTime` three times from the same
    spot and mark where the robot stops. Then change `AutoByEncoder` to
    drive 24 inches forward only, run it three times, and measure each
    distance with a tape measure. If the encoder auto is off by more than
    an inch, check `TICKS_PER_REV`, `GEAR_REDUCTION`, the wheel diameter
    and the motor type in the robot configuration.
2.  **Add a step to the state machine.** After `TURN_LEFT`, add a
    `DRIVE_AGAIN` state that drives 12 inches forward, then goes to `DONE`.
    Call `startDrive(12)` when you change to the new state, the same way
    `start()` starts the first one. Bonus: run the intake again during
    `DRIVE_AGAIN`.

You're done when the encoder auto stops within about an inch of the same
spot every run, `AutoWithTurns` ends each turn within 2° of its target
(watch the heading in telemetry), and your state machine runs every step in
order while the intake stops at 1.5 seconds, whatever the drive is doing.
Pressing STOP in the middle of any of them should stop the robot right
away. You should also be able to explain why `loop()` must never call
`sleep()`.

## Learn more

- The SDK samples
  [RobotAutoDriveByTime_Linear](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotAutoDriveByTime_Linear.java),
  [RobotAutoDriveByEncoder_Linear](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotAutoDriveByEncoder_Linear.java)
  and
  [RobotAutoDriveByGyro_Linear](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotAutoDriveByGyro_Linear.java).
  The gyro sample also steers with the IMU while it drives straight, so
  the robot stays on its heading. It's a good next step.
- gm0:
  [Encoders](https://gm0.org/en/latest/docs/software/tutorials/encoders.html)
  and
  [Finite State Machines](https://gm0.org/en/latest/docs/software/concepts/finite-state-machines.html),
  which has a teleop example: a lift that scores by itself while the
  driver keeps driving
- FTC Docs:
  [Motor Modes and Encoders](https://ftc-docs.firstinspires.org/en/latest/tech_tips/tech-tips/tech-tip-motor-modes/tech-tip-motor-modes.html)
  and the
  [Universal IMU Interface](https://ftc-docs.firstinspires.org/en/latest/programming_resources/imu/imu.html)
- Next: [LinearOpMode to command-based](linear-to-command-based.md)
