'use strict'
/* global describe it */

var Filer = require('../filer')
var is = global.is || require('exam/lib/is')

describe('Filer.prototype.stat', function () {
  var dir = __dirname + '/tree'
  it('finds file stats', function (done) {
    var files = new Filer(dir)
    files.stat()
    files.on('stats', function () {
      is.array(files.files)
      is.truthy(files.files.length)
      done()
    })
  })
})
