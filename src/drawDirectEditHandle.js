import { svg } from '../libs/lit-html.js';

const end = (type, line, turtle, args, initScale) => {
  const {x, y} = turtle.end;

  return svg`
    <style>
      .manipulator:hover {
        fill: red;
      }
    </style>
    <g transform="scale(1, -1)">
      <circle 
        @mousedown=${e => dispatch("DRAG_HANDLE_TARGET", { dragging: true })} 
        class="manipulator ${type} scale-with-viewer handle"
        data-line=${line}
        cx="${x}" 
        cy="${y}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${x} ${y}"/>
    </g>
  `
}

const cc = (type, line, turtle, args, initScale) => {
  const {x, y} = turtle.centroid;

  return svg`
    <style>
      .manipulator:hover {
        fill: red;
      }
    </style>
    <g transform="scale(1, -1)">
      <circle 
        @mousedown=${e => dispatch("DRAG_HANDLE_TARGET", { dragging: true })} 
        class="manipulator ${type} scale-with-viewer handle"
        data-line=${line}
        cx="${x}" 
        cy="${y}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${x} ${y}"/>
    </g>
  `
}

const scale = (type, line, turtle, args, initScale) => {
  const { x: ccx, y: ccy} = turtle.centroid;
  const { x: rtx, y: rty} = turtle.rt;

  return svg`
    <style>
      .manipulator:hover {
        fill: red;
      }
    </style>
    <g transform="scale(1, -1)">
      <circle
        class="${type} scale-with-viewer handle"
        data-line=${line}
        cx="${ccx}" 
        cy="${ccy}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${ccx} ${ccy}"/>
    </g>
    <g transform="scale(1, -1)">
      <circle 
        @mousedown=${e => dispatch("DRAG_HANDLE_TARGET", { dragging: true })} 
        class="manipulator ${type} scale-with-viewer handle"
        data-line=${line}
        cx="${rtx}" 
        cy="${rty}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${rtx} ${rty}"/>
    </g>
  `
}

const rotate = (type, line, turtle, args, initScale) => {
  const { x: ccx, y: ccy} = turtle.centroid;

  return svg`
    <style>
      .manipulator:hover {
        fill: red;
      }
    </style>
    <g transform="scale(1, -1)">
      <circle
        class="${type} scale-with-viewer handle"
        data-line=${line}
        cx="${ccx}" 
        cy="${ccy}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${ccx} ${ccy}"/>
    </g>
    <g transform="scale(1, -1)">
      <circle 
        @mousedown=${e => dispatch("DRAG_HANDLE_TARGET", { dragging: true })} 
        class="manipulator ${type} scale-with-viewer handle"
        data-line=${line}
        cx="${ccx}" 
        cy="${ccy + turtle.height/2}" 
        r="5" 
        stroke="black" 
        stroke-width="0" 
        fill="orange"
        transform="scale(${initScale}, ${initScale})"
        transform-origin="${ccx} ${ccy + turtle.height/2}"/>
    </g>
  `
}

export function drawDirectEditHandle({ type, line, turtleAfter: turtle, args }, svgCloth) {
  let result = "";

  let initScale = svgCloth.getInitScaleWithViewer();

  if (turtle) {
    if (type === "turnforward") return end(type, line, turtle, args, initScale);
    else if (type === "goto") return end(type, line, turtle, args, initScale); 
    else if (type === "arc") return end(type, line, turtle, args, initScale); 
    else if (type === "rotate") return rotate(type, line, turtle, args, initScale); 
    else if (type === "scale") return scale(type, line, turtle, args, initScale); 
    else if (type === "translate") return cc(type, line, turtle, args, initScale); 
    else if (type === "move") return cc(type, line, turtle, args, initScale);
  }

}