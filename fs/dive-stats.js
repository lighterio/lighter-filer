/**
 * Dive into a directory, and call back with an array of fs.lstat results,
 * with a path property added to each.
 *
 * @origin https://github.com/lighterio/lighter-common/common/fs/dive-stats.js
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
        stat.path = path
        list.push(stat)
        if (stat.isDirectory()) {
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
    list.sort(function (a, b) {
      return a.path > b.path ? 1 : -1
    })
    fn(list)
  }
}
