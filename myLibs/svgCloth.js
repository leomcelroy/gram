import { html, svg } from '../libs/lit-html.js';

export class svgCloth {

  constructor() {
    this.pan = true;
    this.grid = false; // TODO
    // this.content = "";
    this.mousedown = false;
    this.clickedTarget = "";
    this.viewBox = {
      v0: 0,
      v1: 0,
      v2: 500,
      v3: 500,
    }

    this.rulers = {
      draw: false,
      mouseLoc: {x: 0, y: 0},
      w: 0,
      h: 0,
      corners: undefined,
    }
  }

  getPoint(event) {
    return getSVGpoint(event);
  }

  getInitScaleWithViewer() {
    const svg = document.getElementById("inner-svg-view");
    let initScale = 1;
    if (svg) {
      const w = Number(svg.getAttribute("width").replace("px", ""));
      let vw = this.viewBox.v2;
      initScale = vw/w;
    }

    return initScale;
  }

  setPan(bool) {
    this.pan = bool;
  }

  focusOn(boundingBox) {
    var svg = document.getElementById("inner-svg-view");
    let viewer = document.getElementById("svg-view");
    let { xMin, xMax, yMin, yMax } = boundingBox;

    let temp = yMax;
    yMax = -yMin;
    yMin = -temp;
   
    let newWidth =
      Math.abs(xMax - xMin) / (viewer.clientWidth / svg.width.baseVal.value);
    let newHeight =
      Math.abs(yMax - yMin) / (viewer.clientHeight / svg.height.baseVal.value);
    let v2v3 = newWidth > newHeight ? newWidth : newHeight;

    this.viewBox.v0 = xMin - viewer.clientWidth*v2v3/10000/2 + Math.abs(xMax - xMin)/2;
    this.viewBox.v1 = yMin - viewer.clientHeight*v2v3/10000/2 + Math.abs(yMax - yMin)/2;
    this.viewBox.v2 = v2v3;
    this.viewBox.v3 = v2v3;

    svg.setAttribute(
      "viewBox",
      `${this.viewBox.v0} ${this.viewBox.v1} ${this.viewBox.v2} ${this.viewBox.v3}`
    );

    let w2 = Number(svg.getAttribute("width").replace("px", ""));
    let vw = this.viewBox.v2;
    let headScale = vw / w2;
    let els = document.getElementsByClassName("scale-with-viewer");

    for (let i = 0; i < els.length; i++) {
      let current = els[i].getAttribute("transform");
      current = current.replace(/scale\([0-9]*.*[0-9]*\)/, `scale(${headScale})`);
      els[i].setAttribute("transform", current);
    }

    if (this.grid) setRulers({ x: 0, y: 0 }, this);
  }

  download() { // TODO

  }

  draw(content) {


    return html`
      <style>
        #svg-view {
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: dashed 2px black;
          box-sizing: border-box;
        }

        .noselect {
          -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
             -khtml-user-select: none; /* Konqueror HTML */
               -moz-user-select: none; /* Old versions of Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none; /* Non-prefixed version, currently
                                          supported by Chrome, Edge, Opera and Firefox */
        }


        #inner-svg-view {
          background: white;
        }

        #svg-top {
          position: absolute;
          left: 0px;
          top: 2px;
          background: white;
        }

        #svg-left {
          position: absolute;
          left: 2px;
          top: 0px;
          background: white;
        }

        #svg-rulers-corner {
          position: absolute;
          left: 0px;
          top: 0px;
          background: white;
          border-left: dashed 2px black;
          border-top: dashed 2px black;
        }

        .grid-line {}
      </style>
      <div id="svg-view">
        ${svg`
          <svg
            id="inner-svg-view"
            preserveAspectRatio="xMidYMid meet"
            width=10000px
            height=10000px
            viewBox="${this.viewBox.v0} ${this.viewBox.v1} ${this.viewBox.v2} ${this.viewBox.v3}"
            @wheel=${(e) => {
              handleWheel(e, this.viewBox);

              if (this.grid) setRulers(getSVGpoint(e), this);
            }}
            @mousemove=${(e) => {
              const clickedHandle = this.clickedTarget && this.clickedTarget.classList.contains("handle");
              handleMouseMove(
                e, 
                this.viewBox, 
                this.mousedown && this.pan && !clickedHandle
              );

              if (this.grid) setRulers(getSVGpoint(e), this);
            }}
            @mousedown=${(e) => { 
              this.mousedown = true; 
              this.clickedTarget = e.target; // these types don't match
            }}
            @mouseup=${(e) => { 
              this.mousedown = false; 
              this.clickedTarget = ""; // these types don't match
            }}
            @resize=${(e) => { // TODO
              // console.log("resize");
              // if (this.grid) setRulers({ x: 0, y: 0 }, this);
            }}>

            ${this.grid && this.rulers.draw 
              ? [ divisionsToLines(this.rulers), origin(this.rulers) ] 
              : ""
            }
            ${content}
            ${this.grid && this.rulers.draw 
              ? drawLocationGuides(this.rulers, this.getInitScaleWithViewer())// [ divisionsToLines(this.rulers, false), drawLocationGuides(this.rulers) ] 
              : ""
            }

          </svg>
          ${ this.grid && this.rulers.draw ? drawRulers(this.rulers) : "" }
        `}
      </div>
    `
  }
}

