import { pauseEvent } from "./pauseEvent.js";
import { createListener } from "./createListener.js";

export function addDividerDrag(state, el) {
  let moveVerticalBar = false;
  let rect = null;

  const listen = createListener(el);

  listen("mousedown", ".divider", e => {
    moveVerticalBar = true;
    rect = e.target.parentNode.getBoundingClientRect();
  })

  listen("mousemove", "", (e) => {
    if (!moveVerticalBar) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const parentWidth = Math.abs(rect.left - rect.right);

    let xPerc = x/parentWidth * 100;

    const minX = 1;
    const maxX = 100;

    if (xPerc < minX) xPerc = minX;
    if (xPerc > maxX) xPerc = maxX;

    document.documentElement.style.setProperty("--cm-width", `${xPerc}%`);

    pauseEvent(e);
  })

  listen("mouseup", "", e => {
    moveVerticalBar = false;
  })

  listen("mouseleave", "body", e => {
    moveVerticalBar = false;
  })
}