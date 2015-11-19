'use strict'

/**
 * A File.
 */
var Flagger = require('lighter-flagger')
var File = module.exports = Flagger.extend({

  init: function File (options) {
    options = options || 0

    // Flagger properties.
    this._events = {}
    this._flags = {}
    this._waitCount = 0
    this._waitParents = options.filer ? [options.filer] : []

    var filer = this.filer = options.filer
    this.rel = options.rel || ''
    this.mode = options.mode || 33188
    this.mtime = options.mtime
    if (filer) {
      filer.waitFor(this)
    }
  }
})

Object.defineProperty(File.prototype, 'filename', {
  get: function getFilename () {
    return this.rel.replace(/^.*\//, '')
  },
  set: function setFilename (filename) {
    this.rel = this.rel.replace(/(\/)?[^\/]+$/, function (match, slash) {
      return slash + filename
    })
    return filename
  }
})

Object.defineProperty(File.prototype, 'extension', {
  get: function getExtension () {
    var filename = this.filename
    var parts = filename.split('.')
    var count = parts.length
    return count > 1 ? parts[count - 1] : ''
  },
  set: function setExtension (extension) {
    this.rel = this.rel.replace(/(\.[^\/\.]+)?$/, '.' + extension)
    return extension
  }
})
