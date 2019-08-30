# MetaWidget Protocol

----

# Raw Value
Lowest common denominator input.
 * String.  If it seems to be HTML, attempts to parse as DOM element
 * Number
 * etc..
 * DOM element or JQuery DOM
 * JSON

# Wrapped Value {
## ._
A JSON object with a key '_' pointing to a raw value,
and any of the following modifiers specified in the following keys.

## .id 
for a specific node identifier.  otherwise UUID will be generated
if the node already exists it will be replaced unless the
value is identical.

## .width, .height
for specific dimensions

## .fill
for DOM nodes, automatically sets the DOM's width and height property to its backing node's width and height 

## .shape
rectangle, hexagon, circle, etc

## .push = targetID
pushes this value to node id, which if exists, will
become a stacked node.  this can be used to emulate 
a 'card' or 'wizard' GUI pattern since the stack
can be navigated in-place.

## .seq = seqID[#branchAtN], .seq = { id: sequenceID, limit: n, remove: r }
similar to push except that new nodes are created and linked
to the previous sequence item.  multiple sequences
can be instantiated for collecting distinct ongoing threads
of activity.

## .send = targetNode
sends the value to a targetNode for it to use as its own
implementation is designed.  this can be used
to collect items within a node rather than creating new
top-level nodes.

## .link = { to: [targetNode,...], from: [sourceNodes,...] }
create generic links to or from any other nodes

# }