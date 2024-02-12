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
/* jshint  curly:false                                  */
/* global require:true */
/* global JsondiffViewModel:true, module:true, process:true */
/* experimental:  [asyncawait, asyncreqawait]  */



(function() {

( JsondiffView = require('../../jsondiffview.js') );
( JsondiffViewModel    = require('../../jsondiffviewmodel.js') );
( JsonDelta    = require('../../jsondelta.js') );
( { generate_diff } = require('../../jsonutils.js') );


let TextView = function (json_delta, toCompact=0) {
  this.viewmodel = new JsondiffViewModel(json_delta, toCompact)
  // this.change_selected_index(1)
  // setTableHandler(this)

  // this.recursive_collapse(1)
  // this.toggle_collapse(1)
  // this.redraw_node(1)

  return this
}

TextView.prototype = JsondiffView.prototype


TextView.prototype.create_textTable = function (textcellLen=50) {
  const get_diff_marks=function (opcodes) {
    let diffmarks=[ "~", "~" ]

    if (opcodes[0]==="equal" && opcodes[1]==="equal")
      diffmarks=[ " ", " " ]
    if (opcodes[0]==="replace" && opcodes[1]==="replace")
      diffmarks=[ "~", "~" ]
    else if (opcodes[0]==="empty" && opcodes[1]==="insert")
      diffmarks=[ "-", "+" ]
    else if (opcodes[0]==="delete" && opcodes[1]==="empty")
      diffmarks=[ "+", "-" ]
    return diffmarks
  }

  var Rows = [ [ "","","",""]   ]
  const lineNumWidth = 5
  const rowsrepr = this.viewmodel.rowsRepr

  for (var i = 1; i < rowsrepr.length; ++i) {
    // if (this.viewmodel.is_hidden(i))
    //     continue;

    const cur_row=rowsrepr[i]
    let diffmarks=get_diff_marks(cur_row.opcodes)
    let cells=[ "0", "", "0", "" ]
    if (cur_row.opcodes[0]==='empty')
      cells[0]=diffmarks[0]+" ".padEnd(textcellLen+lineNumWidth," ")
    else {
      cells[0]=diffmarks[0]+String(cur_row.cells[0]).padEnd(lineNumWidth," ")
      cells[1]=cur_row.cells[1].padEnd(textcellLen," ").slice(0,textcellLen)
    }
    if (cur_row.opcodes[1]==='empty')
      cells[2]=diffmarks[1]+" ".padEnd(textcellLen+lineNumWidth," ")
    else {
      cells[2]=diffmarks[1]+String(cur_row.cells[2]).padEnd(lineNumWidth," ")
      cells[3]=cur_row.cells[3].padEnd(textcellLen," ").slice(0,textcellLen)
    }

    Rows.push(JSON.parse(JSON.stringify(cells)))
  }

  return { rows : Rows }
}




TextView.prototype.show = function (len) {
  const textcellLen = len ? Number(len) : 50
  table = this.create_textTable(Number(textcellLen))
  for (var i = 1; i < table.rows.length; ++i) {
    let cells=table.rows[i]
    let line=cells[0]+cells[1]+"|"+cells[2]+cells[3]
    console.log(line)
  }

}

module.exports=TextView;

})();
