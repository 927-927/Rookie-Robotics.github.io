# Getting started

Before you write robot code, you need to know three things: which part of
the robot runs your code, how your code finds each motor and sensor, and how
code gets from your laptop to the robot. This page covers all three. At the
end, you'll deploy the FTC SDK to a Control Hub and test a motor without
writing a single line of code.

!!! note "Versions"

    Written for the 2026–27 season, BIOBUZZ: FTC SDK 12.0 (September 2026),
    Android Studio Narwhal 3 Feature Drop or later, and REV Hardware
    Client&nbsp;2.

## The control system

<!-- TODO diagram: the FTC control system from a programmer's point of view. Left: a laptop running Android Studio, with two arrows to the Control Hub labelled "USB-C cable" and "Wi-Fi (adb)", and the caption "deploys your code". Middle: the Control Hub (label: "runs the Robot Controller app and your OpModes"), with motors, servos and sensors plugged into it, and a cable to an Expansion Hub (label: "more ports"). The Control Hub holds a small file icon labelled "robot configuration: port 0 = intake". Right: the Driver Hub (label: "runs the Driver Station app") with two gamepads plugged in, and a Wi-Fi arrow to the Control Hub labelled "pick an OpMode, INIT, PLAY". Caption: "Your code runs on the Control Hub. The Driver Hub only picks it and starts it." -->

An FTC robot has three main pieces, plus the gamepads:

| Piece | What it does | What it means for your code |
|---|---|---|
| **Control Hub** | The robot's computer. It runs the Robot Controller app, has ports for motors, servos and sensors, and makes its own Wi-Fi network. | Your code runs here. |
| **Expansion Hub** | More ports for motors, servos and sensors. A cable connects it to the Control Hub. | Optional. Your code uses its ports the same way. |
| **Driver Hub** | The drivers' screen. It runs the Driver Station app and talks to the Control Hub over Wi-Fi. | You pick an OpMode here, then press INIT and PLAY. |
| **Gamepads** | One or two controllers, plugged into the Driver Hub. | Your code reads them as `gamepad1` and `gamepad2`. |

The Driver Hub is one kind of **Driver Station**, the name for anything
that runs the Driver Station app. FTC also allows Android phones as the
Robot Controller and the Driver Station, but only the Control Hub and the
Driver Hub are officially supported. This course uses them.

A program you can pick on the Driver Station is called an **OpMode**.
You'll write your first one in [Your first OpMode](first-opmode.md).

### The robot configuration

The Control Hub doesn't know what's plugged into its ports until you tell
it. The **robot configuration** is a file on the Control Hub that gives
every device a name, like "the motor on port 0 is called `intake`". You make
it on the Driver Station with **Configure Robot**. You can save several
configurations, but only one is active at a time.

Your code finds each device by its name, through the **hardware map**:

```java
DcMotor intake = hardwareMap.get(DcMotor.class, "intake");
```

The name in your code must match the name in the active configuration
exactly, capital letters included. If the configuration says `Intake` and
your code says `"intake"`, the OpMode stops with an error when it looks for
the device, which is usually right after you press INIT. This is the most
common error new programmers hit, so when a device can't be found, check
the names first.

When you add a motor, also pick its exact model as the motor type. The
built-in motor modes depend on it, as
[Mechanism control](mechanism-control.md) explains.

