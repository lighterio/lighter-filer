'use strict'
/* global describe it */

var Load = require('../lighter-load')
var is = global.is || require('exam-is')
var cwd = process.cwd()

describe('Load', function () {
  it('defaults to process.cwd()', function () {
    var load = new Load()
    is(load.root, cwd)
  })
})
