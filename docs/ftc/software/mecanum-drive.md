# Mecanum drive

Many FTC robots use a **mecanum drive**: four **mecanum wheels**, each
with its own motor. A mecanum robot can drive forward, slide sideways
(**strafe**) and turn, all at the same time, so the driver can line up
with a goal without turning around. This page writes the teleop for it
twice: **robot-centric**, where pushing the stick forward
moves the robot toward its own front, and **field-centric**, where pushing
the stick forward moves the robot away from the driver, whichever way the
robot is facing.

!!! note "Versions"

    Written for FTC SDK 12.0. The motor names `front_left_drive`,
    `front_right_drive`, `back_left_drive` and `back_right_drive` are the
    ones the SDK samples use since SDK 10.3. The `IMU` interface works with
    both kinds of Control Hub IMU.

Your robot configuration needs four motors with those four names. For
field-centric drive it also needs the IMU, named `imu`. A new configuration
on a Control Hub already has it, with that name.

## How mecanum wheels move the robot

A mecanum wheel has small rollers around its edge, at 45° to its axle. When
the wheel spins, the rollers push the robot at 45°, not straight ahead. Seen
from above, the rollers on the four wheels must make an **X** shape. Then
the sideways pushes cancel or add up, depending on which way each wheel
spins:

| To move the robot... | Front left | Front right | Back left | Back right |
|---|---|---|---|---|
| Forward | forward | forward | forward | forward |
| Strafe right | forward | backward | backward | forward |
| Turn right (clockwise) | forward | backward | forward | backward |

<!-- TODO diagram: top view of a mecanum chassis with the four wheels, rollers drawn so they form an X. Three small copies side by side: "Forward", "Strafe right", "Turn right". In each, an arrow on every wheel shows which way it spins (forward or backward), and a big arrow on the chassis shows how the robot moves. Label the wheels FL, FR, BL, BR. -->

Because of friction in the rollers, a mecanum robot drives a little faster
forward than sideways. You'll make up for that in the code.

## Robot-centric drive

The driver uses two sticks:

- **Left stick up and down**: drive forward and backward. Call it `y`.
- **Left stick left and right**: strafe. Call it `x`.
- **Right stick left and right**: turn. Call it `rx`.

