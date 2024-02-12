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
/* global require:true */
/* global module:true */

(function(){
var patchArr='def patch_arrays($op): walk(if ( (type=="array" ) and (length == 2 ) and (.[0]==" " or.[0]=="-" or .[0]=="+" or .[0]=="~" )   ) then if ( .[0] == $op ) then "__deleted__" else .[1] end else . end ) ; '

var fixKeys='def fixKeys($tag): ["__added", "__deleted"] as $a | ( if $tag=="__old" then ($a|reverse) else $a end ) as [$x,$y] | with_entries( if (.key|endswith($y)) then .value|="__deleted__" else . end | .key|=rtrimstr($x)  | .key|=rtrimstr($y)) ; '

var patchObj=fixKeys + 'def patch_obj($tag): (.. | select(has($tag)?)  )|=.[$tag] | walk(if type=="object" then fixKeys($tag) else . end) ; '

/*
async function patch_delta(b12) {
  const jq = await require('jq-web')
  const _ = await require('lodash')

  async function patch_for_base(b12) {
    return jq.promised.json( b12, patchArr + patchObj +  'patch_arrays("+") | patch_obj("__old")' ).then( res => _.cloneDeep(res) ).catch(x => console.log("Err: ",x))
  }

  async function patch_for_new(b12) {
    return jq.promised.json( b12, patchArr + patchObj +  'patch_arrays("-") | patch_obj("__new")' ).then( res => _.cloneDeep(res) ).catch(x => console.log("Err: ",x))
  }

  var allRes = await Promise.all([ patch_for_base(b12), patch_for_new(b12)]);
  return { left: allRes[0], right: allRes[1] }
}
*/

async function patch_delta(b12) {
  const jq=require('jq-web')
  const _=require('lodash')

  var d = {}
  d.left  = await jq.promised.json( b12, patchArr + patchObj +  'patch_arrays("+") | patch_obj("__old")' ).then( res => _.cloneDeep(res) ).catch(x => console.log("Err: ",x))
  d.right = await jq.promised.json( b12, patchArr + patchObj +  'patch_arrays("-") | patch_obj("__new")' ).then( res => _.cloneDeep(res) ).catch(x => console.log("Err: ",x))

  return d
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports={
  patch_delta
  };
} else {   // we're in a browser
  window.patch_delta = patch_delta;
}

})();
