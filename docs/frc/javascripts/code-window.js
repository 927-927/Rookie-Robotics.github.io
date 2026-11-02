// Makes each .vscode block work like a small VS Code window: clicking a file
// in the explorer opens it in the editor. Without this script, every file
// shows one after another.
(function () {
  document.querySelectorAll(".vscode").forEach(function (box) {
    var files = box.querySelectorAll(".vscode__file")
    var panes = box.querySelectorAll(".vscode__pane")
    var tab = box.querySelector(".vscode__tab")
    var crumbs = box.querySelector(".vscode__crumbs")

    function open(file) {
      var name = file.getAttribute("data-file")

      files.forEach(function (other) {
        var active = other === file
        other.classList.toggle("is-active", active)
        other.setAttribute("aria-pressed", String(active))
      })

      panes.forEach(function (pane) {
        var active = pane.getAttribute("data-file") === name
        pane.classList.toggle("is-active", active)
        if (active) {
          var path = pane.getAttribute("data-path").split("/")
          tab.textContent = path[path.length - 1]
          crumbs.textContent = path.join(" › ")
        }
      })
    }

    files.forEach(function (file) {
      file.addEventListener("click", function () {
        open(file)
      })
    })

    box.classList.add("vscode--ready")
    open(box.querySelector(".vscode__file.is-active") || files[0])
  })
})()
