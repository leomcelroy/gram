// constants
export const KEYWORDS = [
  "if",
  "elif",
  "else", 
  "for",
  "skip",  
  "break", 
  "as", 
  "def"
];


// built in funcs
// eval, run, quote, if, for, fn operators

// add quote

// what does this.(something) or this.(5) mean
// what of 8-(87)

// can only call if function
// first eval symbol
// if not function don't call
// if not function and args passed then throw error

export const OPERATORS = [
  ["="], // assignment
  [
    "or", "and", 
    "<", ">", "<=", ">=", 
    "==", "!=", 
    "+", "-", "*", "/", 
    "%", "^", "|"
  ], // binary operators
  [], // unary
  ["."] // get
];

const PRECEDENCE = Object.fromEntries(
  OPERATORS.map((level, i) => level.map(op => [op, i + 1])).flat()
);

const MAX_PRECEDENCE = OPERATORS.length;

class InputStream {
  constructor(string) {
    this.pos = 0;
    this.line = 1;
    this.col = 0;
    this.input = string;
  }

  next() {
    let ch = this.input.charAt(this.pos++);
    if (ch === "\n") {
      this.line++;
      this.col = 0;
    } else this.col++;
    return ch;
  }

  peek(offset = 0) {
    return this.input.charAt(this.pos + offset);
  }

  eof() {
    return this.peek() === "";
  }

  loc() {
    return { line: this.line, col: this.col };
  }

  croak(msg) {
    if (msg === "Can't handle character: #") msg += "replaced with .() for accessing" // temporary to help update
    throw new Error(msg + " (" + this.line + ":" + this.col + ")");
  }
}

// predicates
const is_keyword = (x) => KEYWORDS.includes(x);
const is_digit = (ch) => /[0-9]/i.test(ch);
const is_symbol_start = (ch) => /[a-z]/i.test(ch); // : should not be here, : should be parsed separately
const is_symbol = (ch) => is_symbol_start(ch) || "0123456789_".indexOf(ch) >= 0;
const is_op_char = (ch) => ["+", "-", "*", "/", "%", "=", "|", "<", ">", "!", "^"].includes(ch); // TODO: need to get unary operators working, should "." be an op
const is_whitespace = (ch) => " \t\r\n".indexOf(ch) >= 0;
const is_punc_char = (ch) => ["(", ")", "[", "]", "{", "}", ":"].includes(ch);
const is_unary = (ch) => ["?", "~", "'"].includes(ch); // also ! but that could be binary

function TokenStream(string) {
  let input = new InputStream(string);

  let current = null;

  let currentLine = 1;
  let firstColOfLine = 0;

  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: input.croak,
  };


  // helper to read
  function read_while(predicate) {
    let ch = input.peek();
    let str = "";
    while (!input.eof() && predicate(input.peek()))
      str += input.next();
    return str;
  }

  // read symbol
  function read_symbol() {
    let symbol = read_while(is_symbol).toLowerCase(); // case insensitivity

    if (symbol === "true") return { type: "boolean", value: true}; 
    else if (symbol === "false") return { type: "boolean", value: false }; 
    else if (symbol in PRECEDENCE) return { type: "op", value: symbol };
    else return { type: is_keyword(symbol) ? "keyword" : "symbol", value: symbol };
  }

  // read string
  function read_escaped(end) {
    let escaped = false,
    str = "";
    input.next();
    while (!input.eof()) {
      let ch = input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }

  function read_string() {
    return {
      type: "string",
      value: read_escaped(`"`)
    };
  }

  // read number
  function read_number() {
    let dots_seen = 0;
    let number = read_while(function(ch) {
      if ( ch === ".") {
        dots_seen++;
        if (dots_seen > 1) input.croak("Multiple decimals in number.")
        return true;
      } else return is_digit(ch);
    });

    let parsedNum = parseFloat(number);

    if (isNaN(parsedNum)) input.croak("Not a number.");

    return {
      type: "number",
      value: parsedNum
    };
  }

  function skip_comment() {
    read_while(ch => ch !== "\n");
    input.next();
  }

  function read_dot_operator() {
    input.next(); 
    return { value: ".", type: "op" }; 
  }

  function getLocation() {
    let loc = input.loc();
    if (loc.line !== currentLine) {
      firstColOfLine = loc.col;
      currentLine = loc.line;
    }

    loc.firstColOfLine = firstColOfLine;

    return loc;
  }

  // reading
  function read_token() {
    read_while(is_whitespace);
    // if (ch === ";") { input.next(); return read_token(); }

    let loc = getLocation();

    if (input.eof()) return null;

    let ch = input.peek();

    let result;
    if ( ch === "." && !is_digit(input.peek(1)) ) result = read_dot_operator();
    else if (is_punc_char(ch)) result = { type: "punc", value: input.next() };
    else if (is_unary(ch)) result = { type: "unary", value: input.next() };
    else if (is_op_char(ch)) {
      const value = read_while(is_op_char);
      if (value === "//") {
        skip_comment();
        return read_token(); // need this return to keep right line count
      } else if (value === "!") {
        result = { type: "unary", value: "!" };
      } else if (OPERATORS.flat().includes(value)) {
        result = { type: "op", value };
      } else {
        input.croak(`Unexpected operator: ${value}`)
      }
    } else if (is_symbol_start(ch)) result = read_symbol();
    else if (ch === '"') result = read_string();
    else if (ch === '\\') { input.next(); result = { type: "anon-function" }; } 
    else if (is_digit(ch)  || ch === "." ) result = read_number();
    // else if (ch === ".") result = read_dot();

    if (input.peek(0) === "." && is_digit(input.peek(1))) input.croak("Please place number index in '( )'.")

    if (result) return { ...result, loc };
    else input.croak("Can't handle character: " + ch);
  }

  function peek() {
    return current || (current = read_token());
  }

  function next() {
    var tok = current;
    current = null;

    return tok || read_token();
  }

  function eof() {
    return peek() === null;
  }
}

