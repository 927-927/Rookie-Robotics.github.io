# Sensors and vision

Motors move the robot. Sensors tell your code what actually happened: which
way the robot faces, whether a game piece is in the intake, where the robot
is on the field, and what the camera sees. This page covers the sensors most
FTC robots use: the IMU, color, distance and touch sensors, odometry with
the goBILDA Pinpoint, and cameras, with AprilTags, color processing and the
Limelight 3A.

You'll need a working Pinpoint, or another odometry setup, for
[Path following](path-following.md), so don't skip the push tests at the
end.

!!! note "Versions"

    Written for FTC SDK 12.0 and SolversLib 0.3.6. SDK 12 changed how
    AprilTag detections work. AprilTag code written for SDK 11 or earlier,
    in tutorials, videos, other teams' code or answers from AI chatbots,
    doesn't compile on 12.0 until you change it as shown
    [below](#apriltags-in-sdk-12).

Imports are left out. In Android Studio, click a name with a red underline
and press Alt+Enter to add its import. Every name in `hardwareMap.get(...)`
must match a name in the robot configuration on the Driver Station.

## The IMU

The **IMU** (inertial measurement unit) inside the Control Hub measures how
the hub is turned. The number you'll use most is the **yaw**, or heading:
which way the robot faces, as seen from above. You used it for
field-centric driving in [Mecanum drive](mecanum-drive.md) and for turns in
[Your first autonomous](first-autonomous.md).

Control Hubs made since September 2022 have a BHI260AP IMU, and older ones
have a BNO055. The SDK's `IMU` interface works with both, and it's the only
way to use the BHI260AP. Expansion Hubs bought after December 2021 have no
IMU at all. The default configuration names the Control Hub's IMU `"imu"`.

The IMU measures the hub, not the robot, so you tell it how the hub is
mounted: which way the REV logo on top of the hub faces, and which way its
USB ports face.

```java
IMU imu = hardwareMap.get(IMU.class, "imu");
imu.initialize(new IMU.Parameters(
        new RevHubOrientationOnRobot(
                RevHubOrientationOnRobot.LogoFacingDirection.UP,
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD)));

// Every loop
double heading = imu.getRobotYawPitchRollAngles()
        .getYaw(AngleUnit.DEGREES);
```

What to know about the heading:

- It goes from −180 to +180 degrees, and it **increases when the robot
  turns counterclockwise**. If yours goes the wrong way, or pitch changes
  when you turn, the two directions in `RevHubOrientationOnRobot` don't
  match your robot.
- At 180 it jumps to −180. When you work out how far a turn still has to
  go, wrap the result back into −180 to +180 with
  `AngleUnit.normalizeDegrees(target - heading)`, or the robot may turn
  the long way round.
- `imu.resetYaw()` makes the current heading 0. Only call it while the
  robot is flat on the floor.
- If the hub is mounted at an angle that isn't a multiple of 90 degrees,
  see the SDK sample `SensorIMUNonOrthogonal`.

## Color, distance and touch sensors

| Sensor | Get it from `hardwareMap` as | Read it with |
|---|---|---|
| Color sensor, like the REV Color Sensor V3 | `NormalizedColorSensor` | `getNormalizedColors()`, which has `red`, `green`, `blue` and `alpha` |
| Distance sensor, like the REV 2m Distance Sensor | `DistanceSensor` | `getDistance(DistanceUnit.CM)` |
| Touch sensor or limit switch | `TouchSensor` | `isPressed()` |
| Touch sensor, as a digital port | `DigitalChannel` | `getState()`, which is `false` when the button is pressed. Call `setMode(DigitalChannel.Mode.INPUT)` first. |

A few things that help with color sensors:

- **Use the hue.** The red, green and blue numbers all change with
  distance and lighting. Turn them into hue, saturation and value with
  `Color.colorToHSV(colors.toColor(), hsv)`. The hue, `hsv[0]`, from 0 to
  360, says which color it is.
- **Set the gain.** `setGain(2)` makes all the numbers bigger, which
  helps when they're small. Try values with the SDK sample `SensorColor`,
  which changes the gain with the A and B buttons.
- **It may measure distance too.** Some color sensors, like the REV Color
  Sensor V3, also measure distance. Get the same device again as a
  `DistanceSensor`, with the same name.

Here's the intake from
[LinearOpMode to command-based](linear-to-command-based.md), with a color
sensor that sees when a game piece is in. Like the lift in
[Mechanism control](mechanism-control.md), it reads its sensor once per
loop in `periodic()`, and everything else uses the saved value.

<div class="vscode" markdown>
<div class="vscode__titlebar">intake with a sensor</div>
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
    // Measure your own: the distance with a piece in
    public static double PIECE_CM = 3.0;

    private final DcMotor motor;
    private final NormalizedColorSensor color;
    private final DistanceSensor distance;
    private final float[] hsv = new float[3];
    private double distanceCm = 100;

    public Intake(HardwareMap hardwareMap) {
        motor = hardwareMap.get(DcMotor.class, "intake");
        color = hardwareMap.get(
                NormalizedColorSensor.class, "intake_color");
        distance = hardwareMap.get(
                DistanceSensor.class, "intake_color");
        color.setGain(2);
    }

    // Read the sensor once per loop
    @Override
    public void periodic() {
        NormalizedRGBA colors = color.getNormalizedColors();
        Color.colorToHSV(colors.toColor(), hsv);
        distanceCm = distance.getDistance(DistanceUnit.CM);
    }

    public boolean hasPiece() {
        return distanceCm < PIECE_CM;
    }

    public double getDistanceCm() {
        return distanceCm;
    }

    public float getHue() {
        return hsv[0];
    }

    public Command runIn() {
        return run(() -> motor.setPower(0.8));
    }

    public Command stop() {
        return run(() -> motor.setPower(0));
    }
}
```

<div class="vscode__note" markdown>
**The sensor belongs to the subsystem.** The color sensor is named
`"intake_color"` in the configuration. The constructor gets it twice, once
as a color sensor and once as a distance sensor. `periodic()` reads both
every loop, and `hasPiece()` uses the saved distance.
</div>
</div>
<div class="vscode__pane" data-file="teleop" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/IntakeTeleOp.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Intake with sensor")
public class IntakeTeleOp extends CommandOpMode {
    private Intake intake;

    @Override
    public void initialize() {
        intake = new Intake(hardwareMap);
        GamepadEx driver = new GamepadEx(gamepad1);

        intake.setDefaultCommand(intake.stop());
        // Runs while A is held, until a piece is in
        driver.getGamepadButton(GamepadKeys.Button.A)
                .whenHeld(intake.runIn()
                        .interruptOn(intake::hasPiece));
    }

    @Override
    public void run() {
        super.run();
        telemetry.addData("Distance (cm)",
                intake.getDistanceCm());
        telemetry.addData("Hue", intake.getHue());
        telemetry.addData("Has piece", intake.hasPiece());
        telemetry.update();
    }
}
```

