-- gram: a declarative drawing language --

gram is inspired by logo but the drawing paradigm fundamentally differs from logo's strict procedural turtle-state based technique.

In gram all drawing methods operate on the current layer. This allows users to create declarative style descriptions of drawings.

The original motivation for creating gram was to enable crafting parametric line drawings for digital fabrication technologies like laser cutters and CNC mills.
We decided to host the language on the web to support the sharing and remixing of modular designs created with it.

gram has extremely lightweight and minimal syntax. 
Functions have fixed arity and gather arguments by collecting proceeding expression statements.
In gram everything is an expression.
Arrays and special form bodies are simply sub-programs.

The primary purpose of the language is to create declarative drawings.
gram accomplishes this with a collection of built in drawing functions.
They operate on layers with drawing heads (similar to logo's turtle).
Each command alters the layer whose scope it is contained in.
You can reference point locations on previous layers.

gram is in active development and the syntax has not entirely settled yet.
One thing you might observe changing right now is that blocks can be created with:
{...} 					or
start ... end 			or
do
	...

The last case is whitespace sensitive.


The language structure is as follows.

-- Function Declarations -- 
def name :: param0 param1 ... paramN do
	dosomething...

- Example -
def add :: x y do
	x + y

# call with
add 1 2

-- Conditionals -- 
if cond... dosomething... end
if cond... dosomething... else dosomething... end
if cond... dosomething... elif dosomething... else dosomething... end

- Example -
if x == 2
	"two"
elif x == 3
	"three"
else
	"other"
end

-- Assignment -- 
name = val

- Example -
two = 2

-- Literals -- 
number: all floats
string: signified with ""
boolean: true | false

- Example -
2
"cars"
true

-- Loops -- 
for array... as iterator... do
	dosomething...

Can also use a number for the array as shorthand for 0 to number, "as" is optional

- Example -
sum = 0
for [0 1 2] as i do
	sum += i

or

for 4 do
	forward 90
	right 90

-- Arrays -- 
[]

-- Expressions -- 
()

-- Comments --
#
Comments are created with # and run till the end of the current line.

,
Commas are treated as whitespace

- Example -
# this won't run
2 + 2

-- Operators -- 
=, +=, -=, *=, /=
to, at
or
and
<, >, <=, >=, ==, !=
+, -
*, /, %
^
\

They have the precedence of the order provided.

"\" is an application operator

- Example -
neg 10 == -10
10\neg == -10

-- Built-Ins -- 
This list is not exhaustive for the sake of clarity.

A point is [x:number y:number]

layer: body -> creates a new layer whose contents are the body
forward: number -> moves forward by number
right: number -> turns right by number of degrees
left: number -> turns left by number of degrees
fillcolor: string -> sets layer fill to color of string
strokewidth: number -> sets stroke width to thickness of number
strokecolor: string -> sets stroke color to color of string
rotate: point angle -> rotates layer by number of degrees around snapPoint of layer
translate: number0 number1 -> moves layer number0 in x direction and number1 in y direction 
scale: number0 number1 -> scales layer number0 in x direction and number1 in y direction 
closepath: -> returns to start
setangle: number -> sets head angle to number degrees
reverse: -> reverses paths of layer
arc: number0 number1 -> creates arc with number0 degree sweep and number1 radius
circle: number -> creates circle with radius of number
flip: string -> flips layer over "x" centerline, "y" centerline, or "xy" centerline
rectangle: number0 number1 -> creates rectangle with number0 width and number1 height
roundcorners: radius -> fillets corners of layer
move: point0 point1 -> moves point0 of layer to point1
goto: point -> moves head of layer to point
neg: number -> returns negative of number
pick: array -> returns random value from array
copypaste: number body -> copies current layer and applies body to it then repeats with the copied shape
originate: -> moves center center of layer to [0, 0]

- Snap points can be referenced with -
lefttop: shape -> returns lefttop of shape, shorthand is lt
leftcenter: shape -> returns leftcenter of shape, shorthand is lc
leftbottom: shape -> returns leftbottom of shape, shorthand is lb
centertop: shape -> returns centertop of shape, shorthand is ct
centercenter: shape -> returns centercenter of shape, shorthand is cc
centerbottom: shape -> returns centerbottom of shape, shorthand is cb
righttop: shape -> returns righttop of shape, shorthand is rt
rightcenter: shape -> returns rightcenter of shape, shorthand is rc
rightbottom: shape -> returns rightbottom of shape, shorthand is rb
endof: shape -> returns end point of shape
startof: shape -> returns start point of shape
widthof: shape -> returns width of shape as number
heightof: shape -> returns height of shape as number


-- Example Program --
# This program will draw the snap points 
# over shapes passed into a function

def drawDots :: shape do layer do
    circle shape\widthof/20
    copypaste 2 do translate shape\widthof/2 0
    copypaste 2 do translate 0 shape\heightof/2
    move this\cc shape\cc
    fillcolor "black"
  
def square :: size color do layer do
		for 4 do
			forward size
			right 90
		fillcolor color

redSquare = layer do
	square 67 "red"
drawDots redSquare

greenSquare = layer do
	square 70 "green"
  move this\cc redSquare\rt
drawDots greenSquare

-- Acknowledgments -- 

Thanks to Brian Silverman, Artemis Papert, David Cavallo, and Cynthia Solomon for their advice while crafting gram and for their continued support.