Each wheel's power is a mix of the three. These four lines are the whole
idea, from gm0's
[Mecanum TeleOp](https://gm0.org/en/latest/docs/software/tutorials/mecanum-drive.html)
page:

```java
double fl = y + x + rx;   // front left
double bl = y - x + rx;   // back left
double fr = y - x - rx;   // front right
double br = y + x - rx;   // back right
```

Check them against the table above. With only `x = 1` (strafe right), the
front left and back right get +1 and the other two get −1. With only
`rx = 1` (turn right), the left wheels get +1 and the right wheels get −1.

Two more steps make it drive well:

1.  **Multiply `x` by 1.1**, to make up for slower strafing. 1.1 is a
    starting point. Drivers can change it to taste.
2.  **Keep the powers in range.** Power only goes from −1 to 1, and the SDK
    cuts off anything bigger. Full forward (`y = 1`) plus half a turn right
    (`rx = 0.5`) gives the left wheels 1.5 and the right wheels 0.5. Cut to
    1 and 0.5, the left side runs only twice as fast as the right instead
    of three times, so the robot turns less than the driver asked.
    Instead, divide every power by the same number, `d`:

    ```java
    double d = Math.max(
            Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);
    ```

    Here `d` is 1.5, so the powers become 1 and 0.33, still three to one.
    When the sticks add up to 1 or less, `d` is 1 and nothing changes.

Here's the full OpMode. Imports are left out. In Android Studio, click a
name with a red underline and press Alt+Enter to add its import. The
imports are also listed below the window.

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="robot">MecanumTeleOp.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="robot" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/MecanumTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Mecanum (robot-centric)")
public class MecanumTeleOp extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        DcMotor frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        DcMotor backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        DcMotor backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");

        // One side must be reversed. Test it, and swap
        // to the right side if the robot drives backward.
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        DcMotor[] wheels =
                {frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
        }

        waitForStart();

        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;    // forward
            double x = gamepad1.left_stick_x * 1.1; // strafe
            double rx = gamepad1.right_stick_x;   // turn

            // Divide by d so no power goes past 1
            double d = Math.max(
                    Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);
            double fl = (y + x + rx) / d;
            double bl = (y - x + rx) / d;
            double fr = (y - x - rx) / d;
            double br = (y + x - rx) / d;

            frontLeft.setPower(fl);
            backLeft.setPower(bl);
            frontRight.setPower(fr);
            backRight.setPower(br);

            telemetry.addData("Front left/right",
                    "%.2f  %.2f", fl, fr);
            telemetry.addData("Back left/right",
                    "%.2f  %.2f", bl, br);
            telemetry.update();
        }
    }
}
```

<div class="vscode__note" markdown>
**Robot-centric mecanum.** Each loop reads the two sticks, mixes them into
four wheel powers, scales them so none goes past 1, and sets the motors.
`-gamepad1.left_stick_y` has a minus because the stick gives a negative
number when you push it up.
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

### Test the motor directions first

The motors on the left side face the opposite way from the motors on the
right, so one side has to be reversed. Which side depends on your motors
and gearboxes: the SDK samples reverse the left side, and gm0's sample
reverses the right. Neither is wrong. Test your own robot, with it on a box
so the wheels are off the ground:

1.  **Test one wheel at a time.** The SDK sample `BasicOmniOpMode_Linear`
    has a trick for this. Put these lines just before the `setPower` calls,
    so each button runs one wheel forward at 30&nbsp;%:

    ```java
    // Test only: X, A, Y and B each run one wheel
    fl = gamepad1.x ? 0.3 : 0;
    bl = gamepad1.a ? 0.3 : 0;
    fr = gamepad1.y ? 0.3 : 0;
    br = gamepad1.b ? 0.3 : 0;
    ```

    X should spin only the front left wheel, A the back left, Y the front
    right and B the back right, and each should spin forward, the way it
    would roll if the robot drove forward.
    - The wrong wheel spins: fix the names in the robot configuration.
    - The right wheel spins backward: flip that motor's direction. Change
      its `setDirection` line, or add one: a motor with no line runs
      `FORWARD`. If all four are backward, reverse the right side instead
      of the left.

    Remove the test lines when every wheel is right.
2.  **Push the left stick forward, gently.** Every wheel should spin
    forward.
3.  **Put the robot on the floor and push the left stick right.** It should
    slide right without turning. If it drives at an angle or spins, check
    that the rollers make an X from above.

## Field-centric drive

Robot-centric drive is hard when the robot faces the driver: pushing the
stick forward drives the robot toward the driver, and left is right. With
**field-centric** drive, pushing the stick forward always moves the robot
away from the driver, and right always moves it to the driver's right,
whichever way the robot faces. The right stick still turns the robot.

To do that, the code needs to know which way the robot is facing. That's
its **heading**, and the IMU measures it.

### The IMU

The **IMU** (inertial measurement unit) is a sensor inside the Control
Hub that measures how the hub is turned. Control Hubs shipped from
September 2022 have a BHI260AP IMU, and older ones have a BNO055. The
SDK's `IMU` interface works with both. Expansion Hubs bought after
December 2021 have no IMU.

The IMU measures the hub, not the robot. So you tell it how the hub is
mounted, with two directions:

- **Logo facing direction**: the way the REV logo printed on the hub
  faces. Usually `UP`.
- **USB facing direction**: the way the hub's USB ports face. If they point
  to the front of the robot, that's `FORWARD`.

Each one can be `UP`, `DOWN`, `FORWARD`, `BACKWARD`, `LEFT` or `RIGHT`.
Some pairs are impossible, like both `UP`, and the OpMode stops with an
error if you pick one. If your hub is mounted at an angle that isn't a
multiple of 90°, see the FTC Docs
[IMU page](https://ftc-docs.firstinspires.org/en/latest/programming_resources/imu/imu.html).

```java
IMU imu = hardwareMap.get(IMU.class, "imu");
RevHubOrientationOnRobot.LogoFacingDirection logo =
        RevHubOrientationOnRobot.LogoFacingDirection.UP;
RevHubOrientationOnRobot.UsbFacingDirection usb =
        RevHubOrientationOnRobot.UsbFacingDirection.FORWARD;
imu.initialize(new IMU.Parameters(
        new RevHubOrientationOnRobot(logo, usb)));
```

Then read the heading, which the SDK calls **yaw**:

```java
double heading = imu.getRobotYawPitchRollAngles()
        .getYaw(AngleUnit.RADIANS);
