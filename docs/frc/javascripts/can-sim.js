// Animated CAN bus diagrams for the Troubleshooting page.
//
// Each <div class="can-sim" data-scene="..."> holds a numbered list of steps.
// This script draws a CAN bus above the list (roboRIO, four Krakens, three
// Wago joints and the end resistor, plus a multimeter for the meter scenes)
// and plays the steps one at a time, with the list item as the caption.
// Without the script, the list shows on its own.
(function () {
  var NS = "http://www.w3.org/2000/svg"

  // Layout, in SVG units
  var W = 1040
  var Y = 140 // yellow wire
  var G = 190 // green wire
  var MID = (Y + G) / 2
  var KRAKENS = [280, 470, 660, 850]
  var JOINTS = [375, 565, 755]
  var END = 960 // end resistor
  var BENCH = [880, 360] // where the end resistor goes when it's unplugged
  var BREAK_X = 598 // the broken green wire, between J2 and Kraken 3
  var SHORT_X = 918 // the crushed wires, after Kraken 4
  var JACK = { black: [480, 285], red: [560, 285] }
  var REST = { black: [352, 248], red: [688, 248] }

  // Places the probes can touch
  var AT = {
    startY: [172, Y],
    startG: [186, G],
    endY: [940, Y],
    endG: [940, G],
    j2G: [565, G],
    j3G: [755, G],
    benchTop: [BENCH[0], BENCH[1] - 25],
    benchBottom: [BENCH[0], BENCH[1] + 25],
  }

  var ALL_RED = ["red", "red", "red", "red"]

  // Each step's state. Anything a step leaves out goes back to its default.
  var SCENES = {
    resistance: {
      meter: true,
      label:
        "Animated diagram: measuring the resistance of a CAN bus with a multimeter",
      steps: [
        { mode: "ohm" },
        { mode: "ohm", red: AT.startY, black: AT.startG, reading: 120.4, verdict: "bad" },
        {
          mode: "ohm",
          resistor: "bench",
          red: AT.benchTop,
          black: AT.benchBottom,
          reading: 120.1,
          verdict: "good",
        },
      ],
    },
    continuity: {
      meter: true,
      label:
        "Animated diagram: finding a broken CAN wire with a multimeter's continuity setting",
      steps: [
        { mode: "cont", resistor: "bench" },
        {
          mode: "cont",
          resistor: "bench",
          black: AT.startY,
          red: AT.endY,
          reading: 0.3,
          beep: true,
          verdict: "good",
          flow: [Y, AT.startY[0], AT.endY[0]],
        },
        { mode: "cont", resistor: "bench", black: AT.startG, red: AT.endG, verdict: "bad" },
        { mode: "cont", resistor: "bench", black: AT.startG, red: AT.j3G, verdict: "bad" },
        {
          mode: "cont",
          resistor: "bench",
          black: AT.startG,
          red: AT.j2G,
          reading: 0.3,
          beep: true,
          verdict: "good",
          flow: [G, AT.startG[0], AT.j2G[0]],
          broken: true,
        },
        { mode: "ohm", red: AT.startY, black: AT.startG, reading: 60.2, verdict: "good" },
      ],
    },
    split: {
      meter: false,
      label:
        "Animated diagram: opening joints on a CAN bus and watching the Krakens' status lights",
      steps: [
        { robot: "on", leds: ALL_RED },
        { robot: "on", leds: ["orange", "orange", "red", "red"], open: [1] },
        { robot: "on", leds: ["orange", "orange", "orange", "red"], open: [2] },
        { robot: "on", leds: ["orange", "orange", "orange", "red"], open: [2], short: true },
        { robot: "on", leds: ["orange", "orange", "orange", "orange"] },
      ],
    },
  }

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag)
    for (var key in attrs) node.setAttribute(key, attrs[key])
    if (parent) parent.appendChild(node)
    return node
  }

  function label(str, attrs, parent) {
    var node = el("text", attrs, parent)
    node.textContent = str
    return node
  }

  // A wire drawn like the other diagrams: a dark edge under a bright core
  function wire(parent, x1, x2, y, edge, core) {
    el("line", { x1: x1, y1: y, x2: x2, y2: y, stroke: edge, "stroke-width": 8 }, parent)
    el("line", { x1: x1, y1: y, x2: x2, y2: y, stroke: core, "stroke-width": 5 }, parent)
  }

  function copper(parent, x, y) {
    el("rect", { x: x, y: y - 2.5, width: 5, height: 5, fill: "#c87533" }, parent)
  }

  function zigzag(x, y1, y2, amp) {
    var pts = [x + "," + y1]
    var n = 6
    var top = y1 + 8
    var step = (y2 - 8 - top) / n
    pts.push(x + "," + top)
    for (var i = 0; i < n; i++) {
      pts.push(x + (i % 2 ? -amp : amp) + "," + (top + step * (i + 0.5)))
    }
    pts.push(x + "," + (y2 - 8))
    pts.push(x + "," + y2)
    return pts.join(" ")
  }

  function build(scene) {
    var height = scene.meter ? 460 : 255
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + height,
      class: "can-sim__svg",
      role: "img",
      "aria-label": scene.label,
    })
    el("rect", { width: W, height: height, rx: 16, fill: "#ffffff" }, svg)
    var parts = { svg: svg }

    // Robot on or off
    var pill = el("g", { class: "can-sim__pill" }, svg)
    el("rect", { x: 16, y: 16, width: 196, height: 34, rx: 17, class: "can-sim__pill-bg" }, pill)
    el("circle", { cx: 36, cy: 33, r: 6, class: "can-sim__pill-dot" }, pill)
    parts.pill = pill
    parts.pillText = label("", { x: 50, y: 39, class: "can-sim__pill-text" }, pill)

    // roboRIO, with its built-in resistor
    el("rect", { x: 16, y: 100, width: 140, height: 130, rx: 12, fill: "#e8eef3", stroke: "#8796a5", "stroke-width": 2 }, svg)
    label("roboRIO", { x: 28, y: 132, class: "can-sim__title" }, svg)
    label("120 Ω", { x: 28, y: 190, class: "can-sim__strong" }, svg)
    label("built in", { x: 28, y: 209, class: "can-sim__small" }, svg)

    // Wires, cut at each joint
    var wires = el("g", {}, svg)
    var cuts = [138].concat(JOINTS.reduce(function (list, x) {
      return list.concat([x - 10, x + 10])
    }, []), [END])
    for (var i = 0; i < cuts.length; i += 2) {
      wire(wires, cuts[i], cuts[i + 1], Y, "#a07f00", "#f5c400")
      wire(wires, cuts[i], cuts[i + 1], G, "#1b6a2b", "#2e9d43")
    }
    JOINTS.forEach(function (x) {
      ;[Y, G].forEach(function (y) {
        copper(wires, x - 10, y)
        copper(wires, x + 5, y)
      })
    })
    ;[Y, G].forEach(function (y) {
      copper(wires, END - 5, y)
    })
    el("polyline", { points: zigzag(138, Y, G, 6), fill: "none", stroke: "#1f2a33", "stroke-width": 2.5, "stroke-linejoin": "round" }, svg)

    // Current flowing through the meter's path, for a beep
    parts.flow = el("line", { class: "can-sim__flow" }, svg)

    // The broken green wire
    var broken = el("g", { class: "can-sim__marker" }, svg)
    el("rect", { x: BREAK_X - 6, y: G - 6, width: 12, height: 12, fill: "#ffffff" }, broken)
    copper(broken, BREAK_X - 10, G)
    copper(broken, BREAK_X + 5, G)
    el("circle", { cx: BREAK_X, cy: G, r: 17, class: "can-sim__marker-ring" }, broken)
    label("break", { x: BREAK_X, y: 254, class: "can-sim__marker-text" }, broken)
    parts.broken = broken

    // The crushed wires, yellow touching green
    var short = el("g", { class: "can-sim__marker" }, svg)
    el("polygon", {
      points: [
        [SHORT_X + 4, Y + 2], [SHORT_X - 9, MID + 3], [SHORT_X - 1, MID + 3],
        [SHORT_X - 4, G - 2], [SHORT_X + 9, MID - 3], [SHORT_X + 1, MID - 3],
      ].join(" "),
      fill: "#ffca28",
      stroke: "#d32f2f",
      "stroke-width": 2,
      "stroke-linejoin": "round",
    }, short)
    el("circle", { cx: SHORT_X, cy: MID, r: 30, class: "can-sim__marker-ring" }, short)
    label("short", { x: SHORT_X, y: 232, class: "can-sim__marker-text" }, short)
    parts.short = short

    // Wago joints: one for yellow and one for green
    parts.joints = JOINTS.map(function (x, i) {
      var joint = el("g", { class: "can-sim__joint" }, svg)
      var wago = el("g", { class: "can-sim__wago" }, joint)
      ;[Y, G].forEach(function (y) {
        el("rect", { x: x - 14, y: y - 10, width: 28, height: 20, rx: 3, fill: "#eef1f4", stroke: "#8796a5", "stroke-width": 1.5 }, wago)
        el("rect", { x: x - 14, y: y - 10, width: 28, height: 6, rx: 2, fill: "#f28c28" }, wago)
      })
      label("open", { x: x, y: Y - 24, class: "can-sim__open" }, joint)
      label("J" + (i + 1), { x: x, y: 232, class: "can-sim__label" }, joint)
      return joint
    })

    // Krakens, seen from the back, with their two status lights
    parts.krakens = KRAKENS.map(function (x, i) {
      var kraken = el("g", { class: "can-sim__k" }, svg)
      el("circle", { cx: x, cy: MID, r: 44, fill: "#24282d", stroke: "#111417", "stroke-width": 2 }, kraken)
      el("rect", { x: x - 39, y: MID - 4, width: 17, height: 8, rx: 2, class: "can-sim__led" }, kraken)
      el("rect", { x: x + 22, y: MID - 4, width: 17, height: 8, rx: 2, class: "can-sim__led can-sim__led--late" }, kraken)
      label(String(i + 1), { x: x, y: MID + 8, class: "can-sim__knum" }, kraken)
      label("Kraken " + (i + 1), { x: x, y: 232, class: "can-sim__label" }, kraken)
      return kraken
    })

    // End resistor: brown, red, brown, gold is 120 Ω
    var res = el("g", { class: "can-sim__res" }, svg)
    el("line", { x1: 0, y1: -25, x2: 0, y2: 25, stroke: "#7a8088", "stroke-width": 3 }, res)
    el("rect", { x: -7, y: -14, width: 14, height: 28, rx: 5, fill: "#e3c89a", stroke: "#a8834f", "stroke-width": 1.5 }, res)
    ;[[-9, "#7b4a12"], [-4, "#d32f2f"], [1, "#7b4a12"], [7, "#c9a227"]].forEach(function (band) {
      el("rect", { x: -7, y: band[0], width: 14, height: 3, fill: band[1] }, res)
    })
    label("120 Ω", { x: 14, y: 5, class: "can-sim__strong" }, res)
    parts.res = res

    if (scene.meter) buildMeter(svg, parts)
    return parts
  }

  function buildMeter(svg, parts) {
    var meter = el("g", { class: "can-sim__meter" }, svg)
    el("rect", { x: 430, y: 285, width: 180, height: 160, rx: 16, fill: "#f2a900", stroke: "#b37d00", "stroke-width": 2 }, meter)
    el("rect", { x: 444, y: 298, width: 152, height: 134, rx: 10, fill: "#2e3338" }, meter)
    el("rect", { x: 454, y: 308, width: 132, height: 48, rx: 5, fill: "#c5d6c0" }, meter)
    parts.reading = label("OL", { x: 578, y: 343, class: "can-sim__reading" }, meter)

    // Dial: left for Ω, right for continuity
    el("circle", { cx: 486, cy: 396, r: 22, fill: "#4a5058", stroke: "#1f2328", "stroke-width": 2 }, meter)
    parts.pointer = el("line", { x1: 486, y1: 396, x2: 486, y2: 378, stroke: "#ffffff", "stroke-width": 3.5, "stroke-linecap": "round", class: "can-sim__pointer" }, meter)
    parts.modeOhm = label("Ω", { x: 552, y: 405, class: "can-sim__mode" }, meter)
    var cont = el("g", { class: "can-sim__mode-cont" }, meter)
    el("circle", { cx: 538, cy: 396, r: 4, fill: "#ffffff" }, cont)
    ;[9, 15, 21].forEach(function (r) {
      el("path", { d: "M " + (538 + r * 0.6) + " " + (396 - r * 0.8) + " A " + r + " " + r + " 0 0 1 " + (538 + r * 0.6) + " " + (396 + r * 0.8), fill: "none", stroke: "#ffffff", "stroke-width": 2.5, "stroke-linecap": "round" }, cont)
    })
    parts.modeCont = cont

    // Beep, and a tick or cross for the reading
    var beep = el("g", { class: "can-sim__beep" }, meter)
    ;[10, 18, 26].forEach(function (r) {
      el("path", { d: "M " + (412 - r * 0.6) + " " + (332 - r * 0.8) + " A " + r + " " + r + " 0 0 0 " + (412 - r * 0.6) + " " + (332 + r * 0.8), fill: "none", stroke: "#2e9d43", "stroke-width": 3, "stroke-linecap": "round" }, beep)
    })
    parts.beep = beep
    var verdict = el("g", { class: "can-sim__verdict" }, meter)
    el("circle", { cx: 634, cy: 332, r: 16 }, verdict)
    parts.verdictText = label("", { x: 634, y: 339, class: "can-sim__verdict-text" }, verdict)
    parts.verdict = verdict

    parts.probes = {
      black: probe(svg, "black", "#1f2328"),
      red: probe(svg, "red", "#c62828"),
    }
  }

  function probe(svg, name, color) {
    var g = el("g", { class: "can-sim__probe" }, svg)
    var p = {
      jack: JACK[name],
      rest: REST[name],
      cable: el("path", { fill: "none", stroke: color, "stroke-width": 3.5, "stroke-linecap": "round" }, g),
      body: el("line", { stroke: color, "stroke-width": 11, "stroke-linecap": "round" }, g),
      guard: el("line", { stroke: color, "stroke-width": 4, "stroke-linecap": "round" }, g),
      tip: el("line", { stroke: "#9aa3ab", "stroke-width": 3, "stroke-linecap": "round" }, g),
    }
    p.pos = p.rest.slice()
    placeProbe(p, p.pos)
    return p
  }

  function line(node, x1, y1, x2, y2) {
    node.setAttribute("x1", x1)
    node.setAttribute("y1", y1)
    node.setAttribute("x2", x2)
    node.setAttribute("y2", y2)
  }

  // Draw a probe with its tip at pos, pointing back toward its jack
  function placeProbe(p, pos) {
    var x = pos[0]
    var y = pos[1]
    var jx = p.jack[0]
    var jy = p.jack[1]
    var len = Math.hypot(jx - x, jy - y) || 1
    var ux = (jx - x) / len
    var uy = (jy - y) / len
    line(p.tip, x, y, x + ux * 11, y + uy * 11)
    line(p.guard, x + ux * 15 - uy * 8, y + uy * 15 + ux * 8, x + ux * 15 + uy * 8, y + uy * 15 - ux * 8)
    line(p.body, x + ux * 17, y + uy * 17, x + ux * 52, y + uy * 52)
    var ex = x + ux * 52
    var ey = y + uy * 52
    var pull = Math.max(0, len - 52) * 0.45
    p.cable.setAttribute(
      "d",
      "M " + ex + " " + ey +
        " C " + (ex + ux * pull) + " " + (ey + uy * pull + 20) +
        " " + jx + " " + (jy - Math.min(60, len * 0.4)) +
        " " + jx + " " + jy
    )
    p.pos = [x, y]
  }

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function formatReading(value) {
    return value.toFixed(1) + " Ω"
  }

  function Sim(box) {
    var scene = SCENES[box.getAttribute("data-scene")]
    var list = box.querySelector("ol")
    if (!scene || !list) return
    var items = list.querySelectorAll(":scope > li")
    var steps = scene.steps.slice(0, items.length)
    var parts = build(scene)
    var cur = 0
    var playing = !reduceMotion
    var visible = false
    var timer = null
    var pending = []
    var frame = null

    // Figure: diagram, controls, captions
    var figure = document.createElement("div")
    figure.className = "can-sim__figure"
    figure.appendChild(parts.svg)

    var controls = document.createElement("div")
    controls.className = "can-sim__controls"
    var prev = button("can-sim__btn", "Previous step", '<svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z"/></svg>')
    var play = button("can-sim__btn", "Pause", "")
    var next = button("can-sim__btn", "Next step", '<svg viewBox="0 0 24 24"><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z"/></svg>')
    var dots = document.createElement("div")
    dots.className = "can-sim__dots"
    var dotButtons = steps.map(function (_, i) {
      var dot = button("can-sim__dot", "Step " + (i + 1), "")
      dot.addEventListener("click", function () {
        stop()
        go(i)
      })
      dots.appendChild(dot)
      return dot
    })
    var count = document.createElement("span")
    count.className = "can-sim__count"
    ;[prev, play, next, dots, count].forEach(function (node) {
      controls.appendChild(node)
    })

    // Every caption sits in the same grid cell, so the box keeps the height
    // of the longest one and the page doesn't jump between steps
    var captions = document.createElement("div")
    captions.className = "can-sim__captions"
    captions.setAttribute("aria-live", "polite")
    var captionNodes = steps.map(function (_, i) {
      var caption = document.createElement("div")
      caption.className = "can-sim__caption"
      caption.innerHTML = items[i].innerHTML
      captions.appendChild(caption)
      return caption
    })

    figure.appendChild(controls)
    figure.appendChild(captions)
    box.insertBefore(figure, list)
    box.classList.add("can-sim--ready")

    prev.addEventListener("click", function () {
      stop()
      go((cur - 1 + steps.length) % steps.length)
    })
    next.addEventListener("click", function () {
      stop()
      go((cur + 1) % steps.length)
    })
    play.addEventListener("click", function () {
      playing = !playing
      if (playing && cur === steps.length - 1) go(0)
      updatePlay()
      schedule()
    })

    function button(cls, name, html) {
      var node = document.createElement("button")
      node.type = "button"
      node.className = cls
      node.setAttribute("aria-label", name)
      node.innerHTML = html
      return node
    }

    function updatePlay() {
      play.setAttribute("aria-label", playing ? "Pause" : "Play")
      play.innerHTML = playing
        ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
    }

    function stop() {
      playing = false
      updatePlay()
      clearTimeout(timer)
    }

    function later(fn, ms) {
      pending.push(setTimeout(fn, reduceMotion ? 0 : ms))
    }

    function go(index) {
      cur = index
      render(steps[index], true)
      dotButtons.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index)
        dot.setAttribute("aria-current", i === index ? "step" : "false")
      })
      captionNodes.forEach(function (caption, i) {
        caption.classList.toggle("is-active", i === index)
      })
      count.textContent = "Step " + (index + 1) + " of " + steps.length
      schedule()
    }

    function schedule() {
      clearTimeout(timer)
      if (!playing || !visible) return
      var last = cur === steps.length - 1
      var words = captionNodes[cur].textContent.length
      var dwell = Math.min(9000, 3200 + words * 32) + (last ? 2500 : 0)
      timer = setTimeout(function () {
        go(last ? 0 : cur + 1)
      }, dwell)
    }

    function render(state, animate) {
      pending.forEach(clearTimeout)
      pending = []
      cancelAnimationFrame(frame)

      var on = state.robot === "on"
      parts.pill.classList.toggle("is-on", on)
      parts.pillText.textContent = on ? "Robot on, disabled" : "Robot off"

      var leds = state.leds || ["off", "off", "off", "off"]
      parts.krakens.forEach(function (kraken, i) {
        kraken.setAttribute("class", "can-sim__k can-sim__k--" + leds[i])
      })

      var open = state.open || []
      parts.joints.forEach(function (joint, i) {
        joint.classList.toggle("is-open", open.indexOf(i) !== -1)
      })

      var spot = state.resistor === "bench" ? BENCH : [END, MID]
      parts.res.style.transform = "translate(" + spot[0] + "px, " + spot[1] + "px)"

      parts.broken.classList.toggle("is-shown", !!state.broken)
      parts.short.classList.toggle("is-shown", !!state.short)

      if (!parts.probes) return

      // Meter: the reading shows once the probes land
      parts.pointer.style.transform = "rotate(" + (state.mode === "cont" ? 40 : -40) + "deg)"
      parts.modeOhm.style.display = state.mode === "cont" ? "none" : ""
      parts.modeCont.style.display = state.mode === "cont" ? "" : "none"
      parts.reading.textContent = "OL"
      parts.verdict.setAttribute("class", "can-sim__verdict")
      parts.beep.classList.remove("is-shown")
      parts.flow.classList.remove("is-shown")

      var moved = moveProbes(
        { black: state.black || REST.black, red: state.red || REST.red },
        animate && !reduceMotion
      )
      later(function () {
        showReading(state)
      }, moved ? 850 : 150)
    }

    function moveProbes(targets, animate) {
      var probes = parts.probes
      var from = { black: probes.black.pos.slice(), red: probes.red.pos.slice() }
      var moved = ["black", "red"].some(function (name) {
        return from[name][0] !== targets[name][0] || from[name][1] !== targets[name][1]
      })
      if (!moved || !animate) {
        placeProbe(probes.black, targets.black)
        placeProbe(probes.red, targets.red)
        return moved
      }
      var start = performance.now()
      function tick(now) {
        var t = ease(Math.min(1, (now - start) / 750))
        ;["black", "red"].forEach(function (name) {
          placeProbe(probes[name], [
            from[name][0] + (targets[name][0] - from[name][0]) * t,
            from[name][1] + (targets[name][1] - from[name][1]) * t,
          ])
        })
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      return true
    }

    function showReading(state) {
      if (state.verdict) {
        parts.verdict.setAttribute("class", "can-sim__verdict is-" + state.verdict)
        parts.verdictText.textContent = state.verdict === "good" ? "✓" : "✗"
      }
      if (state.reading == null) return
      // A real meter settles over a moment before it shows a steady number
      var value = state.reading
      if (value > 10) {
        parts.reading.textContent = formatReading(value * 0.94)
        later(function () {
          parts.reading.textContent = formatReading(value * 1.02)
        }, 110)
        later(function () {
          parts.reading.textContent = formatReading(value)
        }, 220)
      } else {
        parts.reading.textContent = formatReading(value)
      }
      if (state.beep) parts.beep.classList.add("is-shown")
      if (state.flow) {
        var f = state.flow
        line(parts.flow, f[1], f[0], f[2], f[0])
        parts.flow.setAttribute("class", "can-sim__flow is-shown can-sim__flow--" + (f[0] === Y ? "yellow" : "green"))
      }
    }

    // Play only while the diagram is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting
          schedule()
        },
        { threshold: 0.4 }
      ).observe(figure)
    } else {
      visible = true
    }

    updatePlay()
    go(0)
  }

  document.querySelectorAll(".can-sim").forEach(Sim)
})()
