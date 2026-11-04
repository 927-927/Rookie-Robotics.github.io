# Troubleshooting

When a device doesn't work, start with the quickest check and only move on if
it passes: read the status lights, then measure with a multimeter, then split
the bus. This page covers the CAN bus, where most wiring problems show up.

## Start with the status lights

Every CAN device has status lights. On CTRE devices like the Kraken X60, the
main codes are:

<div class="lights" markdown>

| Lights | What it means |
|---|---|
| <span class="leds"><i class="led"></i><i class="led"></i></span> Off | No power. Check the breaker and the red and black wires. |
| <span class="leds"><i class="led red-off"></i><i class="led red-off late"></i></span> Red | No CAN. Keep reading. |
| <span class="leds"><i class="led orange-off"></i><i class="led orange-off"></i></span> Orange | CAN is working, robot disabled. |
| <span class="leds"><i class="led green-off"></i><i class="led green-off"></i></span> Green | CAN is working, robot enabled. |

</div>

Each device's full list is on [Common devices](../hardware/devices.md). Where
the red lights start tells you where to look:

- **Only some devices blink red.** Follow the bus from the roboRIO: the fault
  is usually just before the first red device. A broken wire cuts off
  everything after it.
- **Every device blinks red.** The fault could be anywhere. Something is
  dragging the whole bus down, like yellow and green touching or a damaged
  device. [Split the bus](#split-the-bus) to find it.

## Check the bus with a multimeter

A multimeter measures the wiring itself, so it finds faults that don't show
up until the robot shakes. Measure with the **robot off**: a meter measuring
resistance sends its own small current, and the robot's power would throw off
the reading.

Plug the black lead into **COM** and the red lead into the jack marked
**Ω** (often shared with V). The two settings you need are:

| Setting | Symbol | Shows |
|---|---|---|
| Resistance | Ω | The resistance between the probes. **OL** means too high to measure, or not connected at all. |
| Continuity | :material-volume-high: (sound waves) | Beeps when the probes are joined by wire, about 0 Ω. |

### Measure the resistors

A CAN bus has a 120 Ω resistor at each end. Measured across yellow and green,
two 120 Ω resistors side by side read **60 Ω**.

<div class="can-sim" data-scene="resistance" markdown>

1. Turn the robot off and set the multimeter to **Ω**. With the probes touching nothing, it reads OL.
2. Touch one probe to yellow and one to green, anywhere on the bus. A good bus reads about **60 Ω**. This one reads **120 Ω**: the meter only sees one of the two resistors.
3. Unplug the end resistor and measure it by itself. It reads **120 Ω**, so the resistor is fine. That means a wire between the two ends is broken: [look for it](#look-for-a-broken-wire) next.

</div>

| Bus reads | What it means | What to do |
|---|---|---|
| About 60 Ω | Both resistors are there | The wiring between them is probably fine. Check device IDs, power and firmware in Phoenix Tuner X. |
| About 120 Ω | Only one resistor: the end resistor is missing or bad, or a wire is broken between the two | Measure the end resistor by itself. If it's 120 Ω, [look for a broken wire](#look-for-a-broken-wire). |
| About 40 Ω | Three resistors: an extra one somewhere in the middle, or a PDH in the middle with TERM ON | Find the extra one and take it out. |
| Near 0 Ω | Yellow and green are touching somewhere | [Split the bus](#split-the-bus) to find where. |
| OL | No resistor at all, or a probe isn't on bare metal | Check the probes, then both ends of the bus. |

### Look for a broken wire

Continuity finds which wire is broken and where. Leave the end resistor
unplugged: with it in, the meter finds a way around a break, through both
resistors and the other wire, and reads about 240 Ω instead of OL.

<div class="can-sim" data-scene="continuity" markdown>

1. Keep the robot off and the end resistor unplugged. Set the meter to **continuity**.
2. Touch yellow at the start of the bus and yellow at the end. It beeps: yellow is whole.
3. Now green, start and end. No beep, and it reads **OL**: green is broken somewhere in between.
4. Keep one probe at the start and move the other back toward it, one joint at a time. At J3 it's still OL.
5. At J2 it beeps, so the break is between J2 and J3. Here, a crimp next to Kraken 3 had pulled off.
6. Fix the wire, plug the end resistor back in, and measure the bus in **Ω** again: **60 Ω**.

</div>

- To reach from one end of the robot to the other, clip a long wire onto one
  probe with an alligator clip.
- If the fault comes and goes, leave the meter on continuity and wiggle the
  wires and joints one at a time. The beep cuts out at the bad spot.
- Breaks are most often at a crimp, at a Wago whose wire isn't pushed all the
  way in, or where a wire rubs on a sharp edge or a moving part.

## Split the bus

When every device blinks red, or the multimeter didn't find anything, split
the bus in half with the robot **on** and watch the motors' lights. Each split
halves the part of the bus left to check, so even a long bus only takes a few.

<div class="can-sim" data-scene="split" markdown>

1. Every Kraken blinks red: nothing on the bus can talk to the roboRIO.
2. Open the joint in the middle, J2. Krakens 1 and 2 turn orange: their half of the bus works, so the fault is past J2.
3. Close J2 and open J3, the middle of the bad half. Krakens 1 to 3 turn orange: the fault is past J3.
4. Only Kraken 4 and its wires are left. Here, its yellow and green wires had been crushed together.
5. Fix the wires and close J3. Every Kraken blinks orange.

</div>

- **Only read the devices on the roboRIO's side** of the open joint. The ones
  past it blink red no matter what, because they're cut off.
- **If the roboRIO's side stays red,** the fault is on that side. Close the
  joint and open one halfway back toward the roboRIO instead.
- **Split at Wagos:** they open without tools. It's one reason the bus uses a
  Wago between subsystems (see [Signal wiring](signal-wiring.md#how-to-wire)).
- With a joint open, the roboRIO's half has a resistor at only one end. A
  short bus usually works like that for a test. If its lights stay red, put a
  spare 120 Ω resistor across yellow and green at the open joint before
  deciding the fault is on that side.
- If the fault narrows down to one device and its wires look fine, the device
  itself may be damaged. Swap it for a spare to check.

More checks, like reading the bus in Phoenix Tuner X, are in CTRE's
[CAN bus troubleshooting](https://v6.docs.ctr-electronics.com/en/stable/docs/troubleshooting/canbus-troubleshooting.html).
