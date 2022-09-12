import { parse } from "./parse.js";
import { Environment } from "./environment.js";
import { builtIns } from "./builtIns.js";
import { Turtle } from "../../myLibs/gram_js.js";

// should validate these as nums
const add = (x, y) => {
  if (typeof x !== typeof y) throw "Types of args to + don't match."
  if (Array.isArray(x) && Array.isArray(y)) return x.concat(y);
  else return x + y;
}

const sub = (x, y) => {
  if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers."
  else return x - y;
}

const div = (x, y) => {
  if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers."
  else if (y === 0) throw "Can not divide by zero."
  else return x / y;
}

const mul = (x, y) => {
  if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers."
  else return x * y;
}

// const sub = (x, y) => x - y;
const power = (x, y) => x ** y;
// const mul = (x, y) => x * y;
const mod = (x, y) => x % y;
const eq = (x, y) => x === y;
const lt = (x, y) => x < y;
const lteq = (x, y) => x <= y;
const gt = (x, y) => x > y;
const gteq = (x, y) => x >= y;

const range = (start, stop, step) => {
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start;
    start = 0;
  }

  if (typeof step == 'undefined') {
    step = start < stop ? 1 : -1;
  };

  // if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) return [];

  var result = [];
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i);
  return result;
}

const SKIP = "SWg@3y5WeXnTr2#&7v";
const BREAK = "RcizZ9qcYE3e2A&Z&5";

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

