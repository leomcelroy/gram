import { parse } from "./parse-comb.js";
import { parse as p } from "./parse.js";

import { View } from "./view.js";

import { buildParser } from "lezer-generator";

import { init } from "./init.js";

/*

gram

KEYWORDS = [
  "if",
  "elif",
  "else", 
  "for",
  "skip",  
  "break", 
  "as", 
  "def"
]

BINARY_OPERATORS = [
  ["="], // assignment
  [
    "or", "and", 
    "<", ">", "<=", ">=", 
    "==", "!=", 
    "+", "-", "*", "/", 
    "%", "^"
  ], // binary operators
  [], // unary
  ["."] // get
]

UNARY_OPERATORS = [
  "!"
]

BOOLEAN = true | false

ARRAY = [ ... ]

BLOCK = { ... } 
  | : INDENT

CALL = (func ...args)
 | func ...args newline

// and (...) for precedence

COMMENT = //

SYMBOL = (_ | [a-z]) (_ | [a-z] | [0-9])*

NUMBER = -? ( [0-9]+ | .[0-9]+ | [0-9]+.[0-9]+ )

STRING = "..."

? hash map, could just be function

(dict 
  "car" 6 
  "house" (add 10 32)
)

==

arr = [dict "car" 6 "house" (add 10 32)]

(head arr) ...(tail arr)

==

tree = {dict "car" 6 "house" (add 10 32)}
eval tree

*/

/* 

REMOVING

pipe |

suppress?

quote '

apply @

*/
const Parser = buildParser(`
@top _ { expression }

expression { Name | Number | BinaryExpression }

BinaryExpression { "(" expression ("+" | "-") expression ")" }

@tokens {
  Name { std.asciiLetter (std.digit | std.asciiLetter)* }
  Number { std.digit+ }
}
`)

// console.log(Parser.parse('(a+1)'));

// console.log(Parser);


const root = document.querySelector("#root");

root.append(View());

const test = `
width = 5
height = 7
thickness = 0.4
tabs = 8
bottabs = 3

tabSize = height/(2*tabs)
width = width - (thickness*2)

def tabGroup num:
  for num:
    forward tabSize
    left 90
    forward thickness
    right 90
    forward tabSize
    right 90
    forward thickness
    left 90

side = layer:
  forward width
  right 90
  tabGroup tabs
  right 90
  forward width
  right 90
  tabGroup tabs
  move this.lt [0 0]
  side = this
  
  holes = layer:
    bottabwidth = width/(bottabs*2)
    rectangle bottabwidth thickness
    copypaste bottabs-1:
      translate this.width + bottabwidth 0
    copypaste 1:
      translate 0 ~side.height+thickness
    move this.ct side.ct
  difference
  
  copypaste 3:
    translate this.width+1 0



`
const test2 = `
top = layer:
  forward 90
  right 30
  forward 32

if a == 3:
  forward this.length
  right this.(90)
elif a == 4 and true:
  left 13
else:
  right 43


for 10 {
  forward 32
}

for 30 as i {
  a = i
  if a < 3: skip
  elif a > 5: break
  else: print i "art"

}

`

// console.log(p(test));
const preprocess = string => `{${string}\n}`.trim();

const program = `

top = layer {
  forward 90
  right 30
  forward 32
}

if a == 3 {
  forward this.length
  right this.(90)
} elif a == 4 and true {
  left 13
} else {
  right 43
}


for 10 {
  forward 32
}


for 30 as i {
  a = i
  if a < 3 { 
    skip 
  } elif true {
    3
  } else {
    4
  }

}



`

console.log("comb", parse(preprocess(program)));


// const ast = parse(test);

// console.log(ast);



// function Root() {
//   const count = o(0);

//   return html`
//     <div onClick=${() => count(count() + 1)}>Hello world! Count is ${count}</div>
//   `
// }


// document.querySelector("#root").append(html`<${Root}/>`)