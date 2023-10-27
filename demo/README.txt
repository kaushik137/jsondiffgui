Run a file server from this directory
Ensure the appropriate jq binaries are copied here - ../3rdparty/jq-web/jq.asm.js.mem ../3rdparty/jq-web/jq.wasm.wasm

python3 -m http.server

Load the demo.html file in a browser

The files left.js and right.js have json objects in the form left={ ... } and right={ ... }
Change the json objects in left.js and right.js to change the json objects to be diffed


