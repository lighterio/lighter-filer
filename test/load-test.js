'use strict'
/* global describe it */

<<<<<<< HEAD
var Load = require('../lighter-load')
var is = global.is || require('exam/lib/is')

describe('Load.prototype.load', function () {
  var dir = __dirname + '/tree'
  it('loads load under the root', function (done) {
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
=======
var Filer = require('../filer')
var is = global.is || require('exam/lib/is')

describe('Filer.prototype.load', function () {
  var dir = __dirname + '/tree'
  it('loads files under the root', function (done) {
    var files = new Filer(dir)
    files
      .on('loaded', function () {
        is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
>>>>>>> 7d38ce2ec5d1f38c370f69b5b346429f1deaa33f
        done()
      })
      .load()
  })
  it('loads a specified file', function (done) {
<<<<<<< HEAD
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.paths(), [dir + '/branch/leaf.js'])
        is(load[0].content, "console.log('leaf:2')\n")
=======
    var files = new Filer(dir)
    files
      .on('loaded', function () {
        is.same(files.paths(), [dir + '/branch/leaf.js'])
        is('' + files.files[0].content, "console.log('leaf:2')\n")
>>>>>>> 7d38ce2ec5d1f38c370f69b5b346429f1deaa33f
        done()
      })
      .load(dir + '/branch/leaf.js')
  })
  it('can be called twice', function (done) {
<<<<<<< HEAD
    var load = new Load(dir)
    load
      .on('loaded', function () {
        is.same(load.rels(), ['branch/leaf.js', 'leaf.js'])
=======
    var files = new Filer(dir)
    files
      .on('loaded', function () {
        is.same(files.rels(), ['branch/leaf.js', 'leaf.js'])
>>>>>>> 7d38ce2ec5d1f38c370f69b5b346429f1deaa33f
        done()
      })
      .load('branch/leaf.js')
      .load('leaf.js')
  })
})
