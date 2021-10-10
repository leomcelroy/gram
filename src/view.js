import { html } from '../libs/lit-html.js';

function downloads(name) {
  return html`
    <div id="downloads" class="menu-item">
      download
      <div class="button-menu">
        <input class="menu-option name" type="text" placeholder=${name}></input>
        <button id="downloadSVG" class="menu-option menu-item">SVG</button>
        <button id="downloadTxt" class="menu-option menu-item">txt</button>
        <button id="download-url" class="menu-option menu-item">URL</button>
      </div>
    </div>
  `
}

export function view({
    svgCloth, 
    hints, 
    showTurtles,
    showDimensions,
    draw, 
    autorun, 
    consoleMessage,
    content,
    experimental,
    grid,
    name
  }) {
	return html`
    <div id="code-editor"></div>
    <div id="buttons">
      <div id="run" class="menu-item">run (Shift + Enter)</div>
      <div id="center" class="menu-item">view</div>
      ${downloads(name)}
      <div id="options" class="menu-item">
        options
        <div class="button-menu">
          <div id="show-turtles" class="menu-option checkbox">
            <span>
              <div class="fillbox ${showTurtles ? "filled" : ""}"></div>
              <span>show turtle</span>
            </span>
          </div>
          <div id="show-dimensions" class="menu-option checkbox">
            <span>
              <div class="fillbox ${showDimensions ? "filled" : ""}"></div>
              <span>dimensions</span>
            </span>
          </div>
          <div id="autorun" class="menu-option checkbox">
            <span>
              <div class="fillbox ${autorun ? "filled" : ""}"></div>
              <span>autorun</span>
            </span>
          </div>
          <div id="hints" class="menu-option checkbox">
            <span>
              <div class="fillbox ${hints ? "filled" : ""}"></div>
              <span>hints</span>
            </span>
          </div>
          <div id="draw" class="menu-option checkbox">
            <span>
              <div class="fillbox ${draw ? "filled" : ""}"></div>
              <span>draw</span>
            </span>
          </div>
          <div id="grid" class="menu-option checkbox">
            <span>
              <div class="fillbox ${grid ? "filled" : ""}"></div>
              <span>grid</span>
            </span>
          </div>
          <div id="experimental" class="menu-option checkbox">
            <span>
              <div class="fillbox ${experimental ? "filled" : ""}"></div>
              <span>experimental</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div id="vertical-bar"></div>
    <div id="viewer">
      ${svgCloth.draw(content)}
      <div class="
        console 
        ${consoleMessage.error ? "console-erred" : ""} 
        ${consoleMessage.value !== "" ? "console-show" : ""}">
        ${consoleMessage.value}
      </div>    
    </div>
	`
};