FTC Docs'
[Configuring Your Hardware](https://ftc-docs.firstinspires.org/en/latest/hardware_and_software_configuration/configuring/index.html)
shows each step with screenshots, for motors, servos, sensors, webcams and
a second hub.

## Blocks, OnBot Java or Android Studio

There are three ways to write FTC code. All three use the same SDK, so an
OpMode works the same whichever tool built it.

| Tool | What it is | Good | Not so good | In this course |
|---|---|---|---|---|
| **Blocks** | Drag-and-drop blocks in a web browser connected to the robot | Nothing to install. The fastest way to see how OpModes and the configuration work. | Hard to manage once a program gets long. The libraries this course uses don't work in it. | One session at most, for absolute beginners |
| **OnBot Java** | Java in a web browser connected to the robot. The code is saved and built on the Control Hub. | Nothing to install, so it works on almost any laptop. The same Java as Android Studio. | No Git. Library support is limited: this course installs its libraries in Android Studio, and Pedro Pathing doesn't work in OnBot Java at all. **Build** compiles every file, so a mistake in one file stops all of them. | Fine for stages 1 and 2 |
| **Android Studio** | A full code editor on your laptop, with the FTC SDK as a project | Libraries, Git, autocomplete, Logcat and the debugger. Deploys over USB-C or Wi-Fi. | A large install that needs a capable laptop, and a session to set up | Needed from stage 3 on |

You open Blocks and OnBot Java from the Control Hub's **Program & Manage**
page, at `http://192.168.43.1:8080` when your laptop is on the robot's
Wi-Fi.

FTC Docs'
[Choosing a Programming Tool](https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/choosing_program_lang/choosing-program-lang.html)
recommends that everyone start with Blocks, and calls Android Studio a tool
for advanced users. This course moves to Android Studio sooner, because the
libraries in stages 3 to 6 (SolversLib, Pedro Pathing and the dashboards)
are installed through Android Studio's build files. The Java you write in
OnBot Java works the same in Android Studio, so nothing you learn there is
wasted.

## Setting up Android Studio

### Install it

Install Android Studio from
[developer.android.com/studio](https://developer.android.com/studio). FTC
SDK 12.0 needs **Narwhal 3 Feature Drop or any later version**, because the
SDK uses Gradle 9.1 and the Android Gradle Plugin (AGP) 8.13.2. Older
versions of Android Studio can't sync the project.

!!! warning "FTC Docs' install page is out of date"

    FTC Docs'
    [Installing Android Studio](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/installing_android_studio/Installing-Android-Studio.html)
    page still warns about Android Studio Ladybug and tells you to install
    JDK 17 separately. It never mentions Narwhal, which SDK 11.2 and later
    need. Since SDK 10.1.1, the SDK's release notes only mention the JDK
    that comes with Android Studio, with one known issue: a warning that
    Java 8 is deprecated. You can ignore that warning. Where FTC Docs and
    the SDK's
    [README](https://github.com/FIRST-Tech-Challenge/FtcRobotController)
    disagree, follow the README.

### Fork and clone the SDK

**FtcRobotController** is the FTC SDK as an Android Studio project, on
GitHub. Don't just download it. **Fork** it first: that makes your own
copy on your team's GitHub account. Then **clone** your fork: that downloads
it to your laptop with Git. This way your team's code is saved on GitHub,
and you can pull in each new SDK version when FTC releases one.

FTC Docs'
[Fork and Clone from GitHub](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/fork_and_clone_github_repository/Fork-and-Clone-From-GitHub.html)
shows every step with Git Bash on Windows, including how to pull in an SDK
update later. Android Studio can also clone a repository for you; gm0's
[Using Android Studio](https://gm0.org/en/latest/docs/software/getting-started/using-android-studio.html)
shows how. If your team is new to Git, see
[Git and GitHub](tools.md#git-and-github) on the Developer tools page.

### Open the project

Open the cloned folder in Android Studio. The first time, Gradle downloads
everything the project needs and **syncs** it, which can take several
minutes. Stay on a normal internet connection until it finishes.

!!! warning "Don't change the Gradle or AGP version"

    Android Studio may offer to upgrade or downgrade the Android Gradle
    Plugin, or to upgrade Gradle. Say no every time. The SDK sets these
    versions on purpose: its release notes say not to downgrade the AGP,
    and FTC Docs says not to upgrade Gradle. If you accepted by mistake,
    undo the change with Git.

### Where your code goes

The project has two parts, called **modules**:

```text
FtcRobotController/            the folder you cloned
├── FtcRobotController/        the Robot Controller app. Don't change it.
│   └── src/main/java/org/firstinspires/ftc/robotcontroller/
│       └── external/samples/  sample OpModes to copy from
├── TeamCode/                  your code
│   ├── build.gradle           TeamCode's own libraries
│   └── src/main/java/org/firstinspires/ftc/teamcode/
├── build.common.gradle        shared build settings. Don't change it.
└── build.dependencies.gradle  the SDK's libraries, and yours
```

Your OpModes go in `TeamCode/src/main/java/org/firstinspires/ftc/teamcode`,
which is the `org.firstinspires.ftc.teamcode` package. In Android Studio's
**Android** view, that's **TeamCode > java > org.firstinspires.ftc.teamcode**.

The samples folder has dozens of working OpModes. To use one, copy it into
`teamcode` and give it a new class name when Android Studio asks. Then
delete its `@Disabled` line so it shows up on the Driver Station. Don't
edit the samples where they are: keeping all your code in `TeamCode` makes
SDK updates easier.

## Deploying code to the robot

**Deploying** means building the Robot Controller app with your code inside
it, and installing it on the Control Hub. Android Studio does both when you
click **Run**.

### Over USB-C

1.  Connect a charged 12&nbsp;V battery to the robot and turn it on.
2.  Plug a USB-C cable from your laptop into the Control Hub's **USB-C**
    port.
3.  In Android Studio, check that **TeamCode** is picked in the run
    configuration list and that the Control Hub shows up as the device.
    Then click the green **Run** button.
4.  Android Studio builds the app and installs it. The Robot Controller app
    restarts, and the Driver Station reconnects after a few seconds. Your
    OpModes are now in the Driver Station's list.

### Over Wi-Fi

Plugging in a cable gets old. The Control Hub also accepts code over its
Wi-Fi, through **adb** (Android Debug Bridge), a command-line tool that comes
with Android Studio:

1.  Connect your laptop to the Control Hub's Wi-Fi network. Its default
    password is `password`, unless your team changed it (you should).
2.  Check that `http://192.168.43.1:8080` opens the Program & Manage page in
    a browser.
3.  In a terminal, run:

    ```text
    adb connect 192.168.43.1:5555
    ```

    If the terminal doesn't know `adb`, FTC Docs'
    [Managing a Control Hub](https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/managing_control_hub/Managing-a-Control-Hub.html)
    links to instructions for finding it and adding it to your PATH.

4.  The Control Hub appears in Android Studio's device list. Click **Run**
    as before.

!!! warning "No internet on the robot's Wi-Fi"

    While your laptop is on the Control Hub's network, it has no internet.
    Gradle needs the internet to download a library the first time. After
    you add a library, build once on your normal network, then switch to
    the robot.

## Keeping everything updated

Several pieces of software need updating, usually at the start of the
season and whenever FTC or REV releases a fix:

- the Control Hub's operating system, and the Driver Hub's
- the firmware on the Control Hub and the Expansion Hub
- the Driver Station app on the Driver Hub
- the Robot Controller app on the Control Hub

**REV Hardware Client&nbsp;2** updates all of these from your laptop. It's
the new version of the REV Hardware Client, released in 2026, and it
installs separately from the original. Teams that use an Android phone as
the Robot Controller still need the original one, because the new one can't
install the Robot Controller app on a phone. FTC Docs'
[Updating Components of the Control System](https://ftc-docs.firstinspires.org/en/latest/ftc_sdk/updating/index.html)
has a page for each piece.

When you deploy from Android Studio, you install the Robot Controller app
from your own project. So when FTC releases a new SDK, pull it into your
fork, deploy it, and update the Driver Station app to the same version.

## Check the wiring before you write code

Since SDK 11.2, the Driver Station has a **Utility** menu with two test
programs. You don't write any code to use them:

- **TestHardware** lets you run every motor, servo and continuous rotation
  servo, and read every color, distance, touch and analog sensor, IMU and
  webcam in the active configuration.
- **TestGamepad** shows what each of your two gamepads is sending.

Both the Robot Controller app and the Driver Station app must be version
11.2 or later. Run TestHardware every time you wire something new. If a
motor doesn't spin in TestHardware, the problem is the wiring or the
configuration, not your code, and you've saved yourself an hour of
debugging.

## What's next for the control system

FIRST is building a new controller called **Systemcore**, whose software is
being built with WPILib, the library FRC teams use. FTC teams can use it
from the 2027–28 season, and today's Control Hub stays legal through at
least 2030–31. This course is written for the Control Hub and the FTC SDK.
Every team uses the FTC SDK in 2026–27. The ideas in it (OpModes,
command-based code, PID, odometry) carry over to the new system.

## Try it

1.  **Deploy the SDK.** Fork and clone FtcRobotController, open it in
    Android Studio, and deploy it to a Control Hub over USB-C without
    changing anything.
2.  **Configure one motor.** Plug a motor into motor port 0. On the Driver
    Station, use **Configure Robot** to make a new configuration with that
    motor named `motor`, with its motor type set to the exact model. Save
    the configuration and make sure it's the active one.
3.  **Test it.** Run TestHardware and make the motor spin. Then run
    TestGamepad and check that both gamepads respond.
4.  **Bonus: deploy over Wi-Fi.** Connect to the Control Hub with
    `adb connect` and deploy again without the cable.

You're done when you can deploy from Android Studio, TestHardware spins the
motor named `motor`, and you can point to the folder where your OpModes
will go.

## Learn more

- FTC Docs:
  [Control System Introduction](https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/control_system_intro/The-FTC-Control-System.html),
  [Configuring Your Hardware](https://ftc-docs.firstinspires.org/en/latest/hardware_and_software_configuration/configuring/index.html),
  [Android Studio Tutorial](https://ftc-docs.firstinspires.org/en/latest/programming_resources/android_studio_java/Android-Studio-Tutorial.html)
  and
  [Managing a Control Hub](https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/managing_control_hub/Managing-a-Control-Hub.html)
- FTC Docs, for the other two tools:
  [Blocks Tutorial](https://ftc-docs.firstinspires.org/en/latest/programming_resources/blocks/Blocks-Tutorial.html)
  and
  [OnBot Java Tutorial](https://ftc-docs.firstinspires.org/en/latest/programming_resources/onbot_java/OnBot-Java-Tutorial.html)
- gm0:
  [Using Android Studio](https://gm0.org/en/latest/docs/software/getting-started/using-android-studio.html)
- The [FtcRobotController](https://github.com/FIRST-Tech-Challenge/FtcRobotController)
  README, which lists what changed in every SDK version
- FIRST's
  [BIOBUZZ kickoff and season resources](https://www.firstinspires.org/community-blog/biobuzz-kickoff-and-season-resources),
  with links to this season's StarterBots
- FIRST's
  [Control System Update – FIRST Tech Challenge Edition](https://www.firstinspires.org/community-blog/control-system-update-first-tech-challenge-edition),
  on Systemcore
- The [FTC Community forum](https://ftc-community.firstinspires.org/), for
  questions FTC Docs doesn't answer
