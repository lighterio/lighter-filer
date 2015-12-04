'use strict'
/* global describe it */

var Load = require('../lighter-load')
var is = global.is || require('exam/lib/is')

describe('Load', function () {
  describe('.relative', function () {
    var load = new Load('/some/where')

    it('goes up', function () {
      var path = load.relative('/some/')
      is(path, '../')
    })

    it('goes up twice', function () {
      var path = load.relative('/')
      is(path, '../../')
    })

    it('goes down', function () {
      var path = load.relative('/some/where/over')
      is(path, 'over')
    })

    it('goes deep', function () {
      var path = load.relative('/some/where/over/the/rainbow')
      is(path, 'over/the/rainbow')
    })

    it('handles dots', function () {
      var path = load.relative('/some/where/over.js')
      is(path, 'over.js')
    })

    it('handles absolute paths', function () {
      var path = load.relative('/another/place')
      is(path, '../../another/place')
    })

    it('handles absolute paths under the root', function () {
      var path = load.relative('/some/where/new')
      is(path, 'new')
    })
  })
})
