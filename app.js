var grid = require('pixel-grid')
var localcast = require('localcast')

var list = null
var pixels = null
var changes = 0
var rendered = 0

var cast = localcast('hypercore')

document.body.style.padding = document.body.style.margin = 0

var cols = Math.floor(document.body.offsetWidth / 8)
var waits = []
var polls = []

cast.on('list', onlist)
cast.on('download', ondownload)
cast.on('upload', onupload)

function onlist (data) {
  list = data.map(function (val) {
    return val ? '#199E33' : '#ffffff'
  })
  reset()
}

function reset () {
  console.log('reset')
  if (pixels) {
    document.body.removeChild(pixels.canvas)
  }

  // console.log(list)

  var rows = Math.ceil(list.length / cols)
  console.log('rows', rows)

  pixels = grid(list, {
    root: document.body,
    size: 8,
    rows: rows,
    columns: cols,
    padding: 0
  })
}

function onupload (data) {
  if (!list) return

  list[data.index] = '#F9A5E4'
  if (!waits[data.index]) polls.push(data.index)
  waits[data.index] = 6
  run()
}

function ondownload (data) {
  if (!list) return

  var grow = false
  if (data.length > list.length) {
    grow = true
    for (var i = list.length; i < data.length; i++) {
      list[i] = '#ffffff'
    }
  }
  list[data.index] = '#199E33'

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
      list[polls[i]] = '#199E33'
      polls.splice(i, 1)
      i--
    }
  }
  run()
}, 250)
