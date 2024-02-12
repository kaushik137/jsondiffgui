/*
@license

jsondiffgui:
jsondiffgui Copyright (c) 2023 Kaushik Sundararajan
https://github.com/kaushik137/jsondiffgui.git
jsondiffgui released under MIT license
Based on jq-web, json-diff, jsdifflib
    jq-web:
        https://github.com/fiatjaf/jq-web.git
        Copyright (c) 2019 fiatjaf <fiatjaf@gmail.com>
        license: ISC

        used to transform json objects
    json-diff:
        https://github.com/andreyvit/json-diff.git
        Copyright (c) 2015 Andrey Tarantsov
        license: MIT

        used to compute a diff of two jsons
    jsdifflib v1.0:
        <http://snowtide.com/jsdifflib>
        Copyright (c) 2007, Snowtide Informatics Systems, Inc.
        license: BSD

        Three functions celt, telt, ctelt are used in jsondiffgui source


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
/* jshint  curly:false                                  */
/* jshint  undef:true                                  */
/* exported diffviewcss                                    */
/* global require:true */
/* global celt:true, telt:true, ctelt:true  */
/* global innerWidth:true, innerHeight:true */
/* experimental:  [asyncawait, asyncreqawait]  */

(function() {
let diffviewcss = require("../../../3rdparty/jsdifflib/diffview.css");

( { celt, telt, ctelt } = require('../../../3rdparty/jsdifflib/htmlelem.js') );



function create_row(rowrepr) {
    var row = document.createElement("tr")

    function create_cell(num, text, op) {
      if (op==="empty") {
        row.appendChild(document.createElement("th"));
        row.appendChild(celt("td", "empty"));
      } else {
        row.appendChild(telt("th", num.toString()));
        row.appendChild(ctelt("td", op, String(text))); // .replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")
      }
    }

    create_cell(rowrepr.cells[0], rowrepr.cells[1], rowrepr.opcodes[0])
    create_cell(rowrepr.cells[2], rowrepr.cells[3], rowrepr.opcodes[1])

    return row
}

const create_table = function (RowsRepr) {
    var baseTextName="base"
    var newTextName="new"

    var table = celt("table", "diff" );
    var thead = document.createElement("thead");

    var headrow = document.createElement("tr");
    headrow.appendChild(document.createElement("th"));
    headrow.appendChild(ctelt("th", "texttitle", baseTextName));
    headrow.appendChild(document.createElement("th"));
    headrow.appendChild(ctelt("th", "texttitle", newTextName));

    var tbody=document.createElement("tbody");

    table.appendChild(thead)
    thead.appendChild(headrow)
    table.appendChild(tbody)

    const re_number = /^(0|[1-9]\d*)$/
    var arr_notation=function(x) { var m=x.match(re_number); return m ? "["+m[0]+"]" : "."+x }

    for (var i=1; i< RowsRepr.length ; ++i) {
      var xrow=create_row(RowsRepr[i])
      //const tooltip = RowsRepr[i].linerepr.path.map(arr_notation).join('')
      const row = RowsRepr[i]
      var fn = (x => x === "same" ? row.linerepr.path : x)

      var apath = fn(row.actual_paths[0])
      xrow.cells[0].title = apath ? apath.map(arr_notation).join('') : null
      apath = fn(row.actual_paths[1])
      xrow.cells[2].title = apath ? apath.map(arr_notation).join('') : null

      tbody.insertBefore(xrow, null); // if 2nd arg is null will be appended, i.e inserted at the end
    }

    return table
}


function isElementInView(elem) {
  var vw=Math.max( innerWidth || 0, document.documentElement.clientWidth)
  var vh=Math.max( innerHeight || 0, document.documentElement.clientHeight)

  var rect = elem.getBoundingClientRect()
  return (rect.top >= 0 && rect.left >= 0 && rect.bottom > 0 && rect.right > 0 && rect.bottom < vh && rect.right < vw)

}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { create_table, isElementInView }
} else {   // we're in a browser
  window.create_table = create_table
  window.isElementInView = isElementInView
}



})()
