import Delegate from "../libs/delegate.js";
import { parse } from "./runtime/parse.js";

import { handleLineMaker } from "./helpers/handleLineMaker.js";
import { minsMaxes } from "./helpers/minsMaxes.js";
import { upload } from "./helpers/upload.js";
import { download, downloadSVG } from "./helpers/download.js";


const getDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const getAngle = (p1, p2) => (180 / Math.PI) * Math.atan2(p2.y - p1.y, p2.x - p1.x);
const round = (x, precision = 1) => Math.round(x*precision)/precision
const negate = x => x < 0 ? `~${x.toString().substring(1)}` : x;

function pauseEvent(e) {
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

function getStartEndSelection (editor) {
      const cursor = editor.getCursor();
      const line = cursor.line;
      let token = editor.getTokenAt(cursor);
      let start = {line, ch: token.start};
      let end = {line, ch: token.end};

      if (token.type !== "number") {
        token = editor.getTokenAt({line, ch: token.end + 1});
        start = {line, ch: token.start};
        end = {line, ch: token.end};
      };

      return {start, end};
}

  // const pan = (state, originX, originY, el) => {
  //   state.translateX += originX;
  //   state.translateY += originY;
  //   el.style.transform = // I should just set the property here
  //       getMatrix({ scale: state.scale, translateX: state.translateX, translateY: state.translateY });

  //   if (el.id !== "realpz") return; //TODO: not ideal method here
  //   var panZoomWindow = document.querySelector("#panZoomWindow"); //TODO should be different for svg window

  //   // let size = panZoomWindow.style["background-size"] || 100;
  //   // console.log("should % by size", size)
  //   // let size = 100;
  //   // panZoomWindow.style["background-position"] = `left ${state.translateX%size}px top ${state.translateY%size}px`;
  //   // panZoomWindow.style["background-position"] = `left ${state.translateX}px top ${state.translateY}px`;
  // };

  // const getScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }) => {
  //   let newScale = scale + (deltaScale / (scaleSensitivity / scale));
  //   newScale = Math.max(minScale, Math.min(newScale, maxScale));
  //   return [scale, newScale];
  // };

  // const wheel = (evt, state) => {
  //   // console.log("zoom")
  //   evt.preventDefault();
  //   // evt.stopPropagation()

  //   var el = document.getElementById("realpz");

  //   let deltaScale = Math.sign(evt.deltaY) > 0 ? -1 : 1;
  //   let x = evt.pageX;
  //   let y = evt.pageY;

  //   const { left, top } = el.getBoundingClientRect();
  //   const [minScale, maxScale, scaleSensitivity] = [0.1, 1, 20];
  //   const [scale, newScale] = getScale({
  //     scale: state.zoomState.scale,
  //     deltaScale,
  //     minScale,
  //     maxScale,
  //     scaleSensitivity
  //   });
  //   const originX = x - left;
  //   const originY = y - top;
  //   const newOriginX = originX / scale;
  //   const newOriginY = originY / scale;
  //   const translate = getTranslate({ scale, minScale, maxScale });
  //   const translateX = translate({
  //     pos: originX,
  //     prevPos: state.zoomState.originX,
  //     translate: state.zoomState.translateX
  //   });
  //   const translateY = translate({
  //     pos: originY,
  //     prevPos: state.zoomState.originY,
  //     translate: state.zoomState.translateY
  //   });

  //   el.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
  //   el.style.transform = getMatrix({ scale: newScale, translateX, translateY });
  // };

function addImgPanZoom(body) {
  let mousedown = false;

  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let start = { x: 0, y: 0 };

  function setTransform(el) {
    el.style.transformOrigin = `${0}px ${0}px`;
    el.style.transform = "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";
  }

  body.on("mousedown", "#viewer", (e) => {
    mousedown = true;

    start = { x: e.offsetX - pointX, y: e.offsetY - pointY };
  })

  body.on("mousemove", "#viewer", (e) => {
    if (!mousedown) return;

    pointX = (e.offsetX - start.x);
    pointY = (e.offsetY - start.y);

    const imgs = document.querySelectorAll(".resize-manual");

    for (const img of imgs) {
      setTransform(img);
    }

  })

  body.on("mouseup", "#viewer", (evt) => {
    mousedown = false;
  })

  body.on("wheel", "#viewer", (e) => {
    
    let xs = (e.offsetX - pointX) / scale;
    let ys = (e.offsetY - pointY) / scale;

    let delta = Math.sign(e.deltaY) > 0 ? -1 : 1;
    if (delta > 0) scale *= 1.03;
    else scale /= 1.03;

    pointX = e.offsetX - xs * scale;
    pointY = e.offsetY - ys * scale;

    const imgs = document.querySelectorAll(".resize-manual");


    for (const img of imgs) {
      setTransform(img);
    }

  })

  body.on("keydown", (e) => {
    let code = e.code;
    // console.log(code, event);
    if (code === "Backspace" && event.shiftKey) {
      event.preventDefault();
      const imgs = document.querySelectorAll(".resize-manual");
      for (const img of imgs) {
        img.remove();
      }
    }
  });
}

export function addEvents(state) {
  document.getElementById("run").addEventListener("click", () => dispatch("RUN"));

  document.getElementById("center").addEventListener("click", function() {
    const extrema = minsMaxes(state.turtles);
    state.svgCloth.focusOn(extrema);
  })

  document.getElementById("downloadSVG").addEventListener("click", function() {
    downloadSVG(state.name, state.turtles, state.codemirror.getValue());
  })

  document.getElementById("downloadTxt").addEventListener("click", function() {
    download(`${state.name}.txt`, state.codemirror.getValue());
  })

  function copy(str) {
    const inp = document.createElement('input');
    document.body.appendChild(inp);
    inp.value = str;
    inp.select();
    document.execCommand('copy', false);
    inp.remove();
  }

  document.getElementById("download-url").addEventListener("click", function() {
    const rawCode = state.codemirror.getValue();
    const encoded = lzutf8.compress(rawCode, { outputEncoding: "StorageBinaryString" });
    // const base64 = btoa(String.fromCharCode.apply(null, encoded));
    // const serialized = encoded.join(",");
    // const serialized = btoa(encoded);
    // console.log(encoded, encoded.length)

    copy(`https://leomcelroy.com/gram/?code=${encoded}`);

    state.consoleMessage = { 
      error: false, 
      value: `URL copied to clipboard.\n
There is a size limit for URL files.\n
For reliable saving download txt.` };
    dispatch("RENDER");
  })

  document.getElementById("show-turtles").addEventListener("click", function() {
    state.showTurtles = !state.showTurtles;
    dispatch("RENDER");
  })

  document.getElementById("show-dimensions").addEventListener("click", function() {
    state.showDimensions = !state.showDimensions;
    dispatch("RENDER");
  })

  document.getElementById("draw").addEventListener("click", function() {
    state.draw = !state.draw;
    dispatch("RENDER");
  })

  document.getElementById("experimental").addEventListener("click", function() {
    state.experimental = !state.experimental;
    dispatch("RENDER");
  })

  document.getElementById("grid").addEventListener("click", function() {
    state.grid = !state.grid;
    dispatch("RENDER");
  })

  document.getElementById("hints").addEventListener("click", function() {
    state.hints = !state.hints;
    dispatch("RENDER");
  })

  document.getElementById("autorun").addEventListener("click", function() {
    state.autorun = !state.autorun;
    dispatch("RENDER");
  })

  document.addEventListener("keydown", function(event) {
    let code = event.code;
    // console.log(code, event);
    if (code === "Enter" && event.shiftKey) {
      event.preventDefault();
      dispatch("RUN");
    }

    // cache
    const rawCode = state.codemirror.getValue();
    localStorage.setItem("gram-cache", rawCode);
  });

  document.addEventListener("keyup", function(event) {
    let code = event.code;
    if (state.autorun) dispatch("RUN");

    // clean up handles
    // don't want it hanging around if line number changes
    if (state.directEditHandle.line !== -1) dispatch("CHANGE_DIRECT_EDIT_HANDLE", { type: "" });
  });

  const body = new Delegate(document.body);

  body.on("mousedown", e => {
    if (e.detail === 1) state.lastClickedLine = state.codemirror.getCursor().line;

    if (e.detail === 3 && state.experimental) {
      const text = state.codemirror.getSelection();

      dispatch("CHANGE_DIRECT_EDIT_HANDLE", { type: "" });
      if (!text) return;

      const { prog: ast } = parse(text);

      // const cursor = state.codemirror.getCursor();
      // const numberLines = state.codemirror.lineCount();
      const line = state.lastClickedLine;
      const [cmd, ...args] = ast;
      if (!cmd) return;
      const { value, type } = cmd;
      
      const HANDLEABLE = ["turnforward", "goto", "arc", "rotate", "scale", "translate", "move"]
      if (type === "symbol") {
        if (HANDLEABLE.includes(value.toLowerCase())) {
          dispatch(
            "CHANGE_DIRECT_EDIT_HANDLE", 
            { type: value.toLowerCase(), line, col: cmd.loc.col, args }, 
            false
          );
        }
      } 


    }
  })

  body.on("mousedown", "#inner-svg-view", (e) => {
    if (state.draw) {
      const newPoint = state.svgCloth.getPoint(e);
      // get last turtle location
      // check if last piece of program is layer
      // if not create new layer and insert the turnforward line
      // if so then insert turnforward line into layer
      const code = state.codemirror.getValue();
      const ast = parse(code).prog;
      const lastTurtle = state.turtles[0];
      const lastPoint = lastTurtle.end;
      newPoint.y = -newPoint.y;
      const lastAngle = lastTurtle.angle;
      const d = getDistance(newPoint, lastPoint);
      const a = getAngle(newPoint, lastPoint) - lastAngle + 180;
      
      const newCode =  code + `\nturnforward ${negate(round(a))} ${negate(round(d))}`
      state.codemirror.setValue(newCode);

      dispatch("RUN");

    }
  })

  body.on("mousemove", "#inner-svg-view", (e) => {
    if (state.draw) {
      const newPoint = state.svgCloth.getPoint(e);
      const lastTurtle = state.turtles[0].copy();
      const lastPoint = lastTurtle.end;
      newPoint.y = -newPoint.y;
      const lastAngle = lastTurtle.angle;
      const d = getDistance(newPoint, lastPoint);
      const a = getAngle(newPoint, lastPoint) - lastAngle + 180;
      lastTurtle.turnForward(a, d);
      const tempLine = [ lastTurtle.pointsFromLast(1), lastTurtle.pointsFromLast(0) ];
      state.tempLine = tempLine;

      dispatch("RENDER");
    } else if ( state.directEditHandle.dragging ) {

      const mouseLocation = state.svgCloth.getPoint(e);
      const newLine = handleLineMaker(state.directEditHandle, mouseLocation);

      var doc = state.codemirror.getDoc();
      const { line } = state.directEditHandle;
      var lineContents = doc.getLine(line); // get the line contents
      var pos = { line, ch: lineContents.length }
      doc.replaceRange(newLine, { line, ch: 0 }, pos); // adds a new line
      dispatch("RUN");

    }
  })

  body.on("mousedown", ".cm-number", (e) => {
    state.dragTarget = Number(e.target.innerHTML);
  })

  body.on("mousemove", (e) => {
    if (state.dragTarget === "#vertical-bar") {
      const dx = e.movementX/window.innerWidth * 100;
      let cur = getComputedStyle(document.documentElement)
        .getPropertyValue('--vertical-bar')
        .slice(0, -1);
      cur = parseFloat(cur);

      let x = cur + dx;

      const minX = 0;
      const maxX = 99;

      if (x < minX) x = minX;
      if (x > maxX) x = maxX;

      document.documentElement.style.setProperty("--vertical-bar", `${x}%`);

      pauseEvent(e);

    } else if (state.dragTarget !== undefined) {
      // console.log(e.offsetX, screen.width);
      // if (e.offsetX < 3)
      
      state.dragTarget += e.movementX;
      if (state.dragTarget < 0) state.dragTarget = 0;
      const { start, end } = getStartEndSelection(state.codemirror);
      state.codemirror.getDoc().replaceRange(`${state.dragTarget}`, start, end);
      dispatch("RUN");

      // clean up handles
      if (state.directEditHandle.line !== -1) dispatch("CHANGE_DIRECT_EDIT_HANDLE", { type: "" } );

      pauseEvent(e);
    }
  })

  body.on("mouseleave", (e) => {
    if (state.dragTarget !== undefined) state.dragTarget = undefined;
  })

  body.on("mouseup", (e) => {
    if (state.dragTarget !== undefined) state.dragTarget = undefined;
    if (state.directEditHandle.dragging) state.directEditHandle.dragging = false;
  })

  body.on("mousedown", "#vertical-bar", function(evt) {
    state.dragTarget = "#vertical-bar";
  });

  body.on("drop", function(evt) {    
    let dt = evt.dataTransfer;
    let files = dt.files;

    upload(files);

    pauseEvent(evt);
  });

  body.on("dragover", function(evt) {    
    pauseEvent(evt);
  });

  body.on("keyup", ".name", function(evt) {
    dispatch("CHANGE_NAME", { name: evt.target.value })
  })

  addImgPanZoom(body);

}

