Run a file server from the root of jsondiffgui git repository

python3 -m http.server 8001

Load the demo.html file in a browser:
    http://localhost:8001/demo/HtmlTableView/demo.html

You should get an interactive html table that shows the diff of the two jsons ./left.json and ./right.json

The following are the keyboard/mouse commands to navigate the diff ( You can find the same instructions in demo/demo.html ):

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

*** Ensure the table is selected and the table has a colored border before you use any of the above ***


To change these navigation commands, change the array eventCommandMaps in the file src/Views/HtmltableView/htmltable_eventcmder.js and rebuild jsondiffgui.
