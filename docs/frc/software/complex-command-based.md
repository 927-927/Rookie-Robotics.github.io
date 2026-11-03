# Complex command-based

Once a basic robot drives and runs a simple auto, the next step is a real
competition robot: several mechanisms, state machines, and a superstructure
that coordinates them. Learn it with **Stage 2** of frcsoftware.org's
learning course. Its project is programming a real FRC robot: team 4322
Clockwork's 2025 offseason robot, MIDTIDE.

[:octicons-arrow-right-24: Start Stage 2 on frcsoftware.org](https://frcsoftware.org/learning-course/stage2/stage-overview/){ .md-button .md-button--primary }

!!! warning "Still being written"

    Stage 2 is a work in progress. For now, only its
    [overview](https://frcsoftware.org/learning-course/stage2/stage-overview/)
    is online. The substages below will show up on frcsoftware.org as
    they're finished.

## What it covers

Stage 2 programs MIDTIDE one piece at a time. Each substage builds on the
last:

| Substage | What you program |
|---|---|
| **2A** | The elevator |
| **2B** | The arm |
| **2C** | The claw |
| **2D** | A few basic teleop modes |
| **2E** | The indexer and the intake, and the simulation backend, on your own |
| **2F** | A teleop built on a state machine |
| **2G** | Basic collision avoidance in the superstructure |

Along the way, it covers how to structure robot code and how to simulate a
mechanism yourself. It doesn't cover swerve, vision or pose estimation.

## Before you start

Stage 2 assumes you've done Stage 1:
[Stage 1A](https://frcsoftware.org/learning-course/stage1/stage1a/stage-overview/),
where you program a kitbot, and Stage 1B, on this site as
[Command-based skeleton](command-based-skeleton.md).
[Stage 1C](https://frcsoftware.org/learning-course/stage1/stage1c/stage-overview/),
on PID control and logging, is still being written too.

!!! tip "See these ideas in a real robot"

    [Team 2910's code](command-based-styles/team-2910.md) uses the same big
    ideas as Stages 2F and 2G: a state machine in every subsystem, and a
    superstructure that coordinates them.

!!! info "Credit"

    These lessons are by [frcsoftware.org](https://frcsoftware.org/), a
    community-driven learning course for FRC software
    ([GitHub](https://github.com/frcsoftware/frcsoftware.org)), shared under
    [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
    This site only links to them.
