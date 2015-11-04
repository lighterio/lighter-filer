'use strict'
/* global describe it beforeEach afterEach */

var fs = require('fs')
var Files = require('../lighter-files')
var is = global.is || require('exam/lib/is')
var mock = global.mock || require('exam/lib/mock')
var unmock = mock.unmock

describe('Files.prototype.read', function () {
  var dir = __dirname + '/tree'
  it('reads a single file', function (done) {
    var files = new Files(dir)
    files
      .on('loaded', function (files) {
        is(files.length, 1)
        is.in('' + files[0].content, 'leaf:1')
        done()
      })
      .read(dir + '/leaf.js')
  })

  it('ignores errors', function (done) {
    var errorFn = function (path, fn) {
      fn(new Error('Error'))
    }
    mock(fs, {readFile: errorFn})
    var files = new Files(dir)
    files
      .on('loaded', function () {
        unmock(fs)
        done()
      })
      .read('leaf.js')
  })
})