function drawRulers(rulers) {
  return svg`
    <svg width=100% height=20px id="svg-top">${divisionsToTop(rulers)}</svg>
    <svg width=20px height=100% id="svg-left">${divisionsToLeft(rulers)}</svg>
    <svg width=20px height=20px id="svg-rulers-corner"></svg>
  `
}

function getSVGpoint(evt) {
    var el = document.getElementById("inner-svg-view");
    var pt = el.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;

    return pt.matrixTransform(el.getScreenCTM().inverse());
};

function getSVGPointFromPt(p) {
    var el = document.getElementById("inner-svg-view");
    var pt = el.createSVGPoint();
    pt.x = p.x;
    pt.y = p.y;

    return pt.matrixTransform(el.getScreenCTM().inverse());
};

function getCorners() {
  const outerSVG = document.getElementById("svg-view");
  if (outerSVG === null) return null;
  const { left, right, bottom, top} = outerSVG.getBoundingClientRect();
  // need rt, lt, rb, lb
  const rt = getSVGPointFromPt({ x: right, y: top });
  rt.y = -rt.y
  const lt = getSVGPointFromPt({ x: left, y: top });
  lt.y = -lt.y
  const rb = getSVGPointFromPt({ x: right, y: bottom });
  rb.y = -rb.y
  const lb = getSVGPointFromPt({ x: left, y: bottom });
  lb.y = -lb.y

  return { rt, lt, rb, lb }
}

function handleWheel(evt, viewBox) {
  // scroll svg viewbox
  evt.preventDefault();

  let scaleFactor = 1;
  if (evt.deltaY > 0) {
    scaleFactor = 1.03;
    
    viewBox.v2 *= scaleFactor;
    viewBox.v3 *= scaleFactor;
  } else {
    scaleFactor = 1.03;

    viewBox.v2 /= scaleFactor;
    viewBox.v3 /= scaleFactor;
  }

  // viewBox.v2 *= scaleFactor;
  // viewBox.v3 *= scaleFactor;

  var el = document.getElementById("inner-svg-view");
  let w = el.clientWidth;
  let h = el.clientHeight;
  let xFactor, yFactor, s;
  var rect = el.getBoundingClientRect();
  var x = evt.clientX - rect.left; //x position within the element.
  var y = evt.clientY - rect.top; //y position within the element.

  if (w > h) {
    s = Math.abs(0.5 - x / w);
    xFactor = viewBox.v2 / w;
    yFactor = viewBox.v3 / h;
  } else {
    // h > w or equal
    s = Math.abs(0.5 - y / h);
    xFactor = viewBox.v2 / w;
    yFactor = viewBox.v3 / h;
  }

  let svgPoint = getSVGpoint(evt);

  viewBox.v0 = svgPoint.x - x * xFactor; // this is affected by the aspect ratio of svg
  viewBox.v1 = svgPoint.y - y * yFactor; // this is affected by the aspect ratio of svg

  el.setAttribute(
    "viewBox",
    `${viewBox.v0} ${viewBox.v1} ${viewBox.v2} ${viewBox.v3}`
  );

  let w2 = Number(el.getAttribute("width").replace("px", ""));
  let vw = viewBox.v2;
  let headScale = vw / w2;
  let els = document.getElementsByClassName("scale-with-viewer");

  for (let i = 0; i < els.length; i++) {
    let current = els[i].getAttribute("transform");
    current = current.replace(/scale\([0-9]*.*[0-9]*\)/, `scale(${headScale})`);
    els[i].setAttribute("transform", current);
  }
}

