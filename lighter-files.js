'use strict'
/**
 * Dive asynchronously into a path, and call back with an array of paths
 * that exist under it. Indicate directories with trailing slashes, and omit
 * symbolic links.
 *
 * Events:
 *   "file" is emitted when a new file is found.
 *   "dir" is emitted when a new directory is found.
 *   "content" is emitted when a file's content has been read.
 *   "found" when a locations are completely found.
 *   "loaded" when locations are completely loaded.
 */

var fs = require('fs')
var Flagger = require('lighter-flagger')
module.exports = Flagger.extend({

  init: function Files (root) {
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
  relative: function (path) {
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
  find: function (path) {
    var self = this
    var wait = 0
    path = self.absolute(path || self.root)
    getStat(path)
    function getStat (path) {
      wait++
      fs.lstat(path, function (error, stat) {
        if (!error) {
          if (stat.isSymbolicLink()) {
            getLink(path)
          } else if (stat.isDirectory()) {
            getDir(path)
            self.dirs.push(path)
            self.emit('dir', path)
          } else {
            var file = self.storeStats ? stat : {}
            file.path = path
            self.map[path] = file
            self.list.push(file)
            self.emit('file', path)
          }
        }
        done()
      })
    }
    function getLink (path) {
      wait++
      fs.readlink(path, function (error, link) {
        if (!error) {
          if (!self.map[link]) {
            self.map[link] = path
            getDir(path)
          }
        }
        done()
      })
    }
    function getDir (path) {
      wait++
      fs.readdir(path, function (error, files) {
        if (!error) {
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
          return a.path < b.path ? -1 : 1
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
   * Load files from a specified path, or from the root.
   *
   * @param  {String} path  An optional path.
   */
  load: function (path) {
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
  read: function (path) {
    var self = this
    self.loadCounter++
    fs.readFile(path, function (error, content) {
      if (!error) {
        var file = self.map[path]
        if (!file) {
          file = self.map[path] = {path: path}
          self.list.push(file)
        }
        file.content = content
      }
      if (!--self.loadCounter) {
        self.emit('loaded', self.list)
      }
    })
    return this
  }
})
