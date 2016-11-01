'use strict'
/* global describe it is */

var Load = require('../lighter-load')

describe('Load.prototype.load', function () {
  var dir = __dirname + '/tree'
  it('loads load under the root', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .add()
  })
  it('loads a specified file', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.paths(), [dir + '/branch/leaf.js'])
        is(load.list[0].content.toString(), "console.log('leaf:2')\n")
        done()
      })
      .add(dir + '/branch/leaf.js')
  })
  it('can be called twice', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
        done()
      })
      .add('branch/leaf.js')
      .add('leaf.js')
  })
})
