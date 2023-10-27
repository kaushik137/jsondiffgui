*) Using jsondiffgui in source code: (Refer demo/* for a working example )
    <script type="text/javascript" src="jsondiffgui-wasm-bundle.js"></script>
    <div id="yourdiv"> </div>

    <script>
        theDiv = document.getElementById("yourdiv")
        jsondiffgui.generate_jsondiff_htmltable( jsonString1, jsonString2).then( newtable => { theDiv.appendChild(newtable) ; } )
    </script>

*) Try demo/demo.html
    Navigating the json object ( You can find the same instructions in demo/demo.html )

    To use key strokes, first select the table either by using tab or selecting a row. The table and rows when selected get a colored border.

    To select a row click on the data cells of the row(cells that are NOT line numbers).

    ( Select the table and make sure the table has a colored border before issuing these commands )

    Move up/down:
        Keys k/j

    Collapse/open row:
        Press Enter  OR  click on row header cell (cells that ARE line numbers)

    Recursively open row:
        Ctrl-Enter  OR  ctrl click on row header

    Recursively collapse row:
        Ctrl-Alt-Enter  OR  ctrl-alt click on row header

    next/prev difference:
        RightArrow/LeftArrow

    next/prev sibling(or object):
        n/p

    beginning/end of current object:
        [ / ]


    Bring currently selected row into screen view:
        alt-Enter keys  OR   alt-mouse click anywhere in the table


    Show json path as tooltip:
        Hover mouse over row cell header

    Ensure the table is selected and the table has a colored border before you use any of the above

*) To change the above keyboard/mouse navigation commands, change eventCommandMaps in src/htmltable_eventcmder.js

*) Which jsondiffgui bundle to use?
    jsondiffgui uses jq-web - Refer 3rdparty/jq-web/README.md
    Some of the jq-web bundles require loading an external binary. Ensure the required binary is in path and can be fetched by the server when a an get request is made.

    You can use any one of the following files for jsondiffgui:
        dist/jsondiffgui-wasm-bundle.js      fast, requires jq.wasm.wasm.
        dist/jsondiffgui-wasm-min-bundle.js  minified version of above

        dist/jsondiffgui-asm-bundle.js       runs in most places but slow, requires jq.asm.js.mem
        dist/jsondiffgui-asm-min-bundle.js   minified version of above

        dist/jsondiffgui-bundle.js           big and slow, has all dependencies
        dist/jsondiffgui-min-bundle.js       minified version of above


* How to build the sources into one javascript bundle file?
    First install nodejs and npm (node package manager). You should have node interepreter running in the command line.
    Then use npm to install the following:
    $npm install json-diff browserify browserify-css browserify-header wasmify


    $cd src
    $browserify  -t browserify-css htmlutils.js -p wasmify  \
         -r ../3rdparty/jq-web/jq.wasm.js:jq  \
         -r ../3rdparty/lodash.min.js:lodash \
         jsondiffview.js htmltable_eventcmder.js eventhandler.js htmljsondiff.js htmlutils.js jsondiffhtmlview.js jsondiffviewmodel.js jsonutils.js  \
         ../3rdparty/jsdifflib/htmlelem.js \
         -r ./jqutils.js:jqutils \
         -r json-diff:json_diff  > ../dist/jsondiffgui-wasm-bundle.js

    ( Replace jq-web/jq.wasm.js with a different jq bundle eg jq-web/jq.asm.bundle.js or jq-web/jq.asm.js )

    $cp ../3rdparty/jq-web/jq.asm.js.mem ../dist
    $cp ../3rdparty/jq-web/jq.wasm.wasm ../dist

