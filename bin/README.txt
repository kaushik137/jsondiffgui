*) node jsondiffgui.js --view TextView ../demo/file1.json ../demo/file2.json
    Use TextView to show the diff in the commandline


*) node jsondiffgui.js --view TextView --width=70 ../demo/file1.json ../demo/file2.json
    TextView specifying width of the text fields in the diff


*) node jsondiffgui.js --delta ../demo/file1.json ../demo/file2.json | jq .
    Print the delta object that represents the diff between the two jsons. Use jq utility to pretty print
