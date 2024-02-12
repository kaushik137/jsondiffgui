# About The Project

Jsondiffgui is **a javascript MVVM framework** for implementing interactive visual json diff tools **either for the browser or locally for the host machine**

[Here is a screencast](https://github.com/kaushik137/jsondiffgui/assets/149125414/77b9799b-dae5-41f0-8bd8-083065071e28) of one such implementation built using the framework [for the browser](#htmltableview-using-jsondiffgui-in-the-browser). The functionality on show [can be implemented for any GUI environment/toolkit rapidly by extending the base classes of the framework](#design).

Try the [online demo](https://kaushik137.github.io/jsondiffgui/)

You can use this project to:

* diff json objects  - use one of the [views under the folder src/Views](#usage-to-diff-json-objects)

* build your own json diff tool - [build your owns views](#how-to-create-new-views)

The plan is to add more [Views](#views) and add jsondiffgui to the node repository.


### Scope
The diff is based on the output of [json-diff node module](#built-with). Arrays are treated as ordered lists.  
In future, we plan to add options to treat arrays as sets or multisets.  


# Built With
* [json-diff](https://github.com/andreyvit/json-diff.git)  
A node module used to compute diff of two json objects

* [jq-web](https://github.com/fiatjaf/jq-web.git)  
jq is used to process the diff to construct the ViewModel

* [jsdifflib](https://github.com/cemerick/jsdifflib)  
The file diffview.css is used to style the html table


# Getting Started and setup
* jsondiffgui on the browser
    * To diff on the browser you do not have to install anything. Just [source one of the prebuilt javascript bundles from the dist/ folder in your html](#htmltableview-using-jsondiffgui-in-the-browser).

    * To implement and build your own views for the browser, [need to install nodejs and a few node modules](#Build-the-sources-into-one-javascript-file)

* jsondiffgui locally on the host machine, [install nodejs, json-diff node module](#textview-jsondiffgui-in-the-commandline).  
In future, if we add more views there would be View specific requirements.


# Usage: To diff json objects
Currently, to diff jsons, we have two View implementations

* For the browser - a fully functional [Htmltableview](#htmltableview-using-jsondiffgui-in-the-browser) which is [an interactive html table](https://github.com/kaushik137/jsondiffgui/assets/149125414/77b9799b-dae5-41f0-8bd8-083065071e28), inspired by the text diff library [jsdifflib](https://github.com/cemerick/jsdifflib)

* On the host machine, a basic [TextView](#textview-jsondiffgui-in-the-commandline) to demonstrate jsondiffgui framework on the commandline


## HtmltableView: Using jsondiffgui in the browser
To diff jsons in the browser all you need is to source one javascript file in your html.

The code block below uses the file dist/jsondiffgui-wasm-bundle.js. You can source [any of the jsondiffgui bundles from dist/ directory](#which-jsondiffgui-bundle-to-use-for-the-browser)

    <script type="text/javascript" src="dist/jsondiffgui-wasm-bundle.js"></script>
    <div id="yourdiv"> </div>

    <script>
        theDiv = document.getElementById("yourdiv")
        jsondiffgui.create_jsondiff_htmltable( jsonString1, jsonString2).then( newtable => { theDiv.appendChild(newtable) ; } )
    </script>


The asynchronous function create_jsondiff_htmltable returns an html table, which can be added to any html document. Here the table gets added to the div section with the id "yourdiv".

For a working example look at [HtmltableView demo](demo/HtmltableView/README.txt)  


## TextView: jsondiffgui in the commandline
Ensure you have nodejs installed and the node interpreter is available in the commandline.  
Install json-diff module from the node package manager  

    npm install json-diff

To run the TextView implementation

    node bin/jsondiffgui.js --view TextView file1.json file2.json

The above will output a plain text diff using [TextView](src/Views/TextView/textview.js)  

Also try [TextView demo](demo/TextView/demo_textview.js)  

    node demo/TextView/demo_textview.js

The current implementation is basic, just to demonstrate how easy it is to build new views, and for the local environment too. We can easily add all the interactivity of [HtmltablView](https://github.com/kaushik137/jsondiffgui/assets/149125414/77b9799b-dae5-41f0-8bd8-083065071e28) by leveraging the full power of [Jsondiffview](./src/jsondiffview.js) and [JsondiffViewModel](./src/jsondiffviewmodel.js).


# Compute jsondiffgui's ViewModel
You can generate the view model in the form a json object on the commandline.

    node bin/jsondiffgui.js -m file1.json file2.json > jdgViewModel.json

The output file above, jdgViewModel.json, is a JsondiffViewModel and Views can be constructed from it. Refer [HtmltableView's](src/Views/HtmltableView/HtmltableView.js) constructor function.


# Which jsondiffgui bundle to use for the browser?
jsondiffgui uses [jq-web](https://github.com/fiatjaf/jq-web.git) to process json.

Some of the jq-web bundles [require loading an external binary](3rdparty/jq-web/README.md).

    dist/jsondiffgui-wasm-bundle.js      fast, requires jq.wasm.wasm.
    dist/jsondiffgui-wasm-min-bundle.js  minified version of above

    dist/jsondiffgui-asm-bundle.js       runs in most places but slow, requires jq.asm.js.mem
    dist/jsondiffgui-asm-min-bundle.js   minified version of above

    dist/jsondiffgui-bundle.js           big and slow, has all dependencies
    dist/jsondiffgui-min-bundle.js       minified version of above

In the html, you can source any one of the above jsondiffgui bundles. Ensure the required binary is in path and can be fetched by the server when a get request is made.

# Design
The framework is built on the MVVM pattern - Model-View-ViewModel  

### Model
Model the core data, here just the json objects to be diffed

### Views
Views implement the GUI specific functionality - displaying lines of the diff, capture user events for each [jsondiffgui command](#jsondiffguicommands).

Views are prototyped from [the base class Jsondiffview](./src/jsondiffview.js) and constructed from a [JsondiffViewModel](./src/jsondiffviewmodel.js) instance


#### jsondiffguiCommands
`JsondiffView` defines an interface `JsondiffView.prototype.jsondiffguiCommands` with the following functions:  

    scroll2selection, change_selected_index, obj_open, obj_close, recursive_collapse, recursive_open, toggle_collapse, prev_row, next_row, prev_obj, next_obj, prev_diff, next_diff

Most of these functions are GUI independent as they call into the JsondiffViewModel to do their work. To implement a new View you only need to override the following functions from [JsondiffView](./src/jsondiffview.js):
    scroll2selection, change_selected_index, handlEvent, redraw_node

The main effort for new View implementations will be [just event handling like with HtmltableView](src/Views/HtmltableView/htmltable_eventcmder.js)


### ViewModel
The bulk of the jsondiffgui's work happens in the JsondiffViewModel. Views rely on the [JsondiffViewModel class](src/jsondiffviewmodel.js) for all the computation to traverse the json trees and the differences.

ViewModel class creates a platform indepent abstract representation of a json diff GUI and its state. ViewModel is independent of the View or the GUI environment.

# How to create new Views
To develop new Views for javascript environments, you should [derive or prototype your View from JsondiffView](#design)

* For the browser, use [HtmltablView](src/Views/HtmltableView/HtmltableView.js) as the reference implementation. Since, we have node module dependenices, we need to use browserify to make them available in the browser. So, just like with HtmltableView [use browserify to build the sources](#build-the-sources-into-one-javascript-file). This will get us a single javascript file that we can source from an html.

* For the nodejs environment on the host machine, refer [TextView](src/Views/TextView/textview.js)

* Also we can **leverage jsondiffgui** in non-javascript environments like python, GTK, QT. We can [compute the JsondiffViewModel](#compute-jsondiffguis-viewmodel) in the nodejs environment. Once the ViewModel is stored as a json object, we can deserialize the [ViewModel in any environment and use it to construct views](#viewmodel)


# Build the sources into one javascript file
We use browserify to build all the node dependencies and sources into one javascript bundle for the browser. You can find the latest in dist/ folder.

First install nodejs and npm (node package manager).  

You should have node interepreter available in the command line.  
Then use npm to install the following:

    $npm install json-diff browserify browserify-css browserify-header wasmify


Build sources into a single javascript bundle file:

    $cd src

    $browserify -p browserify-header \
    -t browserify-css Views/HtmltableView/htmlutils.js \
    -p wasmify -r ../3rdparty/jq-web/jq.wasm.js:jq-web \
    -r ../3rdparty/lodash.min.js:lodash \
    -r json-diff:json_diff \
    Views/HtmltableView/HtmltableView.js \
    > ../dist/jsondiffgui-wasm-bundle.js

If and when we add more Views targeting the browser, we would include them in the build.  
Along with `Views/HtmltableView/HtmltableView.js` above you would add `Views/YourOwnFancyView/YourOwnFancyView.js`

Can replace jq.wasm.js with jq.asm.bundle.js or jq.asm.js, depending on [which jq binary you wish to use](#which-jsondiffgui-bundle-to-use-for-the-browser)  
Then copy the correct jq binary your bundle needs

    $cp ../3rdparty/jq-web/jq.wasm.wasm ../dist
OR

    $cp ../3rdparty/jq-web/jq.asm.js.mem ../dist



# Future plans

* Currently json arrays are treated as ordered lists. We can add options to treat arrays as sets, multisets or ordered lists.

* The function [eventCommand](src/Views/HtmltableView/htmltable_eventcmder.js) can be factored out, moved into base classes. This would make event handling code much simpler for javascript environments.

* Add more views with different kinds of graphic interfaces. For eg, we may use svg, html canvas, we may have a tree/graph instead of html table etc. We need to explore different view implementations for
    * the browser
    * local javascript environments like nodejs (eg use nodegui node module), reactjs
    * local non-javascript environments like Python, GTK etc.


# Contributing
Always good to have feedback and suggestions for improvement. Specifically, we should [add more views](#future-plans)

Developers can create view implementations and add them under src/Views directory. Refer to [HtmltablView](src/Views/HtmltableView/HtmltableView.js) for a reference implementation.

You can fork this project, implement a View by yourself and submit a pull request. Or you can get in touch and perhaps we can collaborate.



# LICENSE
jsondiffgui:  
jsondiffgui Copyright (c) 2023 Kaushik Sundararajan  
<https://github.com/kaushik137/jsondiffgui.git>  
jsondiffgui released under MIT license  
Based on jq-web, &nbsp; json-diff, &nbsp; jsdifflib  

jq-web:  
**Used to transform json objects**  
<https://github.com/fiatjaf/jq-web.git>  
Copyright (c) 2019 fiatjaf <fiatjaf@gmail.com>  
license: ISC  


json-diff:  
**Used to compute a diff of two jsons**  
<https://github.com/andreyvit/json-diff.git>  
Copyright (c) 2015 Andrey Tarantsov  
license: MIT  
  
jsdifflib v1.0:  
**The file diffview.css is used to style the html table. Three functions celt, telt, ctelt are used.**  
<http://snowtide.com/jsdifflib>  
Copyright (c) 2007, Snowtide Informatics Systems, Inc.  
license: BSD  
  
  

jsondiffgui:
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

For full license texts of dependencies refer [LICENSE file](LICENSE) and the same individually in  

* [jq-web LICENSE](3rdparty/jq-web/LICENSE)
* [json\_diff-bundle.js](3rdparty/json_diff-bundle.js)
* [jsdifflib diffview.css](3rdparty/jsdifflib/diffview.css)
* [jsdifflib htmlelem.js](3rdparty/jsdifflib/htmlelem.js)
