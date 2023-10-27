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
/* global HtmltableView:true, module:true, eventCommand:true */

(function() {
// in mac does altKey map to option key?
var eventCommandMaps = [
  { 'eventSpec' : { 'tagName' : 'TH', 'type' : 'click'                                     }, 'commandName' : 'toggle_collapse' },
  { 'eventSpec' : { 'tagName' : 'TH', 'type' : 'click', 'ctrlKey' : true                   }, 'commandName' : 'recursive_open' },
  { 'eventSpec' : { 'tagName' : 'TH', 'type' : 'click', 'ctrlKey' : true, 'altKey' : true  }, 'commandName' : 'recursive_collapse' },
  { 'eventSpec' : { 'tagName' : 'TD', 'type' : 'click'                                     }, 'commandName' : 'change_selected_index' },
  { 'eventSpec' : { 'tagName' : 'TD', 'type' : 'click',                   'altKey' : true  }, 'commandName' : 'scroll2selection' },

  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'p'  }, 'commandName' : 'prev_obj' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'n' }, 'commandName' : 'next_obj' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'Enter',      'ctrlKey' : true }, 'commandName' : 'recursive_open' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'Enter',      'ctrlKey' : true, 'altKey' : true }, 'commandName' : 'recursive_collapse' },

  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': '['                      }, 'commandName' : 'obj_open' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': ']'                      }, 'commandName' : 'obj_close' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'k'                      }, 'commandName' : 'prev_row' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'j'                      }, 'commandName' : 'next_row' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'ArrowLeft'              }, 'commandName' : 'prev_diff' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'ArrowRight'             }, 'commandName' : 'next_diff' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'Enter'                  }, 'commandName' : 'toggle_collapse' },
  { 'eventSpec' : { 'tagName' : 'TABLE', 'type' : 'keydown', 'key': 'Enter', 'altKey' : true }, 'commandName' : 'scroll2selection' },

]

function LOG() {
  return
}

eventCommand = function(event, target_view, inrowindex) {
  const default_false = (x => x === undefined ? false : x)
  const inEvent = event
  const compare_event = ( x =>
    ( inEvent.type                === x.eventSpec.type                    ) &&
    ( inEvent.currentTarget.tagName  === x.eventSpec.tagName                    ) &&
    ( inEvent.key                 === x.eventSpec.key                     ) &&
    ( inEvent.ctrlKey             === default_false(x.eventSpec.ctrlKey)  ) &&
    ( inEvent.altKey              === default_false(x.eventSpec.altKey)   ) &&
    ( inEvent.shiftKey            === default_false(x.eventSpec.shiftKey) )
  )

  this.cmdname = "" ; this.fn = null; this.params = null ; this.cmd_target = null

  var cmd_index = eventCommandMaps.findIndex(compare_event)
  console.log("eventCommand: event = ",event, "tagname = ", event.currentTarget.tagName, "index = ", cmd_index)
  if (cmd_index !== -1 && inrowindex) {
    var cmdEventSpec = eventCommandMaps[cmd_index]
    console.log("command = ", cmdEventSpec.commandName, "eventSpec = ", cmdEventSpec.eventSpec, "rowindex=", inrowindex)

    const cmdname = cmdEventSpec.commandName
    var cmdFn = HtmltableView.prototype.jsondiffguiCommands[cmdname]
    this.cmdname = cmdname; this.fn = cmdFn; this.params = { rowindex : inrowindex } ; this.cmd_target = target_view
    console.assert( typeof(this.fn) === "function", "eventCommand invalid function passed, this=", this)
  }

  return this
}

eventCommand.prototype.is_valid = function () {
  return this.cmdname && this.params && this.params.rowindex
}


eventCommand.prototype.Do = function () {
  LOG("eventCommand ", this)
  return this.cmd_target.execute(this)
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports={ eventCommand };
} else {
  window.eventCommand = eventCommand
}

})()


