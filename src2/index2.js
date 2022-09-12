import { view } from "./view.js";
import { main } from './main.js';
import { initCodeEditor } from "./codeEditor.js";

import { builtIns } from "./runtime/builtIns.js";
import { runtime } from "./runtime/runtime.js";

import { renderApp } from "./render.js";
import { addEvents } from "./addEvents.js";

import { svgCloth } from '../myLibs/svgCloth.js';

import lzutf8 from 'https://cdn.skypack.dev/lzutf8';

// -------------
// --- STATE ---
// -------------

const STATE = {
  svgCloth: new svgCloth(),
  codemirror: undefined,
  showTurtles: false,
  showDimensions: false,
  turtles: [],
  hints: true,
  consoleMessage: { error: false, value: "" },
  dragTarget: undefined,
  draw: false,
  autorun: false,
  tempLine: undefined,
  lastClickedLine: -1,
  directEditHandle: { 
    type: "", 
    line: -1, 
    col: 0,
    // turtle: undefined, 
    args: [],
    dragging: false,
  },
  grid: false,
  experimental: false,
  name: "name_here"
}

// --------------
// -- DISPATCH --
// --------------

async function run(state, first) {
  const code = state.codemirror.getValue();

  // let last = code.slice(code.length - 1);
  // if (last !== "\n") {
  //   code = code + "\n";
  //   state.codemirror.setValue(code);
  // }

  let result;
  try {
    const { directEditHandle } = state;
    // const line = directEditHandle.line;
    result = await runtime(code, builtIns, directEditHandle);
    state.turtles = result.turtles;
    state.consoleMessage.error = false;
    state.consoleMessage.value = result.env.logs.join(", ");
    state.directEditHandle.turtleBefore = result.env.logLineTurtleBefore;
    state.directEditHandle.turtleAfter = result.env.logLineTurtleAfter;

    if (first) { document.getElementById("center").click(); }
  } catch (err) {
    // state.turtles = [];
    console.log(err);
    state.consoleMessage.error = true;
    state.consoleMessage.value = err;
  }
  dispatch("RENDER");
}

const ACTIONS = {
  INIT(args, state) {
    dispatch("RENDER");
    state.codemirror = initCodeEditor(main, STATE);
    addEvents(state);

    const url = new URL(window.location.href);

    const search = window.location.search;
    const code = new URLSearchParams(search).get("code");
    const file = new URLSearchParams(search).get("file");

    if (code) {
      // let uint8 = new Uint8Array(atob(code).split("").map( char => char.charCodeAt(0)) );
      // console.log(uint8);
      // const uint8 = new Uint8Array( code.split(",").map(str => Number(str)) );
      const decoded = lzutf8.decompress(code, { inputEncoding: "StorageBinaryString" });
      // const decoded = btoa(code);
      state.codemirror.setValue(decoded);
      dispatch("RUN", { first: true });
    } else if (file) {

      let file_url = file;

      if (!file.startsWith("http")) file_url = `${url.origin}/gram-examples/${file}`;

      fetch(file_url, {mode: 'cors'})
        .then(file => file
          .text().then( txt => {
            state.codemirror.setValue(txt)
            dispatch("RUN", { first: true });
          })
        );
    }

    dispatch("RUN", { first: true });
  },
  CHANGE_CONSOLE_MESSAGE({ msg }, state) {
    console.log("changing console message to", msg);
    state.consoleMessage.value = msg;
    state.consoleMessage.error = false;
  },
  CHANGE_DIRECT_EDIT_HANDLE({ type, line, col, args }, state) {
    if (type !== "") state.directEditHandle = { type, line, col, args };
    else state.directEditHandle = { type, line: -1, col: 0, args: [], dragging: false };
    // console.log("edit handle", type, line);
    dispatch("RUN", { first: false });
  },
  DRAG_HANDLE_TARGET({ dragging }, state) {
    state.directEditHandle.dragging = true;
  },
  RUN( { first = false } = {}, state) {
    run(state, first);
  },
  SET_CODE( { txt }, state) {
    state.codemirror.setValue(txt);
    run(state, true);
  },
 CHANGE_NAME( { name }, state) {
    state.name = name !== "" ? name : "name_here";
  },
  RENDER(args, state) {},
  STATE(args, state) {
    console.log(state);
  }
}

function dispatch(action, args = {}, rerender = true) {
  const trigger = ACTIONS[action];
  if (trigger) trigger(args, STATE);
  else console.log("Action not recongnized:", action);

  const dont_rerender = ["RUN"];

  if (rerender && !dont_rerender.includes(action)) {
    renderApp(STATE);
  }
}

window.dispatch = dispatch;

window.addEventListener("load", () => dispatch("INIT"));




