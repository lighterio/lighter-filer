'use strict'
/* global describe it is */

var File = require('../lighter-load').File

describe('File', function () {
  it('works with zero data', function () {
    var file = new File()
    is.object(file)
  })
})

describe('File.prototype.filename', function () {
  it('gets and sets the filename', function () {
    var file = new File({rel: __filename})
    is(file.filename, 'file-test.js')
    file.filename = 'filename-test.js'
    is(file.filename, 'filename-test.js')
  })
})

describe('File.prototype.extension', function () {
  it('gets and sets the extension', function () {
    var file = new File({rel: __filename})
    is(file.extension, 'js')
    file.extension = 'css'
    is(file.extension, 'css')
  })

  it('returns empty string when there is no extension', function () {
    var file = new File({rel: 'LICENSE'})
    is(file.extension, '')
    file.extension = 'md'
    is(file.rel, 'LICENSE.md')
  })
})
