#!/usr/bin/env node
// require('../lib/cli')(process.argv.slice(2));

function Usage() {
  const help = `Usage: jsondiffgui {OPTIONS} first.json second.json
  Options:
    -h, --help                   show this help
    -t, --view-types             list all the existing view classes and how to use them.
    -s, --show-view <ViewClass>  display the view specified by the <ViewClass>
                                    eg, --show-view TextView first.json second.json

    -m, --view-model             output to console a json representation of jsondiffgui's view model.
                                    eg, --view-model first.json second.json
                                 Can be used by external external GUI applications to implement their own views. Refer HtmltableView
                                 use jq to pretty print the output. try - jq -c '.[]'
                `

//    -d, --delta               output to console a diff of the two jsons in the form of a json object. This can be used by external GUI programs to show the diff. Refer HtmltableView
//                              eg, --delta first.json second.json

  console.log(help)
}


async function get_jsonfiles_delta(file1, file2) {
  const text1=fs.readFileSync(file1, 'utf-8')
  const text2=fs.readFileSync(file2, 'utf-8')
  return JsonDelta(text1, text2)
}


const fs = require('fs');
const JsonDelta = require('../src/jsondelta.js');
const TextView  = require('../src/Views/TextView/textview.js');
const JsondiffViewModel    = require('../src/jsondiffviewmodel.js');

const { parseArgs }  = require('node:util')
const options = {
                  'help'       : { type: 'boolean', short: 'h' },
                  'view-types' : { type: 'boolean', short: 't' },
                  'show-view'  : { type: 'string',  short: 's' },
                  'width'      : { type: 'string',  short: 'w' },
                  'delta'      : { type: 'boolean', short: 'd' },
                  'view-model' : { type: 'boolean', short: 'm' }
                };

const Args = parseArgs( { options, allowPositionals: true, args : process.argv } )

const file1 = Args.positionals[2]
const file2 = Args.positionals[3]


if (Args.values.help) {
  Usage()
} else if (Args.values["view-types"]) {
  console.log(`TextView:
          jsondiffgui --show-view TextView --width=75 file1.json file2.json

HtmltableView:
          Can be used only in browser. Refer demo/HtmltableView`);
} else if (Args.values["show-view"]) {
  if (Args.values["show-view"] === 'HtmltableView') {
    console.log("Htmltableview can be used only in the browser")
  } else if (Args.values["show-view"] === 'TextView') {
      const cellLen = Args.values.width

      get_jsonfiles_delta(file1, file2).then(json_delta => { let view=new TextView(json_delta); view.show(cellLen) } )
  } else {
      console.log("Invalid view specified - ", Args.values.view)
  }

} else if (Args.values["view-model"]) {
    get_jsonfiles_delta(file1, file2).then(json_delta => { 
                              let view_model = generate_diff(json_delta.left, json_delta.right)
                              console.log(JSON.stringify(view_model))
                              })
} else if (Args.values.delta) {
    get_jsonfiles_delta(file1, file2).then(json_delta => { console.log(JSON.stringify(json_delta)); })
}
