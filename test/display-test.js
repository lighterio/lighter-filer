'use strict'
/* global describe it */

var Filer = require('../filer')
var is = global.is || require('exam-is')
var cwd = process.cwd()

describe('Filer.prototype.display', function () {
  var filer = new Filer()

  it('works in a sub directory', function () {
    var display = filer.display(__filename)
    is(display, './test/display-test.js')
  })

  it('works for unrelated paths', function () {
    var display = filer.display('/tmp/blah.js')
    is(display, '/tmp/blah.js')
  })

  it('works after chdir', function () {
    process.chdir(__dirname)
    var display = filer.display(__filename)
    is(display, './display-test.js')
    process.chdir(cwd)
  })

  it('works for a parent directory', function () {
    process.chdir(__dirname)
    var readme = __dirname.replace(/test$/, 'README.md')
    var display = filer.display(readme)
    is(display, '../README.md')
    process.chdir(cwd)
  })
})
