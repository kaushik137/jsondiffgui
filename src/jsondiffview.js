/*

jsondiffgui:
jsondiffgui Copyright (c) 2023 Kaushik Sundararajan
https://github.com/kaushik137/jsondiffgui.git
The MIT License (MIT)

Copyright (c) 2023 Kaushik Sundararajan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/* jshint esversion: 6                                  */
/* jshint  undef:true                                  */
/* global module:true, JsondiffView:true */
/* experimental:  [asyncawait, asyncreqawait]  */

(function() {

jsondiffgui = { version: 1.0  }

let JsondiffView = function () {  }

JsondiffView.prototype.scroll2selection = null

JsondiffView.prototype.change_selected_index = null

JsondiffView.prototype.recursive_collapse = function(row_index) {
  const toCollapse = true
  return this.viewmodel.recursive_collapse(row_index, toCollapse)
}

JsondiffView.prototype.recursive_open = function(row_index) {
  const toCollapse = false
  return this.viewmodel.recursive_collapse(row_index, toCollapse)
}

JsondiffView.prototype.toggle_collapse = function(row_index) {
  return this.viewmodel.collapse(row_index, "flip")
}

JsondiffView.prototype.prev_row = function(row_index) {
  return this.viewmodel.prev_row(row_index)
}

JsondiffView.prototype.next_row = function(row_index) {
  return this.viewmodel.next_row(row_index)
}

JsondiffView.prototype.prev_obj = function(row_index) {
  return this.viewmodel.prev_obj(row_index)
}

JsondiffView.prototype.next_obj = function(row_index) {
  return this.viewmodel.next_obj(row_index)
}

JsondiffView.prototype.prev_diff = function(row_index) {
  return this.viewmodel.prev_diff(row_index)
}

JsondiffView.prototype.next_diff = function(row_index) {
  return this.viewmodel.next_diff(row_index)
}

JsondiffView.prototype.obj_open = function(row_index) {
  return this.viewmodel.obj_open(row_index)
}

JsondiffView.prototype.obj_close = function(row_index) {
  return this.viewmodel.obj_close(row_index)
}

JsondiffView.prototype.handleEvent = function (event) { // jshint unused:false
  return
}

JsondiffView.prototype.redraw_node = function (index) { // jshint unused:false
  return
}


JsondiffView.prototype.jsondiffguiCommands = {
  "scroll2selection" : JsondiffView.prototype.scroll2selection,
  "change_selected_index" : JsondiffView.prototype.change_selected_index,
  "recursive_collapse" : JsondiffView.prototype.recursive_collapse,
  "recursive_open" : JsondiffView.prototype.recursive_open,
  "toggle_collapse" : JsondiffView.prototype.toggle_collapse,
  "prev_row" : JsondiffView.prototype.prev_row,
  "next_row" : JsondiffView.prototype.next_row,
  "prev_obj" : JsondiffView.prototype.prev_obj,
  "next_obj" : JsondiffView.prototype.next_obj,
  "prev_diff" : JsondiffView.prototype.prev_diff,
  "next_diff" : JsondiffView.prototype.next_diff,
  "obj_open" : JsondiffView.prototype.obj_open,
  "obj_close" : JsondiffView.prototype.obj_close
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsondiffView
} else {
  window.JsondiffView = JsondiffView
}


})()


