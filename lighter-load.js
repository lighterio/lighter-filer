'use strict'
/**
 * Dive asynchronously into a path, and call back with an array of paths
 * that exist under it. Indicate directories with trailing slashes, and omit
 * symbolic links.
 *
 * Events:
 * - "file" is emitted when a new file is found.
 * - "dir" is emitted when a new directory is found.
 * - "content" is emitted when a file's content has been read.
 * - "found" when all locations are found (deep search complete).
 * - "loaded" when all file contents are loaded (deep load complete).
 */

var fs = require('fs')
var Flagger = require('lighter-flagger')
var File = require('./file')
module.exports = Flagger.extend({

  init: function Load (root) {
    // Set up Emitter events and Flagger flags.
    Flagger.call(this)

    // Default to the current working directory.
    this.root = root || process.cwd()

    // Mapping of paths to objects or symlink destinations.
    this.map = {}

    // Array of files.
    this.list = []

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
   * Convert a relative path to an absolute path.
   *
   * @param  {String} path  A relative path.
   * @return {String}       The absolute path.
   */
  absolute: function (path) {
    var dir = this.root
    path = slashify(path)
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
   * Convert an absolute path to a relative path.
   *
   * @param  {String} path  A absolute path.
   * @return {String}       The relative path.
   */
  relative: function (path) {
    var dir = this.root
    var length = dir.length
    path = slashify(path)
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
   * Return a user-friendly path, using "~/" or "./" where possible.
   *
   * @param  {String} path  A relative path.
   * @return {String}       The shortened path.
   */
  display: function display (path) {
    var rel = this.relative(path)
    var env = process.env
    var home = slashify(env.HOME || env.USERPROFILE)
    if (rel[0] !== '.') {
      rel = './' + rel
    }
    path = slashify(path)
    if (path.indexOf(home) === 0) {
      path = '~/' + path.substr(home.length + 1)
    }
    return rel.length < path.length ? rel : path
  },

  /**
   * Find files under a specified path, or under the root.
   *
   * @param  {String}   path  An optional relative or absolute path.
   */
  find: function (path) {
    var self = this
    var wait = 0
    path = self.absolute(path || self.root)
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
              var file = self.storeStats ? stat : {}
              file.rel = rel
              self.map[rel] = file
              self.list.push(file)
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
        self.list.sort(function (a, b) {
          return a.rel < b.rel ? -1 : 1
        })
        self.emit('found', self.list)
        if (self.storeStats) {
          self.emit('stats', self.list)
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
  stat: function (path) {
    this.storeStats = true
    return this.find(path)
  },

  /**
   * Add files from a specified path, or from the root.
   *
   * @param  {String} path  An optional path.
   */
  add: function (path) {
    // Bind the content reader to the file event, but only bind it once.
    if (!this.readContents) {
      this.readContents = true
      this.on('file', this.read)
    }

    // Find files recursively.
    return this.find(path)
  },

  /**
   * Read the contents of a file.
   *
   * @param  {String} path  A file path.
   */
  read: function (path) {
    var self = this
    this.loadCounter++
    fs.readFile(path, function (error, content) {
      if (error) {
        self.emit('error', error)
      } else {
        var rel = self.relative(path)
        var file = self.map[rel]
        if (!file) {
          file = self.map[rel] = new File({rel: rel, load: self})
          self.list.push(file)
        }
        file.content = content
      }
      if (!--self.loadCounter) {
        self.emit('loaded', self.list)
      }
    })
    return this
  },

  /**
   * Get absolute paths of found files.
   */
  paths: function () {
    var list = this.list
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
  rels: function () {
    var list = this.list
    var length = list.length
    var paths = new Array(length)
    for (var i = 0; i < length; i++) {
      paths[i] = list[i].rel
    }
    return paths
  }
})

function slashify (path) {
  return path.replace(/\\/g, '/')
}
