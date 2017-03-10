var yo = require('yo-yo')
var grid = require('pixel-grid')
var localcast = require('localcast')

var list = null
var pixels = null
var changes = 0
var rendered = 0
var stats = {down: 0, up: 0, have: 0}

var cast = localcast('hypercore')

var HAVE = '#199E33'
var NEED = '#ffffff'
var UPLOAD = '#F9A5E4'

document.body.style.padding = document.body.style.margin = 0
var statsEl = document.querySelector('.stats')

var waits = []
var polls = []

cast.on('list', onlist)
cast.on('download', ondownload)
cast.on('upload', onupload)

function onlist (data) {
  stats = {down: 0, up: 0, have: 0}
  list = data.map(function (val) {
    if (val) {
      stats.have++
      return HAVE
    } else {
      return NEED
    }
  })
  reset()
}

function reset () {
  console.log('reset')
  if (pixels) {
    document.body.removeChild(pixels.canvas)
  }
  
  var size = 8
  if (list.length < 1024) size = 16
  
  var cols = Math.floor(document.body.offsetWidth / size)
  var rows = Math.ceil(list.length / cols)
  console.log('rows', rows)
  

  pixels = grid(list, {
    root: document.body,
    size: size,
    rows: rows,
    columns: cols,
    padding: 0,
    background: [255,255,255]
  })
}

function onupload (data) {
  if (!list) return
  stats.up++
  list[data.index] = UPLOAD
  if (!waits[data.index]) polls.push(data.index)
  waits[data.index] = 24
  run()
}

function ondownload (data) {
  if (!list) return
  stats.down++
  stats.have++
  var grow = false
  if (data.length > list.length) {
    grow = true
    for (var i = list.length; i < data.length; i++) {
      list[i] = NEED
    }
  }
  list[data.index] = HAVE

  if (grow) reset()
  else run()
}

function run () {
  if (!pixels) return
  changes++
  pixels.frame(function () {
    if (rendered === changes) return
    rendered = changes
    pixels.update(list)
  })
}

setInterval(function () {
  for (var i = 0; i < polls.length; i++) {
    if (!--waits[polls[i]]) {
      list[polls[i]] = HAVE
      polls.splice(i, 1)
      i--
    }
  }
  run()
  updateStats()
}, 250)

function updateStats () {
  if (!list) return yo.update(statsEl, `<div class="stats">
      <code class="title"><a href="https://datproject.org"><b>Hyperdrive</b> Statistics</a></code>
      <code style="padding-left: 20px">Run dat-next-next with --stats to begin</code>
    </div>
  `)
  yo.update(statsEl, `<div class="stats">
    <code class="title"><a href="https://datproject.org"><b>Hyperdrive</b> Statistics</a></code>
    <ul>
      <li>
        <span class="sg-color-circle" style="background-color: ${NEED};"></span>
        <code class="sg-code">total:</code> <code class="sg-code">${list.length}</code>
      </li>
      <li>
        <span class="sg-color-circle" style="background-color: ${HAVE};"></span>
        <code class="sg-code">have:</code> <code class="sg-code">${stats.have}</code>
      </li>
      <li>
        <span class="sg-color-circle" style="background-color: ${UPLOAD};"></span>
        <code class="sg-code">uploaded:</code> <code class="sg-code">${stats.up}</code>
      </li>
      <li>
        <span class="sg-color-circle" style="background-color: ${HAVE};"></span>
        <code class="sg-code">downloaded:</code> <code class="sg-code">${stats.down}</code>
      </li>
  </div>`)
}