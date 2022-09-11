import { render } from "solid-js/web";
import html from "solid-js/html";
import { createSignal, onMount } from "solid-js";

import { parse } from "./parse.js";
import { parse as p } from "./runtime/parse.js";

// import { o, observable, html } from 'sinuous';

const [name2, setName2] = createSignal("leo");


function MyComponent({ name }) {
  const [ count, setCount ] = createSignal(0);

  const onClick = () => {
    setCount(c => c+1);
    setCount(count()+1);
    console.log("clicked", count());

    setName2("bob");
  };

  onMount(() => {
    const thing = document.querySelector(".thing");
    console.log(thing);
  })

  return html`<div class="thing" on:click=${onClick}>Hello ${name} and ${name2}, ${count}</div>`;
}

render(() => html`<${MyComponent} name="leo"/>`, document.querySelector("#root"));


const test = `
{
a = 4
top = layer:
  forward 90
  right 30
  forward 32
}
`

console.log(p(test));


const ast = parse(test);

console.log(ast);



// function Root() {
//   const count = o(0);

//   return html`
//     <div onClick=${() => count(count() + 1)}>Hello world! Count is ${count}</div>
//   `
// }


// document.querySelector("#root").append(html`<${Root}/>`)