'use strict'

var TextStyle = require('../style/text')

var Text = module.exports = function(text, style, opts) {
  Text.super_.call(this, require('../pdf/nodes/text'))

  this.style    = new TextStyle(style, opts)
  this.children = []

  if (text) {
    this.add(text)
  }
}

require('../pdf/utils').inherits(Text, require('./base'))

var LineBreaker = require('linebreak')
var Word        = require('./word')
var LineBreak   = require('./linebreak')
var PageNumber  = require('./page-number')
var PageCount   = require('./page-count')

Text.prototype.add = function(str, opts, append) {
  var style     = this.style.merge(opts)
  var lastChild = this.children[this.children.length - 1]
  var appendTo  = append && lastChild.children ? lastChild : this

  str = String(str)

  var breaker = new LineBreaker(str)
  var last = 0, bk

  while ((bk = breaker.nextBreak())) {
    // get the string between the last break and this one
    var word = str.slice(last, bk.position)
    last = bk.position

    var linebreaks = 0
    while (!bk.required && word.match(/(\r\n|\n|\r)$/)) {
      word = word.replace(/(\r\n|\n|\r)$/, '')
      linebreaks++
    }

    // remove trailing whitespaces if white-space style is set to normal
    if (style.whiteSpace === 'normal') {
      word = word.replace(/^\s+/, '').replace(/\s+$/, '')
    }

    // remove newline characters
    if (bk.required) {
      word = word.replace(/(\r\n|\n|\r)/, '')
    }

    if (word.length) {
      appendTo.children.push(new Word(word, style))
    }

    appendTo = this

    // add linebreak
    if (bk.required) {
      this.children.push(new LineBreak(style))
    }

    // add trailing line breaks
    for (var i = 0; i < linebreaks; ++i) {
      this.children.push(new LineBreak(style))
    }
  }

  return this
}

Text.prototype.line = function(str, opts) {
  return this.add(str + '\n', opts)
}

Text.prototype.append = function(str, opts) {
  return this.add(str, opts, true)
}

Text.prototype.br = function() {
  this.children.push(new LineBreak(this.style))
  return this
}

Text.prototype.pageNumber = function(opts) {
  this.children.push(new PageNumber(this.style.merge(opts)))
  return this
}

Text.prototype.pageCount = function(opts) {
  this.children.push(new PageCount(this.style.merge(opts)))
  return this
}
