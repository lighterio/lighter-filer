'use strict'
/* global describe it */

var Files = require('../lighter-filer')
var is = global.is || require('exam/lib/is')

describe('Files', function () {
  describe('.relative', function () {
    var files = new Files('/some/where')

    it('goes up', function () {
      var path = files.relative('/some/')
      is(path, '../')
    })

    it('goes up twice', function () {
      var path = files.relative('/')
      is(path, '../../')
    })

    it('goes down', function () {
      var path = files.relative('/some/where/over')
      is(path, 'over')
    })

    it('goes deep', function () {
      var path = files.relative('/some/where/over/the/rainbow')
      is(path, 'over/the/rainbow')
    })

    it('handles dots', function () {
      var path = files.relative('/some/where/over.js')
      is(path, 'over.js')
    })

    it('handles absolute paths', function () {
      var path = files.relative('/another/place')
      is(path, '../../another/place')
    })

    it('handles absolute paths under the root', function () {
      var path = files.relative('/some/where/new')
      is(path, 'new')
    })
  })
})
