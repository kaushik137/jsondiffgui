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

(function() {

function process_event(src, event, theview, row_index) {
  return theview.handleEvent(event, row_index)
}

function onclick_td_handler(theview, row) {
  return function(event) { return process_event(this, event, theview, row.rowIndex) }
}

function onclick_th_handler(theview, row) {
  return function(event) { return process_event(this, event, theview, row.rowIndex) }
}

function keydown_table_handler(theview) {
  return function(event) { return process_event(this, event, theview, null) }
}

function setTableHandler(theview) {
  var table = theview.table
  var rows = table.getElementsByTagName("tr");
  table.addEventListener('keydown', keydown_table_handler(theview) )
  table.tabIndex = 0

  table.onfocus = function(e) { this.style.outline="#0E0 ridge" ; } // jshint unused:false
  table.onblur  = function(e) { this.style.outline="" ; } // jshint unused:false
    // Todo: reset it to old value?

  for (var i = 1; i < rows.length; i++) {
    var row = table.rows[i];
    row.cells[0].onclick = onclick_th_handler(theview, row);
    row.cells[2].onclick = onclick_th_handler(theview, row);
    row.cells[1].onclick = onclick_td_handler(theview, row);
    row.cells[3].onclick = onclick_td_handler(theview, row);
    // reset_state_for_row(row)
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setTableHandler }
} else {   // we're in a browser
  window.setTableHandler = setTableHandler
}



})()

