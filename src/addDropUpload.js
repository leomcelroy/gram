import { createListener } from "./createListener.js";
import { pauseEvent } from "./pauseEvent.js";

export function addDropUpload(el, state) {
  const listenSVG = createListener(el);

  listenSVG("dragenter", "", () => {
    el.classList.add("dragged-over");
  })

  listenSVG("dragover", "", function(evt) {    
    el.classList.add("dragged-over");
    pauseEvent(evt);
  });
  
  listenSVG("drop", "", function(evt) {    
    let dt = evt.dataTransfer;
    let files = dt.files;

    let file = files[0];
    readFileSVG(file);
    // upload(files);

    pauseEvent(evt);
    
    el.classList.remove("dragged-over");

  });

  listenSVG("dragout", "", () => {
    el.classList.remove("dragged-over");
  })


}