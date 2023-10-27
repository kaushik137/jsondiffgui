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
/* jshint  curly:false                                  */
/* exported helloval                                    */
/* global isElementInView:true, eventCommand:true, create_table:true, JsondiffView:true, HtmltableView:true, module:true */
/* experimental:  [asyncawait, asyncreqawait]  */


(function() {

HtmltableView = function (viewmodel) {
  this.viewmodel = viewmodel
  this.table = create_table(viewmodel.rowsRepr)
  this.change_selected_index(1)
  return this
}

HtmltableView.prototype = JsondiffView.prototype

HtmltableView.prototype.scroll2index = function (index, flag_scroll2top) {
  const nearby_index = flag_scroll2top ? this.viewmodel.prev_row(index) : this.viewmodel.next_row(index)
  const nearby_elem = this.table.rows[nearby_index]
  nearby_elem.scrollIntoView(flag_scroll2top)
}

HtmltableView.prototype.scroll2selection = function() {
  return this.cur_selected_index
}

HtmltableView.prototype.jsondiffguiCommands.scroll2selection = HtmltableView.prototype.scroll2selection

HtmltableView.prototype.change_selected_index = function(index) {
  console.assert( !this.viewmodel.is_hidden(index) )
  if (this.cur_selected_index)
    this.table.rows[this.cur_selected_index].style.outline = ""

  this.cur_selected_index = index
  this.table.rows[this.cur_selected_index].style.outline = "#FF5500 double"
  return null
}

HtmltableView.prototype.jsondiffguiCommands.change_selected_index = HtmltableView.prototype.change_selected_index


HtmltableView.prototype.handleEvent = function (event, row_index)
{
    // row_index will be null when called from handler for 'TABLE'
    // (event.type==="keydown" && event.currentTarget.tagName==="TABLE")
    var cmdObj = new eventCommand(event, this, row_index ? row_index : this.cur_selected_index)

    const previndex = this.cur_selected_index
    // In future, the command target may be different from 'this'
    // var newindex = cmdObj ? cmdObj.cmd_target.execute(cmdObj) : null
    var newindex = cmdObj.is_valid() ? cmdObj.Do() : null
    console.log("cmd returned newindex = ", newindex, "cur selected index = ", this.cur_selected_index)

    if (newindex) {
      console.assert(newindex !== -1, "eventCommand ", cmdObj.cmdname, "returned index -1" )
      var ancestor_node = newindex
      if (this.viewmodel.is_hidden(newindex))
        ancestor_node = this.viewmodel.expand_to_node(newindex)

      this.redraw_node(ancestor_node)
      if (newindex !== row_index)
        this.change_selected_index( newindex )

      var elem = this.table.rows[newindex]
      if (!isElementInView(elem)) {
        const flag_scroll2top = (newindex > previndex) ? true : false
        this.scroll2index(newindex, flag_scroll2top)
      }

    }

}

function add_class_if_tree_unequal(table, row_index, cellindex, tree_is_unequal) {
  if (tree_is_unequal)
    table.rows[row_index].cells[cellindex].classList.add('tree_unequal')
  else
    table.rows[row_index].cells[cellindex].classList.remove('tree_unequal')
}

HtmltableView.prototype.redraw_node = function(ind) {
  const viewmodel = this.viewmodel
  const table = this.table

  var range = viewmodel.get_node_range(ind)
  for (var i = range[0]; i <= range[1]; ++i) {
    var cur_row = table.rows[i]
    cur_row.style.display = viewmodel.is_hidden(i) ? 'none' : 'table-row'

    const celltexts = viewmodel.get_row_cells(i)
    cur_row.cells[0].innerHTML = celltexts[0]
    cur_row.cells[1].innerHTML = celltexts[1]
    cur_row.cells[2].innerHTML = celltexts[2]
    cur_row.cells[3].innerHTML = celltexts[3]

    const tree_is_unequal = viewmodel.is_collapsed(i) && viewmodel.is_tree_unequal(i)
    add_class_if_tree_unequal(table, i, 1, tree_is_unequal )
    add_class_if_tree_unequal(table, i, 3, tree_is_unequal )
  }

}

HtmltableView.prototype.execute = function(cmdobj) {
  return cmdobj.fn.call(this, cmdobj.params.rowindex)
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports={ HtmltableView };
} else {   // we're in a browser
  window.HtmltableView = HtmltableView
}

})()
