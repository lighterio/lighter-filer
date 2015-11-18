'use strict'
/* global describe it */

var Files = require('../lighter-filer')
var is = global.is || require('exam/lib/is')
var cwd = process.cwd()

describe('Files', function () {
  it('defaults to process.cwd()', function () {
    var files = new Files()
    is(files.root, cwd)
  })
})
