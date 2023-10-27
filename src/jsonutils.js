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
/* global module:true, get_path_range:true, generate_diff:true */
/* experimental:  [asyncawait, asyncreqawait]  */


(function(){

function assert() { }

const _=require('lodash')

class LineRepr {
  constructor(path, length ) {
    this.path=path; this.length=length; // this.lastkey=lastkey
  }
  // first_term() { }
  // last_term() { }
  str(jo) {
    var path=this.path
    var obj = (path.length > 0 ) ? _.get(jo , path) : jo
    if (obj===undefined) return undefined
    assert ( (typeof(obj)==='object' || this.length===null), "length should be 1 for scalar paths")
    var val=obj
    var key=(path.length>=1) ? path[path.length-1] : ""
    if (typeof(obj)==='object') {
      if (this.length===null)
        val=JSON.stringify(obj)
      else {
        if (this.length>0)
          val=Array.isArray(obj) ? "[" : "{"
        else if (this.length<0)
          { val=Array.isArray(obj) ? "]" : "}" ; key="" }
        else
          assert(true, "this.length shouldn't be 1 for multiline paths")
      }
    }

    var indent="  ".repeat(path.length)
    key=(key==="" || Number.isInteger(Number(key))) ? "" : (key+": ") // Todo: Ideally check if parent is of type array
    return (val==="__deleted__") ? undefined : indent+key+val
  }
}

const is_key_integer = function (path) {
  const re_number = /^(0|[1-9]\d*)$/

  const node_key = path.at(-1)
  return node_key ? node_key.match(re_number) : null
}

function lodash_get(obj, path) {
  return path.length === 0 ? obj : _.get(obj, path)
}

const isPathSpecMultiline = function (jo, path) {
  "use strict";
  var multiline=0
  const toCompact = 0 // Compact feature to turn on if needed
  var obj = (path.length > 0 ) ? _.get(jo ,path) : jo
  if (typeof(obj)==='object') {
    if (!_.isEmpty(obj)) {
      multiline=1
      if (toCompact>=1 && Object.values(obj).every((x) => typeof(x)!=='object') )
        multiline=0
    }
  }
  return multiline
}

const get_linerepr_for_node = function (jo, node_path) {
  "use strict";
  var length=isPathSpecMultiline(jo, node_path) ? 1 : null
  var d={ path: node_path, length: length }

  return d
}

const next_key = function (inObj, par, inKey=null) {
    var obj = (par.length > 0 ) ? _.get(inObj ,par) : inObj

    var outKey=null
    if (typeof(obj)==='object') {
        var arr=Object.keys(obj)
        if (arr.length===0)
            outKey=null
        else if (inKey===null)
            outKey=arr[0]
        else {
            var i=arr.indexOf(String(inKey))
            assert( i>=0, `next_key: par=${par} inKey=${inKey} is invalid path` )
            outKey= (i>=0 && i<arr.length-1) ? arr[i+1] : null
        }
    }

    return outKey
}

const next_linerepr = function (inObj, line) {
  "use strict";
  if (line===null)
    return get_linerepr_for_node(inObj, [])

  var path=line.path, nLine=null
  if (line.length===null && path.length>0) {
      let nKey=next_key(inObj, path.slice(0,-1), path[path.length-1])
      path.pop()
      if (nKey)
          nLine=get_linerepr_for_node(inObj, path.concat([nKey]))
      else
          nLine={ path: path, length: -1 }
  } else {
    // assert( Object.keys(obj).length>0, "Fatal Error: when line.length!=null object can't be empty. Must have got atleast one key here")
    if (line.length>0) { // opening a brace for an object
      let nKey=next_key(inObj, path, null)
      assert( nKey, "Fatal Error: Must have got a key here")
      path.push(nKey)
      nLine=get_linerepr_for_node(inObj, path)
    } else { // line.length<0  -- closing a brace for some path
      if (path.length>0)
      {
        var nKey=next_key(inObj, path.slice(0,-1), path[path.length-1])
        path.pop()
        if (nKey)
            nLine=get_linerepr_for_node(inObj, path.concat([nKey]))
        else
            nLine={ path: path, length: -1 }
      }
    }
  }

  return nLine
}

const get_diffrepr_for_line = function (left, right, linerepr, par_row) {
    var lobj = (linerepr.path.length > 0 ) ? _.get(left,  linerepr.path) : left
    var robj = (linerepr.path.length > 0 ) ? _.get(right, linerepr.path) : right
    // ToAssert lobj && robj  !== undefined
    // Todo : why? we shouldnt force deleted paths to be single line always.
    if (lobj===undefined || lobj==="__deleted__" || robj===undefined || robj==="__deleted__" )
      linerepr.length=null

    var l=new LineRepr(linerepr.path, linerepr.length ).str(left)
    var r=new LineRepr(linerepr.path, linerepr.length ).str(right)

    // Todo: Handle replace of different object types
    var opcodes=[ "equal", "equal" ]
    assert( (l!==undefined || r!==undefined) , `FatalError: For path ${linerepr.path}, both left and right paths are missing`)
    if (l===undefined || l==="__deleted__") {
      opcodes=[ "empty", "insert" ]
      l=""
    }
    if (r===undefined || r==="__deleted__" ) {
      opcodes=[ "delete", "empty" ]
      r=""
    }

    if (l!=="" && r!=="" && l!==r)
      opcodes=[ "replace", "replace" ]

    var tree_unequal=null
    if (opcodes[0] === 'equal' && opcodes[1] === 'equal' && linerepr.length!==null && linerepr.length>=1) {
      // At the start of a vector field
      tree_unequal = _.isEqual( lobj, robj) ? 0 : 1
    }

    var actual_paths = [ "same", "same" ]
    actual_paths[0] = (lobj === "__deleted__") ? null : get_actual_paths(left, 0, linerepr, par_row)
    actual_paths[1] = (robj === "__deleted__") ? null : get_actual_paths(right, 1, linerepr, par_row)

    return { l : l, r: r, opcodes : opcodes, tree_unequal : tree_unequal, actual_paths: actual_paths }
}

get_path_range = function (lineIndex, len) {
  "use strict";
  if (len === null)
    return [ lineIndex, lineIndex]

  var offset = (len > 0) ? len-1 : len+1
  var startIndex, endIndex

  if (offset > 0) {
    // An object opening brace
    startIndex = lineIndex
    endIndex = lineIndex + offset
  } else {
    // An object closing brace
    endIndex = lineIndex
    startIndex = lineIndex + offset
  }

  return [ startIndex, endIndex ]
}

const get_path_length = function (Rows, path_index) {
  "use strict";
  var len = null
  var linerepr = Rows[path_index].linerepr

  if (linerepr.length !== null) {
    var areNegatives = function (x,y) { return (y*x < 0) ? true : false }
    var matchForCurRowPath = function (x) {
      return _.isEqual(x.linerepr.path,linerepr.path) && areNegatives(x.linerepr.length, linerepr.length)
    }

    var matchIndex = 1 + Rows.slice(1).findIndex(x => matchForCurRowPath(x) )
    if (linerepr.length > 0)
      len = matchIndex - path_index + 1
    else {
      len = path_index - matchIndex + 1
      len = (linerepr.length > 0) ? len : -len
    }
  }

  return len

}

const get_equal_sections = function (Rows, ctxtSize) {
  var isequal = (row => row.opcodes[0]==='equal' && row.opcodes[1]==='equal')
  var next_row = ( (start,fn) => { var i=Rows.slice(start).findIndex(fn); return (i===-1||start===null) ? null : start + i } )
  var is_notequal = (row => !isequal(row) )

  var r1=0, r2=0
  var equal_sections=[]
  var minSize=ctxtSize*2

  do
  {
    r1 = next_row(r2, isequal)
    r2 = next_row( is_notequal)

    if (r2===null || r2 - r1 >= minSize)
      equal_sections.push( [ r1, r2 ] )

  }
  while (r1!==null && r2!==null);

  return equal_sections
}

const get_actual_paths = function (left, a_path_ind, linerepr, par_row) {
  var ret_path = "same"
  if (par_row)
  {
    var parent_a_p = par_row.actual_paths[a_path_ind]
    if (parent_a_p === "same")
      parent_a_p = par_row.linerepr.path

    ret_path = JSON.parse(JSON.stringify(parent_a_p))
    ret_path.push(get_actual_key(left, linerepr.path) )
  }

  return ret_path
}

function get_actual_key(obj, path) {
  const del = "__deleted__"

  if (path.length === 0 ) return null
  var actual_key = path.at(-1)

  if (is_key_integer(path)) {
    var arr = lodash_get(obj, path.slice(0,-1))
    const index = Number(path.at(-1))
    var del_count = arr.slice(0,index).reduce( ((acc, val) => { return (val === del) ? ++acc : acc; } ), 0)
    const real_index = index - del_count
    actual_key = String(real_index)
  }

  return actual_key
}

const get_parent_index = function (rows, path) {
  if (path.length === 0) return null

  const parent = path.slice(0,-1)
  const fn = ( x => x.linerepr.length>0 && _.isEqual(x.linerepr.path, parent) )
  const ind = rows.findLastIndex(fn)
  console.assert( ind !== -1, "Parent node path not found")
  return ind
}


generate_diff = function (left,right, toCompact=0) { // jshint unused:false
  var linerepr=null
  var null_row={ linerepr: {path: null, length: null}, cells: [ 0, "", 0, "" ], opcodes: [ "equal", "equal" ] , actual_paths: ["same", "same"], is_collapsed : false, ancestor_collapsed : false }
  var Rows=[ null_row ]
  var prevline = [0,0]

  while (linerepr=next_linerepr(left, linerepr)) {
    var par_ind = get_parent_index(Rows, linerepr.path)
    var difrepr = get_diffrepr_for_line(left, right, linerepr, par_ind ? Rows[par_ind] : null)
    var row=JSON.parse(JSON.stringify(null_row))
    row.linerepr=linerepr
    row.cells[0]=prevline[0]+1
    row.cells[1]=difrepr.l
    row.cells[2]=prevline[1]+1
    row.cells[3]=difrepr.r
    if (row.cells[1])
      prevline[0] = row.cells[0]
    if (row.cells[3])
      prevline[1] = row.cells[2]
    row.opcodes[0]=difrepr.opcodes[0]
    row.opcodes[1]=difrepr.opcodes[1]
    row.actual_paths[0] = difrepr.actual_paths[0]
    row.actual_paths[1] = difrepr.actual_paths[1]
    row.tree_unequal=difrepr.tree_unequal
    Rows.push(JSON.parse(JSON.stringify(row)))
  }

  for (var i = 1; i < Rows.length; ++i) {
    Rows[i].linerepr.length = get_path_length( Rows, i )
  }

  return Rows
}



if (typeof module !== 'undefined' && module.exports) {
  module.exports={
  next_key,
  LineRepr,
  get_linerepr_for_node,
  next_linerepr,
  get_path_range,
  get_equal_sections,
  generate_diff,
  get_diffrepr_for_line
  };
} else {   // we're in a browser
  window.get_path_range = get_path_range;
  window.generate_diff = generate_diff;
}

})();

