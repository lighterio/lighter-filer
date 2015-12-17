'use strict'
/* global describe it */

var Load = require('../lighter-load')
var is = global.is || require('exam-is')

describe('Load.prototype.stat', function () {
  var dir = __dirname + '/tree'
  it('finds file stats', function (done) {
    var load = new Load(dir)
    load.stat()
    load.on('stats', function () {
      is.array(load.list)
      is.truthy(load.list.length)
      done()
    })
  })
})
