# Java basics

FTC robot code is written in Java. If you're new to Java, or to programming,
learn it with **Learn Java for FTC**, a free book by Alan G. Smith. It
teaches Java from the first line, and its programs are FTC OpModes, so you
practice on real hardware from the first chapter.

[:octicons-arrow-right-24: Get Learn Java for FTC on GitHub](https://github.com/alan412/LearnJavaForFTC){ .md-button .md-button--primary }

!!! note "Versions"

    The book's programs were last tested with FTC SDK 11.2. SDK 12.0's only
    breaking change is to AprilTag code, so the book's AprilTag program
    needs the small change shown in [Sensors and vision](sensors-and-vision.md).
    The rest should work unchanged on SDK 12.0.

## How to use the book

- **Read the PDF.** It's
  [LearnJavaForFTC.pdf](https://github.com/alan412/LearnJavaForFTC/blob/master/LearnJavaForFTC.pdf)
  in the book's GitHub repository, and it's free. A printed copy is sold on
  [Amazon](https://www.amazon.com/dp/B08DBVKXLZ).
- **Type every program yourself** and run it. Copying and pasting skips
  the part where you learn.
- **Do the exercises** in each chapter before you look at the answers.
  The answers are in the repository's
  [solutions](https://github.com/alan412/LearnJavaForFTC/tree/master/solutions)
  folder. Each file name ends in the chapter and exercise number, like
  `Exercise_3_1.java`.
- **Use OnBot Java or Android Studio.** The Java is the same in both. See
  [Getting started](getting-started.md) for the difference.
- **Build a test board.** Most chapters use a Control Hub with a touch
  sensor, a motor, a servo and a potentiometer plugged in, and later a
  color and distance sensor. The book keeps all the hardware in one class,
  `ProgrammingBoard`, so each OpMode stays short. No hardware? See
  [Practice without a robot](#practice-without-a-robot).

## What it covers

The book builds up one idea at a time. This site couldn't check the book's
own contents page, so this list comes from its exercise answers. In about
this order, you program:

- a first OpMode that shows text with telemetry, then variables
- reading the gamepad, and making decisions with `if`
- your own class, `RobotLocation`, with fields and methods
- a touch sensor, a motor, a servo and a potentiometer, each added to the
  `ProgrammingBoard` class
- color and distance sensors, and the IMU's heading
- a state machine, with an `enum` and a `switch`
- arrays
- inheritance: a test program built from small test classes
- gamepad rumble, vision with a webcam, and doing something once per
  button press
- joystick math, and driving a robot
- AprilTags

The book also has chapters on mecanum drive, odometry, LEDs and the
Limelight 3A, and, since May 2026, on control theory and behavior trees.

Two things work differently from this course:

- **Most of the book's programs extend `OpMode`**, with `init()` and
  `loop()`.
  [Your first OpMode](first-opmode.md) starts with `LinearOpMode`, then
  teaches `OpMode` too. Both use the hardware the same way.
- **The book detects a button press by storing the button's last state.**
  That still works, and it's what most older team code does. Since SDK 10.3
  the gamepad can also do it for you, with `gamepad1.aWasPressed()`.
  [Your first OpMode](first-opmode.md) shows both.

!!! info "Credit"

    Learn Java for FTC is by Alan G. Smith
    ([GitHub](https://github.com/alan412/LearnJavaForFTC)). The PDF is free
    to read, but it isn't shared under an open license, so this site only
    links to it.

## Another course: frcsoftware.org Stage 0

The FRC side of this site teaches Java with
[Stage 0 of frcsoftware.org](../../frc/software/java-basics.md). Its lessons
are short and teach plain Java, so the ideas work for FTC too. Two things
are different:

- **It's set up for FRC tools.** You do the exercises on your computer, in
  WPILib's VS Code with a template project, not on a Control Hub. A few
  examples use WPILib classes, which don't exist in the FTC SDK.
- **It uses some Java newer than FTC's.** The Interfaces lesson makes lists
  with `List.of(...)`, which isn't part of Java 8. Write `Arrays.asList(...)`
  or `new ArrayList<>()` instead. The [Java 8](#java-8-only) box below lists
  the rest.

[:octicons-arrow-right-24: Start Stage 0 on frcsoftware.org](https://frcsoftware.org/learning-course/stage0/stage-overview/){ .md-button }

1.  [Java Fundamentals](https://frcsoftware.org/learning-course/stage0/java-fundamentals/)
2.  [Debugging](https://frcsoftware.org/learning-course/stage0/debugging/):
    shows VS Code's debugger. Android Studio has its own.
3.  [Git - Uploading Code](https://frcsoftware.org/learning-course/stage0/git/):
    works the same for FTC code
4.  [Operators](https://frcsoftware.org/learning-course/stage0/operators/)
5.  [Conditionals](https://frcsoftware.org/learning-course/stage0/conditionals/)
6.  [Loops](https://frcsoftware.org/learning-course/stage0/loops/)
7.  [Classes and Objects](https://frcsoftware.org/learning-course/stage0/classes-objects/)
8.  [Methods and Mutable State](https://frcsoftware.org/learning-course/stage0/classes-methods/)
9.  [Arrays and For-Each Loops](https://frcsoftware.org/learning-course/stage0/arrays/)
10. [Interfaces, Generics, and Lists](https://frcsoftware.org/learning-course/stage0/interfaces-lists/):
    replace `List.of(...)` as above

!!! info "Credit"

    These lessons are by [frcsoftware.org](https://frcsoftware.org/), a
    community-driven learning course for FRC software
    ([GitHub](https://github.com/frcsoftware/frcsoftware.org)), shared under
    [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
    This site only links to them.

## Practice without a robot

[virtual_robot](https://github.com/Beta8397/virtual_robot) is a 2D robot
simulator for your computer, written to help beginners learn FTC
programming. You write OpModes with `hardwareMap`, gamepads and telemetry,
as on a real robot, and watch a robot drive around a field on screen. It
has a `ProgrammingBoard` setup that matches Learn Java for FTC, so you can
do the book's chapters at home. It runs in IntelliJ (or Android Studio)
with Liberica JDK 17 (the "full" version); its README shows the setup.

It only imitates the FTC SDK, so some things behave differently. Test on
the real robot before you trust anything. It's open source, under the
Apache License 2.0 (see its `LEGAL` folder).

## Java 8 only

!!! warning "Java 8"

    FTC code is compiled as Java 8: the SDK's build settings say so, and
    OnBot Java only supports Java 8. Newer tutorials and AI tools often use
    newer Java. The newer language features in this list won't compile at
    all. Newer library methods, like `List.of`, aren't part of Java 8
    either, so don't count on them. When code that looks right won't
    build, check this list first:

    | Not in Java 8 | Added in | Write this instead |
    |---|---|---|
    | `var speed = 0.5;` | Java 10 | `double speed = 0.5;` |
    | `List.of(...)`, `Map.of(...)` | Java 9 | `Arrays.asList(...)`, or `new ArrayList<>()` and `add(...)`; `new HashMap<>()` and `put(...)` |
    | `switch` with arrows: `case A -> ...` | Java 14 | A normal `switch` with `case A:` and `break;` |
    | Text blocks: `"""` | Java 15 | Normal strings joined with `+` |
    | `record` | Java 16 | A class with `final` fields and a constructor |
    | `if (x instanceof Foo f)` | Java 16 | `if (x instanceof Foo)`, then cast: `Foo f = (Foo) x;` |

    Lambdas (`() -> ...`), generics like `List<String>`, and the for-each
    loop are all in Java 8, so you can use them.

For example:

```java
// Newer Java: don't use it in FTC code
var speed = 0.5;
List<String> names = List.of("intake", "lift");

// Java 8: what FTC code needs
double speed = 0.5;
List<String> names = Arrays.asList("intake", "lift");
```

`Arrays.asList(...)` makes a list you can't add to. If you need to add items
later, start with `new ArrayList<>()` and call `add(...)`.

The last row of the table matters this season: SDK 12.0's AprilTag code
needs an `instanceof` check and a cast, and AI tools often write the Java 16
version, which won't build.

## Try it

1.  **Work through the book** up to and including the chapter on arrays.
    Do every exercise before you open its answer.
2.  **Write a class from scratch**, without looking at the book. Make a
    class `ScoreCounter` with a private `int` field for the total, a
    constructor that starts it at 0, a method `add(int points)` and a
    method `getTotal()`. In an OpMode, add up the array
    `int[] points = {3, 5, 8};` with a for-each loop, then add 1 point each
    time the driver presses A (store A's last state, as the book does).
    Show the total with telemetry. This runs without any hardware, so it
    also works in virtual_robot.

You're done when you can write a class with fields, a constructor and
methods, an `if`/`else`, and a loop over an array without looking anything
up, and you can name two things from newer Java that FTC code can't use,
and what to write instead.

## Learn more

- gm0's [Software section](https://gm0.org/en/latest/docs/software/index.html),
  the community's guide to FTC programming (CC BY-NC 2.0)
- REV's
  [Hello Robot - Intro to OnBot Java](https://docs.revrobotics.com/duo-control/hello-robot-java),
  a short hands-on course that uses `LinearOpMode`
- The [FTC SDK Javadoc](https://javadoc.io/doc/org.firstinspires.ftc), which
  lists every class and method in the SDK
- [Code-A-Robot](https://www.codearobot.org/), a browser-based FTC Java
  course in six units (needs an account)