<div class="vscode__note" markdown>
**The sensor ends the command.** `interruptOn(intake::hasPiece)` ends
`runIn()` as soon as `hasPiece()` is `true`. Then the Intake is free, so
its default command `stop()` stops the motor, even if the driver is still
holding A. With a piece already in, pressing A ends the command in the
same loop it starts, so the intake doesn't run.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports, if Alt+Enter offers more than one choice"

    `Color` is Android's `android.graphics.Color`. Don't pick classes from
    `com.seattlesolvers.solverslib.command.old`.

    ```java
    // Intake.java
    import android.graphics.Color;
    import com.qualcomm.robotcore.hardware.DcMotor;
    import com.qualcomm.robotcore.hardware.DistanceSensor;
    import com.qualcomm.robotcore.hardware.HardwareMap;
    import com.qualcomm.robotcore.hardware.NormalizedColorSensor;
    import com.qualcomm.robotcore.hardware.NormalizedRGBA;
    import com.seattlesolvers.solverslib.command.Command;
    import com.seattlesolvers.solverslib.command.SubsystemBase;
    import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;

    // IntakeTeleOp.java
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import com.seattlesolvers.solverslib.command.CommandOpMode;
    import com.seattlesolvers.solverslib.gamepad.GamepadEx;
    import com.seattlesolvers.solverslib.gamepad.GamepadKeys;
    import org.firstinspires.ftc.teamcode.subsystems.Intake;
    ```

