'use strict'
/* global describe it */

var Files = require('../lighter-files')
var is = global.is || require('exam/lib/is')

describe('Files.prototype.stat', function () {
  var dir = __dirname + '/tree'
  it('finds file stats', function (done) {
    var files = new Files(dir)
    files.stat()
    files.on('stats', function () {
      is.array(files.list)
      is.truthy(files.list.length)
      done()
    })
  })
})