function isFunction(functionToCheck) {
 return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

class Stream {
  constructor(expressions) {
    this.index = 0;
    this.expressions = expressions;
  }

  peek(offset = 0) {
    return this.expressions[this.index+offset];
  }

  next() {
    const current = this.expressions[this.index];
    this.index++;
    return current;
  }

  eof() {
    return this.index === this.expressions.length;
  }
}

function callFunc(value, env, ast, startLine) { 
  const arity = value.arity;
  const params = value.params || getParamNames(value.value);
  let args = [];

  // for (let i = 0; i < arity; i++) {
  //   if (ast.eof()) break;
  //   if (ast.peek().loc.line === startLine) args.push(ast.next());
  // }

  while (true) {
    if (ast.eof() || ast.peek().loc.line !== startLine) break;
    args.push(ast.next());
  }

  args = args.map(a => evaluate(a, env, ast, true));

  if (args.length < arity) throw(`On line ${startLine}. Expected at least ${arity} arguments but received ${args.length}.`);


  let result;

  if (value.builtIn || isFunction(value.value)) {  

    result = value.value(...args)(env);
    // if (result && result.type === "function") { result.env = env; }

  } else {
    env.newScope();

    if (value.extend) {
      for (const key in value.extend){
        env.add(key, value.extend[key].value); // the scoping is a bit off maybe but this seems to work
      }
    }

    args.forEach((arg, i) => {
      const name = params[i];
      env.add( name, arg );
    })

    result = evaluate(value.body, env);

    // if it returns function need to extend env, to maintain scope
    if (result && result.type === "function") result.extend = env.currentScope();

    env.closeScope();
  }


  return result;
}

function setKeyValue(node, env, ast) {
  const map = evaluate(node.left.left, env, ast);
  const key = evaluate(node.left.right, env, ast);
  const value = evaluate(node.right, env, ast);
  map[key] = value;
  return value;
}

function assign(node, env, ast) { // add destructing for dicts/hash-maps
  const constant = false || node.constant;
  if (node.left.type === "binary" && node.left.operator === ".") return setKeyValue(node, env, ast);

  const canWrite = makeCanWrite(env);

  let right = evaluate(node.right, env, ast);
  if (node.left.type === "array") {
    if (!Array.isArray(right)) throw "Right value is not an array so can't be destructured."
    node.left.value.forEach((token, i) => {
      if (right[i] === undefined) throw "More symbols than array values."
      const symbol = canWrite(token);
      env.add(symbol, right[i], constant);
    })
  } else {
    const symbol = canWrite(node.left)
    env.add(symbol, right, constant);
  }

  return right;
} 

function pipe(node, env, ast) {
  node.right.loc = node.left.loc; // for end of line collection termination

  const value = node.right.type === "expression" ? 
    [...node.right.value, node.left] : 
    [node.right, node.left];

  // console.log("pipe value", value);
    
  return evaluate(value, env);
}

function access(left, right, node, env, ast, hold) {
  let val;
  if ( Array.isArray(right) ) {
    if (right.length === 2) val = left.slice(right[0], right[1]);
    else if (right.length === 1) val = left[right[0]];
    else throw "Expected 2 args in array index."
  } else {
    val = left[right];
  }

  return (val && val.type === "function" && !hold)
    ? callFunc(val, env, ast, node.loc.line)
    : val;
}

const makeCanWrite = env => token => {
  if (token.type !== "symbol") throw "Assignment to non-symbol.";
  const symbol = token.value;
  const current = env.find(symbol);
  if (current && current.builtIn) throw "Can't overwrite built-in symbols.";
  if (env.isConstant(symbol)) throw "Can't overwrite constant symbols.";

  return symbol;
}

let evaluate = (node, env, ast, hold = false) => {
  const literals = ["number", "string", "boolean"];
  if (Array.isArray(node)) return runProgram(new Stream(node), env);
  else if (node instanceof Stream) return runProgram(node, env); 
  else if (node.type === "array") {
    const results = [];
    let s = new Stream(node.value);
    while (!s.eof()) {
      results.push(evaluate(s.next(), env, s));
    }
    return results
  } else if (literals.includes(node.type)) {
    return node.value;
  } else if (node.type === "expression") {
    return evaluate(node.value, env);
  } else if (node.type === "binary") { // |, #, set, assign (=)

    if (node.operator === "=") return assign(node, env, ast);
    else if (node.operator === "|") return pipe(node, env, ast);

    const left = evaluate(node.left, env, ast);
    const right = evaluate(node.right, env, ast);

    // check types here
    if (node.operator === "+") return add(left, right);
    else if (node.operator === "*") return mul(left, right);
    else if (node.operator === "/") return div(left, right);
    else if (node.operator === "-") return sub(left, right);
    else if (node.operator === "^") return power(left, right);
    else if (node.operator === "%") return mod(left, right);
    else if (node.operator === "==") return eq(left, right);
    else if (node.operator === "!=") return !eq(left, right);
    else if (node.operator === "<") return lt(left, right);
    else if (node.operator === "<=") return lteq(left, right);
    else if (node.operator === ">") return gt(left, right);
    else if (node.operator === ">=") return gteq(left, right);
    else if (node.operator === "and") return left && right;
    else if (node.operator === "or") return left || right;
    else if (node.operator === "to") return range(left, right, left < right ? 1 : -1);
    else if (node.operator === ".") return access(left, right, node, env, ast, hold);

  } else if (node.type === "unary") {
    const arg = evaluate(node.arg, env, ast);
    if (node.operator === "~") return -arg;
    else if (node.operator === "!") return !arg;
    else if (node.operator === "?") return arg !== undefined;
    else if (node.operator === "@") return callFunc(arg, env, ast, node.arg.loc.line);
  } else if (node.type === "if") {
    if (evaluate(node.cond, env, ast)) return evaluate(node.then, env, ast);
    else if (node.else) return evaluate(node.else, env, ast);
    else return undefined;
  } else if (node.type === "hash-map") {
    const hashMap = {};
    // let keyName = "";
    // let key = true;
    // if (node.body.length % 2 === 1) throw "hash-map must hav even number of entries";

    for (const entry of node.body) {
      if (entry[1].type !== "body") throw "value must be block";
      const key = evaluate(entry[0], env, ast);
      const value = evaluate(entry[1].value, env);
      if (key && typeof key !== "string") throw "key must be a string";

      hashMap[key] = value;
    }

    return hashMap;
  } else if (node.type === "symbol") { 
    if (env.find(node.value) === undefined) throw "Unknown symbol used: " + node.value;
    const value = env.find(node.value);
    if (value.type === "import") { 
      const { env: newEnv, function: func } = value;
      const result = callFunc(func, newEnv, ast, node.loc.line, env); // this needs to be fixed
      if (result instanceof Turtle) env.newTurtle(result);
      return result;
    } else if (value.type === "function") {
      return hold ? value : callFunc(value, env, ast, node.loc.line);
    } else { // not function
      return value;
    }
  } else if (node.type === "skip") return SKIP;
  else if (node.type === "break") return BREAK;
  else if (node.type === "for") { 
    let results = [];
    let iterable = evaluate(node.iterable, env, ast);
    let iterator = node.iterator !== undefined ? node.iterator : undefined;
    if (!isNaN(iterable) && !Array.isArray(iterable)) iterable = range(iterable); // testing shorthand for integers formerly Number.isNumber(iterable) now numbers
    if (!Array.isArray(iterable)) throw "Iterable must be an array.";
    for (let i = 0; i < iterable.length; i++) {
      if (iterator !== undefined) env.add(iterator, iterable[i]);
      let next = evaluate(node.body, env);
      // if (next === undefined) results.push(undefined);
      if (next === SKIP) continue;
      else if (next === BREAK) break;
      else results.push(next);
    };
    env.remove(iterator);
    return results;
  } else if (node.type === "function") { // hmm what do I want to do here
    return node;
  } else if (node.type === "body") {
    return node.value;
  } else {
    console.log(node);
    throw `Unexpected: ${JSON.stringify(node)}.`;
  }
}

const runProgram = (ast, env) => {
  let last;
  while (!ast.eof()) last = evaluate(ast.next(), env, ast);
  return last;
}

const loggingEvaluate = (line, col, oldEvaluate) => (node, env, ast, hold = false) => {
  const show = node.type === "symbol" && line + 1 === node.loc.line && col === node.loc.col;
  if (show) env.logLineTurtleBefore = env.turtle().copy();

  const result = oldEvaluate(node, env, ast, hold);
  // if (result === undefined) throw "Unexpected undefined. If accessing unknown property use: ?"; // TODO

  if (show) env.logLineTurtleAfter = env.show(""); // need to get this turtle into state so I can use it to render handle

  return result;
}

const ogEval = evaluate;
const run = async (ast, env, { line = -1, col = 0 }) => {
  // console.log(ast);
  evaluate = loggingEvaluate(line, col, ogEval);

  const astStream = new Stream(ast);
  let imports = [];
  while (!astStream.eof() && astStream.peek().type === "import") imports.push(astStream.next());

  for (const imp of imports) {
    const src = await fetch(imp.source);
    // first get text of import
    const importAst = parse(await src.text());
    // then run import
    const importEnv = new Environment(builtIns);
    const val = await run(importAst.prog, importEnv);
    // add name of import to current env
    if (val.type !== "function") throw "Can only import functions."

    env.add(imp.name, {
      type: "import",
      function: val,
      env: importEnv
    });
    // this name should be a special import value, it takes the parameters of the return val
    // when it is run it gets it's own scope
  }

  return evaluate(astStream, env);
}



export { evaluate, run }