The IMU, color sensors and distance sensors connect over I2C, which bulk
reads don't cover, so each read takes its own trip to the hub. Read each
one once per loop, and only the values you use.

## Odometry and the goBILDA Pinpoint

To drive a path, your code needs the robot's **pose**: where it is on the
field (x and y) and which way it faces (heading). Working out the pose as
the robot moves is called **odometry**. You can do it with the drive motor
encoders, but mecanum wheels slip, so most teams add **odometry pods**
(also called dead wheels): small omni wheels with their own encoders, with
no motor, pressed against the floor by a spring. They only turn when the
robot really moves.

<!-- TODO diagram: the bottom of a mecanum robot, seen from below. Four mecanum wheels at the corners. One odometry pod near the center pointing forward (labelled "X pod: counts forward and back"), one pointing sideways (labelled "Y pod: counts left and right"), both wired to a Pinpoint board, which is wired to an I2C port on the Control Hub. A dot at the robot's center labelled "tracking point", with the two offsets drawn as dimension lines: "X pod offset: sideways from the center" and "Y pod offset: forward from the center". Caption: "The Pinpoint turns two pods and its own IMU into a pose." -->

| Setup | Pods | Heading from | What gm0 says |
|---|---|---|---|
| **Two-wheel** | One forward, one sideways | An IMU | Cheaper, but it drifts more, and reading the hub's IMU slows down your loop |
| **Three-wheel** | Two forward, one sideways | The difference between the two forward pods | More accurate, but you have to tune how it measures heading |

The **goBILDA Pinpoint** is a small odometry computer for the two-wheel
setup. It reads both pods and its own IMU, works out the pose itself
(goBILDA says about 1,500 times a second), and your code reads the result.
Your loop never reads the hub's IMU or does the odometry math. The SDK has
a driver for it, `GoBildaPinpointDriver`, built in since SDK 10.3, with
support for the Pinpoint V2 since 11.1. The first Pinpoint is
discontinued; the V2 is the one you can buy now.

To set it up:

1.  **Mount and wire it.** Mount the Pinpoint sticker side up. Plug the
    forward pod into its X port and the sideways pod into its Y port.
2.  **Plug it into an I2C port other than 0** on the Control Hub. Port 0
    is used by the hub's own IMU. In the robot configuration, add it on
    that I2C port and name it `"pinpoint"`.
3.  **Measure the offsets** from the point on the robot you want to track,
    usually its center. The X pod offset is how far the forward pod is to
    the side: left of the center is positive, right is negative. The Y pod
    offset is how far the sideways pod is forward: in front of the center
    is positive, behind it is negative.

Then run this OpMode and push the robot around by hand:

<div class="vscode" markdown>
<div class="vscode__titlebar">pinpoint test</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="pinpoint">PinpointTest.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="pinpoint" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/PinpointTest.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "Pinpoint test")
public class PinpointTest extends OpMode {
    private GoBildaPinpointDriver pinpoint;

    @Override
    public void init() {
        pinpoint = hardwareMap.get(
                GoBildaPinpointDriver.class, "pinpoint");

        // Example offsets: measure your own robot
        pinpoint.setOffsets(-84.0, -168.0, DistanceUnit.MM);
        pinpoint.setEncoderResolution(
                GoBildaPinpointDriver.GoBildaOdometryPods
                        .goBILDA_4_BAR_POD);
        pinpoint.setEncoderDirections(
                GoBildaPinpointDriver.EncoderDirection.FORWARD,
                GoBildaPinpointDriver.EncoderDirection.FORWARD);

        // Sets the pose to 0, 0, 0 and calibrates the IMU.
        // The robot must be still.
        pinpoint.resetPosAndIMU();
    }

