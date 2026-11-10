# Team code styles

Every FTC team starts from the same SDK, but top teams organize a whole
robot's code in very different ways. This page looks at three of them, from
plain Java to a framework of the team's own. Read them after
[LinearOpMode to command-based](../linear-to-command-based.md), once you've
written a subsystem or two yourself.

!!! info "About the code on this page"

    Most top teams don't publish their code, and few have published code for
    the 2026–27 season yet, so these repos are from DECODE (2025–26) and
    INTO THE DEEP (2024–25). Each link points at the commit this page was
    written from, so the code won't change under you.

    None of these repos adds its own license. Each one keeps the FIRST
    FtcRobotController license it was forked from. So this page only links to
    the code and describes it. Read it on GitHub, and ask a team before you
    copy whole files.

## Team 11329

I.C.E. Robotics · Hailstorm, their DECODE robot
{ .item__aka }

**Plain Java, no command library.** Each subsystem is one class that takes
the `hardwareMap` in its constructor and has an `update()` method. One
`Robot` class owns all the subsystems and calls their `update()` every loop.
The OpModes are thin: `MainTeleopBlue` and `MainTeleopRed` only pass
`init()`, `loop()` and the rest on to one shared `MainTeleop` class.

At the 2026 World Championship, Hailstorm was the first pick on the Edison
Division's winning alliance.

What to look at:

- **Why a `Robot` class.** The team's
  [docs/robot.md](https://github.com/FTC11329/11329-2026-repo/blob/829cc23/docs/robot.md)
  explains it in their own words. In earlier seasons, every OpMode set up
  every subsystem itself and repeated the logic that uses several of them.
  `Robot.java` became the one place for that.
- **A small subsystem.** `subsystems/Intake.java` only writes a new power to
  a motor or servo when the value changes. This is called **write caching**:
  every write takes loop time.
- **Edges and constants.** A `FancyButton` class turns button presses into
  toggles and long presses, and `Constants.java` keeps the numbers in nested
  static classes.
- **Auto to teleop.** `EndValuesStorer` passes the robot's pose and
  mechanism positions from the end of auto into teleop.

Read `teleops/MainTeleopBlue.java`, then `teleops/MainTeleop.java`, then
`subsystems/Intake.java`. Skim `subsystems/Robot.java`: it's over 1,000
lines. The Pedro Pathing source is copied into the repo, so skip the
`pedroPathing` folder.

[:octicons-arrow-right-24: 11329's code on GitHub](https://github.com/FTC11329/11329-2026-repo/tree/829cc23)

Deep dive coming soon.

## Team 23511

Seattle Solvers · their INTO THE DEEP robot
{ .item__aka }

**Command-based with SolversLib**, the library this site teaches, which this
team maintains. It's the closest match to
[LinearOpMode to command-based](../linear-to-command-based.md). Each
subsystem extends `SubsystemBase`, and its states are enums, like
`IntakePivotState`. Commands such as `SetIntake` and `SetDeposit` move a
subsystem to a state. All buttons are bound once, in `initialize()`, with
`whenPressed(...)`.

Their DECODE robot placed 2nd for the Inspire Award in the Lovelace Division
at the 2026 World Championship. Their DECODE code uses a swerve drive and is
much more advanced, so start with this one.

What to look at:

- **One object holds the hardware.** `hardware/Robot.java` is a singleton,
  `Robot.getInstance()`, that creates every motor and servo, the subsystems
  and the Pedro Pathing follower. `hardware/Globals.java` holds the constants.
- **Write caching and bulk reads.** Motors and servos are SolversLib
  wrappers that skip writes smaller than 0.01. Hubs use manual bulk caching,
  and teleop clears the Control Hub's cache once at the end of every loop.
- **Bindings.** `opmode/TeleOp/FullTeleOp.java` binds every button with
  `InstantCommand`, `ConditionalCommand` and `UninterruptibleCommand`.
- **Tuning notes.** The `tuning` folder has the team's own guides to tuning
  PIDF and servos.

!!! warning "An older SolversLib"

    This code was built on SolversLib 0.2.7. This site uses 0.3.6, so some
    class names, like the `SolversMotorEx` wrapper, may differ. Check the
    [SolversLib docs](https://docs.seattlesolvers.com/) before you copy a
    pattern.

[:octicons-arrow-right-24: 23511's code on GitHub](https://github.com/FTC-23511/Into-the-Deep-2025/tree/9a1b4ad)

Deep dive coming soon.

## Team 6165

MSET Cuttlefish · their INTO THE DEEP robot
{ .item__aka }

**Their own framework.** Instead of a library, the team wrote an abstract
`Module` class that every subsystem extends. Each module is a state machine,
and each value of its `ModuleState` enum carries the servo or motor target
for that state. So switching state is enough to move the mechanism.

The robot won the Judges' Choice Award in the Jemison Division at the 2025
World Championship.

What to look at:

- **Modules and states.** `architecture/modules`, starting with the
  `Module` base class.
- **Hardware wrappers.** `architecture/hardware/EnhancedMotor.java` and
  `EnhancedServo.java` do write caching and voltage compensation, and the
  comments explain each step for teammates.
- **Auto.** It uses Road Runner 1.0 actions, not Pedro Pathing.

The repo is a two-commit snapshot, archived in December 2025, so there's no
history to read through.

[:octicons-arrow-right-24: 6165's code on GitHub](https://github.com/6165-MSET-Cuttlefish/6165-IntoTheDeep/tree/74bc060)

Deep dive coming soon.

## More to read

- **19448 X BOTS**, [DECODE](https://github.com/ryalisuchir/Decode/tree/a51e333):
  SolversLib command-based code, with a `common/commandbase` layout and a
  `Globals` enum per mechanism. They won the Control Award in the Lovelace
  Division at the 2026 World Championship.
- **14343 Escape Velocity**, [INTO THE DEEP](https://github.com/escape-velocity-14343/IntoTheSleep):
  FTCLib code laid out like a WPILib project, with `subsystems`, `commands`
  and `Constants` packages. It's the closest to the FRC pages, but the README
  is a joke, not documentation.
- **16379 KookyBotz**, [CENTERSTAGE](https://github.com/KookyBotz/CenterStage):
  the `common/commandbase`, `common/hardware`, `common/subsystem` layout from
  2023–24 that many teams copied, 19448 among them.
- **12808 RevAmped**, [DECODE](https://github.com/junkjunk123/RevAmped-Decode-V2):
  advanced reading, with hardware wrappers, a state graph and threads. It
  depends on a library that isn't published, so it won't build as it is.

## What they have in common

Different styles, but the same ideas show up in almost every repo:

- **One class per mechanism**, with its states as an enum.
- **One central object** (a `Robot` class or a singleton) that creates the
  hardware and the subsystems, so OpModes stay short.
- **A constants file** for positions, speeds and gains.
- **Manual bulk caching**, cleared once per loop, and **write caching**, so
  each loop talks to the hubs as little as possible. See
  [Mechanism control](../mechanism-control.md).
- **Buttons act on presses**, not on being held, unless holding is the point.
- **The end-of-auto pose is passed to teleop.**
- **Separate OpModes for tuning and testing.**

When you read a team's code, start with a teleop OpMode and follow one
button press down to a motor. That shows you how the layers fit together
faster than reading files in folder order.
