import { comb } from "./comb.js";

const skip = ["ws", "comma"];
const literals = ["[", "]", "{", "}", "(", ")"]
  .reduce((acc, cur) => {
    acc[cur] = cur;

    return acc;
  }, {});

const tokenRules = {
  ...literals,
  word: /[a-zA-Z]+/,
  number: /-?[0-9]+/,
  ws: /[^\S\r\n]+/,
  newline: /\n+/,
  singleQuote: "'",
  comma: ",",
  // name: /[a-zA-Z0-9\/]+/,
  // math: 
  // other: /(?!\])/
}

const parse = comb`
  lexer ${{rules: tokenRules, skip }}

  number -> ${x => Number(x.value)}
  number = 'number'

  word -> ${word => word.value}
  word = 'word'

  exp = body | paren | list | word | number | 'newline'

  quote -> ${x => x[0] !== null ? ["quote", x[1]] : x[1]}
  quote = 'singleQuote'? exp

  list -> ${ x => ["arr", ...x[1].filter(x => x.type !== "newline")] }
  list = '[' quote* ']'

  paren -> ${ x => x[1].filter(x => x.type !== "newline") }
  paren = '(' quote* ')'

  body -> ${x => {
    const calls = [];

    x[1].forEach(exp => {
      if (exp.type === 'newline') calls.push([]);
      // should only push if call, not quote or arr
      else if (
        Array.isArray(exp) && 
        calls.length > 0 &&
        calls.at(-1).length === 0
        // && !["quote", "arr"].includes(exp.at(0))
      ) calls.push(exp, []);
      else if (calls.at(-1)) calls.at(-1).push(exp);
      else calls.push([exp]);
    })

    return ["quote", calls.filter( x => x.length > 0)];
  }}
  body = '{' quote* '}'

  body
`

// body line could be implicit quote if only one item

export { parse };
