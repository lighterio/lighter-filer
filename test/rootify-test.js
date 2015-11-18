'use strict'
/* global describe it */

var Files = require('../lighter-filer')
var is = global.is || require('exam/lib/is')

describe('Files', function () {
  describe('.absolute', function () {
    var files = new Files('/some/where')

    it('goes up', function () {
      var path = files.absolute('../')
      is(path, '/some/')
    })

    it('goes up twice', function () {
      var path = files.absolute('../../')
      is(path, '/')
    })

    it('goes down', function () {
      var path = files.absolute('over')
      is(path, '/some/where/over')
    })

    it('goes deep', function () {
      var path = files.absolute('over/the/rainbow')
      is(path, '/some/where/over/the/rainbow')
    })

    it('handles dots', function () {
      var path = files.absolute('over.js')
      is(path, '/some/where/over.js')
    })

    it('handles a leading dot', function () {
      var path = files.absolute('./over.js')
      is(path, '/some/where/over.js')
    })

    it('handles absolute paths', function () {
      var path = files.absolute('/another/place')
      is(path, '/another/place')
    })

    it('handles absolute paths under the root', function () {
      var path = files.absolute('/some/where/new')
      is(path, '/some/where/new')
    })
  })
})
