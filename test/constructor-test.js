'use strict'
/* global describe it */

var Filer = require('../filer')
var is = global.is || require('exam/lib/is')
var cwd = process.cwd()

describe('Filer', function () {
  it('defaults to process.cwd()', function () {
    var files = new Filer()
    is(files.root, cwd)
  })
})
