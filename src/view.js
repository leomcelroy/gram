// import { render } from "solid-js/web";
// import html from "solid-js/html";
// import { createSignal, onMount } from "solid-js";

import { o, observable, html } from 'sinuous';


// const [showTurtle, setShowTurtle] = createSignal(false);
// const [showDimensions, setShowDimensions] = createSignal(false);
// const [autorun, setAutorun] = createSignal(false);
// const [draw, setDraw] = createSignal(false);
// const [showGrid, setShowGrid] = createSignal(false);

const showTurtle = o(false);
const showDimensions = o(false);
const autorun = o(false);
const draw = o(false);
const showGrid = o(false);

export const View = () => { 
  return html`
    <div class="menu-bar">
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
          <div class="menu-item checkbox">
            <div class="check"></div>
            <div class="checkbox-text">show turtle</div>
          </div>
          <div class="menu-item checkbox" onclick=${() => { showDimensions(!showDimensions()); console.log("hello", showDimensions, showDimensions())}}>  
            <div class="check"></div>
            <div class="checkbox-text">dimensions ${showDimensions}</div>
          </div>
          <div class="menu-item checkbox">
            <div class="check"></div>
            <div class="checkbox-text">autorun</div>
          </div>
          <div class="menu-item checkbox">
            <div class="check"></div>
            <div class="checkbox-text">hints</div>
          </div>
          <div class="menu-item checkbox">
            <div class="check"></div>
            <div class="checkbox-text">draw</div>
          </div>
          <div class="menu-item checkbox">
            <div class="check"></div>
            <div class="checkbox-text">grid</div>
          </div>
        </div>
      </div>
    </div>
    <div class="main-container">
      <div class="code-editor"></div>
      <div class="svg-viewer"></div>
      <div class="vertical-bar"></div>
    </div>
  `

}