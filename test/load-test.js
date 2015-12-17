'use strict'
/* global describe it */

var Load = require('../lighter-load')
var is = global.is || require('exam-is')

describe('Load.prototype.load', function () {
  var dir = __dirname + '/tree'
  it('loads load under the root', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .load()
  })
  it('loads a specified file', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.paths(), [dir + '/branch/leaf.js'])
        is(load[0].content, "console.log('leaf:2')\n")
        done()
      })
      .load(dir + '/branch/leaf.js')
  })
  it('can be called twice', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .load('branch/leaf.js')
      .load('leaf.js')
  })
})
