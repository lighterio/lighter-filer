'use strict'
/* global describe it */

var Files = require('../lighter-files')
var is = global.is || require('exam/lib/is')

describe('Files.prototype.load', function () {
  var dir = __dirname + '/tree'
  it('loads files under the root', function (done) {
    var files = new Files(dir)
    files
      .on('loaded', function () {
        is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .load()
  })
  it('loads a specified file', function (done) {
    var files = new Files(dir)
    files
      .on('loaded', function () {
        is.same(files.paths(), [dir + '/branch/leaf.js'])
        is('' + files.list[0].content, "console.log('leaf:2')\n")
        done()
      })
      .load(dir + '/branch/leaf.js')
  })
  it('can be called twice', function (done) {
    var files = new Files(dir)
    files
      .on('loaded', function () {
        is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .load('branch/leaf.js')
      .load('leaf.js')
  })
})
