#!/usr/bin/env node
// require('../lib/cli')(process.argv.slice(2));

const path = require("path");
const fs = require('fs');
const JsonDelta = require('../../src/jsondelta.js');
const TextView  = require('../../src/Views/TextView/textview.js')


const text1=fs.readFileSync(path.resolve(__dirname,'../egA1.json'), 'utf-8')
const text2=fs.readFileSync(path.resolve(__dirname,'../egA2.json'), 'utf-8')
const textWidth = 75

JsonDelta(text1, text2).then(json_delta => { let view=new TextView(json_delta); view.show(textWidth) } )

// JsonDelta(text1, text2).then(json_delta => {
//            let view=new TextView(json_delta);
//            view.recursive_collapse(1);
//            view.toggle_collapse(1);
//            view.toggle_collapse(1);view.show(textWidth)
//            } )



