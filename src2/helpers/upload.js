
function readTxtSVG(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = event => {
    let text = reader.result;
    const container = document.createElement("div");
    container.innerHTML = text;
    const recoveredTxt = container.firstChild.dataset.txt;
    // clean up
    // document.body.appendChild(container); // do I need these?
    // document.body.removeChild(container); // do I need these?
    dispatch("SET_CODE", { txt: recoveredTxt })
  };
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild; 
}

function readImg(file){
  var reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = event => {
    // let text = reader.result;
    const htmlStringWithDelete = `

      <div
        style="
          position: absolute;
          left: 0px;
          top: 0px;
          z-index: -99;
        "
        class="resize-manual"
        >
        <style>
          .delete-ghost {
            z-index: 10 !important;
          }

          .delete-ghost:hover {
            color: red;
          }

        </style>
        <img 
          src="${reader.result}" 
          ><img/>
        <div class="delete-ghost" style="z-index: 99;">delete</div>
      </div>
    `

    const htmlString = `

      <div
        style="
          position: absolute;
          left: 0px;
          top: 0px;
          z-index: -99;
        "
        class="resize-manual"
        >
        <img 
          src="${reader.result}" 
          ><img/>
      </div>
    `

    const img = createElementFromHTML(htmlString);

    // const img = document.createElement("div");
    // img.innerHTML = htmlString;
    // const img = document.createElement("img");
    // img.src = reader.result;
    // img.style = `
    //   position: absolute;
    //   left: 0px;
    //   top: 0px;
    //   z-index: -99;
    // `
    // img.classList.add("resize-manual");

    const container = document.getElementById("viewer");
    document.getElementById("svg-view").style.opacity = .5;
    container.appendChild(img); // do I need these?
    // document.body.removeChild(container); // do I need these?
    // container.innerHTML = text;
    // const recoveredTxt = container.firstChild.dataset.txt;
    // dispatch("SET_CODE", { txt: recoveredTxt })
  };
}

export function upload(files, extensions = []) {
  let file = files[0];
  let fileName = file.name.split(".");
  let name = fileName[0];
  const extension = fileName[fileName.length - 1];

  if (extensions.length > 0 && extensions.includes(enxtension)) throw "Extension not recongized: " + fileName;

  console.log(file);
  if (["txt", "svg"].includes(extension)) readTxtSVG(file);
  else if (["png", "JPG"].includes(extension)) readImg(file);
  else console.log("Unknown extension:", extension);
};