function convert(n) {
    var order = Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
    return Math.pow(10,order);
}

function setRulers(pt, that) {
  pt.y = -pt.y;
  const mouseLoc = pt;
  const draw = true;
  const corners = getCorners();
  const w = Math.abs(corners.lt.x - corners.rt.x);
  const h = Math.abs(corners.lt.y - corners.lb.y);
  const size = w < h ? w/15 : h/15;
  // const size = 10;


  const orderMagW = convert(w);
  const stepW = orderMagW/2;
  const orderMagH = convert(h);
  const stepH = orderMagH/2;
  const step = stepW < stepH ? stepW : stepH;
  const r = n => step*Math.ceil(n/step);

  const wDivs = [];
  // const rW = n => stepW*Math.ceil(n/stepW);
  for (let i = r(corners.lt.x); i <= r(corners.rt.x); i += step) wDivs.push(i);

  const hDivs = [];
  // const rH = n => stepH*Math.ceil(n/stepH);
  for (let i = r(corners.lb.y); i <= r(corners.lt.y); i += step) hDivs.push(i);

  const outerSVG = document.getElementById("svg-view");
  if (outerSVG === null) return null;
  const bb = outerSVG.getBoundingClientRect();
  const actualWidth = bb.width;
  const actualHeight = bb.height;

  that.rulers = {
    draw,
    w,
    h,
    actualWidth,
    actualHeight,
    mouseLoc,
    size,
    corners,
    wDivs,
    hDivs
  }

  dispatch("RENDER");
}

function divisionsToLines({ wDivs, corners, size, hDivs, w, h }) {
  return svg`<g>
    ${wDivs.map(d => svg`
        <line
          class = "grid-line"
          x1=${d} y1=${-corners.lt.y + h} 
          x2=${d} y2=${-corners.lt.y} 
          stroke="lightgrey"
          vector-effect="non-scaling-stroke"/>
    `)}
    ${hDivs.map(d => svg`
        <line 
          class = "grid-line"
          x1=${corners.lt.x + w} y1=${-d} 
          x2=${corners.lt.x} y2=${-d} 
          stroke="lightgrey"
          vector-effect="non-scaling-stroke"/>
    `)}
  </g>`

}

// function divisionsToSides({ wDivs, corners, size, hDivs, w, h }) {
//   return svg`<g>
//     <rect x=${corners.lt.x} y=${-corners.lt.y} width=${w} height=${size/2} fill="white"/>
//     <rect x=${corners.lt.x} y=${-corners.lt.y} width=${size/2} height=${h} fill="white"/>
//     ${wDivs.map((d,id) => svg`
//         <path 
//           id="${id}-w-baseline"
//           d="M ${d-5},${-corners.lt.y + size/2} L ${d+5},${-corners.lt.y + size/2} " 
//           stroke="none"
//           stroke-width="0px"/>
//         <textPath 
//           href="#${id}-w-baseline" 
//           startOffset="50%">
//           ${d}
//         </textPath>
//     `)}
//     ${hDivs.map(d => svg`
        
//     `)}
//     <rect x=${corners.lt.x} y=${-corners.lt.y} width=${size/2} height=${size/2} fill="white"/>
//   </g>`

// }

const round = (x, precision = 1) => Math.round(x*precision)/precision

function divisionsToTop(rulers) {
  const ws = rulers.wDivs;
  const odd = ws.indexOf(0) < 0 ? ws.length % 2 : ws.indexOf(0) % 2;
  return svg`
    <g class="noselect" transform="translate(${-rulers.corners.lt.x/rulers.w*rulers.actualWidth}, 0)"">
      ${ws.map((d, i) => svg`
          <!--
          <circle 
            cx="${d/rulers.w*rulers.actualWidth}" 
            cy="10" 
            r="4" 
            fill="black"/>
          -->
          <text 
            font-size="smaller"
            text-anchor="middle" 
            x="${d/rulers.w*rulers.actualWidth}" 
            y="15">
            ${ ws.length < 8 || i % 2 === odd ? round(d,2) : "" }
          </text>
      `)}
    </g>
  `

}

function divisionsToLeft(rulers) {
  const hs = rulers.hDivs;
  const odd = hs.indexOf(0) < 0 ? hs.length % 2 : hs.indexOf(0) % 2;
  return svg`
    <g class="noselect" transform="translate(0, ${rulers.corners.lt.y/rulers.h*rulers.actualHeight})">
      ${hs.map((d, i) => svg`
          <text 
            font-size="smaller"
            text-anchor="middle" 
            x="15" 
            y="${-d/rulers.h*rulers.actualHeight}"
            transform-origin="${15} ${-d/rulers.h*rulers.actualHeight}"
            transform="rotate(-90)">
            ${ hs.length < 8 || i % 2 === odd ? round(d,2) : "" }
          </text>
      `)}
    </g>
  `

}

