'use strict'
var fs = require('fs')
var Flagger = require('lighter-flagger')
var File = require('./file')

/**
 * A Filer can asynchronously dive down a directory, emitting events for files
 * and directories that exist under it. Symbolic links are followed, with loop
 * protection.
 *
 * Events:
 * - "file" is emitted when a new file is found.
 * - "dir" is emitted when a new directory is found.
 * - "content" is emitted when a file's content has been read.
 * - "found" when a locations are completely found.
 * - "loaded" when locations are completely loaded.
 */
var Filer = module.exports = Flagger.extend({

  // Use the file system.
  fs: fs,

  // Use File objects.
  File: File,

  /**
   * Create a new filer with a root path (or rooted at the current working
   * directory).
   *
   * @param  {String} root  An optional path to this filer's root.
   */
  init: function Filer (root) {
    // Flagger properties.
    this._events = {}
    this._flags = {}
    this._waitCount = 0
    this._waitParents = []

    // Default to the current working directory.
    this.root = root || Filer.root

    // Mapping of paths to objects or symlink destinations.
    this.map = {}

    // Array of files.
    this.files = []

    // Array of directories.
    this.dirs = []

    // Whether to store file stats.
    this.storeStats = false

    // Whether to read file contents.
    this.readContents = false

    // Number of files whose contents we're waiting for.
    this.loadCounter = 0
  },

  /**
   * Return a user-friendly path, using "~/" or "./" where possible.
   *
   * @param  {String} path  A relative path.
   * @return {String}       The shortened path.
   */
  display: function display (path) {
    var Filer = this.constructor
    var rel = Filer.relative(path)
    if (rel[0] !== '.') {
      rel = './' + rel
    }
    if (path.indexOf(Filer.home) === 0) {
      path = '~/' + path.substr(Filer.home.length)
    }
    return rel.length < path.length ? rel : path
  },

  /**
   * Convert a relative path to an absolute path.
   *
   * @param  {String} path  A relative path.
   * @return {String}       The absolute path.
   */
  absolute: function absolute (path) {
    var dir = this.root
    if (path[0] !== '/') {
      while (path.substr(0, 3) === '../') {
        path = path.substr(3)
        dir = dir.replace(/\/[^\/]+$/, '')
      }
      if (path.substr(0, 2) === './') {
        path = path.substr(2)
      }
      path = dir + '/' + path
    }
    return path
  },

  /**
   * Convert a absolute path to a relative path.
   *
   * @param  {String} path  A absolute path.
   * @return {String}       The relative path.
   */
  relative: function relative (path) {
    var dir = this.root
    var length = dir.length
    if (path.substr(0, length) === dir) {
      path = path.substr(length + 1)
    } else {
      var dirParts = dir.split('/')
      var pathParts = path.split('/')
      var up = ''
      var same = 1
      for (var i = 1, l = dirParts.length; i < l; i++) {
        if (dirParts[i] === pathParts[i]) {
          same++
        } else {
          break
        }
      }
      var diff = l - same
      for (i = 0; i < diff; i++) {
        up += '../'
      }
      path = up + pathParts.slice(same, pathParts.length).join('/')
    }
    return path
  },

  /**
   * Find files under a specified path, or under the root.
   *
   * @param  {String}   path  An optional relative or absolute path.
   */
  find: function find (path) {
    var self = this
    var fs = this.fs
    var wait = 0
    path = this.absolute(path || this.root)
    getStat(path)
    function getStat (path) {
      wait++
      fs.lstat(path, function (error, stat) {
        if (error) {
          self.emit('error', error)
        } else {
          if (stat.isSymbolicLink()) {
            getLink(path)
          } else {
            var rel = self.relative(path)
            if (stat.isDirectory()) {
              getDir(path)
              self.dirs.push(rel)
              self.emit('dir', path)
            } else {
              var options = self.storeStats ? stat : {}
              options.rel = rel
              options.stat = self.storeStats ? stat : null
              options.filer = self
              var file = new self.File(options)
              self.map[rel] = file
              self.files.push(file)
              self.emit('file', path)
            }
          }
        }
        done()
      })
    }
    function getLink (path) {
      wait++
      fs.readlink(path, function (error, link) {
        if (error) {
          self.emit('error', error)
        } else {
          var rel = self.relative(link)
          if (!self.map[rel]) {
            self.map[rel] = rel
            getDir(path)
          }
        }
        done()
      })
    }
    function getDir (path) {
      wait++
      fs.readdir(path, function (error, files) {
        if (error) {
          self.emit('error', error)
        } else {
          path += '/'
          for (var i = 0, l = files.length; i < l; i++) {
            getStat(path + files[i])
          }
        }
        done()
      })
    }
    function done () {
      if (!--wait) {
        self.files.sort(function (a, b) {
          return a.rel < b.rel ? -1 : 1
        })
        self.emit('found', self.files)
        if (self.storeStats) {
          self.emit('stats', self.files)
        }
      }
    }
    return this
  },

  /**
   * Find files, and store their stats.
   *
   * @param  {String} path  An optional path.
   */
  stat: function stat (path) {
    this.storeStats = true
    return this.find(path)
  },

  /**
   * Load files from a specified path, or from the root.
   *
   * @param  {String} path  An optional path.
   */
  load: function load (path) {
    // Bind the content reader to the file event, but only bind it once.
    if (!this.readContents) {
      this.readContents = true
      this.on('file', this.read)
    }

    // Load by finding files.
    return this.find(path)
  },

  /**
   * Read the contents of a file.
   *
   * @param  {String} path  A file path.
   */
  read: function read (path) {
    var self = this
    var fs = self.fs
    self.loadCounter++
    fs.readFile(path, function (error, content) {
      if (error) {
        self.emit('error', error)
      } else {
        var rel = self.relative(path)
        var file = self.map[rel]
        if (!file) {
          file = self.map[rel] = {rel: rel}
          self.files.push(file)
        }
        file.content = content
      }
      if (!--self.loadCounter) {
        self.emit('loaded', self.files)
      }
    })
    return this
  },

  /**
   * Get absolute paths of found files.
   */
  paths: function paths () {
    var list = this.files
    var length = list.length
    var paths = new Array(length)
    for (var i = 0; i < length; i++) {
      paths[i] = this.absolute(list[i].rel)
    }
    return paths
  },

  /**
   * Get relative paths of found files.
   */
  rels: function rels () {
    var list = this.files
    var length = list.length
    var paths = new Array(length)
    for (var i = 0; i < length; i++) {
      paths[i] = list[i].rel
    }
    return paths
  }
})

// Remember the user's home directory.
Filer.home = (process.env.HOME).replace(/\/?$/, '/')
Filer.init(Filer, [process.cwd()])

// Remember the current directory, and track changes.
var chdir = process.chdir
process.chdir = function () {
  chdir.apply(process, arguments)
  Filer.root = process.cwd()
}
