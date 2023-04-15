import { drawTurtle, Turtle } from '../../myLibs/gram-js.js';
import { render } from '../../libs/lit-html.js';
import { minsMaxes } from "./minsMaxes.js";

export function downloadSVG(filename, turtles, txt) {
  // get mins and maxs
  const { xMin, xMax, yMin, yMax } = minsMaxes(turtles);
  const margin = 5;

  // reoriginate them so lowest x and lowest y become 0,0
  const oneTurtle = turtles.reduce((acc, cur) => {
    acc.path = [...acc.path, ...cur.path];

    return acc;
  }, new Turtle());

  const atOrigin = oneTurtle.translate({x: margin, y: -margin}, oneTurtle.point("lt"));

  // make svg
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const width = xMax - xMin + 2 * margin;
  const height = yMax - yMin + 2 * margin;
  svg.setAttribute("width", `${width}mm`);
  svg.setAttribute("height", `${height}mm`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttributeNS(
    "http://www.w3.org/2000/xmlns/",
    "xmlns:xlink",
    "http://www.w3.org/1999/xlink"
  );
  svg.dataset.txt = txt;
  document.body.appendChild(svg);
  const litsvg = drawTurtle(atOrigin, { showTurtles: false, filterConstruction: true })
  render(litsvg, svg);
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

  // make download link
  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = `${filename}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // clean up
  document.body.removeChild(downloadLink);
  document.body.removeChild(svg);
}

export function download(filename, txt) {
  const blob = new Blob([txt], { type: "text/plain" });

  var link = document.createElement("a"); // Or maybe get it from the current document
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}`;
  link.click();
  URL.revokeObjectURL(link);
}