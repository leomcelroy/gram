// import { render } from "solid-js/web";
// import html from "solid-js/html";
// import { createSignal, onMount } from "solid-js";

import { o, observable, html } from 'sinuous';


import "./codemirror.js";



// const [showTurtle, setShowTurtle] = createSignal(false);
// const [showDimensions, setShowDimensions] = createSignal(false);
// const [autorun, setAutorun] = createSignal(false);
// const [draw, setDraw] = createSignal(false);
// const [showGrid, setShowGrid] = createSignal(false);

const showTurtles = o(false);
const showDimensions = o(false);
const autorun = o(false);
const draw = o(false);
const showGrid = o(false);

export const View = () => { 
  // fetch("https://raw.githubusercontent.com/hackclub/sprig/main/README.md").then(res => res.text().then(b => console.log(b)));
  
  return html`
    <div class="menu-bar no-select">
      <div class="menu-item">run (shift + enter)</div>
      <div class="menu-item dropdown-menu">
        save
        <div class="dropdown-menu-container">
          <input class="name-input" type="text" placeholder="name_here" default?/>
          <div class="menu-item">txt</div>
          <div class="menu-item">svg</div>
          <div class="menu-item">url</div>
        </div>
      </div>
      <div class="menu-item">center view</div>
      <div class="menu-item dropdown-menu">
        view options
        <div class="dropdown-menu-container">
          <div class="menu-item checkbox" onclick=${() => showTurtles(!showTurtles())}>
            <div class="check ${() => showTurtles() ? "checked" : ""}"></div>
            <div class="checkbox-text">show turtles</div>
          </div>
          <div class="menu-item checkbox" onclick=${() => showGrid(!showGrid())}>
            <div class="check ${() => showGrid() ? "checked" : ""}"></div>
            <div class="checkbox-text">grid</div>
          </div>
          <div class="menu-item checkbox" onclick=${() => showDimensions(!showDimensions())}>  
            <div class="check ${() => showDimensions() ? "checked" : ""}"></div>
            <div class="checkbox-text">dimensions</div>
          </div>
          <div class="menu-item checkbox" onclick=${() => autorun(!autorun())}>
            <div class="check" style=${() => autorun() ? "background:blue;" : "background:white;"}></div>
            <div class="checkbox-text">autorun</div>
          </div>
          <div class="menu-item checkbox" onclick=${() => draw(!draw())}>
            <div class="check ${() => draw() ? "checked" : ""}"></div>
            <div class="checkbox-text">draw</div>
          </div>
        </div>
      </div>
    </div>
    <div class="main-container">
      <div class="code-editor">
        <codemirror-editor></codemirror-editor>
      </div>
      <div class="svg-viewer"></div>
      <div class="vertical-bar"></div>
    </div>
  `

}