function drawLocationGuides(rulers, initScale) {
  const size = 7; // rulers.size/2;
  return svg`<g>
    <!--
    <circle 
      cx="${rulers.mouseLoc.x}" 
      cy="${-rulers.corners.lt.y}" 
      r="3" 
      fill="black"
      class="scale-with-viewer"
      transform="scale(${initScale}, ${initScale}) translate(0, 26)"
      transform-origin="${rulers.mouseLoc.x} ${-rulers.corners.lt.y}"/>
    <circle 
      cx="${rulers.corners.lt.x}" 
      cy="${-rulers.mouseLoc.y}" 
      r="3" 
      fill="black"
      class="scale-with-viewer"
      transform="scale(${initScale}, ${initScale}) translate(26, 0)"
      transform-origin="${rulers.corners.lt.x} ${-rulers.mouseLoc.y}"/>
    -->


    <polyline 
      points="
        ${rulers.mouseLoc.x-size} ${-rulers.corners.lt.y} 
        ${rulers.mouseLoc.x} ${-rulers.corners.lt.y+size} 
        ${rulers.mouseLoc.x+size} ${-rulers.corners.lt.y}"
      class="scale-with-viewer"
      transform="scale(${initScale}, ${initScale}) translate(0, 20)"
      transform-origin="${rulers.mouseLoc.x} ${-rulers.corners.lt.y}"
      fill="black"/>
    <polyline 
      points="
        ${rulers.corners.lt.x} ${-rulers.mouseLoc.y+size} 
        ${rulers.corners.lt.x+size} ${-rulers.mouseLoc.y} 
        ${rulers.corners.lt.x} ${-rulers.mouseLoc.y-size}"
      class="scale-with-viewer"
      transform="scale(${initScale}, ${initScale}) translate(20, 0)"
      transform-origin="${rulers.corners.lt.x} ${-rulers.mouseLoc.y}"
      fill="black"/>
  

    <!--
    <line 
      x1=${rulers.mouseLoc.x} y1=${-rulers.corners.lt.y+rulers.size} 
      x2=${rulers.mouseLoc.x} y2=${-rulers.corners.lt.y} 
      stroke="black"
      vector-effect="non-scaling-stroke"/>
    <line 
      x1=${rulers.corners.lt.x+rulers.size} y1=${-rulers.mouseLoc.y} 
      x2=${rulers.corners.lt.x} y2=${-rulers.mouseLoc.y} 
      stroke="black"
      vector-effect="non-scaling-stroke"/>
    -->
  <g>`
}

function origin(rulers) {
  return svg`<g>
    <line 
      x1=${0} y1=${-rulers.corners.lt.y+rulers.h} 
      x2=${0} y2=${-rulers.corners.lt.y} 
      stroke="lightgrey"
      stroke-width="3"
      vector-effect="non-scaling-stroke"/>
    <line 
      x1=${rulers.corners.lt.x+rulers.w} y1=${0} 
      x2=${rulers.corners.lt.x} y2=${0} 
      stroke="lightgrey"
      stroke-width="3"
      vector-effect="non-scaling-stroke"/>
  <g>`
}

// <defs>
//   <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
//     <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" stroke-width="0.5"/>
//   </pattern>
//   <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
//     <rect width="80" height="80" fill="url(#smallGrid)"/>
//     <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" stroke-width="1"/>
//   </pattern>
// </defs>
// <rect width="100px" height="100px" fill="url(#grid)" />



function handleMouseMove(e, viewBox, pan) {

  if (pan) {
    // svg pan, translate
    var el = document.getElementById("inner-svg-view");

    let xFactor = viewBox.v2 / (el.clientWidth - 6);
    let yFactor = viewBox.v3 / (el.clientHeight - 6);

    let scale = xFactor > yFactor ? xFactor : yFactor;

    viewBox.v0 -= e.movementX * scale;
    viewBox.v1 -= e.movementY * scale;

    el.setAttribute(
      "viewBox",
      `${viewBox.v0} ${viewBox.v1} ${viewBox.v2} ${viewBox.v3}`
    );
  }
}