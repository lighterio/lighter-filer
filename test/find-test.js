'use strict'
/* global describe it beforeEach afterEach */

var fs = require('fs')
var Filer = require('../filer')
var is = global.is || require('exam/lib/is')
var mock = global.mock || require('exam/lib/mock')
var unmock = mock.unmock

describe('Filer.prototype.find', function () {
  var dir = __dirname + '/tree'

  it('finds files', function (done) {
    var files = new Filer(dir)
    files.find()
    files.on('found', function () {
      is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
      done()
    })
  })

  describe('ignores errors', function () {
    var errorFn = function (path, fn) {
      fn(new Error('Error'))
    }

    it('from fs.lstat', function (done) {
      mock(fs, {lstat: errorFn})
      var files = new Filer(dir)
      var count = mock.count()
      files
        .on('error', count)
        .on('found', function () {
          is(count.value, 1)
          is.same(files.rels(), [])
          unmock(fs)
          done()
        })
        .find()
    })

    it('from fs.readlink', function (done) {
      mock(fs, {readlink: errorFn})
      fs.symlink(dir, dir + '/branch/loop', 'dir', function () {
        var files = new Filer(dir)
        var count = mock.count()
        files
          .on('error', count)
          .on('found', function () {
            is(count.value, 1)
            is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
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
      var files = new Filer(dir)
      var count = mock.count()
      files
        .on('error', count)
        .on('found', function () {
          is(count.value, 1)
          is.same(files.rels(), [])
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
      var files = new Filer(dir)
      files.find()
      files.on('found', function () {
        is.array(files.files)
        is.truthy(files.files.length)
        done()
      })
    })

    it('with upward symlinks', function (done) {
      var files = new Filer(dir + '/branch')
      files.find()
      files.on('found', function () {
        is.array(files.files)
        is.truthy(files.files.length)
        done()
      })
    })
  })
})
