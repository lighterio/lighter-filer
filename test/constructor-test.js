'use strict'
/* global describe it is */

var Load = require('../lighter-load')
var cwd = process.cwd()

describe('Load', function () {
  it('defaults to process.cwd()', function () {
    var load = new Load()
    is(load.root, cwd)
  })
})
