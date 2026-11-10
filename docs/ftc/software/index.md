# Software

Programming an FTC robot with the FTC SDK, in Java. The pages below are a
learning path: do them in order, and finish each page's **Try it** exercise
before moving on. Where a good free lesson already exists, a page links to
it instead of repeating it.

!!! note "Versions"

    Written for the 2026–27 season, BIOBUZZ: FTC SDK 12.0, Android Studio
    Narwhal 3 Feature Drop or later, SolversLib 0.3.6 and Pedro Pathing
    3.0.2. Each page lists the versions it depends on.

## The learning path

A session is about two hours with a robot or a Control Hub.

| Stage | Page | When you're done, you can... | Sessions |
|---|---|---|---|
| 0 | [Getting started](getting-started.md) | deploy code to a Control Hub from Android Studio and test the wiring | 1 |
| 0 | [Java basics](java-basics.md) | write classes, methods, loops and arrays in Java | 4–6, on your own |
| 1 | [Your first OpMode](first-opmode.md) | read a gamepad, run motors and servos, and show telemetry | 2 |
| 1 | [Mecanum drive](mecanum-drive.md) | drive a mecanum robot, robot-centric and field-centric | 1–2 |
| 2 | [Your first autonomous](first-autonomous.md) | run an auto by time, by encoder and with IMU turns, then as a state machine | 2–3 |
| 3 | [LinearOpMode to command-based](linear-to-command-based.md) | split robot code into subsystems, commands and button bindings | 2–3 |
| 4 | [Mechanism control](mechanism-control.md) | hold a lift or an arm at a position with your own PID, and tune it live | 3–4 |
| 5 | [Sensors and vision](sensors-and-vision.md) | use the IMU, color sensors, Pinpoint odometry and AprilTags | 2–3 |
| 6 | [Path following](path-following.md) | tune Pedro Pathing and follow paths in auto | 3–4 |
| any | [Developer tools](tools.md) | graph and tune values live, read logs, and deploy faster | as needed |
| after | [Team code styles](team-code/index.md) | read how top teams structure a whole robot | reading |

!!! tip "Blocks, OnBot Java or Android Studio?"

    Absolute beginners can spend one session in Blocks to see how OpModes
    and the robot configuration work. Stages 1 and 2 work in OnBot Java if
    Android Studio isn't set up yet, because the Java is the same. From
    stage 3 on you need Android Studio, since libraries like SolversLib and
    Pedro Pathing don't work in OnBot Java.
    [Getting started](getting-started.md) compares the three.

<div class="grid cards" markdown>

-   :material-rocket-launch-outline:{ .lg .middle } __Getting started__

    ---

    The control system from a programmer's point of view, setting up
    Android Studio, and deploying code to the robot.

    [:octicons-arrow-right-24: Getting started](getting-started.md)

-   :material-language-java:{ .lg .middle } __Java basics__

    ---

    The Java you need for robot code, from Learn Java for FTC, with the
    limits of FTC's Java 8.

    [:octicons-arrow-right-24: Java basics](java-basics.md)

-   :material-gamepad-variant-outline:{ .lg .middle } __Your first OpMode__

    ---

    LinearOpMode and OpMode, the hardware map, gamepads, motors, servos
    and telemetry.

    [:octicons-arrow-right-24: Your first OpMode](first-opmode.md)

-   :material-car-traction-control:{ .lg .middle } __Mecanum drive__

    ---

    Driving in any direction: the robot-centric math, then field-centric
    with the IMU.

    [:octicons-arrow-right-24: Mecanum drive](mecanum-drive.md)

-   :material-flag-checkered:{ .lg .middle } __Your first autonomous__

    ---

    Driving by time, by encoder and by IMU, and why autos end up as state
    machines.

    [:octicons-arrow-right-24: Your first autonomous](first-autonomous.md)

-   :material-swap-horizontal:{ .lg .middle } __LinearOpMode to command-based__

    ---

    How SolversLib's command scheduler runs the loop for you, the three
    pieces it works with, and the simplest example.

    [:octicons-arrow-right-24: LinearOpMode to command-based](linear-to-command-based.md)

-   :material-tune-vertical:{ .lg .middle } __Mechanism control__

    ---

    Built-in motor modes, your own PID and feedforward, loop time and bulk
    reads.

    [:octicons-arrow-right-24: Mechanism control](mechanism-control.md)

-   :material-camera-outline:{ .lg .middle } __Sensors and vision__

    ---

    The IMU, color and distance sensors, Pinpoint odometry, AprilTags and
    the Limelight 3A.

    [:octicons-arrow-right-24: Sensors and vision](sensors-and-vision.md)

-   :material-map-marker-path:{ .lg .middle } __Path following__

    ---

    Tuning Pedro Pathing and following paths in auto, from the Pedro
    Pathing docs.

    [:octicons-arrow-right-24: Path following](path-following.md)

-   :material-tools:{ .lg .middle } __Developer tools__

    ---

    Panels and FTC Dashboard, logs, and faster deploys with Sloth.

    [:octicons-arrow-right-24: Developer tools](tools.md)

-   :material-compare-horizontal:{ .lg .middle } __Team code styles__

    ---

    How top FTC teams structure their robot code.

    [:octicons-arrow-right-24: Team code styles](team-code/index.md)

</div>

## Coming from FRC?

The ideas carry over. [LinearOpMode to command-based](linear-to-command-based.md)
maps each WPILib name to its SolversLib one, and the FRC page
[Time-based to command-based](../../frc/software/time-based-to-command-based.md)
explains the same scheduler for the roboRIO.
