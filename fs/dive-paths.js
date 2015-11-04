/**
 * Dive asynchronously into a path, and call back with an array of paths
 * that exist under it. Indicate directories with trailing slashes, and omit
 * symbolic links.
 *
 * @origin https://github.com/lighterio/lighter-common/common/fs/dive-paths.js
 * @version 0.0.1
 */

var fs = require('fs')

var dive = module.exports = function (path, fn) {
  var list = []
  var wait = 0
  got(path)
  function got (path) {
    wait++
    fs.lstat(path, function (error, stat) {
      if (!error) {
        if (stat.isFile()) {
          list.push(path)
        }
        if (stat.isDirectory()) {
          list.push(path + '/')
          wait++
          fs.readdir(path, function (error, files) {
            if (!error) {
              files.forEach(function (file) {
                got(path + '/' + file)
              })
            }
            if (!--wait) done()
          })
        }
      }
      if (!--wait) done()
    })
  }
  function done () {
    list.sort()
    fn(list)
  }
}
