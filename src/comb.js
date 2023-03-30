// const oneOf = item => w => w.startsWith(item);
// const anyOf = arr => w => arr.some(oneOf(w));


// token types that match skip are skipped
// token values that match literals have the token type set to value
const makeLexer = ({ rules = {}, skip = [], literals = [] } = { }) => string => { 
  let index = 0;

  // let line = 0;
  // let col = 0;

  const peek = () => string[index];
  // const next = () => string[index++];
  const tokens = [];

  // should I add literals to token rules automatically
  // if (literals.length > 0) rules[Date.now()] = literals;

  while (index < string.length) {
    let type, value;

    for (const key in rules) {
      type = key;
      value = null;
      let rule = rules[key];

      if (rule instanceof RegExp) {
        let tempValue = string.slice(index).match(rule);

        if (tempValue !== null && tempValue.index === 0) {
          value = tempValue[0];        
          break;
        }
      } else if (typeof rule === "function") {
        if (rule(peek())) {
          let i = index;
          value = string[i]
          while (rule(value)) {
            if(rule(value + string[i + 1])) value += string[++i];
            else break;
          }
          break;
        }
      } else if (Array.isArray(rule)) { // should I allow regex and functions too
        let match = false;
        for (let i = 0; i < rule.length; i++) {
          if (typeof rule[i] !== "string") console.error("makeLexer only accepts arrays of strings.");
          if (string.slice(index).startsWith(rule[i])) {
            value = rule[i];
            match = true;
          }
        }

        if (match) break;
      } else if (typeof rule === "string") {
        if (string.slice(index).startsWith(rule)) {
          value = rule;
          break;
        }
      }
    }

    if (value === undefined || value === null) {
      const section = string.slice(0, index+1);
      const lines = section.split("\n");
      const line = lines.length;
      const col = lines.at(-1).indexOf(peek());

      throw `Unknown character: ${peek()}\nAt index: ${index}\nLine: ${line}\nCol: ${col}`;
    }

    if (literals.includes(value)) type = value;
    if (!skip.includes(type)) tokens.push({ type, value, index });
    index += value.length;

  }

  return tokens;
}

//////////////////////////////

const convert = pred => s => {
  return s[0] && (s[0].type === pred)
    ? [ s[0], s.slice(1) ] 
    : null
}

const star = (pred, transform = null) => s => { // 0 or more
  if (typeof pred === "string") pred = convert(pred);

  const arr = [];
  let next = pred(s);

  while (next) {
    arr.push(next);
    next = pred(next[1]);
  }

  return arr.length > 0 
    ? [ ( transform ? transform(arr.map(([x]) => x)) : arr.map(([x]) => x) ), arr[arr.length - 1][1] ] 
    : [[], s];
}

const plus = (pred, transform = null) => s => { // at least one
  if (typeof pred === "string") pred = convert(pred);

  const arr = [];
  let next = pred(s);

  while (next) {
    arr.push(next);
    next = pred(next[1]);
  }

  return arr.length > 0
    ? [ ( transform ? transform(arr.map(([x]) => x)) : arr.map(([x]) => x) ), arr[arr.length - 1][1] ] 
    : null;
}

const or = (preds, transform = null) => s => {
    const result = preds.reduce((acc, cur) => 
        acc || (typeof cur === "string" ? convert(cur) : cur)(s)
      , false);

    return Array.isArray(result) 
      ? (transform ? [ transform(result[0]), result[1] ] : result)
      : null;
}

const and = (preds, transform = null) => s => { // must match each predicate
  const result = [];
  for (let pred of preds) {
    if (typeof pred === "string") pred = convert(pred);

    const next = pred(s);
    if (next === null) return null;
    s = next[1];
    result.push(next[0])
  }
  
  return result.length === preds.length 
    ? [transform ? transform(result) : result, s] 
    : null;
}

const opt = pred => s => { // optional
  if (typeof pred === "string") pred = convert(pred);

  const next = pred(s);
  if (next === null) return [null, s]; // should I use null or []
  else return next;
}

// const trim = pred => or([ // not used
//   and(["ws", pred, "ws"], ([_0, x, _1]) => x),
//   and([pred, "ws"], ([x, _]) => x),
//   and(["ws", pred], ([_, x]) => x),
//   pred
// ])

const none = () => s => [ null, s ]; // not used

const any = () => s => [ s[0], s.slice(1) ]; // not used

///////////////////

// class Stream { // not used
//   constructor(ast) {
//     this.index = 0;
//     this.ast = ast;
//   }

//   peek() {
//     return this.ast[this.index];
//   }

//   next() {
//     const current = this.ast[this.index];
//     this.index++;
//     return current;
//   }

//   eof() {
//     return this.peek() === undefined;
//   }
// }

//////////////////////////////

// plus, star, or, and, optional