    @Override
    public void loop() {
        pinpoint.update();   // every loop
        Pose2D pose = pinpoint.getPosition();

        telemetry.addData("x (in)",
                pose.getX(DistanceUnit.INCH));
        telemetry.addData("y (in)",
                pose.getY(DistanceUnit.INCH));
        telemetry.addData("heading (deg)",
                pose.getHeading(AngleUnit.DEGREES));

        // A sets the pose back to 0, 0, 0
        if (gamepad1.aWasPressed()) {
            pinpoint.setPosition(new Pose2D(DistanceUnit.INCH,
                    0, 0, AngleUnit.DEGREES, 0));
        }
    }
}
```

<div class="vscode__note" markdown>
**Configure once, update every loop.** `init()` tells the Pinpoint where
the pods are, which pods you have, and which way they count, then resets
it. `loop()` calls `update()` to read the newest pose from the Pinpoint,
then shows it. For pods that aren't goBILDA's, the SDK sample
`SensorGoBildaPinpoint` shows how to set the resolution in ticks per
millimeter instead. Telemetry is sent for you, because this is an
iterative `OpMode`.
</div>
</div>
</div>
</div>
</div>
</div>

??? info "The imports"

    ```java
    import com.qualcomm.hardware.gobilda.GoBildaPinpointDriver;
    import com.qualcomm.robotcore.eventloop.opmode.OpMode;
    import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
    import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
    import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
    import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;
    ```

The Pinpoint's x is **forward** and its y is **to the left**, both counted
from where the robot was when you reset it. Pushing the robot forward
should make x go up, and pushing it left should make y go up. If one goes
down instead, change that pod's direction to `REVERSED` in
`setEncoderDirections`.

### Coordinate frames

The Pinpoint gives a pose compared with where the robot started. A path
follower needs a pose on the field, and you'll meet two different field
frames:

- The **FTC field coordinate system**, from FTC Docs, puts the origin, (0,
  0), at the center of the field.
- **Pedro Pathing uses its own frame**, drawn with the field seen from
  above. The origin is the bottom-left corner of the field, distances are
  in inches, x increases to the right and y increases going up. A heading
  of 0 faces right, and headings increase counterclockwise.

A pose from one frame is wrong in the other, so a pose from FTC Docs or an
FTC sample has to be converted before Pedro can use it. Pedro's
[Coordinates](https://pedropathing.com/docs/pathing/reference/coordinates)
page shows how.

## Vision

A webcam plugs into a USB port on the Control Hub and gets a name in the
robot configuration, usually `"Webcam 1"`. In code, a **VisionPortal**
runs the camera and hands every frame to one or more **processors**. Each
processor looks for one thing: AprilTags, a color, or a colored blob.

### AprilTags in SDK 12

An **AprilTag** is a square black-and-white code. The AprilTag processor
finds tags in each frame, and for every tag in the SDK's tag library it
works out where the tag is compared with the camera. The library already
has this season's tags.

In SDK 12, each detection is one of two kinds, and you check which with
`instanceof` before you read it:

| | `AprilTagSingleDetection` | `AprilTagClusterDetection` |
|---|---|---|
| **What it is** | One tag on its own | A **cluster**: a group of tags that belong together. You get one detection per cluster, however many of its tags the camera sees. |
| **Its own fields** | `id`, `metadata`, `center` and a few more | `percentClusterFound`, `metadata` |
| **Both have** | `ftcPose`: `range`, `bearing`, `x`, `y`, `z`, `roll` and more | the same |

Older code reads `detection.id` straight from an `AprilTagDetection`. That
doesn't compile on SDK 12, because only single detections have an `id`.

BIOBUZZ has four clusters and no single tags. Each cluster's pose doesn't
point at a tag: it points at about the center of the HIVE CELL's opening,
so you can aim straight at it. The tags move with the HIVE CELLs, so the
SDK's release notes say they're **not suitable for working out where the
robot is on the field**. Use them to aim, with range and bearing, and use
odometry for the robot's position.

<div class="vscode" markdown>
<div class="vscode__titlebar">apriltag test</div>
<div class="vscode__body" markdown>
<nav class="vscode__sidebar" aria-label="Files">
<div class="vscode__heading">Explorer</div>
<div class="vscode__folder" style="--depth: 0">TeamCode/.../teamcode</div>
<button type="button" class="vscode__file is-active" style="--depth: 1" data-file="apriltag">AprilTagTest.java</button>
</nav>
<div class="vscode__editor" markdown>
<div class="vscode__tabs"><span class="vscode__tab"></span></div>
<div class="vscode__crumbs"></div>
<div class="vscode__panes" markdown>
<div class="vscode__pane" data-file="apriltag" data-path="TeamCode/src/main/java/org/firstinspires/ftc/teamcode/AprilTagTest.java" markdown>

```java linenums="1"
package org.firstinspires.ftc.teamcode;

