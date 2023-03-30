import { render, svg } from '../libs/lit-html.js';

import { view } from "./view.js";
import { Turtle, drawTurtle } from "../myLibs/gram-js.js";
import { drawDirectEditHandle } from "./drawDirectEditHandle.js";

const drawLine = ( [p0, p1] ) => svg`
  <g transform="scale(1, -1)">
    <polyline 
      points="${p0.x},${p0.y} ${p1.x},${p1.y}" 
      stroke="black"
      stroke-width="2px"
      vector-effect="non-scaling-stroke"/>
  </g>
`

function group() {
  const turtles = arguments;

    let path = [];
    for (const turtle of turtles) {
      if (turtle.path.length === 1) {
        if (turtle.path[0].points.length === 1) continue;
      };
      path = [...path, ...turtle.path];
    };

    const final = new Turtle();
    if (path.length > 0) final.path = path;
    final.angle = turtles[turtles.length - 1].angle;

    return final;
}

const round = num => Math.round(num*100)/100;

const drawDims = ( turtles ) => { 
  const turtle = group(...turtles); // should actually group turtles
  if (!turtle) return "";

  const { width: w, height: h, ct, rc } = turtle;

  return svg`
    <defs>
      <marker 
        id="start-arrow" 
        viewBox="0 0 10 10"
        markerWidth="10" markerHeight="7" 
        refX="0" refY="3.5" 
        orient="auto">
          <polygon points="10 0, 10 7, 0 3.5" fill="black" />
      </marker>
      <marker 
        id="end-arrow" 
        viewBox="0 0 10 10"
        markerWidth="10" markerHeight="7" 
        refX="10" refY="3.5" 
        orient="auto" 
        markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
      <path 
        id="width-baseline"
        d="M ${ct.x + w/2},${ct.y+h*0.07} L ${ct.x - w/2},${ct.y+h*0.07}" 
        stroke="none"
        stroke-width="0px"/>
      <path 
        id="height-baseline"
        d="M ${rc.x+w*0.07},${rc.y-h/2} L ${rc.x+w*0.07},${rc.y + h/2} " 
        stroke="none"
        stroke-width="0px"/>
    </defs>
    <g transform="scale(1, -1)">
      <path 
        id="width"
        marker-start="url(#start-arrow)"
        marker-end="url(#end-arrow)"
        d="M ${ct.x + w/2},${ct.y+h*0.05} L ${ct.x - w/2},${ct.y+h*0.05}" 
        stroke="black"
        stroke-width="1px"
        vector-effect="non-scaling-stroke"/>
      <path 
        id="height"
        marker-start="url(#start-arrow)"
        marker-end="url(#end-arrow)"
        d="M ${rc.x+w*0.05},${rc.y-h/2} L ${rc.x+w*0.05},${rc.y + h/2} " 
        stroke="black"
        stroke-width="1px"
        vector-effect="non-scaling-stroke"/>
      <g transform="scale(1, -1)" transform-origin="${rc.x} ${rc.y}">
        <text 
          style="
            font-size: ${h/10}px;
          " 
          text-anchor="middle">
          <textPath 
            href="#height-baseline" 
            startOffset="50%">
            ${round(h)} mm
          </textPath>
        </text>
      </g>
      <g transform="scale(-1, 1)" transform-origin="${ct.x} ${ct.y}">
        <text 
          style="
            font-size: ${w/10}px;
          " 
          text-anchor="middle">
          <textPath 
            href="#width-baseline" 
            startOffset="50%">
            ${round(w)} mm
          </textPath>
        </text>
      </g>
    </g>
  `
}


export const renderApp= (state) => {
  const turtles = state.turtles;
  const content = turtles.map((turtle, i) => drawTurtle(turtle, { showTurtles: state.showTurtles }));
  if (state.draw && state.tempLine) content.push(drawLine(state.tempLine));
  if (state.showDimensions) content.push(drawDims(turtles));
  if (state.directEditHandle) content.push(drawDirectEditHandle(state.directEditHandle, state.svgCloth));

  state.svgCloth.grid = state.grid;
  state.content = content;

  render(view(state), document.getElementById("root"));
};