```

- Yaw goes from −180° to 180° (−π to π in radians).
- It **goes up when the robot turns left** (counter-clockwise, seen from
  above).
- Java's `Math.sin` and `Math.cos` use radians, so ask for
  `AngleUnit.RADIANS` here. Ask for `AngleUnit.DEGREES` to show it in
  telemetry.
- `imu.resetYaw()` makes the way the robot faces right now heading 0. Only
  call it while the robot sits flat on the floor.

The heading is kept between OpMode runs until the robot or the Robot
Controller app restarts, so it carries over from auto into teleop. It
also drifts slowly. Give the driver a button to reset it: face the robot
away from the driver and press **options** (**start** on an Xbox-style
gamepad). It's hard to press by accident.

### Turning the stick by the heading

The left stick gives a direction on the field. The wheels need a direction
relative to the robot. To get one from the other, turn the stick direction
by the heading, backward (by −heading):

```java
double rotX = x * Math.cos(-heading) - y * Math.sin(-heading);
double rotY = x * Math.sin(-heading) + y * Math.cos(-heading);
```

Then use `rotX` and `rotY` in the mecanum lines instead of `x` and `y`.

For example, say the robot has turned 90° to the left, and the driver
pushes the stick straight forward (`x = 0`, `y = 1`). Then
`rotX = 0 − 1 × sin(−90°) = 1` and `rotY = 0 + 1 × cos(−90°) = 0`. The
robot strafes to its own right. It's facing the driver's left, so its
right is straight away from the driver, which is what the driver asked
for.

<!-- TODO diagram: two top-down pictures of the field with the driver at the bottom edge. Left: robot facing up (heading 0); the stick is pushed forward; the robot drives up. Right: the same robot turned 90° to the left (heading +90°, front pointing to the driver's left); the stick is pushed forward; an arrow shows the robot strafing to its own right, which is up the field. Under each picture, the values of x, y, rotX and rotY. -->

<div class="vscode" markdown>
<div class="vscode__titlebar">TeamCode</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="field">FieldCentricTeleOp.java</button>
<button type="button" class="vscode__file" style="--depth: 1" data-file="robot">MecanumTeleOp.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="field" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/FieldCentricTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Mecanum (field-centric)")
public class FieldCentricTeleOp extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        DcMotor frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        DcMotor backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        DcMotor backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");

        // The same directions you found for MecanumTeleOp
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        DcMotor[] wheels =
                {frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
        }

        // Change these to match how your hub is mounted
        IMU imu = hardwareMap.get(IMU.class, "imu");
        RevHubOrientationOnRobot.LogoFacingDirection logo =
                RevHubOrientationOnRobot.LogoFacingDirection.UP;
        RevHubOrientationOnRobot.UsbFacingDirection usb =
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD;
        imu.initialize(new IMU.Parameters(
                new RevHubOrientationOnRobot(logo, usb)));

        // Instead of waitForStart(): show the heading until PLAY
        while (opModeInInit()) {
            telemetry.addData("Heading (deg)", "%.1f",
                    imu.getRobotYawPitchRollAngles()
                            .getYaw(AngleUnit.DEGREES));
            telemetry.update();
        }

        while (opModeIsActive()) {
            if (gamepad1.options) {
                imu.resetYaw();
            }
            double heading = imu.getRobotYawPitchRollAngles()
                    .getYaw(AngleUnit.RADIANS);

            double y = -gamepad1.left_stick_y;
            double x = gamepad1.left_stick_x;
            double rx = gamepad1.right_stick_x;

            // Turn the stick direction by -heading
            double rotX = x * Math.cos(-heading)
                    - y * Math.sin(-heading);
            double rotY = x * Math.sin(-heading)
                    + y * Math.cos(-heading);
            rotX = rotX * 1.1;  // make up for slower strafing

            double d = Math.max(Math.abs(rotY)
                    + Math.abs(rotX) + Math.abs(rx), 1);
            frontLeft.setPower((rotY + rotX + rx) / d);
            backLeft.setPower((rotY - rotX + rx) / d);
            frontRight.setPower((rotY - rotX - rx) / d);
            backRight.setPower((rotY + rotX - rx) / d);

            telemetry.addData("Heading (deg)", "%.1f",
                    Math.toDegrees(heading));
            telemetry.update();
        }
    }
}
```