@TeleOp(name = "AprilTag test")
public class AprilTagTest extends LinearOpMode {
    @Override
    public void runOpMode() {
        AprilTagProcessor aprilTag =
                AprilTagProcessor.easyCreateWithDefaults();
        VisionPortal portal =
                VisionPortal.easyCreateWithDefaults(
                        hardwareMap.get(WebcamName.class,
                                "Webcam 1"),
                        aprilTag);

        waitForStart();

        while (opModeIsActive()) {
            for (AprilTagDetection det
                    : aprilTag.getDetections()) {
                if (det instanceof AprilTagClusterDetection) {
                    AprilTagClusterDetection cluster =
                            (AprilTagClusterDetection) det;
                    String name = cluster.metadata.name;
                    // Red alliance: clusters starting with R
                    boolean ours = name.startsWith("R");
                    // Right side up, so you can score in it
                    boolean upright =
                            Math.abs(det.ftcPose.roll) < 90;
                    telemetry.addData(name, "%d%% seen",
                            cluster.percentClusterFound);
                    telemetry.addData("  aim at it",
                            ours && upright);
                } else {
                    AprilTagSingleDetection tag =
                            (AprilTagSingleDetection) det;
                    if (tag.metadata == null) {
                        continue;   // not in the library
                    }
                    telemetry.addData("Tag", tag.id);
                }
                telemetry.addData("  range (in)",
                        det.ftcPose.range);
                telemetry.addData("  bearing (deg)",
                        det.ftcPose.bearing);
            }
            telemetry.update();
            sleep(20);   // give the camera some CPU time
        }
        portal.close();
    }
}
```

<div class="vscode__note" markdown>
**Check the kind, then cast.** The loop goes through every detection. A
cluster shows its name and how much of it the camera sees, and whether
it's one to aim at: your alliance's, and right side up. A single tag shows
its id. Both kinds have `ftcPose`, so range and bearing are read from
`det`, without a cast. `range` is the distance from the camera to the
target, and `bearing` is how far to the side of the camera's center line
it is, in degrees. To aim, turn until the bearing is close to 0.
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
    import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
    import org.firstinspires.ftc.vision.VisionPortal;
    import org.firstinspires.ftc.vision.apriltag.AprilTagClusterDetection;
    import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
    import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;
    import org.firstinspires.ftc.vision.apriltag.AprilTagSingleDetection;
    ```

