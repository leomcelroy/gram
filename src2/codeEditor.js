import { builtIns } from "./runtime/builtIns.js";
import { KEYWORDS, OPERATORS } from "./runtime/parse.js";


const is_letter = (ch) => /[a-z]/i.test(ch); // : should not be here, : should be parsed separately

const regExString = `${
  Object.keys(builtIns)
    .sort((a, b) => b.length - a.length)
    .reduce((acc, cur, i ) => acc + "(" + cur + "(\\s|\\b))" + (i !== Object.keys(builtIns).length - 1 ? `|` : ""), "")
  }`;
const builtInRegEx = new RegExp(regExString, "i");

const kw = [ "layer", ...KEYWORDS ];
const keywords = new RegExp("(" + kw.join("|") + ")\\b");

// old worse one: /[\+\-\*\/\%\=\&\|\<\>\!\.]+|(\b)+(and|or)(\b)+/
const literalOps = OPERATORS
  .flat()
  .map(op => op
    .split("")
    .map( char => is_letter(char) 
      ? char 
      : `\\${char}`)
    .join(""));
const opsString = "(" + literalOps.map(op => (/[a-zA-Z]/.test(op[0])) ? `(\s|\\b)${op}(\s|\\b)` : `${op}`).join("|") + ")";
var operators = new RegExp(`(${opsString})`);


// simplebody regex notes
// The regex matches the token, the token property contains the type

// {
//   regex: /(:)([a-z]+)([?0123456789]|[a-z])*/,
//   token: "variable-2"
// }, // parameter

// Rules are matched in the order in which they appear, so there is
// no ambiguity between this one and the one above

// You can match multiple tokens at once. Note that the captured
// groups must span the whole string in this case
// {
//   regex: /(def)(\s+)([a-z]+[?0123456789]|[a-z]*)/,
//   token: ["keyword", null, "variable-3"]
// }, 

// A next property will cause the mode to move to a different state
// {regex: /\/\*/, token: "comment", next: "comment"},
// indent and dedent properties guide autoindentation

// This is a multi-line comment state
// comment: [{
//   regex: /.*?\*\//,
//   token: "comment",
//   next: "start"
// }, {
//   regex: /.*/,
//   token: "comment"
// }],


CodeMirror.defineSimpleMode("simplemode", {
  meta: {
    lineComment: '\/\/'
  },
  start: [
    { // parameters
      regex: /(def)( *[a-z|0-9|?]*)([a-z| |0-9|?]*)(:|{)/i,
      token: ["keyword", null, "variable-2", null]
    },
    { // parameters
      regex: /(\\)([a-z| |0-9|?]*)(:|{)/i,
      token: ["keyword", "variable-2", null]
    },
    {
      regex: /"(?:[^\\]|\\.)*?(?:"|$)/, // TODO: understand this better
      token: "string"
    }, 
    {
      regex: keywords,
      token: "keyword"
    },
    {
      regex: /true|false|undefined/,
      token: "atom"
    },  
    {
      regex: /\/\/.*/,
      token: "comment"
    },
    {
      regex: operators,
      token: "operator"
    }, 
    {
      regex: /\d+|\d+\.\d+/i,
      token: "number"
    }, 
    {
      regex: builtInRegEx,
      token: "built-in"
    }, 
    { // not colored
      regex: /[a-z$][\w$]*/,
      token: "variable"
    }
  ],
});

function indent(cm) {
  cm.indentSelection("add");
}

function dedent(cm) {
  cm.indentSelection("subtract");
}

function wordAt(cm, pos) {
  var start = pos.ch, end = start, line = cm.getLine(pos.line);
  while (start && CodeMirror.isWordChar(line.charAt(start - 1))) --start;
  while (end < line.length && CodeMirror.isWordChar(line.charAt(end))) ++end;
  return {from: CodeMirror.Pos(pos.line, start), to: CodeMirror.Pos(pos.line, end), word: line.slice(start, end)};
}

function isSelectedRange(ranges, from, to) {
  for (var i = 0; i < ranges.length; i++)
    if (CodeMirror.cmpPos(ranges[i].from(), from) == 0 &&
        CodeMirror.cmpPos(ranges[i].to(), to) == 0) return true
  return false
}

function selectNextOccurrence(cm) {
  var from = cm.getCursor("from"), to = cm.getCursor("to");
  var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
  if (CodeMirror.cmpPos(from, to) == 0) {
    var word = wordAt(cm, from);
    if (!word.word) return;
    cm.setSelection(word.from, word.to);
    fullWord = true;
  } else {
    var text = cm.getRange(from, to);
    var query = fullWord ? new RegExp("\\b" + text + "\\b") : text;
    var cur = cm.getSearchCursor(query, to);
    var found = cur.findNext();
    if (!found) {
      cur = cm.getSearchCursor(query, CodeMirror.Pos(cm.firstLine(), 0));
      found = cur.findNext();
    }
    if (!found || isSelectedRange(cm.listSelections(), cur.from(), cur.to())) return
    cm.addSelection(cur.from(), cur.to());
  }
  if (fullWord)
    cm.state.sublimeFindFullWord = cm.doc.sel;
};

function toggleComment(cm) {
  cm.toggleComment();
}

export function initCodeEditor(main, state) {
  const codemirror = CodeMirror(document.querySelector('#code-editor'), {
    lineNumbers: true,
    tabSize: 2,
    // mode: "simplemode",
    value: main,
    styleActiveLine: {
      nonEmpty: false
    },
    extraKeys: { 
      Tab: indent,
      "Shift-Tab": dedent,
      "Cmd-D": selectNextOccurrence,
      "Cmd-/": toggleComment,
      "Ctrl-/": toggleComment,
    }
  });

  // keymap
  // codemirror.setOption('extraKeys', {
  //   'Cmd-E': function() {
  //     snippet()
  //   },
  //   'Ctrl-E': function() {
  //     snippet()
  //   }
  // })

  const DONT_OPEN = ["Enter", "Escape", "Tab", "Key", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

  codemirror.on("keyup", function(cm, event) {
    if (
      !cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
      !DONT_OPEN.includes(event.code) && 
      state.hints
    ) { /*Enter - do not open autocomplete list just after item has been selected in it*/
      snippet()
    }

    // if (event.code === "Tab" && event.shiftKey) {
    //   console.log("unindent highlighted");
    // }

  });

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;

  function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) result = [];
    return result;
  }

  const snippets = Object.keys(builtIns).map(x => {
    const value = builtIns[x].value || builtIns[x];
    let params = getParamNames(value);
    // if (params[params.length - 1] === "=>") params = params.slice(0, params.length - 1);
    if (params[params.length - 1] === "env") params = params.slice(0, params.length - 1);
    let text = x;
    if (params.length !== 0) text += " " + params.join(" ");
    return {
      text: x,
      displayText: text
    }
  });

  function snippet() {
    CodeMirror.showHint(codemirror, function() {
      const cursor = codemirror.getCursor()
      const token = codemirror.getTokenAt(cursor)
      const start = token.start
      const end = cursor.ch
      const line = cursor.line
      const currentWord = token.string

      const list = snippets.filter(function(item) {
        return item.text.indexOf(currentWord) >= 0
      })

      // should I add enter? [...list, { text: "\n", displayText: ""}]
      return {
        list: list.length && currentWord !== "" ? list : [], // default to []
        from: CodeMirror.Pos(line, start),
        to: CodeMirror.Pos(line, end)
      }
    }, {
      completeSingle: false,
      extraKeys: {
        Enter: "newlineAndIndent"
      }
    })
  }

  return codemirror;
}