<div class="vscode__note" markdown>
**Field-centric mecanum.** The same drive as `MecanumTeleOp`, with three
additions: it sets up the IMU in INIT, it shows the heading until PLAY so
you can check the IMU, and each loop turns the left stick's direction by
the heading before mixing the wheel powers. Pressing options makes the
way the robot faces right now "forward".
</div>
</div>
<div class="vscode__pane" data-file="robot" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/MecanumTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Mecanum (robot-centric)")
public class MecanumTeleOp extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor frontLeft = hardwareMap.get(
                DcMotor.class, "front_left_drive");
        DcMotor frontRight = hardwareMap.get(
                DcMotor.class, "front_right_drive");
        DcMotor backLeft = hardwareMap.get(
                DcMotor.class, "back_left_drive");
        DcMotor backRight = hardwareMap.get(
                DcMotor.class, "back_right_drive");

        // One side must be reversed. Test it, and swap
        // to the right side if the robot drives backward.
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        DcMotor[] wheels =
                {frontLeft, frontRight, backLeft, backRight};
        for (DcMotor wheel : wheels) {
            wheel.setZeroPowerBehavior(
                    DcMotor.ZeroPowerBehavior.BRAKE);
        }

        waitForStart();

        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;    // forward
            double x = gamepad1.left_stick_x * 1.1; // strafe
            double rx = gamepad1.right_stick_x;   // turn

            // Divide by d so no power goes past 1
            double d = Math.max(
                    Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);
            double fl = (y + x + rx) / d;
            double bl = (y - x + rx) / d;
            double fr = (y - x - rx) / d;
            double br = (y + x - rx) / d;

            frontLeft.setPower(fl);
            backLeft.setPower(bl);
            frontRight.setPower(fr);
            backRight.setPower(br);

            telemetry.addData("Front left/right",
                    "%.2f  %.2f", fl, fr);
            telemetry.addData("Back left/right",
                    "%.2f  %.2f", bl, br);
            telemetry.update();
        }
    }
}
```

<div class="vscode__note" markdown>
The robot-centric version from above, to compare.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
    import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.IMU;
    import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
    ```

`while (opModeInInit())` replaces `waitForStart()`. It runs over and over
during INIT and ends when the driver presses PLAY, so you can watch the
heading before you drive. The SDK sample `RobotAutoDriveByGyro_Linear` does
the same.

### Check the IMU, then drive

1.  **During INIT, turn the robot left by hand.** The heading should go
    up. If it goes down, or if it changes when you tilt the robot instead
    of turning it, the logo and USB directions in the code are wrong.
2.  **Press PLAY, face the robot away from you, and press options.** The
    heading becomes 0.
3.  **Turn the robot 90° and push the left stick forward.** The robot
    should drive away from you. Try it facing left, right and toward you.

The SDK sample `RobotTeleopMecanumFieldRelativeDrive` does the same thing
another way: it turns the stick into an angle and a length with
`Math.atan2` and `Math.hypot`, subtracts the heading from the angle, and
turns it back. The result is the same.

## Try it

1.  **Slow mode.** In `FieldCentricTeleOp`, while the driver holds the
    right bumper, multiply all four powers by 0.4 so the robot drives
    slowly for lining up.
2.  **Switch to robot-centric.** While the driver holds the left bumper,
    use `x` and `y` instead of `rotX` and `rotY`, so the robot drives
    robot-centric. The SDK sample `RobotTeleopMecanumFieldRelativeDrive`
    has the same feature.

You're done when pushing the left stick forward spins every wheel forward,
the robot strafes right without turning, and, after you reset the heading,
pushing the stick forward drives the robot away from you whether it faces
away, left, right or toward you. The heading in telemetry should go up
when the robot turns left.

## Learn more

- gm0:
  [Mecanum TeleOp](https://gm0.org/en/latest/docs/software/tutorials/mecanum-drive.html),
  where the math on this page comes from, with a Blocks version, and
  [Holonomic Drivetrains](https://gm0.org/en/latest/docs/common-mechanisms/drivetrains/holonomic.html),
  on how mecanum wheels work
- FTC Docs:
  [Universal IMU Interface](https://ftc-docs.firstinspires.org/en/latest/programming_resources/imu/imu.html),
  including hubs mounted at an angle
- The SDK samples
  [BasicOmniOpMode_Linear](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOmniOpMode_Linear.java),
  robot-centric, which scales the powers by the biggest one instead of by
  `d`, and
  [RobotTeleopMecanumFieldRelativeDrive](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotTeleopMecanumFieldRelativeDrive.java),
  field-centric
- [Sensors and vision](sensors-and-vision.md), for more about the IMU

!!! info "Credit"

    The mecanum math and the field-centric rotation on this page are
    adapted from gm0's
    [Mecanum TeleOp](https://gm0.org/en/latest/docs/software/tutorials/mecanum-drive.html)
    page. gm0 is shared under
    [CC BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/)
    (see its [license page](https://gm0.org/en/latest/docs/appendix/license.html)).
