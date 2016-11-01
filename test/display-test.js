'use strict'
/* global describe it is mock unmock */

var Load = require('../lighter-load')

describe('Load.prototype.display', function () {
  it('works in a sub directory', function () {
    var load = new Load()
    var display = load.display(__filename)
    is(display, './test/display-test.js')
  })

  it('works for unrelated paths', function () {
    var load = new Load()
    var display = load.display('/tmp/blah.js')
    is(display, '/tmp/blah.js')
  })

  it('works after chdir', function () {
    var load = new Load(__dirname)
    var display = load.display(__filename)
    is(display, './display-test.js')
  })

  it('works for a parent directory', function () {
    var load = new Load(__dirname)
    var readme = __dirname.replace(/test$/, 'README.md')
    var display = load.display(readme)
    is(display, '../README.md')
  })

  it('works for the home directory', function () {
    mock(process.env, {
      HOME: '/Users/me'
    })
    var load = new Load()
    var display = load.display('/Users/me/profile')
    is(display, '~/profile')
    unmock(process.env)
  })

  it('works for the home directory on Windows', function () {
    mock(process.env, {
      HOME: '',
      USERPROFILE: 'C:\\Users\\me'
    })
    var load = new Load()
    var display = load.display('C:\\Users\\me\\profile')
    is(display, '~/profile')
    unmock(process.env)
  })
})
