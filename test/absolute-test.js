'use strict'
/* global describe it is */

var Load = require('../lighter-load')

describe('Load', function () {
  describe('.absolute', function () {
    var load = new Load('/some/where')

    it('goes up', function () {
      var path = load.absolute('../')
      is(path, '/some/')
    })

    it('goes up twice', function () {
      var path = load.absolute('../../')
      is(path, '/')
    })

    it('goes down', function () {
      var path = load.absolute('over')
      is(path, '/some/where/over')
    })

    it('goes deep', function () {
      var path = load.absolute('over/the/rainbow')
      is(path, '/some/where/over/the/rainbow')
    })

    it('handles dots', function () {
      var path = load.absolute('over.js')
      is(path, '/some/where/over.js')
    })

    it('handles a leading dot', function () {
      var path = load.absolute('./over.js')
      is(path, '/some/where/over.js')
    })

    it('handles absolute paths', function () {
      var path = load.absolute('/another/place')
      is(path, '/another/place')
    })

    it('handles absolute paths under the root', function () {
      var path = load.absolute('/some/where/new')
      is(path, '/some/where/new')
    })
  })
})
