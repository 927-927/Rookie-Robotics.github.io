// Adds a header button that hides/shows the left navigation on desktop.
// On narrower screens Material already turns the nav into a drawer with its own button.
(function () {
  var KEY = "rbedu.sidebar"
  var HIDDEN = "rb-sidebar-hidden"
  var root = document.documentElement

  var ICON_OPEN =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 15.61 19.59 17l-5.01-5 5.01-5L21 8.39 17.44 12 21 15.61M3 6h13v2H3V6m0 7v-2h10v2H3m0 5v-2h13v2H3Z"/></svg>'
  var ICON_CLOSED =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"/></svg>'

  function save(hidden) {
    try {
      localStorage.setItem(KEY, hidden ? "hidden" : "shown")
    } catch (e) {}
  }

  function render(button) {
    var hidden = root.classList.contains(HIDDEN)
    var label = hidden ? "Show navigation" : "Hide navigation"
    button.innerHTML = hidden ? ICON_CLOSED : ICON_OPEN
    button.setAttribute("aria-label", label)
    button.setAttribute("title", label)
    button.setAttribute("aria-expanded", String(!hidden))
  }

  var anchor = document.querySelector(".md-header__inner label[for='__drawer']")
  if (!anchor) return

  var button = document.createElement("button")
  button.type = "button"
  button.className = "md-header__button md-icon rb-sidebar-toggle"
  button.addEventListener("click", function () {
    var hidden = root.classList.toggle(HIDDEN)
    save(hidden)
    render(button)
  })

  anchor.insertAdjacentElement("afterend", button)
  render(button)
})()
