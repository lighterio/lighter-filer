'use strict'
/* global describe it beforeEach afterEach */

var fs = require('fs')
var Load = require('../lighter-load')
var is = global.is || require('exam-is')
var mock = global.mock || require('exam-mock')
var unmock = mock.unmock

describe('Load.prototype.read', function () {
  var dir = __dirname + '/tree'
  it('reads a single file', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function (load) {
        is(load.length, 1)
        is.in('' + load[0].content, 'leaf:1')
        done()
      })
      .read(dir + '/leaf.js')
  })

  it('ignores errors', function (done) {
    var errorFn = function (path, fn) {
      fn(new Error('Error'))
    }
    mock(fs, {readFile: errorFn})
    var load = new Load(dir)
    load
      .on('loaded', function () {
        unmock(fs)
        done()
      })
      .read('leaf.js')
  })
})
