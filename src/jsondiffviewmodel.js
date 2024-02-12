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
/* global require:true */
/* experimental:  [asyncawait, asyncreqawait]  */

(function(){

const _=require('lodash');
( { get_path_range, generate_diff } = require('./jsonutils.js') );

function LOG() { return ; }

const is_different = r => r.opcodes.some( x=> x!=='equal' && x!=='tree_unequal')

const JsondiffViewModel = function (json_deltas, toCompact=0) {
  this.json_deltas = json_deltas
  this.rowsRepr = generate_diff(json_deltas.left, json_deltas.right, toCompact)
  this.current_selected_index = 0

  return this
}

JsondiffViewModel.prototype._RRPath = function (i)      { return this.rowsRepr[i].linerepr.path   }

JsondiffViewModel.prototype._RRLen = function (i)       { return this.rowsRepr[i].linerepr.length }

JsondiffViewModel.prototype._RRFind = function (fn, i=0, j=null) {
  j = j || this.rowsRepr.length
  var next = this.rowsRepr.slice(i,j).findIndex(fn)
  return (next === -1 ) ? -1 : i+next
}

JsondiffViewModel.prototype._RRFindLastIndex = function (fn, i=0, j=null) {
  j = j || this.rowsRepr.length
  var next = this.rowsRepr.slice(i,j).findLastIndex(fn)
  return (next === -1 ) ? -1 : i+next
}

JsondiffViewModel.prototype.is_collapsed = function (index) {
  return this.rowsRepr[index].is_collapsed
}

JsondiffViewModel.prototype.is_ancestor_collapsed = function (index) {
  return this.rowsRepr[index].ancestor_collapsed
}

JsondiffViewModel.prototype.is_hidden = function (index) {
    // or hidden_from_diff due to diff context (in future)
    return this.is_ancestor_collapsed(index)
}

JsondiffViewModel.prototype.is_tree_unequal = function (index) {
  return this.rowsRepr[index].tree_unequal
}


JsondiffViewModel.prototype.get_node_range = function (index) {
  return get_path_range(index, this._RRLen(index) )
}

JsondiffViewModel.prototype.get_row_cells = function (index) {
  return this.rowsRepr[index].cells
}

JsondiffViewModel.prototype.expand_to_node = function (index) {
  var path = this._RRPath(index)
    const line_matches_path = function (inPath) {
      return ( x => x.linerepr.length>0 && _.isEqual(x.linerepr.path, inPath) )
    }

  var paths_to_update = []
  for (var i = 0; i <= path.length-1; ++i) {
    var ancestor_path = path.slice(0,i)

    // var ancestor_index = this._RRFind( x => x.linerepr.length>0 && _.isEqual(x.linerepr.path, ancestor_path) )
    var ancestor_index = this._RRFind( line_matches_path(ancestor_path) )

    console.assert( ancestor_index !== -1 , "expand to node: ancestor_index!=-1 "+ancestor_index)
    if (this.rowsRepr[ancestor_index].is_collapsed) {
      this.collapse(ancestor_index, false)
      paths_to_update.push(ancestor_index)
    }
  }

  LOG("expand to node: paths to update", paths_to_update)
  return  paths_to_update[0]
}

JsondiffViewModel.prototype.set_collapsedtext = function (index, objIndex, toCollapse) {
  var cellIndex = (objIndex*2) + 1
  var celltext = this.rowsRepr[index].cells[cellIndex]
  var replaced_text = celltext

  const re_collapsed = /^ *@.*\.\.\.$/
  const re_number = /^(0|[1-9]\d*)$/

  var cur_row = this.rowsRepr[index]
  var fn = (x => x === "same" ? cur_row.linerepr.path : x)

  // Todo: assuming no multiline when deleted. actual_paths may be null otherwise
  const thepath = fn(cur_row.actual_paths[objIndex])
  const node_key = thepath.at(-1)
  const node_key_isArrayIndex = node_key ? node_key.match(re_number) : null

  if (toCollapse && !celltext.match(re_collapsed) ) {
      if (node_key_isArrayIndex)
        replaced_text = celltext.replace(/^( *)(.*)/,"$1"+"@["+node_key+"] $2"+"...")
      else
        replaced_text = celltext.replace(/^( *)(.*)/,"$1"+"@"+"$2"+"...")
  }
  else if (!toCollapse && celltext.match(re_collapsed) ) {
      if (node_key_isArrayIndex)
        replaced_text = celltext.replace(/^(.*)@\[\d+\] (.*)\.\.\./,"$1"+"$2");
      else
        replaced_text = celltext.replace(/^(.*)@(.*)\.\.\./,"$1"+"$2");
  }

  this.rowsRepr[index].cells[cellIndex] = replaced_text
}

JsondiffViewModel.prototype.collapse = function (index, toCollapse) {
  var range = this.get_node_range(index)
  var startIndex = range[0], endIndex = range[1]

  if (toCollapse === "flip")
    toCollapse = !this.rowsRepr[index].is_collapsed

  this.rowsRepr[startIndex].is_collapsed = toCollapse ? true : false
  this.rowsRepr[endIndex].is_collapsed   = toCollapse ? true : false

  if (toCollapse) {
    for (let i = startIndex+1; i < endIndex; i++) {
      this.rowsRepr[i].ancestor_collapsed = true
    }
  } else {
      let i=startIndex+1
      while (i < endIndex) {
        var node_length = this._RRLen(i)
        // set ancestor_collapsed stated for both start and end for a node that span multiple lines
        // if on a node spanning multiple lines, the end brace occurs at [i+ node_length - 1]
        // Also skip so many rows so that collapse state is not changed, since we are not opening recursively
        this.rowsRepr[i].ancestor_collapsed = false
        if (node_length !== null && node_length > 0) {
          this.rowsRepr[i + node_length -1].ancestor_collapsed = false
          if (this.rowsRepr[i].is_collapsed)
            i += node_length - 1
        }
        i = i + 1
      }
  }

  this.update_collapsedtext(startIndex)
  return startIndex
}

JsondiffViewModel.prototype.recursive_collapse = function (rowIndex, toCollapse) {
  var range = this.get_node_range( rowIndex)
  var startIndex = range[0], endIndex = range[1]

  this.rowsRepr[startIndex].is_collapsed = toCollapse ? true : false // for row with opening brace
  this.rowsRepr[endIndex].is_collapsed   = toCollapse ? true : false // for row with closing brace

  for(var i = startIndex+1; i < endIndex; ++i) {
    var node_length = this._RRLen(i)

    this.rowsRepr[i].ancestor_collapsed = toCollapse
    if (node_length !== null && node_length > 0) {
      this.rowsRepr[i].is_collapsed = toCollapse
      this.rowsRepr[i+node_length-1].is_collapsed = toCollapse
    }
  }

  this.update_collapsedtext(startIndex)
  return startIndex
}

JsondiffViewModel.prototype.prev_diff = function (i) {
  const maxindex = this.rowsRepr.length - 1
  var index = i<=1 ? maxindex : i-1

  var next = this._RRFindLastIndex(is_different, 0, index+1)
  if (next === -1) {
    next = this._RRFindLastIndex(is_different, index)
  }
  return next
}

JsondiffViewModel.prototype.next_diff = function (i) {
  const maxindex = this.rowsRepr.length - 1
  var index = i>=maxindex ? 1 : i+1

  var next = this._RRFind(is_different, index)
  if (next === -1) {
    next = this._RRFind(is_different, 1)
  }

  return next
}

JsondiffViewModel.prototype.prev_row = function(rowIndex) {
  if (rowIndex<=1)
    return 1

  for (var i = rowIndex-1; i>1; --i) {
    if (!this.is_hidden(i))
      break
  }

  return i
}

JsondiffViewModel.prototype.next_row = function(rowIndex) {
  const maxlen = this.rowsRepr.length-1
  if (rowIndex>=maxlen)
    return maxlen

  for (var i = rowIndex+1; i<maxlen-1; ++i) {
    if (!this.is_hidden(i))
      break
  }
  return i

}

JsondiffViewModel.prototype.prev_obj = function(rowIndex) {
  var len = this._RRLen(rowIndex)
  var path = this._RRPath(rowIndex)

  if (len > 0) {
    rowIndex = this._RRFind( x => x.linerepr.length>0 && _.isEqual(x.linerepr.path, path ) )
    path = this._RRPath(rowIndex)
  }
  console.assert( rowIndex !== -1, "path for object start not found" )

  var nextind = this._RRFindLastIndex( x => x.linerepr.length!==null && x.linerepr.length>0 && x.linerepr.path.length<=path.length , 0, rowIndex)

  return nextind === -1 ? 1 : nextind
}

JsondiffViewModel.prototype.next_obj = function(rowIndex) {
  var len = this._RRLen(rowIndex)
  var path = this._RRPath(rowIndex)

  if (len > 0)
    rowIndex = this._RRFind( x => x.linerepr.length<0 && _.isEqual(x.linerepr.path, path ) )

  console.assert( rowIndex !== -1, "path for object closing brace not found")

  var nextind = this._RRFind( x => x.linerepr.length!==null && x.linerepr.length>0 , rowIndex+1)

  return nextind === -1 ? this.rowsRepr.length-1 : nextind
}


JsondiffViewModel.prototype.obj_open = function(rowIndex) {
  var parent = this._RRPath(rowIndex).slice(0,-1)
  return this._RRFind( x => _.isEqual(x.linerepr.path, parent) )
}

JsondiffViewModel.prototype.obj_close = function(rowIndex) {
  var parent = this._RRPath(rowIndex).slice(0,-1)
  return this._RRFind( x => x.linerepr.length<0 && _.isEqual(x.linerepr.path, parent) )
}


JsondiffViewModel.prototype.update_collapsedtext = function (index) {
  var range = this.get_node_range(index)
  var start = range[0], end = range[1]
  for (var i = start; i <= end; i++) {
    var node_length = this._RRLen(i)
    if (node_length &&  (node_length>0) ) {
        var toCollapse = this.rowsRepr[i].is_collapsed
        this.set_collapsedtext(i, 0, toCollapse)
        this.set_collapsedtext(i, 1, toCollapse)
    }
  }
}



if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsondiffViewModel;
} else {   // we're in a browser
  window.JsondiffViewModel = JsondiffViewModel;
}

})();



