'use strict'

var PDFObject = require('./objects/object')
var PDFArray  = require('./objects/array')

var Page  = require('./page')
var utils = require('./utils')

var Pages = module.exports = function(document) {
  PDFObject.call(this, 'Pages')

  this.document = document

  this.pages = []
  this.kids  = new PDFArray()

  this.prop('MediaBox', new PDFArray([
    0, 0,
    this.document.style.width,
    this.document.style.height
  ]))
  this.prop('Kids',     this.kids)
  this.prop('Count',    this.kids.length)
}

utils.inherits(Pages, PDFObject)

Pages.prototype.createPage = function() {
  var offset = this.document.style.height
    - (this.document.style.paddingTop || this.document.style.padding || 0) * 2
    - (this.document.style.paddingBottom || this.document.style.padding || 0)

  var page = new Page(this, this.pages.length * offset)

  this.pages.push(page)
  this.kids.push(page.toReference())
  this.prop('Count', this.kids.length)

  // this.doc.subsets.forEach(function(subset) {
  //   subset.addTo(page)
  // })

  return page
}

Pages.prototype.embed = function(doc) {
  doc.addObject(this)

  this.pages.forEach(function(page) {
    page.embed(doc)
  })
}