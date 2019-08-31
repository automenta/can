# MetaWidget Protocol

----

# Raw Value
Lowest common denominator input.
 * String
   * HTML detected: attempts to parse as DOM element :ok:
   * other markup detections: markdown, etc
 * Number
 * DOM element :ok:
 * JQuery expression - if the referred DOM is attached to a page, detaches from there prior to reattach :ok: 
 * JSON - editable with a default built-in JSON editor :ok:
 * JS source code - to be evaluated and/or called with certain args

# Wrapped Value {

## Identity

### ._
A JSON object with a key '_' pointing to a raw value that will be dereferenced prior to rendering.
Any of the following modifiers can be specified in the wrapping object's keys.
:ok:

### .id 
for a specific node identifier.  otherwise UUID will be generated
if the node already exists it will be replaced unless the
value is identical.
:ok:

## Mode 
### .push = targetID
pushes this value to node id, which if exists, will
become a stacked node.  this can be used to emulate 
a 'card' or 'wizard' GUI pattern since the stack
can be navigated in-place.

### .seq = seqID[#branchAtN], .seq = { id: sequenceID, limit: n, remove: r }
similar to push except that new nodes are created and linked
to the previous sequence item.  multiple sequences
can be instantiated for collecting distinct ongoing threads
of activity.

### .for = targetNode
sends the value to a targetNode for it to use as its own
implementation is designed.  this can be used
to collect items within a node rather than creating new
top-level nodes.

## Appearance

### .pos = [x, y]
for specific absolute positioning
:ok:

### .size = [width, height]
for specific absolute sizing
:ok:

### .fill
for DOM nodes, automatically sets the DOM's width and height property to its backing node's width and height when that changes 
:ok:

### .shape
rectangle, hexagon, circle, etc
:ok:

### .color
background shape color, as CSS string

### .scale = [ targetID, howMuch{, aspectRatio} ]
sets size scaled relative to another node with optional specific aspectRatio 

### .focus
autozoom when shown

## Graph
### .link = { to: [targetNode,...], from: [sourceNodes,...] }
create generic links to or from any other nodes

# }