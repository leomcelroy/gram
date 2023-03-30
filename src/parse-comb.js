import { comb } from "./comb.js";

const skip = ["ws"];
const literals = [
  "[", 
  "]", 
  "{", 
  "}", 
  "(", 
  ")", 
  "def", 
  "if",
  "elif",
  "else",
  "for", 
  "as",
  // "skip",
  // "break",
  "true",
  "false",
];

// what about patterns that match multiple tokens
// need to add better error messages
// how to handle literals?
// postprocess functions

/*
operator precedence
=
binary
unary
.
*/

const tokenRules = {
  bracket: ["[", "]", "{", "}", "(", ")"],
  number: /-?\d+/,
  string: /"(.*?)"/,
  ws: /[^\S\r\n]+/,
  newline: /\n/,
  binary_op: ["+", "-", "*", "/", "!=", "==", "or", "and", "<=", ">=",  "<", ">", "%", "^"],
  unary_op: ["!", "'", "~"],
  assign: "=",
  get_dot: ".",
  word: /[a-zA-Z]+/,
}

const parse = comb`
  lexer ${{rules: tokenRules, skip, literals }}

  number -> ${x => Number(x.value)}
  number = 'number'

  word = 'word'

  string = 'string'

  number -> ${x => x.value === "true"}
  boolean = 'true' | 'false'

  cond = 'if' term block ('elif' term block)* ('else' block)?

  func = 'def' word+ block

  for = 'for' term ('as' word)? block

  unary = 'unary_op' exp

  get = ( assign | cond | for | func | block | paren | list | word | boolean | string | number) 'get_dot' (word | string | paren)

  assign = word 'assign' linecall

  exp = get | assign | cond | for | func | unary | block | paren | list | word | boolean | string | number

  binary = exp ('binary_op' exp)+

  term = binary | exp

  list -> ${([_0, list, _1]) => ["list", ...list.filter(x => x.type !== "newline")]}
  list = '[' (term | 'newline')* ']'

  paren -> ${([_0, list, _1]) => [...list.filter(x => x.type !== "newline")]}
  paren = '(' (term | 'newline')* ')'

  linecall -> ${([term, newline]) => [...term]}
  linecall = term* 'newline'

  block -> ${([_0, block, _1]) => ["block", ...block.filter(x => x.length !== 0)]}
  block = '{' (linecall | term)* '}'

  block
`

// block line could be implicit quote if only one item

export { parse };
