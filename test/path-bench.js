'use strict'
/* global bench it */

var Files = require('../lighter-files')
var lib = require('path')

bench('Relative paths', function () {
  var files = new Files('/some/where')
  it('Files.relative', function () {
    files.relative('/')
    files.relative('/some/')
    files.relative('/some/where/over')
    files.relative('/some/where/over/the/rainbow')
    files.relative('/some/where/over.js')
    files.relative('/another/place')
    files.relative('/some/where/new')
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
