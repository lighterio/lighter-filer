'use strict'
/* global it */

var Load = require('../lighter-load')
var lib = require('path')
var bench = global.bench || function () {}

bench('Relative paths', function () {
  var load = new Load('/some/where')
  it('Load.relative', function () {
    load.relative('/')
    load.relative('/some/')
    load.relative('/some/where/over')
    load.relative('/some/where/over/the/rainbow')
    load.relative('/some/where/over.js')
    load.relative('/another/place')
    load.relative('/some/where/new')
  })
  it('path.relative', function () {
    lib.relative('/some/where', '/')
    lib.relative('/some/where', '/some/')
    lib.relative('/some/where', '/some/where/over')
    lib.relative('/some/where', '/some/where/over/the/rainbow')
    lib.relative('/some/where', '/some/where/over.js')
    lib.relative('/some/where', '/another/place')
    lib.relative('/some/where', '/some/where/new')
  })
})
