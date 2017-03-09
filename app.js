var localcast = require('localcast')

var cast = localcast()

cast.on('localcast', function (data) {
  console.log('localcast', data)
})

cast.on('hello', function () {
  console.log('hello')
})