export function parse(string) {
  const input = TokenStream(string);

  return parse_toplevel();

  function quote() {
    return { type: "symbol", value: "quote" }
  }

  function is_punc(ch) {
    var tok = input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }

  function skip_punc(ch) {
    if (is_punc(ch)) input.next();
    else input.croak("Expecting punctuation: \"" + ch + "\"");
  }

  function delimited(start, stop, separator = false) {
    var a = [], first = true, skipped = false;
    skip_punc(start);
    while (!input.eof()) {
        if (is_punc(stop)) break;
        if (first || !separator) first = false; else { skipped = true; skip_punc(separator) };
        if (is_punc(stop)) break; // the last separator can be missing
        a.push(parse_expression());
    }
    skip_punc(stop);
    return a;
  }

  function is_op(op) {
    var tok = input.peek();
    return tok && tok.type === "op" && (!op || tok.value === op) && tok;
  }

  function is_kw(kw) {
    var tok = input.peek();
    return tok && tok.type === "keyword" && (!kw || tok.value === kw) && tok;
  }

  function skip_kw(kw) {
    if (is_kw(kw)) input.next();
    else input.croak("Expecting keyword: \"" + kw + "\"");
  }

  function unexpected(tok) {
    input.croak("Unexpected token: " + JSON.stringify(tok));
  }

  function maybe_binary(left, my_prec) {
    var tok = is_op();
    if (!tok) return left; // guard statement

    var his_prec = PRECEDENCE[tok.value];
    if (his_prec > my_prec) {
      input.next();

      let right = parse_expression(his_prec);

      if (tok.value === "=") {
        right = [ right ];
        let line = tok.loc.line;
        while (!input.eof() && input.peek().loc.line === line) {
          right.push(parse_expression());
        }

        if (right.length === 1) right = right[0];
      }

      // if tok is = gather up calls till end of line

      // if (tok.getter) right.type = "string";
      if (right.type === "symbol" && tok.value === ".") right.type = "string";
      

      return maybe_binary([ 
          { type: "symbol", value: tok.value }, 
          left, 
          right 
        ], my_prec);
    } else {
      return left;
    }

  }

  function parse_cond() {
    const cond = parse_expression();
    if ( !(is_punc(":") || is_punc("{")) ) input.croak("Expecting body.");

    return cond;
  }

  function parse_if(elif = false) {
    if (!elif) skip_kw("if");

    const cond = parse_cond();
    const thenClause = parse_body();
    let elseClause = undefined;

    if (is_kw("elif")) {
      skip_kw("elif");
      elseClause = [ quote(), parse_if(true) ];
    } else if (is_kw("else")) {
      skip_kw("else");
      elseClause = parse_body();
    }

    return [
      { type: "symbol", value: "if" },
      cond,
      thenClause,
      elseClause
    ];
  }

  function parse_iterable() {
    const cond = parse_expression();
    if ( !is_punc(":") && !is_punc("{") && !is_kw("as")) input.croak(`Expecting body or "as".`);
    
    return [
      { type: "symbol", value: "quote"},
      cond
    ] 
  }

  function parse_for() { // for ([] | num) (as iterator)
    skip_kw("for");
    let loop = {
      type: "for",
      iterable: parse_iterable(),
      iterator: undefined,
    };
    if (is_kw("as")) {
      skip_kw("as");
      if (input.peek().type !== "symbol") throw "Iterator must be symbol."
      loop.iterator = { type: "symbol", value: input.next().value };
    }

    const body = parse_body();

    return [
      { type: "symbol", value: "for"},
      loop.iterable,
      loop.iterator,
      body
    ];
  }

  function parse_colon() {
    const body = [];
    const loc = input.peek().loc;
    const { line: currentLine, firstColOfLine } = loc;
    let callLine = -1;

    skip_punc(":");
    const closingPunc = () => is_punc("]") || is_punc(")") || is_punc("}");

    if (input.peek() && input.peek().loc.line === currentLine) {
      while (input.peek() && input.peek().loc.line === currentLine && !closingPunc()) {
        
        if (callLine !== input.peek().loc.line) {
          if (!input.eof()) callLine = input.peek().loc.line;
          body.push([ parse_expression() ]);
        } else body.at(-1).push(parse_expression());
      }
    } else {

      let first = true;
      let col = firstColOfLine;

      while (input.peek() && input.peek().loc.col > firstColOfLine) {
        if (first) {
          first = false;
          col = input.peek().loc.firstColOfLine;
        } else if (col !== input.peek().loc.firstColOfLine) input.croak(`Misaligned block on line: ${input.peek().loc.line}`);
        
        if (callLine !== input.peek().loc.line) {
          if (!input.eof()) callLine = input.peek().loc.line;

          body.push([ parse_expression() ]);
        } else body.at(-1).push(parse_expression());

        
      }
    }

    return [ quote(), body ];
  }

  function parse_curly() {
    const body = [];
    skip_punc("{")

    let line = -1;
    while (!is_punc("}")) {
      if (line !== input.peek().loc.line) {
        line = input.peek().loc.line;
        body.push([ parse_expression() ]);
      } else body.at(-1).push(parse_expression());

    }

    skip_punc("}")

    return [ quote(), body ];
  }

  function parse_body(prec = 0) {
    const body = parse_expression(prec);
    if (!(Array.isArray(body) && body[0].value === "quote")) input.croak("Expecting { or :");

    return body;
  }

  function parse_toplevel() {
    const body = [];

    let line = -1;
    while (!input.eof()) {
      // console.log(input.peek(), line !== input.peek().loc.line);
      if (line !== input.peek().loc.line) {
        // console.log("new call");
        if (!input.eof()) line = input.peek().loc.line;
        body.push([ parse_expression() ]);
      } else { 
        // console.log("add argument");
        body.at(-1).push(parse_expression());
      }
    }

    return [ quote(), body ];
  }

  function parse_fun(anon = false) {
    input.next(); // skip "\" or "fun"

    const name = !anon ? input.next() : undefined;
    if (name && name.type !== "symbol") input.croak("Expecting symbol.")

    const params = parse_params();

    const body = parse_body(MAX_PRECEDENCE);

    const func = [
      { type: "symbol", value: "fn" },
      params,
      body
    ];


    return anon 
      ? func
      : [ { type:"symbol", value: "=" }, name, func ]
  }

  function parse_params() {
    const params = [];
    while (!input.eof() && input.peek().type === "symbol") params.push(input.next().value);
    return params.map(p => ({ type: "symbol", value: p }));
  }

  function parse_array() {
    let value = [];
    skip_punc("[");
    while (!is_punc("]") && !input.eof()) value.push(parse_expression());
    skip_punc("]")

    value.unshift({ type:"symbol", value: "arr" });
    return value;
  }

  function parse_paren() {
    let value = [];
    skip_punc("(");
    while (!is_punc(")") && !input.eof()) value.push(parse_expression());
    skip_punc(")");

    return value;
  }

  function parse_atom() {
    const { type, loc } = input.peek();
    let tok;
    if (is_punc("(")) tok = parse_paren();
    else if (is_punc("[")) tok = parse_array();
    else if (is_kw("if")) tok = parse_if();
    else if (is_kw("def")) tok = parse_fun();
    else if (type === "anon-function") tok = parse_fun(true);
    else if (is_kw("for")) tok = parse_for();
    else if (is_kw("skip")) { input.next(); tok = { type: "skip" } }
    else if (is_kw("break"))  { input.next(); tok = { type: "break" } }
    else if (is_punc("{")) tok = parse_curly();
    else if (is_punc(":")) tok = parse_colon();
    else if (type === "unary") {
      tok = [ 
        { type:"symbol", value: input.next().value },
        parse_expression(MAX_PRECEDENCE - 1)
      ]
    } else {
      const literals = ["number", "string", "boolean", "symbol"];
      tok = input.next();

      if (!literals.includes(tok.type)) unexpected(tok);
    }

    return Array.isArray(tok) ? tok : {
      type: tok.type,
      value: tok.value
    };
  }

  function parse_expression(prec = 0) {
    return maybe_binary(parse_atom(), prec);
  }
}