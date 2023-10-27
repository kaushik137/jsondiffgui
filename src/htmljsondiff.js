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


/* async/await not supported by jshint */

/* jshint esversion: 6                                  */
/* exported helloval                                    */
/* global require:true */
/* global ViewModel:true, HtmltableView:true, setTableHandler:true */
/* experimental:  [asyncawait, asyncreqawait]  */

(function() {

async function get_delta_patched_jsons(basetxt, newtxt) {
  const json_diff=require('json-diff')
  const jqutils=require('./jqutils.js')
  var delta_lr=json_diff.diff(JSON.parse(basetxt, 'utf-8'), JSON.parse(newtxt,'utf-8'), {keepUnchangedValues: true, full: true } )
  var patched_lr=await jqutils.patch_delta( delta_lr)
  return patched_lr
}

async function generate_jsondiff_htmltable(basetxt, newtxt, toCompact=0) {
  var patched_jsons = await get_delta_patched_jsons(basetxt, newtxt)
  var viewmodel = new ViewModel(patched_jsons, toCompact)

  var view = new HtmltableView(viewmodel)
  setTableHandler(view)
  console.log("Number of Rows =", viewmodel.rowsRepr.length)

  viewmodel.recursive_collapse(1, "yes")
  viewmodel.collapse(1, "")
  view.redraw_node(1)

  return view.table
}

window.get_delta_patched_jsons = get_delta_patched_jsons
window.jsondiffgui={ generate_jsondiff_htmltable }


})()