The "aim at it" checks come from FTC Docs'
[AprilTag Clusters](https://ftc-docs.firstinspires.org/en/latest/tech_tips/tech-tips/tech-tip-apriltag-clusters/tech-tip-apriltag-clusters.html)
tech tip: each cluster's name starts with `R` or `B` for its alliance, and
a roll between −90 and 90 degrees means the cluster is right side up. A
cluster that's upside down can't be scored in, even if the camera sees all
of it. A blue robot checks for `"B"` instead.

To see what the camera sees, press INIT, then, before PLAY, open the
Driver Station menu with the three dots and pick **Camera Stream**.

### Color processing

The SDK has two processors that look for colors instead of tags. They go
into a VisionPortal the same way:

- **PredominantColorProcessor** uses the camera like a color sensor. You
  pick a part of the image and a list of colors, and it tells you which
  color fills that part best, in `result.closestSwatch`. See the SDK
  sample `ConceptVisionColorSensor`.
- **ColorBlobLocatorProcessor** finds areas of one color, called
  **blobs**, with their size and place in the image, from `getBlobs()`.
  Use it to drive toward a game piece. See the SDK samples
  `ConceptVisionColorLocator_Rectangle` and
  `ConceptVisionColorLocator_Circle`.

FTC Docs'
[Color Processing](https://ftc-docs.firstinspires.org/en/latest/color_processing/index.html)
pages explain both, step by step.

### Limelight 3A (optional)

The **Limelight 3A** is a camera with its own computer. It runs the vision
code itself and sends the results to the Control Hub, so the Control Hub
doesn't have to process the images. Plug it into the Control Hub's blue
USB 3.0 port. In the robot configuration, scan for devices: it shows up
as an **Ethernet Device**. Rename it `"limelight"`. You set up what it
looks for, called a **pipeline**, in its web page at
`http://limelight.local:5801`. The
[Limelight 3A guide](https://docs.limelightvision.io/docs/docs-limelight/getting-started/limelight-3a)
explains the setup.

```java
Limelight3A limelight =
        hardwareMap.get(Limelight3A.class, "limelight");
limelight.pipelineSwitch(0);
limelight.start();   // nothing is valid until start()

// Every loop
LLResult result = limelight.getLatestResult();
if (result != null && result.isValid()) {
    telemetry.addData("tx", result.getTx());
    telemetry.addData("ty", result.getTy());
}
```

`getTx()` is how far left or right the target is, in degrees, and `getTy()`
is how far up or down. To aim, turn until `tx` is close to 0. The Limelight
can also work out the robot's field position from AprilTags, with its
botpose and MegaTag features. BIOBUZZ's tags move, so the warning above
applies to those too. Call `limelight.stop()` when you're done with it.

## Try it

1.  **Push-test the Pinpoint.** Set it up and run `PinpointTest`. Lay a
    tape measure on the floor and do three tests, pressing A to reset
    before each one:
    - Push the robot straight forward 48 inches. x should read about 48,
      and y about 0.
    - Push it straight left 48 inches. y should read about 48, and x about
      0.
    - Spin it slowly in place five times and stop where it started. x and
      y should read close to 0, and the heading close to 0.

    If x or y reads negative, flip that pod's direction. If both distances
    are too big, or both too small, by about the same fraction, check the
    pod type. If spinning moves x or y, measure the offsets again.

2.  **Stop the intake, then find a tag.** Build the intake above and use the
    telemetry to pick `PIECE_CM` for your game piece. Then run
    `AprilTagTest` with the webcam pointed at a HIVE CELL's tags, or at a
    tag from FTC Docs'
    [AprilTag Test Images](https://ftc-docs.firstinspires.org/en/latest/apriltag/opmode_test_images/opmode-test-images.html),
    and move the camera around. The test tags are in the SDK's tag library,
    so they show up as single tags. If you print one, print it at actual
    size, or the range will be wrong.

You're done when the Pinpoint passes all three push tests to within about
an inch and a few degrees, the intake stops by itself when a piece comes
in, and `AprilTagTest` builds on SDK 12 and shows a range that matches a
tape measure. Write down your Pinpoint offsets and directions. In
[Path following](path-following.md), Pedro's Pinpoint tuner measures them
again, in inches, and your numbers are a good check on its results.

## Learn more

- FTC Docs:
  [Universal IMU Interface](https://ftc-docs.firstinspires.org/en/latest/programming_resources/imu/imu.html),
  the
  [AprilTag and VisionPortal pages](https://ftc-docs.firstinspires.org/en/latest/apriltag/index.html),
  [AprilTag Clusters](https://ftc-docs.firstinspires.org/en/latest/tech_tips/tech-tips/tech-tip-apriltag-clusters/tech-tip-apriltag-clusters.html),
  [Understanding AprilTag Detection Values](https://ftc-docs.firstinspires.org/en/latest/apriltag/understanding_apriltag_detection_values/understanding-apriltag-detection-values.html),
  [Color Processing](https://ftc-docs.firstinspires.org/en/latest/color_processing/index.html)
  and the
  [Field Coordinate System](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- goBILDA:
  [Pinpoint V2](https://www.gobilda.com/pinpoint-v2-odometry-computer-imu-sensor-fusion-for-2-wheel-odometry/),
  with its user guide
- Pedro Pathing:
  [Pinpoint localizer](https://pedropathing.com/docs/pathing/tuning/localization/pinpoint),
  for setting up the Pinpoint for path following
- gm0:
  [Odometry](https://gm0.org/en/latest/docs/software/concepts/odometry.html)
  and
  [Dead Wheels](https://gm0.org/en/latest/docs/common-mechanisms/dead-wheels.html),
  for how odometry works. They were written before the Pinpoint and
  don't mention it.
- Limelight:
  [FTC programming guide](https://docs.limelightvision.io/docs/docs-limelight/apis/ftc-programming)
  and the
  [Limelight 3A guide](https://docs.limelightvision.io/docs/docs-limelight/getting-started/limelight-3a)
