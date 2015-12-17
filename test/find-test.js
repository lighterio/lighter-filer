'use strict'
/* global describe it beforeEach afterEach */

var fs = require('fs')
var Load = require('../lighter-load')
var is = global.is || require('exam-is')
var mock = global.mock || require('exam-mock')
var unmock = mock.unmock

describe('Load.prototype.find', function () {
  var dir = __dirname + '/tree'

  it('finds load', function (done) {
    var load = new Load(dir)
    load.find()
    load.on('found', function () {
      is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
      done()
    })
  })

  describe('ignores errors', function () {
    var errorFn = function (path, fn) {
      fn(new Error('Error'))
    }

    it('from fs.lstat', function (done) {
      mock(fs, {lstat: errorFn})
      var load = new Load(dir)
      var count = mock.count()
      load
        .on('error', count)
        .on('found', function () {
          is(count.value, 1)
          is.same(load.rels(), [])
          unmock(fs)
          done()
        })
        .find()
    })

    it('from fs.readlink', function (done) {
      mock(fs, {readlink: errorFn})
      fs.symlink(dir, dir + '/branch/loop', 'dir', function () {
        var load = new Load(dir)
        var count = mock.count()
        load
          .on('error', count)
          .on('found', function () {
            is(count.value, 1)
            is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
            unmock(fs)
            fs.unlink(dir + '/branch/loop', function () {
              done()
            })
          })
          .find()
      })
    })

    it('from fs.readdir', function (done) {
      mock(fs, {readdir: errorFn})
      var load = new Load(dir)
      var count = mock.count()
      load
        .on('error', count)
        .on('found', function () {
          is(count.value, 1)
          is.same(load.rels(), [])
          unmock(fs)
          done()
        })
        .find()
    })
  })

  describe('works in loops', function () {
    beforeEach(function (done) {
      fs.symlink(dir, dir + '/branch/loop', 'dir', done)
    })

    afterEach(function (done) {
      fs.unlink(dir + '/branch/loop', function () {
        done()
      })
    })

    it('with downward symlinks', function (done) {
      var load = new Load(dir)
      load.find()
      load.on('found', function () {
        is.array(load.list)
        is.truthy(load.list.length)
        done()
      })
    })

    it('with upward symlinks', function (done) {
      var load = new Load(dir + '/branch')
      load.find()
      load.on('found', function () {
        is.array(load.list)
        is.truthy(load.list.length)
        done()
      })
    })
  })
})