const comb = (strs, ...vals) => {
  let result = "";
  let refs = {};
  strs.forEach((str, i) => {
    if (i >= vals.length) result = result + str;
    else {
      const val = vals[i];
      if (typeof val === "function" || typeof val === "object") {
        let tempName = `$f${i}`;
        refs[tempName] = val;
        result = result + str + tempName; 
      } else if (typeof val === "string" || typeof val === "number") {
        result = result + str + val; 
      } else {
        console.error("Unexpected interpolated value:", val);
      }
    } 
  })

  const skip = ["ws"];
  const literals = ["->", "=", "|", "*", "+", "?", "(", ")", ".", "lexer"]
    .reduce((acc, cur) => {
      acc[cur] = cur;

      return acc;
    }, {});

  const tokenRules = {
    ...literals,
    ws: /[^\S\r\n]+/,
    newline: /\n+/,
    func: /\$f[0-9]+/,
    symbol: /[a-zA-Z_]+/,
    token: /'.*?'/,
  }

  const tokenize = makeLexer({ rules: tokenRules, skip })

  const toks = tokenize(result);

  const token = or(["token"], x => ({ type: "token", value: x.value.slice(1, -1), index: x.index}))

  const andClause = s => plus(and([
    or([paren, "symbol", token, "."]),
    opt(or(["*", "+", "?"])),
  ], x => x[1] ? [x[1].value, x[0]] : x[0]), x => x.length > 1 ? ["and", ...x] : x[0])(s);

  const orClause = s => 
    and([ 
      andClause, 
      plus(
        and([
          opt("newline"),
          "|",
          andClause
        ], x => x[2])
      ) 
    ], x => x[1].length > 0 ? ["or", x[0], ...x[1]] : x[0])(s);

  const paren = s => and(["(", or([ orClause, andClause ]), ")"], x => x[1])(s);

  const production = s => and([ "symbol", "=", or([orClause, andClause, "newline"]) ], x => ["set", x[0].value, x[2]])(s);

  const transformation = s => and(["symbol", "->", "func"], x => ["transform", x[0].value, x[2]])(s);

  const lexer = s => and(["lexer", "func"], x => ({ type: "lexer", value: x[1] }))(s);

  const statement = s => or([ production, transformation, lexer, orClause, andClause ])(s);

  const parse = star(or([statement, "newline"]), x => x.filter(x => x.type !== "newline"));

  // check that last line is or or and

  const [ ast, remainder ] = parse(toks);

  const last = ast.at(-1);
  const validReturn = ["*", "?", "+", "or", "and"].includes(last[0]);
  
  // if (!validReturn) return console.error(`Must end with [* | ? | + | or | and] clause.`)

  let $lexer = null;
  const $stored = {};
  const $transforms = {};

  const funcs = {
    "or": (...args) => or(args),
    "and": (...args) => and(args),
    "transform": (name, value) => {
      $transforms[name] = value; 
      return value;
    },
    "set": (name, value) => {
      $stored[name] = value;
      return value; 
    },
    "*": (...args) => star(...args),
    "+": (...args) => plus(...args),
    "?": (...args) => opt(...args),
  }

  const funcsTransform = {
    "or": (arr, trans) => or(arr, trans),
    "and": (arr, trans) => and(arr, trans),
    "*": (term, trans) => star(term[0], trans),
    "+": (term, trans) => plus(term[0], trans),
    "?": (term, trans) => opt(term[0], trans),
  }

  const evaluate = node => {

    if (Array.isArray(node)) {
      const [head, ...tail] = node;

      // if set and set name in transform, pass transform
      if (head === "set" && tail[0] in $transforms) {
        if (!Array.isArray(tail[1])) tail[1] = [ "or", tail[1] ];

        const [innerHead, ...innerTail] = tail[1];
        const args = innerTail.map(evaluate);
        const value = funcsTransform[innerHead](args, $transforms[tail[0]]);
        $stored[tail[0]] = value;
        return value;
      }

      const args = tail.map(evaluate);

      return (head in funcs)
        ? funcs[head](...args)
        : node.map(evaluate);
    } else if (node.type === "symbol") {
      const name = node.value;

      return (s) => $stored[name](s);
    } else if (node.type === "token") {
      return convert(node.value);
    } else if (node.type === ".") {
      return any;
    } else if (node.type === "lexer") {
      let val = refs[node.value.value];
      if (typeof val === "object") val = makeLexer(val);
      $lexer = val; // why is this double value
      return $lexer;
    } else if (node.type === "func") {
      return refs[node.value];
    } else { // string
      return node;
    }
  }

  const generatedParser = evaluate(ast);

  return string => {
    const generatedToks = $lexer(string);

    if (generatedToks.length === 0) {
      return [];
    }

    const gp = generatedParser.at(-1);

    console.log({$stored, generatedToks, gp});
    const [ast, remainder] = gp(generatedToks);

    if (remainder.length > 0) console.error("Parsing failed. The remainder is:", remainder);

    return ast;
  }


}







export { comb, makeLexer }




