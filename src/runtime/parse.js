// constants
export const KEYWORDS = [
  "if",
  "elif",
  "else", 
  "for",
  "skip",  
  "break", 
  "import", 
  "as", 
  "def",
  "dict"
];

export const OPERATORS = [
  ["="], // assignment
  [
    "to", "or", "and", 
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
    if (msg === "Can't handle character: #") msg += "\n # replaced with .() for accessing" // temporary to help update
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
const is_unary = (ch) => ["?", "@", "~"].includes(ch); // also ! but that could be binary

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

  // function read_dot() {
  //   let next = input.peek(1);
  //   if (is_digit(next)) return read_number();
  //   else if (is_symbol_start(next)) { // TODO: do I want this
  //     input.next();
  //     return { type: "op", value: "#", getter: true };
  //   } else input.croak("Dot should be followed by number or symbol.")
  // }

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

  function is_punc(ch) {
    var tok = input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }

  function skip_punc(ch) {
    if (is_punc(ch)) input.next();
    else input.croak("Expecting punctuation: \"" + ch + "\"");
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

      const right = parse_expression(his_prec);

      // if (tok.getter) right.type = "string";
      if (right.type === "symbol" && tok.value === ".") right.type = "string";
      

      return maybe_binary({
        type: "binary",
        operator: tok.value,
        left: left,
        right,
        loc: left.loc
      }, my_prec);
    } else {
      return left;
    }

  }

  function parse_cond() {
    const cond = [];
    while (!input.eof()) {
      cond.push(parse_expression());
      if ( is_punc(":") || is_punc("{")) break;
    }

    return cond;
  }

  function parse_if(elif = false) {
    if (!elif) skip_kw("if");

    const cond = parse_cond();

    const result = {
      type: "if",
      cond: { type: "expression", value: cond },
      then: { type: "expression", value: parse_body().value },
      else: undefined,
    };

    if (is_kw("elif")) {
      skip_kw("elif");
      result.else = parse_if(true);
    } else if (is_kw("else")) {
      skip_kw("else");
      result.else = { type: "expression", value: parse_body().value };
    }

    return result;
  }

  function parse_for() { // for ([] | num) (as iterator)
    skip_kw("for");
    let loop = {
      type: "for",
      iterable: parse_expression(),
      iterator: undefined,
    };
    if (is_kw("as")) {
      skip_kw("as");
      if (input.peek().type !== "symbol") throw "Iterator must be symbol."
      loop.iterator = input.next().value;
    }

    const body = parse_body();
    loop.body = body.value;

    return loop;
  }

  function parse_colon() {
    const body = [];
    const loc = input.peek().loc;
    const { line: currentLine, firstColOfLine } = loc;

    skip_punc(":");
    const closingPunc = () => is_punc("]") || is_punc(")") || is_punc("}");

    if (input.peek() && input.peek().loc.line === currentLine) {
      while (input.peek() && input.peek().loc.line === currentLine && !closingPunc()) {
        body.push(parse_expression());
      }
    } else {

      let first = true;
      let col = firstColOfLine;
      while (input.peek() && input.peek().loc.col > firstColOfLine) {
        if (first) {
          first = false;
          col = input.peek().loc.firstColOfLine;
        } else if (col !== input.peek().loc.firstColOfLine) input.croak(`Misaligned block on line: ${input.peek().loc.line}`);
        body.push(parse_expression());
      }
    }

    return { type: "body", value: body };
  }

  function parse_curly() {
    const body = [];
    skip_punc("{")
    while (!is_punc("}")) body.push(parse_expression());
    skip_punc("}")

    return { type: "body", value: body };
  }

  function parse_body(prec = 0) {
    const body = parse_expression(prec);
    if (body.type !== "body") input.croak("Expecting { or :");
    return body;
  }

  function parse_fun(anon = false) {
    input.next(); // skip "\" or "fun"

    const name = !anon ? input.next() : undefined;
    if (name && name.type !== "symbol") input.croak("Expecting symbol.")

    const params = parse_params();

    const body = parse_body(MAX_PRECEDENCE);

    const func = {
      type: "function",
      arity: params.length,
      params,
      body: body.value,
      builtIn: false
    };

    return anon ? func : {
      type: "binary",
      operator: "=",
      constant: true,
      left: name,
      right: func
    };
  }

  function parse_params() {
    const params = [];
    while (!input.eof() && input.peek().type === "symbol") params.push(input.next().value);
    return params;
  }

  function parse_import() {
    skip_kw("import");
    const importExp = { type: "import" };
    if (input.peek().type !== "string") throw "Please specify string of source."
    importExp.source = input.next().value;
    skip_kw("as");

    if (input.peek().type !== "symbol") throw "Please specify symbol of import."
    importExp.name = input.next().value;

    return importExp;
  }

  function parse_array() {
    let value = [];
    skip_punc("[");
    while (!is_punc("]") && !input.eof()) value.push(parse_expression());
    skip_punc("]")
    return { type: "array", value };
  }

  function parse_paren() {
    let value = [];
    skip_punc("(");
    while (!is_punc(")") && !input.eof()) value.push(parse_expression());
    skip_punc(")");

    return { type: "expression", value };
  }

  function parse_hash_map() {
    const body = [];
    skip_kw("dict");
    skip_punc("[")
    while ( !is_punc("]") ) {
      const key = parse_expression();
      if (key.type === "symbol") key.type = "string";
      const value = parse_expression();
      body.push([key, value])
    }
    skip_punc("]")

    return { type: "hash-map", body }; 
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
    else if (is_kw("import")) tok = parse_import();
    else if (is_kw("skip")) { input.next(); tok = { type: "skip" } }
    else if (is_kw("break"))  { input.next(); tok = { type: "break" } }
    else if (is_punc("{")) tok = parse_curly();
    else if (is_punc(":")) tok = parse_colon();
    else if (is_kw("dict")) tok = parse_hash_map();
    else if (type === "unary") {
      tok = {
        type: "unary",
        operator: input.next().value,
        arg: parse_expression(MAX_PRECEDENCE - 1) // want to be less than #
      }
    } else {
      const literals = ["number", "string", "boolean", "symbol"];
      tok = input.next();

      if (!literals.includes(tok.type)) unexpected(tok);
    }

    return { ...tok, loc };
  }

  function parse_toplevel() {
    var prog = [];
    while (!input.eof()) prog.push(parse_expression());
    return {
      type: "prog",
      prog: prog
    };
  }

  function parse_expression(prec = 0) {
    return maybe_binary(parse_atom(), prec);
  }
}